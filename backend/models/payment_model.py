from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid

class PaymentModel(BaseModel):
    """
    Payment record model for tracking all payment transactions
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    credits_purchased: int
    base_price: float  # Base price before discount
    discount_percent: float  # Discount percentage applied
    discount_amount: float  # Actual discount amount in currency
    final_price: float  # Final price after discount (in paise for Razorpay)
    currency: str = "INR"
    
    # Razorpay details
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    
    # Status tracking
    status: Literal["created", "pending", "paid", "failed", "refunded"] = "created"
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    paid_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None
    
    # Additional info
    payment_method: Optional[str] = None  # card, upi, netbanking, etc.
    error_message: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "user_123",
                "credits_purchased": 5000,
                "base_price": 5000.0,
                "discount_percent": 15.5,
                "discount_amount": 775.0,
                "final_price": 4225.0,
                "status": "paid"
            }
        }

class CreateOrderRequest(BaseModel):
    credits: int = Field(..., ge=300, le=50000, description="Number of credits to purchase (300-50000)")

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class PaymentResponse(BaseModel):
    payment_id: str
    user_id: str
    credits_purchased: int
    final_price: float
    status: str
    created_at: datetime
