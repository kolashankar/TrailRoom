from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from middleware.auth_middleware import get_current_user
from models.user_model import UserInDB
from services.credit_service import CreditService
from models.credit_transaction_model import CreditTransactionResponse
from typing import List

router = APIRouter(prefix="/credits", tags=["Credits"])

class CreditBalance(BaseModel):
    credits: int
    daily_free_credits: int

@router.get("", response_model=CreditBalance)
async def get_credit_balance(current_user: UserInDB = Depends(get_current_user)):
    """Get current credit balance"""
    credits = await CreditService.get_user_credits(current_user.id)
    
    return CreditBalance(
        credits=credits,
        daily_free_credits=current_user.daily_free_credits
    )

@router.get("/transactions", response_model=List[CreditTransactionResponse])
async def get_credit_transactions(
    limit: int = 100,
    current_user: UserInDB = Depends(get_current_user)
):
    """Get credit transaction history"""
    transactions = await CreditService.get_transactions(current_user.id, limit)
    
    return [
        CreditTransactionResponse(
            id=t["id"],
            type=t["type"],
            credits=t["credits"],
            balance_after=t["balance_after"],
            description=t["description"],
            created_at=t["created_at"]
        )
        for t in transactions
    ]
