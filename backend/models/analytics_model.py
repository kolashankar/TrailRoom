from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import uuid4


class UsageEventModel(BaseModel):
    """Model for storing API usage events"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    endpoint: str
    method: str
    status_code: int
    response_time_ms: float
    credits_used: int = 0
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "user-123",
                "endpoint": "/api/v1/tryon",
                "method": "POST",
                "status_code": 200,
                "response_time_ms": 1234.56,
                "credits_used": 1
            }
        }


class UsageStatsResponse(BaseModel):
    """Response model for usage statistics"""
    total_requests: int
    successful_requests: int
    failed_requests: int
    total_credits_used: int
    average_response_time: float
    period_start: datetime
    period_end: datetime
    daily_breakdown: List[Dict[str, Any]]


class EndpointStatsResponse(BaseModel):
    """Response model for endpoint statistics"""
    endpoint: str
    total_requests: int
    success_rate: float
    average_response_time: float
    credits_used: int
