from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List
from models.analytics_model import UsageStatsResponse, EndpointStatsResponse
from services.analytics_service import AnalyticsService
from middleware.auth_middleware import get_current_user
from models.user_model import UserModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/usage", response_model=UsageStatsResponse)
async def get_usage_stats(
    period: str = Query("7d", regex="^(1d|7d|30d)$"),
    current_user: UserModel = Depends(get_current_user)
):
    """Get usage statistics for the current user
    
    Args:
        period: Time period for stats - '1d', '7d', or '30d'
    """
    try:
        stats = await AnalyticsService.get_usage_stats(
            user_id=current_user.id,
            period=period
        )
        return stats
    except Exception as e:
        logger.error(f"Error fetching usage stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch usage statistics")


@router.get("/credits")
async def get_credit_usage(
    period: str = Query("30d", regex="^(7d|30d|90d)$"),
    current_user: UserModel = Depends(get_current_user)
):
    """Get credit usage over time
    
    Args:
        period: Time period for stats - '7d', '30d', or '90d'
    """
    try:
        stats = await AnalyticsService.get_credit_usage(
            user_id=current_user.id,
            period=period
        )
        return stats
    except Exception as e:
        logger.error(f"Error fetching credit usage: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch credit usage")


@router.get("/endpoints", response_model=List[EndpointStatsResponse])
async def get_endpoint_stats(
    period: str = Query("7d", regex="^(1d|7d|30d)$"),
    current_user: UserModel = Depends(get_current_user)
):
    """Get statistics per endpoint
    
    Args:
        period: Time period for stats - '1d', '7d', or '30d'
    """
    try:
        stats = await AnalyticsService.get_endpoint_stats(
            user_id=current_user.id,
            period=period
        )
        return stats
    except Exception as e:
        logger.error(f"Error fetching endpoint stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch endpoint statistics")


@router.get("/summary")
async def get_analytics_summary(
    current_user: UserModel = Depends(get_current_user)
):
    """Get a summary of all analytics"""
    try:
        # Get various stats
        usage_stats = await AnalyticsService.get_usage_stats(current_user.id, "7d")
        endpoint_stats = await AnalyticsService.get_endpoint_stats(current_user.id, "7d")
        credit_usage = await AnalyticsService.get_credit_usage(current_user.id, "30d")

        return {
            "usage": usage_stats,
            "endpoints": endpoint_stats,
            "credits": credit_usage
        }
    except Exception as e:
        logger.error(f"Error fetching analytics summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics summary")
