"""Unit tests for pricing service."""
import pytest
from backend.services.pricing_service import PricingService

class TestPricingService:
    """Test pricing calculations and discount logic."""
    
    def test_calculate_discount_no_discount(self):
        """Test discount calculation for credits below threshold."""
        service = PricingService()
        
        # Less than 2100 credits should have 0% discount
        discount = service.calculate_discount(1000)
        assert discount == 0
        
        discount = service.calculate_discount(2099)
        assert discount == 0
    
    def test_calculate_discount_minimum(self):
        """Test discount at minimum threshold."""
        service = PricingService()
        
        # Exactly 2100 credits should have 10% discount
        discount = service.calculate_discount(2100)
        assert discount == 10
    
    def test_calculate_discount_maximum(self):
        """Test maximum discount."""
        service = PricingService()
        
        # 50000 or more credits should have 25% discount
        discount = service.calculate_discount(50000)
        assert discount == 25
        
        discount = service.calculate_discount(100000)
        assert discount == 25
    
    def test_calculate_discount_interpolation(self):
        """Test linear interpolation for mid-range credits."""
        service = PricingService()
        
        # Test mid-range value
        discount = service.calculate_discount(26050)
        # Should be around 17.5% (halfway between 10% and 25%)
        assert 15 <= discount <= 20
    
    def test_calculate_price_no_discount(self):
        """Test price calculation without discount."""
        service = PricingService()
        base_price_per_credit = 1.0
        
        price = service.calculate_price(
            credits=1000,
            base_price_per_credit=base_price_per_credit
        )
        
        # No discount, so price should be credits * base_price
        assert price == 1000.0
    
    def test_calculate_price_with_discount(self):
        """Test price calculation with discount."""
        service = PricingService()
        base_price_per_credit = 1.0
        
        # At 2100 credits with 10% discount
        price = service.calculate_price(
            credits=2100,
            base_price_per_credit=base_price_per_credit
        )
        
        expected_price = 2100 * 0.9  # 10% discount
        assert abs(price - expected_price) < 0.01
    
    def test_calculate_price_maximum_discount(self):
        """Test price calculation with maximum discount."""
        service = PricingService()
        base_price_per_credit = 1.0
        
        # At 50000 credits with 25% discount
        price = service.calculate_price(
            credits=50000,
            base_price_per_credit=base_price_per_credit
        )
        
        expected_price = 50000 * 0.75  # 25% discount
        assert abs(price - expected_price) < 0.01
