from typing import Dict, Optional, List
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..models.invoice_model import InvoiceModel, InvoiceLineItem, InvoiceResponse

class InvoiceService:
    """
    Service for generating and managing invoices
    """
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.invoices_collection = db.invoices
        self.payments_collection = db.payments
        self.users_collection = db.users
    
    async def _get_next_invoice_number(self) -> str:
        """
        Generate sequential invoice number
        """
        # Get the last invoice
        last_invoice = await self.invoices_collection.find_one(
            {},
            sort=[("invoice_date", -1)]
        )
        
        if not last_invoice:
            return "INV-2024-0001"
        
        # Extract number and increment
        try:
            last_number = int(last_invoice["invoice_number"].split("-")[-1])
            new_number = last_number + 1
            return f"INV-2024-{new_number:04d}"
        except:
            # Fallback to timestamp-based number
            return f"INV-2024-{int(datetime.utcnow().timestamp())}"
    
    async def create_invoice(self, payment_id: str) -> Dict:
        """
        Create invoice for a payment
        
        Args:
            payment_id: Payment ID
            
        Returns:
            Invoice details
        """
        # Get payment details
        payment = await self.payments_collection.find_one({"id": payment_id})
        
        if not payment:
            raise ValueError("Payment not found")
        
        # Check if invoice already exists
        existing_invoice = await self.invoices_collection.find_one(
            {"payment_id": payment_id}
        )
        
        if existing_invoice:
            return existing_invoice
        
        # Get user details
        user = await self.users_collection.find_one({"id": payment["user_id"]})
        
        if not user:
            raise ValueError("User not found")
        
        # Generate invoice number
        invoice_number = await self._get_next_invoice_number()
        
        # Create line item
        line_items = [
            InvoiceLineItem(
                description=f"TrailRoom Credits - {payment['credits_purchased']} credits",
                quantity=payment['credits_purchased'],
                unit_price=1.0,  # ₹1 per credit
                discount=payment['discount_amount'],
                amount=payment['final_price']
            )
        ]
        
        # Create invoice
        invoice = InvoiceModel(
            invoice_number=invoice_number,
            user_id=payment["user_id"],
            payment_id=payment_id,
            customer_name=user.get("name", user.get("email")),
            customer_email=user.get("email"),
            customer_phone=user.get("phone"),
            line_items=[item.model_dump() for item in line_items],
            subtotal=payment["base_price"],
            discount_amount=payment["discount_amount"],
            tax_amount=0.0,  # No tax for now
            total_amount=payment["final_price"],
            invoice_date=payment.get("paid_at", datetime.utcnow()),
            paid_date=payment.get("paid_at"),
            status="paid"
        )
        
        # Save to database
        await self.invoices_collection.insert_one(invoice.model_dump())
        
        return invoice.model_dump()
    
    async def get_invoice_by_id(self, invoice_id: str) -> Optional[Dict]:
        """
        Get invoice by ID
        """
        return await self.invoices_collection.find_one({"id": invoice_id})
    
    async def get_invoices_by_user(self, user_id: str, limit: int = 50, skip: int = 0) -> List[Dict]:
        """
        Get all invoices for a user
        """
        cursor = self.invoices_collection.find(
            {"user_id": user_id}
        ).sort("invoice_date", -1).skip(skip).limit(limit)
        
        invoices = await cursor.to_list(length=limit)
        return invoices
    
    async def generate_invoice_text(self, invoice_id: str) -> str:
        """
        Generate text-based invoice for download
        
        Args:
            invoice_id: Invoice ID
            
        Returns:
            Formatted invoice text
        """
        invoice = await self.get_invoice_by_id(invoice_id)
        
        if not invoice:
            raise ValueError("Invoice not found")
        
        # Format invoice as text
        text = f"""
========================================
            INVOICE
========================================

Invoice Number: {invoice['invoice_number']}
Invoice Date: {invoice['invoice_date'].strftime('%Y-%m-%d %H:%M:%S')}

----------------------------------------
COMPANY DETAILS
----------------------------------------
{invoice['company_name']}
{invoice.get('company_address', '')}
Email: {invoice.get('company_email', '')}

----------------------------------------
CUSTOMER DETAILS
----------------------------------------
Name: {invoice.get('customer_name', 'N/A')}
Email: {invoice.get('customer_email', 'N/A')}
Phone: {invoice.get('customer_phone', 'N/A')}

----------------------------------------
LINE ITEMS
----------------------------------------
"""
        
        for item in invoice['line_items']:
            text += f"\n{item['description']}"
            text += f"\nQuantity: {item['quantity']} credits"
            text += f"\nUnit Price: ₹{item['unit_price']}"
            text += f"\nDiscount: ₹{item['discount']}"
            text += f"\nAmount: ₹{item['amount']}\n"
            text += "----------------------------------------\n"
        
        text += f"""
Subtotal: ₹{invoice['subtotal']}
Discount: -₹{invoice['discount_amount']}
Tax: ₹{invoice['tax_amount']}
========================================
TOTAL: ₹{invoice['total_amount']}
========================================

Status: {invoice['status'].upper()}
Paid Date: {invoice.get('paid_date', 'N/A')}

Thank you for using TrailRoom!
For support, contact: support@trailroom.com
"""
        
        return text
