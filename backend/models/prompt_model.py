from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid

class PromptBase(BaseModel):
    name: str  # e.g., "top_only_prompt", "full_outfit_prompt"
    mode: Literal["top_only", "full_outfit"]
    prompt_text: str
    description: Optional[str] = None
    is_active: bool = True

class PromptCreate(PromptBase):
    pass

class PromptUpdate(BaseModel):
    prompt_text: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class PromptInDB(PromptBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    version: int = 1
    previous_version_id: Optional[str] = None  # Link to previous version
    created_by: str  # Admin user ID
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PromptResponse(BaseModel):
    id: str
    name: str
    mode: str
    prompt_text: str
    description: Optional[str]
    is_active: bool
    version: int
    created_at: datetime
    updated_at: datetime
