from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

from database import Database
from middleware.admin_middleware import AdminMiddleware
from services.admin_analytics_service import AdminAnalyticsService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/analytics", tags=["Admin - Analytics"])
security = HTTPBearer()

@router.get("/dashboard")
async def get_dashboard_stats(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get comprehensive dashboard statistics
    Requires: any admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_admin(None, credentials)
        
        stats = await AdminAnalyticsService.get_dashboard_stats()
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving dashboard statistics"
        )

@router.get("/revenue-chart")
async def get_revenue_chart(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    days: int = Query(30, ge=1, le=365, description="Number of days to include")
):
    """
    Get revenue chart data
    Requires: finance_admin or super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_finance_admin(None, credentials)
        
        chart_data = await AdminAnalyticsService.get_revenue_chart(days)
        
        return {"data": chart_data}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting revenue chart: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving revenue chart"
        )

@router.get("/jobs-chart")
async def get_jobs_chart(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    days: int = Query(30, ge=1, le=365, description="Number of days to include")
):
    """
    Get jobs chart data
    Requires: any admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_admin(None, credentials)
        
        chart_data = await AdminAnalyticsService.get_jobs_chart(days)
        
        return {"data": chart_data}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting jobs chart: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving jobs chart"
        )

@router.get("/user-growth-chart")
async def get_user_growth_chart(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    days: int = Query(30, ge=1, le=365, description="Number of days to include")
):
    """
    Get user growth chart data
    Requires: any admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_admin(None, credentials)
        
        chart_data = await AdminAnalyticsService.get_user_growth_chart(days)
        
        return {"data": chart_data}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user growth chart: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving user growth chart"
        )
