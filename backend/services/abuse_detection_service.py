from database import Database
from datetime import datetime, timedelta
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

class AbuseDetectionService:
    """
    Service for detecting abuse patterns and suspicious activity
    """
    
    @staticmethod
    async def detect_excessive_usage(user_id: str, time_window: int = 60) -> dict:
        """
        Detect if user is making excessive API calls
        time_window: minutes to check
        """
        try:
            db = Database.get_db()
            start_time = datetime.utcnow() - timedelta(minutes=time_window)
            
            # Count jobs in time window
            job_count = await db.tryon_jobs.count_documents({
                "user_id": user_id,
                "created_at": {"$gte": start_time}
            })
            
            # Threshold: 50 jobs per hour is suspicious
            is_suspicious = job_count > 50
            
            return {
                "user_id": user_id,
                "job_count": job_count,
                "time_window_minutes": time_window,
                "is_suspicious": is_suspicious,
                "threshold": 50,
                "checked_at": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error detecting excessive usage: {str(e)}")
            raise
    
    @staticmethod
    async def detect_failed_payments(user_id: str) -> dict:
        """
        Detect patterns of failed payments
        """
        try:
            db = Database.get_db()
            
            # Count failed payments in last 7 days
            week_ago = datetime.utcnow() - timedelta(days=7)
            failed_count = await db.payments.count_documents({
                "user_id": user_id,
                "status": "failed",
                "created_at": {"$gte": week_ago}
            })
            
            # Threshold: 3 or more failed payments is suspicious
            is_suspicious = failed_count >= 3
            
            return {
                "user_id": user_id,
                "failed_payment_count": failed_count,
                "time_window_days": 7,
                "is_suspicious": is_suspicious,
                "threshold": 3,
                "checked_at": datetime.utcnow()
            }
            
        except Exception as e:
            logger.error(f"Error detecting failed payments: {str(e)}")
            raise
    
    @staticmethod
    async def detect_api_scraping(user_id: str) -> dict:
        """
        Detect if user might be scraping the API
        Based on: high frequency, consistent patterns, no variation
        """
        try:
            db = Database.get_db()
            
            # Get last 24 hours of jobs
            day_ago = datetime.utcnow() - timedelta(days=1)
            jobs = await db.tryon_jobs.find({
                "user_id": user_id,
                "created_at": {"$gte": day_ago}
            }).to_list(None)
            
            if len(jobs) < 20:  # Not enough data
                return {
                    "user_id": user_id,
                    "is_suspicious": False,
                    "reason": "Insufficient data",
                    "job_count": len(jobs)
                }
            
            # Check for consistent time intervals (bot-like behavior)
            if len(jobs) >= 2:
                timestamps = [job["created_at"] for job in jobs]
                timestamps.sort()
                
                intervals = []
                for i in range(1, len(timestamps)):
                    interval = (timestamps[i] - timestamps[i-1]).total_seconds()
                    intervals.append(interval)
                
                # If intervals are very consistent (low variance), might be automated
                if len(intervals) > 0:
                    avg_interval = sum(intervals) / len(intervals)
                    variance = sum((x - avg_interval) ** 2 for x in intervals) / len(intervals)
                    
                    # Low variance + high frequency = suspicious
                    is_suspicious = variance < 100 and avg_interval < 300  # < 5 min avg
                    
                    return {
                        "user_id": user_id,
                        "is_suspicious": is_suspicious,
                        "job_count": len(jobs),
                        "avg_interval_seconds": round(avg_interval, 2),
                        "variance": round(variance, 2),
                        "reason": "Consistent automated pattern detected" if is_suspicious else "Normal usage"
                    }
            
            return {
                "user_id": user_id,
                "is_suspicious": False,
                "job_count": len(jobs)
            }
            
        except Exception as e:
            logger.error(f"Error detecting API scraping: {str(e)}")
            raise
    
    @staticmethod
    async def get_suspicious_users() -> List[dict]:
        """
        Get list of users with suspicious activity
        """
        try:
            db = Database.get_db()
            suspicious_users = []
            
            # Get all active users
            users = await db.users.find({"is_active": True}).to_list(None)
            
            for user in users:
                user_id = user["id"]
                
                # Check various abuse patterns
                excessive_usage = await AbuseDetectionService.detect_excessive_usage(user_id, 60)
                failed_payments = await AbuseDetectionService.detect_failed_payments(user_id)
                api_scraping = await AbuseDetectionService.detect_api_scraping(user_id)
                
                # If any pattern is suspicious, add to list
                if excessive_usage["is_suspicious"] or failed_payments["is_suspicious"] or api_scraping["is_suspicious"]:
                    suspicious_users.append({
                        "user_id": user_id,
                        "email": user.get("email"),
                        "role": user.get("role"),
                        "excessive_usage": excessive_usage["is_suspicious"],
                        "failed_payments": failed_payments["is_suspicious"],
                        "api_scraping": api_scraping["is_suspicious"],
                        "details": {
                            "excessive_usage": excessive_usage,
                            "failed_payments": failed_payments,
                            "api_scraping": api_scraping
                        }
                    })
            
            return suspicious_users
            
        except Exception as e:
            logger.error(f"Error getting suspicious users: {str(e)}")
            raise
    
    @staticmethod
    async def block_ip(ip_address: str, reason: str, admin_id: str) -> dict:
        """
        Block an IP address
        """
        try:
            db = Database.get_db()
            
            blocked_ip = {
                "ip_address": ip_address,
                "reason": reason,
                "blocked_by": admin_id,
                "blocked_at": datetime.utcnow(),
                "is_active": True
            }
            
            await db.blocked_ips.insert_one(blocked_ip)
            
            return blocked_ip
            
        except Exception as e:
            logger.error(f"Error blocking IP: {str(e)}")
            raise
    
    @staticmethod
    async def unblock_ip(ip_address: str) -> bool:
        """
        Unblock an IP address
        """
        try:
            db = Database.get_db()
            
            result = await db.blocked_ips.update_one(
                {"ip_address": ip_address},
                {"$set": {"is_active": False}}
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error unblocking IP: {str(e)}")
            raise
    
    @staticmethod
    async def get_blocked_ips() -> List[dict]:
        """
        Get all blocked IPs
        """
        try:
            db = Database.get_db()
            
            blocked_ips = await db.blocked_ips.find({"is_active": True}).to_list(None)
            return blocked_ips
            
        except Exception as e:
            logger.error(f"Error getting blocked IPs: {str(e)}")
            raise
