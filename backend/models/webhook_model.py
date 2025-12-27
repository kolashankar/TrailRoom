from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import uuid4


class WebhookModel(BaseModel):
    """Model for storing webhook configurations"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    url: str  # Webhook URL to send events to
    name: str
    events: List[str]  # List of event types to listen to
    secret: str  # Secret for signature verification
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_triggered_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user-123",
                "url": "https://example.com/webhook",
                "name": "My Webhook",
                "events": ["tryon.completed", "tryon.failed"],
                "is_active": True
            }
        }


class WebhookDeliveryModel(BaseModel):
    """Model for storing webhook delivery attempts"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    webhook_id: str
    event_type: str
    payload: Dict[str, Any]
    status: str  # 'pending', 'success', 'failed'
    response_code: Optional[int] = None
    response_body: Optional[str] = None
    error_message: Optional[str] = None
    attempts: int = 0
    max_attempts: int = 5
    next_retry_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    delivered_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "webhook_id": "webhook-123",
                "event_type": "tryon.completed",
                "payload": {"job_id": "job-123"},
                "status": "success",
                "attempts": 1
            }
        }


class WebhookCreateRequest(BaseModel):
    """Request model for creating a webhook"""
    url: str
    name: str
    events: List[str]

    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://example.com/webhook",
                "name": "My Webhook",
                "events": ["tryon.completed", "tryon.failed"]
            }
        }


class WebhookUpdateRequest(BaseModel):
    """Request model for updating a webhook"""
    url: Optional[str] = None
    name: Optional[str] = None
    events: Optional[List[str]] = None
    is_active: Optional[bool] = None
