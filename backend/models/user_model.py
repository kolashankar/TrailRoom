from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime
import uuid

class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    auth_provider: Literal["email", "google"] = "email"

class UserInDB(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    password_hash: Optional[str] = None
    auth_provider: Literal["email", "google"] = "email"
    role: Literal["free", "paid", "admin"] = "free"
    
    # Credits
    credits: int = 0
    daily_free_credits: int = 3
    last_free_credit_reset: Optional[datetime] = None
    
    # Profile
    profile_picture: Optional[str] = None
    
    # Status
    is_active: bool = True
    is_email_verified: bool = False
    is_suspended: bool = False
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

class UserResponse(UserBase):
    id: str
    role: str
    credits: int
    daily_free_credits: int
    is_active: bool
    created_at: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str
