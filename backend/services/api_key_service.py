import secrets
import hashlib
from datetime import datetime
from typing import Optional, List
from database import get_database
from models.api_key_model import APIKey, APIKeyResponse
import logging

logger = logging.getLogger(__name__)

class APIKeyService:
    @staticmethod
    def generate_key() -> str:
        """Generate a cryptographically secure API key"""
        return f"tr_{secrets.token_urlsafe(32)}"
    
    @staticmethod
    def hash_key(key: str) -> str:
        """Hash API key for storage"""
        return hashlib.sha256(key.encode()).hexdigest()
    
    @staticmethod
    async def create_api_key(user_id: str, name: str = "Default API Key") -> tuple[str, APIKey]:
        """Create a new API key for user"""
        db = get_database()
        
        # Generate key
        api_key = APIKeyService.generate_key()
        key_hash = APIKeyService.hash_key(api_key)
        key_prefix = api_key[:12] + "..."
        
        # Create API key object
        api_key_obj = APIKey(
            user_id=user_id,
            key_hash=key_hash,
            key_prefix=key_prefix,
            name=name
        )
        
        # Save to database
        api_key_doc = api_key_obj.model_dump()
        api_key_doc['created_at'] = api_key_doc['created_at'].isoformat()
        if api_key_doc.get('last_used'):
            api_key_doc['last_used'] = api_key_doc['last_used'].isoformat()
        if api_key_doc.get('expires_at'):
            api_key_doc['expires_at'] = api_key_doc['expires_at'].isoformat()
        
        await db.api_keys.insert_one(api_key_doc)
        logger.info(f"Created API key for user {user_id}")
        
        return api_key, api_key_obj
    
    @staticmethod
    async def validate_api_key(api_key: str) -> Optional[str]:
        """Validate API key and return user_id"""
        db = get_database()
        key_hash = APIKeyService.hash_key(api_key)
        
        api_key_doc = await db.api_keys.find_one(
            {"key_hash": key_hash, "is_active": True},
            {"_id": 0}
        )
        
        if not api_key_doc:
            return None
        
        # Update last used
        await db.api_keys.update_one(
            {"id": api_key_doc["id"]},
            {
                "$set": {"last_used": datetime.utcnow().isoformat()},
                "$inc": {"usage_count": 1}
            }
        )
        
        return api_key_doc["user_id"]
    
    @staticmethod
    async def get_user_api_keys(user_id: str) -> List[APIKeyResponse]:
        """Get all API keys for a user"""
        db = get_database()
        api_keys = await db.api_keys.find(
            {"user_id": user_id},
            {"_id": 0}
        ).to_list(100)
        
        # Convert to response models
        response_keys = []
        for key_doc in api_keys:
            if isinstance(key_doc.get('created_at'), str):
                key_doc['created_at'] = datetime.fromisoformat(key_doc['created_at'])
            if isinstance(key_doc.get('last_used'), str):
                key_doc['last_used'] = datetime.fromisoformat(key_doc['last_used'])
            
            response_keys.append(APIKeyResponse(
                id=key_doc["id"],
                name=key_doc["name"],
                key_prefix=key_doc["key_prefix"],
                is_active=key_doc["is_active"],
                created_at=key_doc["created_at"],
                last_used=key_doc.get("last_used")
            ))
        
        return response_keys
    
    @staticmethod
    async def delete_api_key(key_id: str, user_id: str) -> bool:
        """Delete an API key"""
        db = get_database()
        result = await db.api_keys.delete_one({"id": key_id, "user_id": user_id})
        return result.deleted_count > 0
