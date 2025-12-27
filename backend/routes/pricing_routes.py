from fastapi import APIRouter, HTTPException, Depends
from typing import List

from ..services.pricing_service import PricingService
from ..middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/v1/pricing", tags=["pricing"])

@router.get("/calculate")
async def calculate_pricing(credits: int, current_user: dict = Depends(get_current_user)):
    """
    Calculate pricing for a given number of credits
    
    Query Parameters:
    - credits: Number of credits (300-50000)
    
    Returns:
    - Complete pricing breakdown with discounts
    """
    try:
        if credits < PricingService.MIN_CREDITS or credits > PricingService.MAX_CREDITS:
            raise HTTPException(
                status_code=400,
                detail=f"Credits must be between {PricingService.MIN_CREDITS} and {PricingService.MAX_CREDITS}"
            )
        
        pricing = PricingService.calculate_price(credits)
        return {
            "success": True,
            "pricing": pricing
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plans")
async def get_pricing_plans(current_user: dict = Depends(get_current_user)):
    """
    Get all pricing plans and tiers
    
    Returns:
    - Fixed plan (2100 credits)
    - Sample pricing tiers
    - Discount information
    """
    try:
        fixed_plan = PricingService.get_fixed_plan()
        tiers = PricingService.get_pricing_tiers()
        
        return {
            "success": True,
            "fixed_plan": {
                "name": "Starter Pack",
                "credits": PricingService.FIXED_PLAN_CREDITS,
                "pricing": fixed_plan,
                "recommended": True
            },
            "custom_plan": {
                "name": "Custom Plan",
                "min_credits": PricingService.MIN_CREDITS,
                "max_credits": PricingService.MAX_CREDITS,
                "description": "Choose any amount between 300 and 50,000 credits"
            },
            "pricing_tiers": tiers,
            "discount_info": {
                "min_threshold": PricingService.MIN_DISCOUNT_THRESHOLD,
                "min_discount": PricingService.MIN_DISCOUNT,
                "max_discount": PricingService.MAX_DISCOUNT,
                "max_discount_threshold": PricingService.MAX_DISCOUNT_THRESHOLD
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/discount")
async def get_discount_info(credits: int = None):
    """
    Get discount information
    
    Query Parameters:
    - credits (optional): Calculate discount for specific credits
    
    Returns:
    - Discount rules and calculated discount
    """
    try:
        response = {
            "success": True,
            "discount_rules": {
                "below_2100": "0% discount",
                "at_2100": "10% discount",
                "between_2100_and_50000": "Linear interpolation from 10% to 25%",
                "above_50000": "25% discount (maximum)"
            }
        }
        
        if credits:
            discount = PricingService.calculate_discount(credits)
            response["calculated_discount"] = {
                "credits": credits,
                "discount_percent": discount
            }
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
