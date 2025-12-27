from database import Database
from datetime import datetime, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class AdminAnalyticsService:
    """
    Service for admin analytics and system monitoring
    """
    
    @staticmethod
    async def get_dashboard_stats():
        """
        Get comprehensive dashboard statistics
        """
        try:
            db = Database.get_db()
            
            # User statistics
            total_users = await db.users.count_documents({})
            free_users = await db.users.count_documents({"role": "free"})
            paid_users = await db.users.count_documents({"role": "paid"})
            admin_users = await db.users.count_documents({"role": "admin"})
            active_users = await db.users.count_documents({"is_active": True})
            suspended_users = await db.users.count_documents({"is_suspended": True})
            
            # Get new users today
            today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            new_users_today = await db.users.count_documents({
                "created_at": {"$gte": today}
            })
            
            # Get new users this week
            week_ago = datetime.utcnow() - timedelta(days=7)
            new_users_week = await db.users.count_documents({
                "created_at": {"$gte": week_ago}
            })
            
            # Revenue statistics
            total_revenue_result = await db.payments.aggregate([
                {"$match": {"status": "completed"}},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
            ]).to_list(1)
            total_revenue = total_revenue_result[0]["total"] if total_revenue_result else 0
            
            # Revenue today
            revenue_today_result = await db.payments.aggregate([
                {"$match": {
                    "status": "completed",
                    "created_at": {"$gte": today}
                }},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
            ]).to_list(1)
            revenue_today = revenue_today_result[0]["total"] if revenue_today_result else 0
            
            # Revenue this month
            month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            revenue_month_result = await db.payments.aggregate([
                {"$match": {
                    "status": "completed",
                    "created_at": {"$gte": month_start}
                }},
                {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
            ]).to_list(1)
            revenue_month = revenue_month_result[0]["total"] if revenue_month_result else 0
            
            # Try-on job statistics
            total_jobs = await db.tryon_jobs.count_documents({})
            completed_jobs = await db.tryon_jobs.count_documents({"status": "completed"})
            failed_jobs = await db.tryon_jobs.count_documents({"status": "failed"})
            processing_jobs = await db.tryon_jobs.count_documents({"status": "processing"})
            queued_jobs = await db.tryon_jobs.count_documents({"status": "queued"})
            
            # Jobs today
            jobs_today = await db.tryon_jobs.count_documents({
                "created_at": {"$gte": today}
            })
            
            # Credit statistics
            total_credits_result = await db.credit_transactions.aggregate([
                {"$match": {"type": "purchase"}},
                {"$group": {"_id": None, "total": {"$sum": "$credits"}}}
            ]).to_list(1)
            total_credits_sold = total_credits_result[0]["total"] if total_credits_result else 0
            
            # Credits used
            credits_used_result = await db.credit_transactions.aggregate([
                {"$match": {"type": "usage"}},
                {"$group": {"_id": None, "total": {"$sum": "$credits"}}}
            ]).to_list(1)
            total_credits_used = abs(credits_used_result[0]["total"]) if credits_used_result else 0
            
            # Error rate (failed jobs / total jobs)
            error_rate = (failed_jobs / total_jobs * 100) if total_jobs > 0 else 0
            
            return {
                "users": {
                    "total": total_users,
                    "free": free_users,
                    "paid": paid_users,
                    "admin": admin_users,
                    "active": active_users,
                    "suspended": suspended_users,
                    "new_today": new_users_today,
                    "new_week": new_users_week
                },
                "revenue": {
                    "total": total_revenue / 100,  # Convert from paise to rupees
                    "today": revenue_today / 100,
                    "month": revenue_month / 100
                },
                "jobs": {
                    "total": total_jobs,
                    "completed": completed_jobs,
                    "failed": failed_jobs,
                    "processing": processing_jobs,
                    "queued": queued_jobs,
                    "today": jobs_today,
                    "error_rate": round(error_rate, 2)
                },
                "credits": {
                    "sold": total_credits_sold,
                    "used": total_credits_used,
                    "remaining": total_credits_sold - total_credits_used
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting dashboard stats: {str(e)}")
            raise
    
    @staticmethod
    async def get_revenue_chart(days: int = 30):
        """
        Get daily revenue data for chart
        """
        try:
            db = Database.get_db()
            start_date = datetime.utcnow() - timedelta(days=days)
            
            pipeline = [
                {
                    "$match": {
                        "status": "completed",
                        "created_at": {"$gte": start_date}
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "$dateToString": {
                                "format": "%Y-%m-%d",
                                "date": "$created_at"
                            }
                        },
                        "revenue": {"$sum": "$amount"},
                        "count": {"$sum": 1}
                    }
                },
                {"$sort": {"_id": 1}}
            ]
            
            results = await db.payments.aggregate(pipeline).to_list(None)
            
            return [
                {
                    "date": r["_id"],
                    "revenue": r["revenue"] / 100,  # Convert to rupees
                    "count": r["count"]
                }
                for r in results
            ]
            
        except Exception as e:
            logger.error(f"Error getting revenue chart: {str(e)}")
            raise
    
    @staticmethod
    async def get_jobs_chart(days: int = 30):
        """
        Get daily job statistics for chart
        """
        try:
            db = Database.get_db()
            start_date = datetime.utcnow() - timedelta(days=days)
            
            pipeline = [
                {
                    "$match": {
                        "created_at": {"$gte": start_date}
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "date": {
                                "$dateToString": {
                                    "format": "%Y-%m-%d",
                                    "date": "$created_at"
                                }
                            },
                            "status": "$status"
                        },
                        "count": {"$sum": 1}
                    }
                },
                {"$sort": {"_id.date": 1}}
            ]
            
            results = await db.tryon_jobs.aggregate(pipeline).to_list(None)
            
            # Organize by date
            by_date = {}
            for r in results:
                date = r["_id"]["date"]
                status = r["_id"]["status"]
                if date not in by_date:
                    by_date[date] = {"date": date, "completed": 0, "failed": 0, "processing": 0, "queued": 0}
                by_date[date][status] = r["count"]
            
            return list(by_date.values())
            
        except Exception as e:
            logger.error(f"Error getting jobs chart: {str(e)}")
            raise
    
    @staticmethod
    async def get_user_growth_chart(days: int = 30):
        """
        Get user growth data for chart
        """
        try:
            db = Database.get_db()
            start_date = datetime.utcnow() - timedelta(days=days)
            
            pipeline = [
                {
                    "$match": {
                        "created_at": {"$gte": start_date}
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "$dateToString": {
                                "format": "%Y-%m-%d",
                                "date": "$created_at"
                            }
                        },
                        "count": {"$sum": 1}
                    }
                },
                {"$sort": {"_id": 1}}
            ]
            
            results = await db.users.aggregate(pipeline).to_list(None)
            
            return [
                {
                    "date": r["_id"],
                    "new_users": r["count"]
                }
                for r in results
            ]
            
        except Exception as e:
            logger.error(f"Error getting user growth chart: {str(e)}")
            raise
