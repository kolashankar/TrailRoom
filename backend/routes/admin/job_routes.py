from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging

from database import Database
from middleware.admin_middleware import AdminMiddleware
from services.audit_service import AuditService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/jobs", tags=["Admin - Jobs"])
security = HTTPBearer()

@router.get("")
async def get_jobs(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """
    Get list of try-on jobs
    Requires: support_admin or super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_support_admin(None, credentials)
        
        db = Database.get_db()
        
        # Build query
        query = {}
        if status_filter:
            query["status"] = status_filter
        if user_id:
            query["user_id"] = user_id
        
        # Get total count
        total = await db.tryon_jobs.count_documents(query)
        
        # Get jobs
        jobs = await db.tryon_jobs.find(query).skip(skip).limit(limit).sort("created_at", -1).to_list(None)
        
        # Get user emails
        for job in jobs:
            user = await db.users.find_one({"id": job["user_id"]})
            if user:
                job["user_email"] = user.get("email")
        
        return {
            "jobs": jobs,
            "total": total,
            "skip": skip,
            "limit": limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting jobs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving jobs"
        )

@router.get("/{job_id}")
async def get_job_detail(
    job_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get detailed job information
    Requires: support_admin or super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_support_admin(None, credentials)
        
        db = Database.get_db()
        
        # Get job
        job = await db.tryon_jobs.find_one({"id": job_id})
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Get user info
        user = await db.users.find_one({"id": job["user_id"]})
        if user:
            job["user_email"] = user.get("email")
            job["user_role"] = user.get("role")
        
        return job
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting job detail: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving job details"
        )

@router.post("/{job_id}/retry")
async def retry_job(
    job_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Retry a failed job
    Requires: support_admin or super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_support_admin(None, credentials)
        
        db = Database.get_db()
        
        # Get job
        job = await db.tryon_jobs.find_one({"id": job_id})
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        if job["status"] != "failed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only retry failed jobs"
            )
        
        # Reset job status to queued
        await db.tryon_jobs.update_one(
            {"id": job_id},
            {"$set": {
                "status": "queued",
                "error_message": None
            }}
        )
        
        # Log action
        await AuditService.log_action(
            action="job.retry",
            admin_id=admin["id"],
            admin_email=admin["email"],
            target_type="job",
            target_id=job_id,
            details={
                "user_id": job["user_id"],
                "mode": job["mode"]
            }
        )
        
        return {"message": "Job queued for retry"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrying job: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrying job"
        )

@router.post("/{job_id}/cancel")
async def cancel_job(
    job_id: str,
    reason: str = Query(..., description="Reason for cancellation"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Force cancel a job
    Requires: support_admin or super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_support_admin(None, credentials)
        
        db = Database.get_db()
        
        # Get job
        job = await db.tryon_jobs.find_one({"id": job_id})
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        if job["status"] in ["completed", "failed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel completed or failed jobs"
            )
        
        # Update job status
        await db.tryon_jobs.update_one(
            {"id": job_id},
            {"$set": {
                "status": "failed",
                "error_message": f"Cancelled by admin: {reason}"
            }}
        )
        
        # Log action
        await AuditService.log_action(
            action="job.cancel",
            admin_id=admin["id"],
            admin_email=admin["email"],
            target_type="job",
            target_id=job_id,
            details={
                "reason": reason,
                "user_id": job["user_id"],
                "mode": job["mode"]
            }
        )
        
        return {"message": "Job cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling job: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error cancelling job"
        )

@router.post("/{job_id}/refund")
async def refund_job(
    job_id: str,
    reason: str = Query(..., description="Reason for refund"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Refund credits for a job
    Requires: support_admin or super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_support_admin(None, credentials)
        
        db = Database.get_db()
        
        # Get job
        job = await db.tryon_jobs.find_one({"id": job_id})
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Check if already refunded
        if job.get("refunded", False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Job has already been refunded"
            )
        
        # Refund credits (1 credit per job)
        from services.credit_service import CreditService
        await CreditService.add_credits(
            job["user_id"],
            1,
            "refund",
            f"Refund for job {job_id}: {reason}"
        )
        
        # Mark job as refunded
        await db.tryon_jobs.update_one(
            {"id": job_id},
            {"$set": {"refunded": True}}
        )
        
        # Log action
        await AuditService.log_action(
            action="job.refund",
            admin_id=admin["id"],
            admin_email=admin["email"],
            target_type="job",
            target_id=job_id,
            details={
                "reason": reason,
                "user_id": job["user_id"],
                "credits_refunded": 1
            }
        )
        
        return {"message": "Credits refunded successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refunding job: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error refunding job"
        )
