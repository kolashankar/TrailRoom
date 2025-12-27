from database import Database
from models.audit_log_model import AuditLogCreate, AuditLogInDB
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

class AuditService:
    """
    Service for managing audit logs
    """
    
    @staticmethod
    async def log_action(
        action: str,
        admin_id: str,
        admin_email: str,
        target_type: str,
        target_id: Optional[str] = None,
        details: dict = {},
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ):
        """
        Log an admin action
        """
        try:
            db = Database.get_db()
            
            audit_log = AuditLogInDB(
                action=action,
                admin_id=admin_id,
                admin_email=admin_email,
                target_type=target_type,
                target_id=target_id,
                details=details,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            await db.audit_logs.insert_one(audit_log.model_dump())
            logger.info(f"Audit log created: {action} by {admin_email}")
            
            return audit_log
            
        except Exception as e:
            logger.error(f"Error logging action: {str(e)}")
            # Don't raise - audit logging should not break the main flow
    
    @staticmethod
    async def get_logs(
        target_type: Optional[str] = None,
        target_id: Optional[str] = None,
        admin_id: Optional[str] = None,
        limit: int = 100,
        skip: int = 0
    ) -> List[dict]:
        """
        Get audit logs with filters
        """
        try:
            db = Database.get_db()
            
            query = {}
            if target_type:
                query["target_type"] = target_type
            if target_id:
                query["target_id"] = target_id
            if admin_id:
                query["admin_id"] = admin_id
            
            logs = await db.audit_logs.find(query).sort("timestamp", -1).skip(skip).limit(limit).to_list(None)
            
            return logs
            
        except Exception as e:
            logger.error(f"Error getting audit logs: {str(e)}")
            raise
    
    @staticmethod
    async def search_logs(search_term: str, limit: int = 100) -> List[dict]:
        """
        Search audit logs
        """
        try:
            db = Database.get_db()
            
            # Search in action, admin_email, and target_id
            query = {
                "$or": [
                    {"action": {"$regex": search_term, "$options": "i"}},
                    {"admin_email": {"$regex": search_term, "$options": "i"}},
                    {"target_id": {"$regex": search_term, "$options": "i"}}
                ]
            }
            
            logs = await db.audit_logs.find(query).sort("timestamp", -1).limit(limit).to_list(None)
            
            return logs
            
        except Exception as e:
            logger.error(f"Error searching audit logs: {str(e)}")
            raise
