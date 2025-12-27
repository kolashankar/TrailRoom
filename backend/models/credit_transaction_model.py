from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid

class CreditTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    
    # Transaction details
    type: Literal["usage", "purchase", "free", "refund", "admin_adjustment"]
    credits: int
    balance_after: int
    description: str
    
    # Reference
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None
    
    # Metadata
    metadata: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CreditTransactionResponse(BaseModel):
    id: str
    type: str
    credits: int
    balance_after: int
    description: str
    created_at: datetime
