import razorpay
import hmac
import hashlib
from typing import Dict, Optional, List
from datetime import datetime
import os
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..services.pricing_service import PricingService
from ..services.credit_service import CreditService
from ..models.payment_model import PaymentModel, PaymentResponse

class PaymentService:
    """
    Service for handling Razorpay payment operations
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.payments_collection = db.payments
        
        # Initialize Razorpay client
        self.razorpay_key_id = os.getenv("RAZORPAY_KEY_ID")
        self.razorpay_key_secret = os.getenv("RAZORPAY_KEY_SECRET")
        self.razorpay_webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")
        
        if not self.razorpay_key_id or not self.razorpay_key_secret:
            raise ValueError("Razorpay credentials not configured")
        
        self.client = razorpay.Client(auth=(self.razorpay_key_id, self.razorpay_key_secret))
        self.credit_service = CreditService(db)
    
    async def create_order(self, user_id: str, credits: int) -> Dict:
        """
        Create a Razorpay order for credit purchase
        
        Args:
            user_id: User ID
            credits: Number of credits to purchase
            
        Returns:
            Order details with Razorpay order ID
        """
        # Calculate pricing (backend is source of truth)
        pricing = PricingService.calculate_price(credits)
        
        # Create payment record in database
        payment = PaymentModel(
            user_id=user_id,
            credits_purchased=credits,
            base_price=pricing["base_price"],
            discount_percent=pricing["discount_percent"],
            discount_amount=pricing["discount_amount"],
            final_price=pricing["final_price"],
            status="created"
        )
        
        # Create Razorpay order
        try:
            razorpay_order = self.client.order.create({
                "amount": pricing["final_price_paise"],  # Amount in paise
                "currency": "INR",
                "receipt": payment.id,
                "notes": {
                    "user_id": user_id,
                    "credits": credits,
                    "payment_id": payment.id
                }
            })
            
            # Update payment record with Razorpay order ID
            payment.razorpay_order_id = razorpay_order["id"]
            payment.status = "pending"
            
            # Save to database
            await self.payments_collection.insert_one(payment.model_dump())
            
            return {
                "payment_id": payment.id,
                "order_id": razorpay_order["id"],
                "amount": pricing["final_price_paise"],
                "amount_inr": pricing["final_price"],
                "currency": "INR",
                "credits": credits,
                "pricing": pricing,
                "key_id": self.razorpay_key_id
            }
            
        except Exception as e:
            # Update payment status to failed
            payment.status = "failed"
            payment.error_message = str(e)
            await self.payments_collection.insert_one(payment.model_dump())
            raise Exception(f"Failed to create Razorpay order: {str(e)}")
    
    async def verify_payment(self, razorpay_order_id: str, razorpay_payment_id: str, 
                            razorpay_signature: str) -> Dict:
        """
        Verify Razorpay payment signature and update payment status
        
        Args:
            razorpay_order_id: Razorpay order ID
            razorpay_payment_id: Razorpay payment ID
            razorpay_signature: Razorpay signature for verification
            
        Returns:
            Payment details and credit update status
        """
        # Verify signature
        is_valid = self._verify_signature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        )
        
        if not is_valid:
            raise ValueError("Invalid payment signature")
        
        # Find payment record
        payment = await self.payments_collection.find_one(
            {"razorpay_order_id": razorpay_order_id}
        )
        
        if not payment:
            raise ValueError("Payment record not found")
        
        # Check if already processed
        if payment["status"] == "paid":
            return {
                "status": "already_processed",
                "payment_id": payment["id"],
                "message": "Payment already processed"
            }
        
        # Update payment record
        await self.payments_collection.update_one(
            {"id": payment["id"]},
            {
                "$set": {
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                    "status": "paid",
                    "paid_at": datetime.utcnow()
                }
            }
        )
        
        # Add credits to user account
        await self.credit_service.add_credits(
            user_id=payment["user_id"],
            credits=payment["credits_purchased"],
            transaction_type="purchase",
            description=f"Purchased {payment['credits_purchased']} credits",
            reference_id=payment["id"]
        )
        
        return {
            "status": "success",
            "payment_id": payment["id"],
            "credits_added": payment["credits_purchased"],
            "message": "Payment verified and credits added successfully"
        }
    
    def _verify_signature(self, order_id: str, payment_id: str, signature: str) -> bool:
        """
        Verify Razorpay payment signature
        """
        try:
            # Create signature string
            message = f"{order_id}|{payment_id}"
            
            # Generate expected signature
            generated_signature = hmac.new(
                self.razorpay_key_secret.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            # Compare signatures
            return hmac.compare_digest(generated_signature, signature)
        except Exception:
            return False
    
    async def handle_webhook(self, payload: Dict, signature: str) -> Dict:
        """
        Handle Razorpay webhook events
        
        Args:
            payload: Webhook payload
            signature: Webhook signature
            
        Returns:
            Processing result
        """
        # Verify webhook signature
        if not self._verify_webhook_signature(payload, signature):
            raise ValueError("Invalid webhook signature")
        
        event = payload.get("event")
        
        if event == "payment.captured":
            # Payment successful
            payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
            order_id = payment_entity.get("order_id")
            payment_id = payment_entity.get("id")
            
            if order_id and payment_id:
                # Update payment status
                await self.payments_collection.update_one(
                    {"razorpay_order_id": order_id},
                    {
                        "$set": {
                            "razorpay_payment_id": payment_id,
                            "status": "paid",
                            "paid_at": datetime.utcnow(),
                            "payment_method": payment_entity.get("method")
                        }
                    }
                )
        
        elif event == "payment.failed":
            # Payment failed
            payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
            order_id = payment_entity.get("order_id")
            
            if order_id:
                await self.payments_collection.update_one(
                    {"razorpay_order_id": order_id},
                    {
                        "$set": {
                            "status": "failed",
                            "error_message": payment_entity.get("error_description")
                        }
                    }
                )
        
        return {"status": "processed", "event": event}
    
    def _verify_webhook_signature(self, payload: Dict, signature: str) -> bool:
        """
        Verify Razorpay webhook signature
        """
        if not self.razorpay_webhook_secret:
            return True  # Skip verification if secret not configured
        
        try:
            import json
            body = json.dumps(payload, separators=(',', ':'))
            
            generated_signature = hmac.new(
                self.razorpay_webhook_secret.encode(),
                body.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(generated_signature, signature)
        except Exception:
            return False
    
    async def get_payment_history(self, user_id: str, limit: int = 50, skip: int = 0) -> List[Dict]:
        """
        Get payment history for a user
        """
        cursor = self.payments_collection.find(
            {"user_id": user_id}
        ).sort("created_at", -1).skip(skip).limit(limit)
        
        payments = await cursor.to_list(length=limit)
        return payments
    
    async def get_payment_by_id(self, payment_id: str) -> Optional[Dict]:
        """
        Get payment details by ID
        """
        return await self.payments_collection.find_one({"id": payment_id})
