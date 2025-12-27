from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging

from database import Database
from middleware.admin_middleware import AdminMiddleware
from models.prompt_model import PromptCreate, PromptUpdate, PromptInDB
from services.audit_service import AuditService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/prompts", tags=["Admin - Prompts"])
security = HTTPBearer()

@router.get("")
async def get_prompts(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    mode: Optional[str] = Query(None, description="Filter by mode")
):
    """
    Get all AI prompts
    Requires: super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_super_admin(None, credentials)
        
        db = Database.get_db()
        
        query = {}
        if mode:
            query["mode"] = mode
        
        prompts = await db.prompts.find(query).sort("created_at", -1).to_list(None)
        
        return {"prompts": prompts}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting prompts: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving prompts"
        )

@router.post("")
async def create_prompt(
    prompt_data: PromptCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Create a new prompt
    Requires: super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_super_admin(None, credentials)
        
        db = Database.get_db()
        
        # Create prompt
        prompt = PromptInDB(
            **prompt_data.model_dump(),
            created_by=admin["id"]
        )
        
        await db.prompts.insert_one(prompt.model_dump())
        
        # Log action
        await AuditService.log_action(
            action="prompt.create",
            admin_id=admin["id"],
            admin_email=admin["email"],
            target_type="prompt",
            target_id=prompt.id,
            details={
                "name": prompt.name,
                "mode": prompt.mode
            }
        )
        
        return prompt
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating prompt: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating prompt"
        )

@router.put("/{prompt_id}")
async def update_prompt(
    prompt_id: str,
    prompt_update: PromptUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Update a prompt (creates new version)
    Requires: super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_super_admin(None, credentials)
        
        db = Database.get_db()
        
        # Get existing prompt
        existing_prompt = await db.prompts.find_one({"id": prompt_id})
        if not existing_prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prompt not found"
            )
        
        # Create new version
        new_version = existing_prompt["version"] + 1
        
        # Prepare update data
        update_data = prompt_update.model_dump(exclude_unset=True)
        update_data["version"] = new_version
        update_data["previous_version_id"] = prompt_id
        update_data["updated_at"] = None  # Will be set by default factory
        
        # Deactivate old version
        await db.prompts.update_one(
            {"id": prompt_id},
            {"$set": {"is_active": False}}
        )
        
        # Create new version as a new document
        from models.prompt_model import PromptInDB
        new_prompt = PromptInDB(
            name=existing_prompt["name"],
            mode=existing_prompt["mode"],
            prompt_text=update_data.get("prompt_text", existing_prompt["prompt_text"]),
            description=update_data.get("description", existing_prompt.get("description")),
            is_active=update_data.get("is_active", True),
            version=new_version,
            previous_version_id=prompt_id,
            created_by=admin["id"]
        )
        
        await db.prompts.insert_one(new_prompt.model_dump())
        
        # Log action
        await AuditService.log_action(
            action="prompt.update",
            admin_id=admin["id"],
            admin_email=admin["email"],
            target_type="prompt",
            target_id=new_prompt.id,
            details={
                "name": existing_prompt["name"],
                "old_version": existing_prompt["version"],
                "new_version": new_version
            }
        )
        
        return new_prompt
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating prompt: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating prompt"
        )

@router.post("/{prompt_id}/rollback")
async def rollback_prompt(
    prompt_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Rollback to a previous prompt version
    Requires: super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_super_admin(None, credentials)
        
        db = Database.get_db()
        
        # Get prompt
        prompt = await db.prompts.find_one({"id": prompt_id})
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prompt not found"
            )
        
        # Get previous version
        previous_version_id = prompt.get("previous_version_id")
        if not previous_version_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No previous version to rollback to"
            )
        
        previous_prompt = await db.prompts.find_one({"id": previous_version_id})
        if not previous_prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Previous version not found"
            )
        
        # Deactivate current version
        await db.prompts.update_one(
            {"id": prompt_id},
            {"$set": {"is_active": False}}
        )
        
        # Activate previous version
        await db.prompts.update_one(
            {"id": previous_version_id},
            {"$set": {"is_active": True}}
        )
        
        # Log action
        await AuditService.log_action(
            action="prompt.rollback",
            admin_id=admin["id"],
            admin_email=admin["email"],
            target_type="prompt",
            target_id=prompt_id,
            details={
                "name": prompt["name"],
                "from_version": prompt["version"],
                "to_version": previous_prompt["version"]
            }
        )
        
        return {"message": "Prompt rolled back successfully", "active_version": previous_prompt}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rolling back prompt: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error rolling back prompt"
        )

@router.get("/active/{mode}")
async def get_active_prompt(
    mode: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get active prompt for a specific mode
    Requires: any admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_admin(None, credentials)
        
        db = Database.get_db()
        
        prompt = await db.prompts.find_one({
            "mode": mode,
            "is_active": True
        })
        
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No active prompt found for mode: {mode}"
            )
        
        return prompt
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting active prompt: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving active prompt"
        )
