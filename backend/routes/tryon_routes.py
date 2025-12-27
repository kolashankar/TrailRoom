from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
import logging

from middleware.auth_middleware import get_current_user
from models.user_model import UserModel
from models.tryon_job_model import TryOnJobCreateRequest, TryOnJobResponse
from services.tryon_service import TryOnService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tryon", tags=["Try-On"])
tryon_service = TryOnService()

@router.post("", response_model=TryOnJobResponse)
async def create_tryon_job(
    request: TryOnJobCreateRequest,
    current_user: UserModel = Depends(get_current_user)
):
    """
    Create a new try-on job
    """
    try:
        # Validate full mode requirements
        if request.mode == "full" and not request.bottom_image_base64:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bottom image is required for full mode"
            )
        
        job = await tryon_service.create_tryon_job(
            user_id=current_user.id,
            mode=request.mode,
            person_image=request.person_image_base64,
            clothing_image=request.clothing_image_base64,
            bottom_image=request.bottom_image_base64
        )
        
        return TryOnJobResponse(
            id=job.id,
            mode=job.mode,
            status=job.status,
            result_image_base64=job.result_image_base64,
            error_message=job.error_message,
            credits_used=job.credits_used,
            created_at=job.created_at,
            completed_at=job.completed_at
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating try-on job: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create try-on job"
        )

@router.get("/{job_id}", response_model=TryOnJobResponse)
async def get_tryon_job(
    job_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """
    Get a try-on job by ID
    """
    job = await tryon_service.get_job(job_id, current_user.id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    return TryOnJobResponse(
        id=job['id'],
        mode=job['mode'],
        status=job['status'],
        result_image_base64=job.get('result_image_base64'),
        error_message=job.get('error_message'),
        credits_used=job['credits_used'],
        created_at=job['created_at'],
        completed_at=job.get('completed_at')
    )

@router.get("/history/list")
async def get_tryon_history(
    skip: int = 0,
    limit: int = 20,
    current_user: UserModel = Depends(get_current_user)
):
    """
    Get user's try-on history
    """
    jobs = await tryon_service.get_user_jobs(current_user.id, skip, limit)
    
    return {
        "jobs": [
            {
                "id": job['id'],
                "mode": job['mode'],
                "status": job['status'],
                "result_image_base64": job.get('result_image_base64'),
                "error_message": job.get('error_message'),
                "credits_used": job['credits_used'],
                "created_at": job['created_at'],
                "completed_at": job.get('completed_at')
            }
            for job in jobs
        ],
        "skip": skip,
        "limit": limit
    }

@router.delete("/{job_id}")
async def delete_tryon_job(
    job_id: str,
    current_user: UserModel = Depends(get_current_user)
):
    """
    Delete a try-on job
    """
    deleted = await tryon_service.delete_job(job_id, current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    return {"message": "Job deleted successfully"}
