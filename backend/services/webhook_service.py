import hmac
import hashlib
import httpx
import secrets
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from database import Database
from models.webhook_model import WebhookModel, WebhookDeliveryModel
import logging

logger = logging.getLogger(__name__)


class WebhookService:
    """Service for managing webhooks and deliveries"""

    # Supported event types
    SUPPORTED_EVENTS = [
        "tryon.completed",
        "tryon.failed",
        "credits.low",
        "payment.completed"
    ]

    @staticmethod
    def generate_secret() -> str:
        """Generate a secure webhook secret"""
        return secrets.token_urlsafe(32)

    @staticmethod
    def generate_signature(payload: str, secret: str) -> str:
        """Generate HMAC signature for webhook payload"""
        return hmac.new(
            secret.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()

    @staticmethod
    async def create_webhook(
        user_id: str,
        url: str,
        name: str,
        events: List[str]
    ) -> WebhookModel:
        """Create a new webhook"""
        # Validate events
        invalid_events = [e for e in events if e not in WebhookService.SUPPORTED_EVENTS]
        if invalid_events:
            raise ValueError(f"Invalid events: {', '.join(invalid_events)}")

        webhook = WebhookModel(
            user_id=user_id,
            url=url,
            name=name,
            events=events,
            secret=WebhookService.generate_secret()
        )

        db = await Database.get_database()
        await db.webhooks.insert_one(webhook.model_dump())
        logger.info(f"Webhook created: {webhook.id} for user {user_id}")
        return webhook

    @staticmethod
    async def get_webhooks(user_id: str) -> List[WebhookModel]:
        """Get all webhooks for a user"""
        db = await Database.get_database()
        webhooks = await db.webhooks.find({"user_id": user_id}).to_list(100)
        return [WebhookModel(**w) for w in webhooks]

    @staticmethod
    async def get_webhook(webhook_id: str, user_id: str) -> Optional[WebhookModel]:
        """Get a specific webhook"""
        db = await Database.get_database()
        webhook = await db.webhooks.find_one({"id": webhook_id, "user_id": user_id})
        return WebhookModel(**webhook) if webhook else None

    @staticmethod
    async def update_webhook(
        webhook_id: str,
        user_id: str,
        url: Optional[str] = None,
        name: Optional[str] = None,
        events: Optional[List[str]] = None,
        is_active: Optional[bool] = None
    ) -> Optional[WebhookModel]:
        """Update a webhook"""
        db = await Database.get_database()
        webhook = await WebhookService.get_webhook(webhook_id, user_id)
        if not webhook:
            return None

        update_data = {"updated_at": datetime.utcnow()}
        if url is not None:
            update_data["url"] = url
        if name is not None:
            update_data["name"] = name
        if events is not None:
            # Validate events
            invalid_events = [e for e in events if e not in WebhookService.SUPPORTED_EVENTS]
            if invalid_events:
                raise ValueError(f"Invalid events: {', '.join(invalid_events)}")
            update_data["events"] = events
        if is_active is not None:
            update_data["is_active"] = is_active

        await db.webhooks.update_one(
            {"id": webhook_id, "user_id": user_id},
            {"$set": update_data}
        )
        logger.info(f"Webhook updated: {webhook_id}")
        return await WebhookService.get_webhook(webhook_id, user_id)

    @staticmethod
    async def delete_webhook(webhook_id: str, user_id: str) -> bool:
        """Delete a webhook"""
        db = await Database.get_database()
        result = await db.webhooks.delete_one({"id": webhook_id, "user_id": user_id})
        if result.deleted_count > 0:
            logger.info(f"Webhook deleted: {webhook_id}")
            return True
        return False

    @staticmethod
    async def trigger_webhook(
        user_id: str,
        event_type: str,
        payload: Dict[str, Any]
    ) -> None:
        """Trigger webhooks for a specific event"""
        # Get all active webhooks for this user that listen to this event
        db = await Database.get_database()
        webhooks = await db.webhooks.find({
            "user_id": user_id,
            "is_active": True,
            "events": event_type
        }).to_list(100)

        logger.info(f"Triggering {len(webhooks)} webhooks for event {event_type}")

        for webhook_data in webhooks:
            webhook = WebhookModel(**webhook_data)
            # Create delivery record
            delivery = WebhookDeliveryModel(
                webhook_id=webhook.id,
                event_type=event_type,
                payload=payload,
                status="pending"
            )
            await db.webhook_deliveries.insert_one(delivery.model_dump())

            # Attempt delivery (don't await to avoid blocking)
            try:
                await WebhookService.deliver_webhook(webhook, delivery)
            except Exception as e:
                logger.error(f"Failed to deliver webhook {webhook.id}: {str(e)}")

    @staticmethod
    async def deliver_webhook(
        webhook: WebhookModel,
        delivery: WebhookDeliveryModel
    ) -> None:
        """Deliver a webhook with retry logic"""
        db = await Database.get_database()

        try:
            # Prepare payload
            payload_str = json.dumps(delivery.payload)
            signature = WebhookService.generate_signature(payload_str, webhook.secret)

            # Send webhook
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    webhook.url,
                    json=delivery.payload,
                    headers={
                        "X-Webhook-Signature": signature,
                        "X-Event-Type": delivery.event_type,
                        "User-Agent": "TrailRoom-Webhook/1.0"
                    }
                )

            # Update delivery status
            delivery.attempts += 1
            delivery.response_code = response.status_code
            delivery.response_body = response.text[:1000]  # Limit size

            if 200 <= response.status_code < 300:
                delivery.status = "success"
                delivery.delivered_at = datetime.utcnow()
                logger.info(f"Webhook delivered successfully: {webhook.id}")

                # Update webhook's last triggered time
                await db.webhooks.update_one(
                    {"id": webhook.id},
                    {"$set": {"last_triggered_at": datetime.utcnow()}}
                )
            else:
                delivery.status = "failed"
                delivery.error_message = f"HTTP {response.status_code}"
                logger.warning(f"Webhook delivery failed: {webhook.id} - {response.status_code}")

                # Schedule retry if not max attempts
                if delivery.attempts < delivery.max_attempts:
                    # Exponential backoff: 1min, 5min, 15min, 1hr
                    retry_delays = [60, 300, 900, 3600, 7200]
                    delay = retry_delays[min(delivery.attempts - 1, len(retry_delays) - 1)]
                    delivery.next_retry_at = datetime.utcnow() + timedelta(seconds=delay)
                    delivery.status = "pending"

        except Exception as e:
            delivery.attempts += 1
            delivery.status = "failed"
            delivery.error_message = str(e)
            logger.error(f"Webhook delivery error: {webhook.id} - {str(e)}")

            # Schedule retry if not max attempts
            if delivery.attempts < delivery.max_attempts:
                retry_delays = [60, 300, 900, 3600, 7200]
                delay = retry_delays[min(delivery.attempts - 1, len(retry_delays) - 1)]
                delivery.next_retry_at = datetime.utcnow() + timedelta(seconds=delay)
                delivery.status = "pending"

        # Update delivery record
        await db.webhook_deliveries.update_one(
            {"id": delivery.id},
            {"$set": delivery.model_dump()}
        )

    @staticmethod
    async def get_deliveries(
        webhook_id: str,
        user_id: str,
        limit: int = 50
    ) -> List[WebhookDeliveryModel]:
        """Get delivery history for a webhook"""
        # Verify webhook belongs to user
        webhook = await WebhookService.get_webhook(webhook_id, user_id)
        if not webhook:
            return []

        db = await Database.get_database()
        deliveries = await db.webhook_deliveries.find(
            {"webhook_id": webhook_id}
        ).sort("created_at", -1).limit(limit).to_list(limit)

        return [WebhookDeliveryModel(**d) for d in deliveries]

    @staticmethod
    async def test_webhook(webhook_id: str, user_id: str) -> Dict[str, Any]:
        """Send a test event to a webhook"""
        webhook = await WebhookService.get_webhook(webhook_id, user_id)
        if not webhook:
            raise ValueError("Webhook not found")

        test_payload = {
            "event": "test",
            "webhook_id": webhook_id,
            "timestamp": datetime.utcnow().isoformat(),
            "message": "This is a test webhook delivery"
        }

        delivery = WebhookDeliveryModel(
            webhook_id=webhook.id,
            event_type="test",
            payload=test_payload,
            status="pending"
        )

        db = await Database.get_database()
        await db.webhook_deliveries.insert_one(delivery.model_dump())

        # Attempt delivery
        await WebhookService.deliver_webhook(webhook, delivery)

        # Get updated delivery
        updated_delivery = await db.webhook_deliveries.find_one({"id": delivery.id})
        return WebhookDeliveryModel(**updated_delivery).model_dump()
