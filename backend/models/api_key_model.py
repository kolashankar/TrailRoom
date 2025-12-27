from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class APIKey(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    
    # Key details
    key_hash: str
    key_prefix: str  # First 8 chars for display
    name: str = "Default API Key"
    
    # Usage
    last_used: Optional[datetime] = None
    usage_count: int = 0
    
    # Status
    is_active: bool = True
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None

class APIKeyResponse(BaseModel):
    id: str
    name: str
    key_prefix: str
    is_active: bool
    created_at: datetime
    last_used: Optional[datetime] = None

class APIKeyCreate(BaseModel):
    name: str = "Default API Key"
