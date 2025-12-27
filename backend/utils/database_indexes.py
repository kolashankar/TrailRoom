"""
Database index creation for performance optimization
"""
import logging
from database import Database

logger = logging.getLogger(__name__)

async def create_indexes():
    """Create database indexes for frequently queried fields"""
    db = Database.get_db()
    
    try:
        # Users collection indexes
        await db.users.create_index("id", unique=True)
        await db.users.create_index("email", unique=True)
        await db.users.create_index("created_at")
        logger.info("Created indexes for users collection")
        
        # TryOn Jobs collection indexes
        await db.tryon_jobs.create_index("id", unique=True)
        await db.tryon_jobs.create_index("user_id")
        await db.tryon_jobs.create_index("status")
        await db.tryon_jobs.create_index("created_at")
        await db.tryon_jobs.create_index([("user_id", 1), ("created_at", -1)])
        logger.info("Created indexes for tryon_jobs collection")
        
        # Credit Transactions collection indexes
        await db.credit_transactions.create_index("id", unique=True)
        await db.credit_transactions.create_index("user_id")
        await db.credit_transactions.create_index("created_at")
        await db.credit_transactions.create_index([("user_id", 1), ("created_at", -1)])
        logger.info("Created indexes for credit_transactions collection")
        
        # Payments collection indexes
        await db.payments.create_index("id", unique=True)
        await db.payments.create_index("user_id")
        await db.payments.create_index("razorpay_order_id", unique=True)
        await db.payments.create_index("razorpay_payment_id")
        await db.payments.create_index("created_at")
        logger.info("Created indexes for payments collection")
        
        # Invoices collection indexes
        await db.invoices.create_index("id", unique=True)
        await db.invoices.create_index("user_id")
        await db.invoices.create_index("payment_id")
        await db.invoices.create_index("created_at")
        logger.info("Created indexes for invoices collection")
        
        # Webhooks collection indexes
        await db.webhooks.create_index("id", unique=True)
        await db.webhooks.create_index("user_id")
        await db.webhooks.create_index("is_active")
        logger.info("Created indexes for webhooks collection")
        
        # API Keys collection indexes
        await db.api_keys.create_index("id", unique=True)
        await db.api_keys.create_index("user_id")
        await db.api_keys.create_index("key_hash")
        await db.api_keys.create_index("is_active")
        logger.info("Created indexes for api_keys collection")
        
        logger.info("All database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Error creating indexes: {str(e)}")
        raise

if __name__ == "__main__":
    import asyncio
    asyncio.run(create_indexes())
