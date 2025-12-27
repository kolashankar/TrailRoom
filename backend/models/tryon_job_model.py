from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid

class TryOnJobModel(BaseModel):
    """Model for Try-On Job"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    mode: Literal["top", "full"] = "top"
    status: Literal["queued", "processing", "completed", "failed"] = "queued"
    person_image_url: Optional[str] = None
    person_image_base64: Optional[str] = None
    clothing_image_url: Optional[str] = None
    clothing_image_base64: Optional[str] = None
    bottom_image_url: Optional[str] = None  # For full mode
    bottom_image_base64: Optional[str] = None  # For full mode
    result_image_base64: Optional[str] = None
    error_message: Optional[str] = None
    credits_used: int = 1
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "user_id": "user123",
                "mode": "top",
                "status": "queued",
                "credits_used": 1
            }
        }

class TryOnJobCreateRequest(BaseModel):
    """Request model for creating a try-on job"""
    mode: Literal["top", "full"] = "top"
    person_image_base64: str
    clothing_image_base64: str
    bottom_image_base64: Optional[str] = None  # Required for full mode

class TryOnJobResponse(BaseModel):
    """Response model for try-on job"""
    id: str
    mode: str
    status: str
    result_image_base64: Optional[str] = None
    error_message: Optional[str] = None
    credits_used: int
    created_at: datetime
    completed_at: Optional[datetime] = None
