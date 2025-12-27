from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.webhook_model import (
    WebhookModel,
    WebhookDeliveryModel,
    WebhookCreateRequest,
    WebhookUpdateRequest
)
from services.webhook_service import WebhookService
from middleware.auth_middleware import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("", response_model=WebhookModel)
async def create_webhook(
    request: WebhookCreateRequest,
    current_user: UserModel = Depends(get_current_user)
):
    """Create a new webhook"""
    try:
        webhook = await WebhookService.create_webhook(
            user_id=current_user.id,
            url=request.url,
            name=request.name,
            events=request.events
        )
        return webhook
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create webhook")


@router.get("", response_model=List[WebhookModel])
async def get_webhooks(
    current_user: UserModel = Depends(get_current_user)
):
    """Get all webhooks for the current user"""
    try:
        webhooks = await WebhookService.get_webhooks(current_user.id)
        return webhooks
    except Exception as e:
        logger.error(f"Error fetching webhooks: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch webhooks")


@router.get("/{webhook_id}", response_model=WebhookModel)
async def get_webhook(
    webhook_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Get a specific webhook"""
    webhook = await WebhookService.get_webhook(webhook_id, current_user.id)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    return webhook


@router.put("/{webhook_id}", response_model=WebhookModel)
async def update_webhook(
    webhook_id: str,
    request: WebhookUpdateRequest,
    current_user: UserModel = Depends(get_current_user)
):
    """Update a webhook"""
    try:
        webhook = await WebhookService.update_webhook(
            webhook_id=webhook_id,
            user_id=current_user.id,
            url=request.url,
            name=request.name,
            events=request.events,
            is_active=request.is_active
        )
        if not webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")
        return webhook
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update webhook")


@router.delete("/{webhook_id}")
async def delete_webhook(
    webhook_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Delete a webhook"""
    try:
        success = await WebhookService.delete_webhook(webhook_id, current_user.id)
        if not success:
            raise HTTPException(status_code=404, detail="Webhook not found")
        return {"message": "Webhook deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete webhook")


@router.get("/{webhook_id}/deliveries", response_model=List[WebhookDeliveryModel])
async def get_webhook_deliveries(
    webhook_id: str,
    limit: int = 50,
    current_user: UserModel = Depends(get_current_user)
):
    """Get delivery history for a webhook"""
    try:
        deliveries = await WebhookService.get_deliveries(
            webhook_id=webhook_id,
            user_id=current_user.id,
            limit=limit
        )
        return deliveries
    except Exception as e:
        logger.error(f"Error fetching deliveries: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch deliveries")


@router.post("/{webhook_id}/test")
async def test_webhook(
    webhook_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """Send a test event to a webhook"""
    try:
        result = await WebhookService.test_webhook(webhook_id, current_user.id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error testing webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to test webhook")


@router.get("/events/supported")
async def get_supported_events(
    current_user: UserModel = Depends(get_current_user)
):
    """Get list of supported webhook events"""
    return {
        "events": WebhookService.SUPPORTED_EVENTS,
        "descriptions": {
            "tryon.completed": "Triggered when a try-on job completes successfully",
            "tryon.failed": "Triggered when a try-on job fails",
            "credits.low": "Triggered when user credits fall below threshold",
            "payment.completed": "Triggered when a payment is successfully processed"
        }
    }
