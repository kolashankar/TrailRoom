from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging

from middleware.admin_middleware import AdminMiddleware
from services.audit_service import AuditService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/audit-logs", tags=["Admin - Audit Logs"])
security = HTTPBearer()

@router.get("")
async def get_audit_logs(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    target_type: Optional[str] = Query(None, description="Filter by target type"),
    target_id: Optional[str] = Query(None, description="Filter by target ID"),
    admin_id: Optional[str] = Query(None, description="Filter by admin ID"),
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0)
):
    """
    Get audit logs with filters
    Requires: super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_super_admin(None, credentials)
        
        logs = await AuditService.get_logs(
            target_type=target_type,
            target_id=target_id,
            admin_id=admin_id,
            limit=limit,
            skip=skip
        )
        
        return {
            "logs": logs,
            "count": len(logs),
            "skip": skip,
            "limit": limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting audit logs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving audit logs"
        )

@router.get("/search")
async def search_audit_logs(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    q: str = Query(..., description="Search term"),
    limit: int = Query(100, ge=1, le=500)
):
    """
    Search audit logs
    Requires: super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_super_admin(None, credentials)
        
        logs = await AuditService.search_logs(q, limit)
        
        return {
            "logs": logs,
            "count": len(logs),
            "search_term": q
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching audit logs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error searching audit logs"
        )
