from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import PlainTextResponse

from ..services.invoice_service import InvoiceService
from ..middleware.auth_middleware import get_current_user
from ..database import get_database

router = APIRouter(prefix="/api/v1/invoices", tags=["invoices"])

@router.get("")
async def get_invoices(
    limit: int = 50,
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all invoices for current user
    
    Query Parameters:
    - limit: Number of records to return (default: 50)
    - skip: Number of records to skip (default: 0)
    
    Returns:
    - List of invoices
    """
    try:
        db = await get_database()
        invoice_service = InvoiceService(db)
        
        invoices = await invoice_service.get_invoices_by_user(
            user_id=current_user["id"],
            limit=limit,
            skip=skip
        )
        
        return {
            "success": True,
            "invoices": invoices,
            "count": len(invoices)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{invoice_id}")
async def get_invoice(
    invoice_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get invoice details by ID
    
    Path Parameters:
    - invoice_id: Invoice ID
    
    Returns:
    - Invoice details
    """
    try:
        db = await get_database()
        invoice_service = InvoiceService(db)
        
        invoice = await invoice_service.get_invoice_by_id(invoice_id)
        
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Verify user owns this invoice
        if invoice["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {
            "success": True,
            "invoice": invoice
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{invoice_id}/download")
async def download_invoice(
    invoice_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Download invoice as text file
    
    Path Parameters:
    - invoice_id: Invoice ID
    
    Returns:
    - Invoice text file
    """
    try:
        db = await get_database()
        invoice_service = InvoiceService(db)
        
        # Get invoice
        invoice = await invoice_service.get_invoice_by_id(invoice_id)
        
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        # Verify user owns this invoice
        if invoice["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Generate invoice text
        invoice_text = await invoice_service.generate_invoice_text(invoice_id)
        
        return PlainTextResponse(
            content=invoice_text,
            headers={
                "Content-Disposition": f"attachment; filename={invoice['invoice_number']}.txt"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
