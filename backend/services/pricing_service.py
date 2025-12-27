from typing import Dict
import math

class PricingService:
    """
    Service for calculating dynamic pricing with discounts
    
    Pricing Rules:
    - Base: ₹1 = 1 credit
    - < 2100 credits: 0% discount
    - = 2100 credits: 10% discount
    - 2100 - 50000 credits: Linear interpolation from 10% to 25%
    - >= 50000 credits: 25% discount (max)
    """
    
    MIN_CREDITS = 300
    MAX_CREDITS = 50000
    FIXED_PLAN_CREDITS = 2100
    
    MIN_DISCOUNT_THRESHOLD = 2100
    MIN_DISCOUNT = 10.0  # 10%
    MAX_DISCOUNT = 25.0  # 25%
    MAX_DISCOUNT_THRESHOLD = 50000
    
    BASE_RATE = 1.0  # ₹1 = 1 credit
    
    @staticmethod
    def calculate_discount(credits: int) -> float:
        """
        Calculate discount percentage based on credits
        
        Args:
            credits: Number of credits
            
        Returns:
            Discount percentage (0-25)
        """
        if credits < PricingService.MIN_DISCOUNT_THRESHOLD:
            return 0.0
        
        if credits == PricingService.MIN_DISCOUNT_THRESHOLD:
            return PricingService.MIN_DISCOUNT
        
        if credits >= PricingService.MAX_DISCOUNT_THRESHOLD:
            return PricingService.MAX_DISCOUNT
        
        # Linear interpolation between 10% and 25%
        credits_range = PricingService.MAX_DISCOUNT_THRESHOLD - PricingService.MIN_DISCOUNT_THRESHOLD
        discount_range = PricingService.MAX_DISCOUNT - PricingService.MIN_DISCOUNT
        
        discount = PricingService.MIN_DISCOUNT + (
            ((credits - PricingService.MIN_DISCOUNT_THRESHOLD) / credits_range) * discount_range
        )
        
        return math.floor(discount * 10) / 10  # Round to 1 decimal place
    
    @staticmethod
    def calculate_price(credits: int) -> Dict[str, float]:
        """
        Calculate complete pricing breakdown
        
        Args:
            credits: Number of credits
            
        Returns:
            Dictionary with pricing details
        """
        # Validate credits
        if credits < PricingService.MIN_CREDITS:
            credits = PricingService.MIN_CREDITS
        if credits > PricingService.MAX_CREDITS:
            credits = PricingService.MAX_CREDITS
        
        # Calculate base price
        base_price = credits * PricingService.BASE_RATE
        
        # Calculate discount
        discount_percent = PricingService.calculate_discount(credits)
        discount_amount = (base_price * discount_percent) / 100
        
        # Calculate final price
        final_price = base_price - discount_amount
        
        return {
            "credits": credits,
            "base_price": round(base_price, 2),
            "discount_percent": round(discount_percent, 1),
            "discount_amount": round(discount_amount, 2),
            "final_price": round(final_price, 2),
            "final_price_paise": int(final_price * 100),  # For Razorpay
            "currency": "INR",
            "savings": round(discount_amount, 2)
        }
    
    @staticmethod
    def get_fixed_plan() -> Dict[str, float]:
        """
        Get the fixed plan pricing (2100 credits with 10% discount)
        """
        return PricingService.calculate_price(PricingService.FIXED_PLAN_CREDITS)
    
    @staticmethod
    def get_pricing_tiers() -> list:
        """
        Get sample pricing tiers for display
        """
        tiers = [
            300,
            1000,
            2100,
            5000,
            10000,
            25000,
            50000
        ]
        
        return [
            PricingService.calculate_price(tier) for tier in tiers
        ]
