from pydantic import BaseModel, Field
from typing import Optional, Literal, Any
from datetime import datetime
import uuid

class AuditLogBase(BaseModel):
    action: str  # e.g., "user.credit.add", "user.suspend", "job.retry"
    admin_id: str
    admin_email: str
    target_type: Literal["user", "job", "payment", "prompt", "system"]  # What was affected
    target_id: Optional[str] = None  # ID of affected entity
    details: dict = {}  # Additional details about the action
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLogInDB(AuditLogBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AuditLogResponse(BaseModel):
    id: str
    action: str
    admin_email: str
    target_type: str
    target_id: Optional[str]
    details: dict
    timestamp: datetime
