from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from database import Database
from models.analytics_model import UsageEventModel, UsageStatsResponse, EndpointStatsResponse
import logging

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Service for tracking and analyzing API usage"""

    @staticmethod
    async def track_request(
        user_id: str,
        endpoint: str,
        method: str,
        status_code: int,
        response_time_ms: float,
        credits_used: int = 0,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Track an API request"""
        event = UsageEventModel(
            user_id=user_id,
            endpoint=endpoint,
            method=method,
            status_code=status_code,
            response_time_ms=response_time_ms,
            credits_used=credits_used,
            metadata=metadata
        )

        db = await Database.get_database()
        await db.usage_events.insert_one(event.model_dump())
        logger.debug(f"Tracked request: {method} {endpoint} for user {user_id}")

    @staticmethod
    async def get_usage_stats(
        user_id: str,
        period: str = "7d"  # '1d', '7d', '30d'
    ) -> UsageStatsResponse:
        """Get usage statistics for a user"""
        # Parse period
        period_map = {
            "1d": 1,
            "7d": 7,
            "30d": 30
        }
        days = period_map.get(period, 7)
        period_start = datetime.utcnow() - timedelta(days=days)
        period_end = datetime.utcnow()

        db = await Database.get_database()

        # Get all events in period
        events = await db.usage_events.find({
            "user_id": user_id,
            "timestamp": {"$gte": period_start, "$lte": period_end}
        }).to_list(10000)

        if not events:
            return UsageStatsResponse(
                total_requests=0,
                successful_requests=0,
                failed_requests=0,
                total_credits_used=0,
                average_response_time=0,
                period_start=period_start,
                period_end=period_end,
                daily_breakdown=[]
            )

        # Calculate stats
        total_requests = len(events)
        successful_requests = len([e for e in events if 200 <= e["status_code"] < 300])
        failed_requests = total_requests - successful_requests
        total_credits_used = sum(e.get("credits_used", 0) for e in events)
        average_response_time = sum(e["response_time_ms"] for e in events) / total_requests

        # Daily breakdown
        daily_stats = {}
        for event in events:
            day = event["timestamp"].date().isoformat()
            if day not in daily_stats:
                daily_stats[day] = {
                    "date": day,
                    "requests": 0,
                    "credits": 0,
                    "errors": 0
                }
            daily_stats[day]["requests"] += 1
            daily_stats[day]["credits"] += event.get("credits_used", 0)
            if event["status_code"] >= 400:
                daily_stats[day]["errors"] += 1

        daily_breakdown = sorted(daily_stats.values(), key=lambda x: x["date"])

        return UsageStatsResponse(
            total_requests=total_requests,
            successful_requests=successful_requests,
            failed_requests=failed_requests,
            total_credits_used=total_credits_used,
            average_response_time=round(average_response_time, 2),
            period_start=period_start,
            period_end=period_end,
            daily_breakdown=daily_breakdown
        )

    @staticmethod
    async def get_credit_usage(
        user_id: str,
        period: str = "30d"
    ) -> Dict[str, Any]:
        """Get credit usage over time"""
        period_map = {
            "7d": 7,
            "30d": 30,
            "90d": 90
        }
        days = period_map.get(period, 30)
        period_start = datetime.utcnow() - timedelta(days=days)

        db = await Database.get_database()

        # Get credit transactions
        transactions = await db.credit_transactions.find({
            "user_id": user_id,
            "created_at": {"$gte": period_start}
        }).to_list(1000)

        # Group by day and type
        daily_usage = {}
        for txn in transactions:
            day = txn["created_at"].date().isoformat()
            if day not in daily_usage:
                daily_usage[day] = {
                    "date": day,
                    "used": 0,
                    "purchased": 0,
                    "free": 0
                }
            
            if txn["type"] == "usage":
                daily_usage[day]["used"] += abs(txn["credits"])
            elif txn["type"] == "purchase":
                daily_usage[day]["purchased"] += txn["credits"]
            elif txn["type"] == "free":
                daily_usage[day]["free"] += txn["credits"]

        return {
            "period": period,
            "period_start": period_start.isoformat(),
            "period_end": datetime.utcnow().isoformat(),
            "daily_breakdown": sorted(daily_usage.values(), key=lambda x: x["date"])
        }

    @staticmethod
    async def get_endpoint_stats(
        user_id: str,
        period: str = "7d"
    ) -> List[EndpointStatsResponse]:
        """Get statistics per endpoint"""
        period_map = {
            "1d": 1,
            "7d": 7,
            "30d": 30
        }
        days = period_map.get(period, 7)
        period_start = datetime.utcnow() - timedelta(days=days)

        db = await Database.get_database()

        # Get all events in period
        events = await db.usage_events.find({
            "user_id": user_id,
            "timestamp": {"$gte": period_start}
        }).to_list(10000)

        # Group by endpoint
        endpoint_stats = {}
        for event in events:
            endpoint = event["endpoint"]
            if endpoint not in endpoint_stats:
                endpoint_stats[endpoint] = {
                    "endpoint": endpoint,
                    "total_requests": 0,
                    "successful_requests": 0,
                    "total_response_time": 0,
                    "credits_used": 0
                }
            
            endpoint_stats[endpoint]["total_requests"] += 1
            if 200 <= event["status_code"] < 300:
                endpoint_stats[endpoint]["successful_requests"] += 1
            endpoint_stats[endpoint]["total_response_time"] += event["response_time_ms"]
            endpoint_stats[endpoint]["credits_used"] += event.get("credits_used", 0)

        # Calculate derived stats
        result = []
        for stats in endpoint_stats.values():
            success_rate = (
                stats["successful_requests"] / stats["total_requests"] * 100
                if stats["total_requests"] > 0 else 0
            )
            avg_response_time = (
                stats["total_response_time"] / stats["total_requests"]
                if stats["total_requests"] > 0 else 0
            )
            
            result.append(EndpointStatsResponse(
                endpoint=stats["endpoint"],
                total_requests=stats["total_requests"],
                success_rate=round(success_rate, 2),
                average_response_time=round(avg_response_time, 2),
                credits_used=stats["credits_used"]
            ))

        return sorted(result, key=lambda x: x.total_requests, reverse=True)
