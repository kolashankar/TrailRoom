from fastapi import APIRouter, HTTPException, Depends, Request, Header
from typing import Optional
import json

from ..services.payment_service import PaymentService
from ..services.invoice_service import InvoiceService
from ..models.payment_model import CreateOrderRequest, VerifyPaymentRequest
from ..middleware.auth_middleware import get_current_user
from ..database import get_database

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])

@router.post("/create-order")
async def create_payment_order(
    order_request: CreateOrderRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a Razorpay order for credit purchase
    
    Request Body:
    - credits: Number of credits to purchase (300-50000)
    
    Returns:
    - Razorpay order details for checkout
    """
    try:
        db = await get_database()
        payment_service = PaymentService(db)
        
        order = await payment_service.create_order(
            user_id=current_user["id"],
            credits=order_request.credits
        )
        
        return {
            "success": True,
            "order": order
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify")
async def verify_payment(
    verify_request: VerifyPaymentRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Verify Razorpay payment and add credits
    
    Request Body:
    - razorpay_order_id: Razorpay order ID
    - razorpay_payment_id: Razorpay payment ID
    - razorpay_signature: Razorpay signature
    
    Returns:
    - Verification status and credit update
    """
    try:
        db = await get_database()
        payment_service = PaymentService(db)
        invoice_service = InvoiceService(db)
        
        # Verify payment
        result = await payment_service.verify_payment(
            razorpay_order_id=verify_request.razorpay_order_id,
            razorpay_payment_id=verify_request.razorpay_payment_id,
            razorpay_signature=verify_request.razorpay_signature
        )
        
        # Create invoice
        if result["status"] == "success":
            try:
                invoice = await invoice_service.create_invoice(
                    payment_id=result["payment_id"]
                )
                result["invoice_id"] = invoice["id"]
            except Exception as e:
                # Log error but don't fail the payment
                print(f"Failed to create invoice: {e}")
        
        return {
            "success": True,
            "result": result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None)
):
    """
    Handle Razorpay webhook events
    
    Headers:
    - X-Razorpay-Signature: Webhook signature
    
    Request Body:
    - Razorpay webhook payload
    
    Returns:
    - Processing status
    """
    try:
        # Get raw body
        body = await request.body()
        payload = json.loads(body)
        
        db = await get_database()
        payment_service = PaymentService(db)
        
        # Handle webhook
        result = await payment_service.handle_webhook(
            payload=payload,
            signature=x_razorpay_signature or ""
        )
        
        return {
            "success": True,
            "result": result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_payment_history(
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """
    Get payment history for current user
    
    Query Parameters:
    - limit: Number of records to return (default: 50)
    - skip: Number of records to skip (default: 0)
    
    Returns:
    - List of payments
    """
    try:
        db = await get_database()
        payment_service = PaymentService(db)
        
        payments = await payment_service.get_payment_history(
            user_id=current_user["id"],
            limit=limit,
            skip=skip
        )
        
        return {
            "success": True,
            "payments": payments,
            "count": len(payments)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{payment_id}")
async def get_payment_details(
    payment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get payment details by ID
    
    Path Parameters:
    - payment_id: Payment ID
    
    Returns:
    - Payment details
    """
    try:
        db = await get_database()
        payment_service = PaymentService(db)
        
        payment = await payment_service.get_payment_by_id(payment_id)
        
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        # Verify user owns this payment
        if payment["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {
            "success": True,
            "payment": payment
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
