from datetime import datetime, timedelta
from typing import Optional
from database import get_database
from models.credit_transaction_model import CreditTransaction
from config import settings
import logging

logger = logging.getLogger(__name__)

class CreditService:
    @staticmethod
    async def add_credits(user_id: str, credits: int, transaction_type: str, description: str, reference_id: Optional[str] = None) -> int:
        """Add credits to user account"""
        db = get_database()
        
        # Get current user credits
        user = await db.users.find_one({"id": user_id}, {"credits": 1})
        if not user:
            raise ValueError("User not found")
        
        current_credits = user.get("credits", 0)
        new_balance = current_credits + credits
        
        # Update user credits
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"credits": new_balance, "updated_at": datetime.utcnow().isoformat()}}
        )
        
        # Create transaction record
        transaction = CreditTransaction(
            user_id=user_id,
            type=transaction_type,
            credits=credits,
            balance_after=new_balance,
            description=description,
            reference_id=reference_id
        )
        
        transaction_doc = transaction.model_dump()
        transaction_doc['created_at'] = transaction_doc['created_at'].isoformat()
        await db.credit_transactions.insert_one(transaction_doc)
        
        logger.info(f"Added {credits} credits to user {user_id}. New balance: {new_balance}")
        return new_balance
    
    @staticmethod
    async def deduct_credits(user_id: str, credits: int, description: str, reference_id: Optional[str] = None) -> int:
        """Deduct credits from user account"""
        db = get_database()
        
        # Get current user credits
        user = await db.users.find_one({"id": user_id}, {"credits": 1})
        if not user:
            raise ValueError("User not found")
        
        current_credits = user.get("credits", 0)
        if current_credits < credits:
            raise ValueError("Insufficient credits")
        
        new_balance = current_credits - credits
        
        # Update user credits
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"credits": new_balance, "updated_at": datetime.utcnow().isoformat()}}
        )
        
        # Create transaction record
        transaction = CreditTransaction(
            user_id=user_id,
            type="usage",
            credits=-credits,
            balance_after=new_balance,
            description=description,
            reference_id=reference_id
        )
        
        transaction_doc = transaction.model_dump()
        transaction_doc['created_at'] = transaction_doc['created_at'].isoformat()
        await db.credit_transactions.insert_one(transaction_doc)
        
        logger.info(f"Deducted {credits} credits from user {user_id}. New balance: {new_balance}")
        return new_balance
    
    @staticmethod
    async def get_user_credits(user_id: str) -> int:
        """Get user's current credit balance"""
        db = get_database()
        user = await db.users.find_one({"id": user_id}, {"credits": 1})
        if not user:
            return 0
        return user.get("credits", 0)
    
    @staticmethod
    async def reset_daily_free_credits(user_id: str) -> bool:
        """Reset daily free credits for a user"""
        db = get_database()
        
        # Get user
        user = await db.users.find_one({"id": user_id})
        if not user:
            return False
        
        # Check if reset is needed
        last_reset = user.get('last_free_credit_reset')
        if last_reset:
            if isinstance(last_reset, str):
                last_reset = datetime.fromisoformat(last_reset)
            
            # If reset was today, skip
            if last_reset.date() == datetime.utcnow().date():
                return False
        
        # Add free credits
        current_credits = user.get("credits", 0)
        new_balance = current_credits + settings.FREE_DAILY_CREDITS
        
        # Update user
        await db.users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "credits": new_balance,
                    "last_free_credit_reset": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                }
            }
        )
        
        # Create transaction
        transaction = CreditTransaction(
            user_id=user_id,
            type="free",
            credits=settings.FREE_DAILY_CREDITS,
            balance_after=new_balance,
            description="Daily free credits"
        )
        
        transaction_doc = transaction.model_dump()
        transaction_doc['created_at'] = transaction_doc['created_at'].isoformat()
        await db.credit_transactions.insert_one(transaction_doc)
        
        logger.info(f"Reset daily free credits for user {user_id}")
        return True
    
    @staticmethod
    async def get_transactions(user_id: str, limit: int = 100) -> list:
        """Get user's credit transaction history"""
        db = get_database()
        transactions = await db.credit_transactions.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        # Convert ISO strings back to datetime
        for trans in transactions:
            if isinstance(trans.get('created_at'), str):
                trans['created_at'] = datetime.fromisoformat(trans['created_at'])
        
        return transactions
