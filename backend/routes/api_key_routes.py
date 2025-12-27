from fastapi import APIRouter, Depends, HTTPException
from ..middleware.auth_middleware import get_current_user
from ..models.user_model import UserInDB
from ..models.api_key_model import APIKeyCreate, APIKeyResponse
from ..services.api_key_service import APIKeyService
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/api-keys", tags=["API Keys"])

class APIKeyWithSecret(BaseModel):
    api_key: str
    key_id: str
    name: str

@router.post("/generate", response_model=APIKeyWithSecret)
async def generate_api_key(
    key_data: APIKeyCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    """Generate a new API key"""
    api_key, api_key_obj = await APIKeyService.create_api_key(
        current_user.id,
        key_data.name
    )
    
    return APIKeyWithSecret(
        api_key=api_key,
        key_id=api_key_obj.id,
        name=api_key_obj.name
    )

@router.get("", response_model=List[APIKeyResponse])
async def list_api_keys(current_user: UserInDB = Depends(get_current_user)):
    """List all API keys for current user"""
    keys = await APIKeyService.get_user_api_keys(current_user.id)
    return keys

@router.delete("/{key_id}")
async def delete_api_key(
    key_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """Delete an API key"""
    success = await APIKeyService.delete_api_key(key_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=404, detail="API key not found")
    
    return {"message": "API key deleted successfully"}
