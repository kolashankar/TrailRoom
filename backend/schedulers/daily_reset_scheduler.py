from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import logging
from ..database import get_database
from ..services.credit_service import CreditService

logger = logging.getLogger(__name__)

class DailyCreditResetScheduler:
    """Scheduler for resetting daily free credits"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
    
    async def reset_all_user_credits(self):
        """Reset daily free credits for all active users"""
        try:
            db = get_database()
            
            # Find all active users
            users = await db.users.find(
                {"is_active": True, "is_suspended": False},
                {"id": 1}
            ).to_list(None)
            
            reset_count = 0
            for user in users:
                try:
                    success = await CreditService.reset_daily_free_credits(user["id"])
                    if success:
                        reset_count += 1
                except Exception as e:
                    logger.error(f"Failed to reset credits for user {user['id']}: {e}")
            
            logger.info(f"Daily credit reset completed. Reset {reset_count} users.")
        except Exception as e:
            logger.error(f"Error in daily credit reset: {e}")
    
    def start(self):
        """Start the scheduler"""
        # Run every day at midnight UTC
        self.scheduler.add_job(
            self.reset_all_user_credits,
            trigger=CronTrigger(hour=0, minute=0, timezone='UTC'),
            id='daily_credit_reset',
            name='Reset daily free credits',
            replace_existing=True
        )
        
        self.scheduler.start()
        logger.info("Daily credit reset scheduler started")
    
    def shutdown(self):
        """Shutdown the scheduler"""
        self.scheduler.shutdown()
        logger.info("Daily credit reset scheduler stopped")

# Global scheduler instance
scheduler_instance = None

def get_scheduler():
    global scheduler_instance
    if scheduler_instance is None:
        scheduler_instance = DailyCreditResetScheduler()
    return scheduler_instance
