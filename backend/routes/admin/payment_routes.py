from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging

from database import Database
from middleware.admin_middleware import AdminMiddleware
from services.audit_service import AuditService
from services.credit_service import CreditService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/payments", tags=["Admin - Payments"])
security = HTTPBearer()

@router.get("")
async def get_all_payments(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """
    Get all payments with filters
    Requires: finance_admin or super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_finance_admin(None, credentials)
        
        db = Database.get_db()
        
        # Build query
        query = {}
        if status_filter:
            query["status"] = status_filter
        if user_id:
            query["user_id"] = user_id
        
        # Get total count
        total = await db.payments.count_documents(query)
        
        # Get payments
        payments = await db.payments.find(query).skip(skip).limit(limit).sort("created_at", -1).to_list(None)
        
        # Get user emails
        for payment in payments:
            user = await db.users.find_one({"id": payment["user_id"]})
            if user:
                payment["user_email"] = user.get("email")
        
        return {
            "payments": payments,
            "total": total,
            "skip": skip,
            "limit": limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting payments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving payments"
        )

@router.get("/transactions/credits")
async def get_credit_transactions(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    transaction_type: Optional[str] = Query(None, description="Filter by type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """
    Get all credit transactions
    Requires: finance_admin or super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_finance_admin(None, credentials)
        
        db = Database.get_db()
        
        # Build query
        query = {}
        if user_id:
            query["user_id"] = user_id
        if transaction_type:
            query["type"] = transaction_type
        
        # Get total count
        total = await db.credit_transactions.count_documents(query)
        
        # Get transactions
        transactions = await db.credit_transactions.find(query).skip(skip).limit(limit).sort("created_at", -1).to_list(None)
        
        # Get user emails
        for transaction in transactions:
            user = await db.users.find_one({"id": transaction["user_id"]})
            if user:
                transaction["user_email"] = user.get("email")
        
        return {
            "transactions": transactions,
            "total": total,
            "skip": skip,
            "limit": limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting credit transactions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving credit transactions"
        )

@router.post("/{payment_id}/refund")
async def refund_payment(
    payment_id: str,
    reason: str = Query(..., description="Reason for refund"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Process payment refund
    Requires: finance_admin or super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_finance_admin(None, credentials)
        
        db = Database.get_db()
        
        # Get payment
        payment = await db.payments.find_one({"id": payment_id})
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        if payment["status"] != "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only refund completed payments"
            )
        
        # Check if already refunded
        if payment.get("refunded", False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment has already been refunded"
            )
        
        # Deduct credits (purchased credits)
        credits_to_deduct = payment.get("credits", 0)
        if credits_to_deduct > 0:
            try:
                await CreditService.use_credits(
                    payment["user_id"],
                    credits_to_deduct,
                    "refund",
                    f"Refund for payment {payment_id}: {reason}"
                )
            except Exception as e:
                logger.warning(f"Could not deduct credits during refund: {str(e)}")
                # Continue with refund even if credit deduction fails
        
        # Mark payment as refunded
        await db.payments.update_one(
            {"id": payment_id},
            {"$set": {
                "refunded": True,
                "refund_reason": reason,
                "status": "refunded"
            }}
        )
        
        # Log action
        await AuditService.log_action(
            action="payment.refund",
            admin_id=admin["id"],
            admin_email=admin["email"],
            target_type="payment",
            target_id=payment_id,
            details={
                "reason": reason,
                "user_id": payment["user_id"],
                "amount": payment["amount"],
                "credits": credits_to_deduct
            }
        )
        
        return {
            "message": "Payment refunded successfully",
            "refunded_amount": payment["amount"] / 100,  # Convert to rupees
            "credits_deducted": credits_to_deduct
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refunding payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing refund"
        )
