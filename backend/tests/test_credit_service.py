"""Unit tests for credit service."""
import pytest
from backend.services.credit_service import CreditService
import uuid

class TestCreditService:
    """Test credit service operations."""
    
    @pytest.mark.asyncio
    async def test_initialize_credits(self, clean_db):
        """Test credit initialization for new users."""
        user_id = str(uuid.uuid4())
        
        service = CreditService(clean_db)
        credits = await service.initialize_credits(user_id)
        
        assert credits == 3  # Default free credits
    
    @pytest.mark.asyncio
    async def test_add_credits(self, clean_db):
        """Test adding credits to user account."""
        user_id = str(uuid.uuid4())
        
        # Initialize user in database
        await clean_db.users.insert_one({
            "id": user_id,
            "email": "test@example.com",
            "credits": 3
        })
        
        service = CreditService(clean_db)
        new_balance = await service.add_credits(
            user_id=user_id,
            credits=100,
            description="Test purchase"
        )
        
        assert new_balance == 103
    
    @pytest.mark.asyncio
    async def test_deduct_credits_success(self, clean_db):
        """Test successful credit deduction."""
        user_id = str(uuid.uuid4())
        
        # Initialize user with credits
        await clean_db.users.insert_one({
            "id": user_id,
            "email": "test@example.com",
            "credits": 10
        })
        
        service = CreditService(clean_db)
        new_balance = await service.deduct_credits(
            user_id=user_id,
            credits=5,
            description="Test usage"
        )
        
        assert new_balance == 5
    
    @pytest.mark.asyncio
    async def test_deduct_credits_insufficient(self, clean_db):
        """Test credit deduction with insufficient balance."""
        user_id = str(uuid.uuid4())
        
        # Initialize user with low credits
        await clean_db.users.insert_one({
            "id": user_id,
            "email": "test@example.com",
            "credits": 2
        })
        
        service = CreditService(clean_db)
        
        with pytest.raises(Exception):
            await service.deduct_credits(
                user_id=user_id,
                credits=5,
                description="Test usage"
            )
    
    @pytest.mark.asyncio
    async def test_get_credit_balance(self, clean_db):
        """Test retrieving credit balance."""
        user_id = str(uuid.uuid4())
        
        await clean_db.users.insert_one({
            "id": user_id,
            "email": "test@example.com",
            "credits": 42
        })
        
        service = CreditService(clean_db)
        balance = await service.get_credit_balance(user_id)
        
        assert balance == 42
