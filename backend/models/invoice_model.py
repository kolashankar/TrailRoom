from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class InvoiceLineItem(BaseModel):
    """
    Individual line item in an invoice
    """
    description: str
    quantity: int
    unit_price: float
    discount: float = 0.0
    amount: float

class InvoiceModel(BaseModel):
    """
    Invoice model for generating receipts
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str  # Auto-generated sequential number
    user_id: str
    payment_id: str  # Reference to payment record
    
    # Customer details
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    
    # Invoice details
    line_items: List[InvoiceLineItem]
    subtotal: float
    discount_amount: float
    tax_amount: float = 0.0
    total_amount: float
    
    currency: str = "INR"
    
    # Company details (TrailRoom)
    company_name: str = "TrailRoom"
    company_address: Optional[str] = "Virtual Try-On Platform"
    company_email: Optional[str] = "support@trailroom.com"
    company_phone: Optional[str] = None
    company_tax_id: Optional[str] = None
    
    # Timestamps
    invoice_date: datetime = Field(default_factory=datetime.utcnow)
    due_date: Optional[datetime] = None
    paid_date: Optional[datetime] = None
    
    # Status
    status: str = "paid"  # paid, pending, cancelled
    
    # Additional info
    notes: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "inv_123",
                "invoice_number": "INV-2024-0001",
                "user_id": "user_123",
                "payment_id": "pay_123",
                "customer_email": "user@example.com",
                "line_items": [
                    {
                        "description": "TrailRoom Credits",
                        "quantity": 5000,
                        "unit_price": 1.0,
                        "discount": 775.0,
                        "amount": 4225.0
                    }
                ],
                "subtotal": 5000.0,
                "discount_amount": 775.0,
                "total_amount": 4225.0
            }
        }

class InvoiceResponse(BaseModel):
    invoice_id: str
    invoice_number: str
    total_amount: float
    invoice_date: datetime
    status: str
