from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

from database import Database
from middleware.admin_middleware import AdminMiddleware
from services.abuse_detection_service import AbuseDetectionService
from services.audit_service import AuditService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/security", tags=["Admin - Security"])
security = HTTPBearer()

@router.get("/suspicious-users")
async def get_suspicious_users(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get list of users with suspicious activity
    Requires: super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_super_admin(None, credentials)
        
        suspicious_users = await AbuseDetectionService.get_suspicious_users()
        
        return {"suspicious_users": suspicious_users}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting suspicious users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving suspicious users"
        )

@router.get("/check-user/{user_id}")
async def check_user_abuse(
    user_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Check specific user for abuse patterns
    Requires: super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_super_admin(None, credentials)
        
        # Run all abuse detection checks
        excessive_usage = await AbuseDetectionService.detect_excessive_usage(user_id, 60)
        failed_payments = await AbuseDetectionService.detect_failed_payments(user_id)
        api_scraping = await AbuseDetectionService.detect_api_scraping(user_id)
        
        return {
            "user_id": user_id,
            "excessive_usage": excessive_usage,
            "failed_payments": failed_payments,
            "api_scraping": api_scraping,
            "is_suspicious": (
                excessive_usage["is_suspicious"] or 
                failed_payments["is_suspicious"] or 
                api_scraping["is_suspicious"]
            )
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking user abuse: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error checking user for abuse"
        )

@router.post("/block-ip")
async def block_ip(
    ip_address: str = Query(..., description="IP address to block"),
    reason: str = Query(..., description="Reason for blocking"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Block an IP address
    Requires: super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_super_admin(None, credentials)
        
        blocked_ip = await AbuseDetectionService.block_ip(ip_address, reason, admin["id"])
        
        # Log action
        await AuditService.log_action(
            action="security.ip.block",
            admin_id=admin["id"],
            admin_email=admin["email"],
            target_type="system",
            details={
                "ip_address": ip_address,
                "reason": reason
            }
        )
        
        return {"message": "IP address blocked successfully", "blocked_ip": blocked_ip}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error blocking IP: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error blocking IP address"
        )

@router.post("/unblock-ip")
async def unblock_ip(
    ip_address: str = Query(..., description="IP address to unblock"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Unblock an IP address
    Requires: super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_super_admin(None, credentials)
        
        success = await AbuseDetectionService.unblock_ip(ip_address)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="IP address not found in block list"
            )
        
        # Log action
        await AuditService.log_action(
            action="security.ip.unblock",
            admin_id=admin["id"],
            admin_email=admin["email"],
            target_type="system",
            details={
                "ip_address": ip_address
            }
        )
        
        return {"message": "IP address unblocked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unblocking IP: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error unblocking IP address"
        )

@router.get("/blocked-ips")
async def get_blocked_ips(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get all blocked IP addresses
    Requires: super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_super_admin(None, credentials)
        
        blocked_ips = await AbuseDetectionService.get_blocked_ips()
        
        return {"blocked_ips": blocked_ips}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting blocked IPs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving blocked IPs"
        )
