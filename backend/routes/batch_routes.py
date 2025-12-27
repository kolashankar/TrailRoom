from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from middleware.auth_middleware import get_current_user
from services.tryon_service import TryOnService
from database import Database
import asyncio

router = APIRouter(prefix="/api/v1/batch", tags=["batch"])
tryon_service = TryOnService()

class BatchTryOnItem(BaseModel):
    person_image_base64: str
    clothing_image_base64: str
    bottom_image_base64: Optional[str] = None
    mode: str = "top"

class BatchTryOnRequest(BaseModel):
    items: List[BatchTryOnItem]

@router.post("/tryon")
async def create_batch_tryon(request: BatchTryOnRequest, current_user: dict = Depends(get_current_user)):
    """Create batch try-on jobs"""
    user_id = current_user["id"]
    
    # Get user from database to check credits
    db = Database.get_db()
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check batch size limit based on user plan
    is_paid = user.get("credits", 0) >= 2100  # Simple check, can be enhanced
    max_batch_size = 10 if is_paid else 5
    if len(request.items) > max_batch_size:
        raise HTTPException(
            status_code=400,
            detail=f"Batch size exceeds limit. Max: {max_batch_size} for your plan"
        )
    
    # Check total credits needed
    total_credits_needed = sum(2 if item.mode == "full" else 1 for item in request.items)
    if user.get("credits", 0) < total_credits_needed:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient credits. Need {total_credits_needed}, have {user.get('credits', 0)}"
        )
    
    # Create all jobs
    jobs = []
    try:
        for item in request.items:
            job = await tryon_service.create_tryon_job(
                user_id=user_id,
                mode=item.mode,
                person_image=item.person_image_base64,
                clothing_image=item.clothing_image_base64,
                bottom_image=item.bottom_image_base64
            )
            jobs.append({
                "id": job.id,
                "status": job.status,
                "mode": job.mode
            })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return {
        "message": f"Created {len(jobs)} jobs",
        "jobs": jobs
    }

@router.get("/tryon/status")
async def get_batch_status(job_ids: str, current_user: dict = Depends(get_current_user)):
    """Get status of multiple jobs"""
    user_id = current_user["id"]
    job_id_list = job_ids.split(",")
    
    statuses = []
    for job_id in job_id_list:
        job = await tryon_service.get_job(job_id.strip(), user_id)
        if job:
            statuses.append({
                "id": job["id"],
                "status": job["status"],
                "result_image_base64": job.get("result_image_base64")
            })
    
    return {"jobs": statuses}
