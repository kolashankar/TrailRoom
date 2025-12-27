from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, List
import logging

from database import Database
from middleware.admin_middleware import AdminMiddleware
from services.credit_service import CreditService
from services.audit_service import AuditService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/users", tags=["Admin - Users"])
security = HTTPBearer()

@router.get("")
async def get_users(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    search: Optional[str] = Query(None, description="Search by email or name"),
    role: Optional[str] = Query(None, description="Filter by role"),
    is_suspended: Optional[bool] = Query(None, description="Filter by suspension status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """
    Get list of users with search and filters
    Requires: support_admin or super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_support_admin(None, credentials)
        
        db = Database.get_db()
        
        # Build query
        query = {}
        if search:
            query["$or"] = [
                {"email": {"$regex": search, "$options": "i"}},
                {"first_name": {"$regex": search, "$options": "i"}},
                {"last_name": {"$regex": search, "$options": "i"}}
            ]
        if role:
            query["role"] = role
        if is_suspended is not None:
            query["is_suspended"] = is_suspended
        
        # Get total count
        total = await db.users.count_documents(query)
        
        # Get users
        users = await db.users.find(query).skip(skip).limit(limit).sort("created_at", -1).to_list(None)
        
        # Remove sensitive data
        for user in users:
            user.pop("password_hash", None)
        
        return {
            "users": users,
            "total": total,
            "skip": skip,
            "limit": limit
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving users"
        )

@router.get("/{user_id}")
async def get_user_detail(
    user_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get detailed user information
    Requires: support_admin or super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_support_admin(None, credentials)
        
        db = Database.get_db()
        
        # Get user
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.pop("password_hash", None)
        
        # Get credit history
        credit_history = await db.credit_transactions.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(20).to_list(None)
        
        # Get job history
        job_history = await db.tryon_jobs.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(20).to_list(None)
        
        # Get payment history
        payment_history = await db.payments.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(20).to_list(None)
        
        # Get API keys
        api_keys = await db.api_keys.find(
            {"user_id": user_id}
        ).to_list(None)
        
        return {
            "user": user,
            "credit_history": credit_history,
            "job_history": job_history,
            "payment_history": payment_history,
            "api_keys": api_keys
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user detail: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving user details"
        )

@router.post("/{user_id}/credits")
async def adjust_user_credits(
    user_id: str,
    credits: int = Query(..., description="Credits to add (positive) or deduct (negative)"),
    reason: str = Query(..., description="Reason for adjustment"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Manually adjust user credits
    Requires: support_admin or super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_support_admin(None, credentials)
        
        db = Database.get_db()
        
        # Check if user exists
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Add credits
        if credits > 0:
            await CreditService.add_credits(user_id, credits, "admin_add", reason)
        else:
            # Deduct credits
            await CreditService.use_credits(user_id, abs(credits), "admin_deduct", reason)
        
        # Log action
        await AuditService.log_action(
            action="user.credits.adjust",
            admin_id=admin["id"],
            admin_email=admin["email"],
            target_type="user",
            target_id=user_id,
            details={
                "credits": credits,
                "reason": reason,
                "user_email": user["email"]
            }
        )
        
        # Get updated user
        updated_user = await db.users.find_one({"id": user_id})
        
        return {
            "message": "Credits adjusted successfully",
            "new_balance": updated_user["credits"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adjusting credits: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error adjusting credits"
        )

@router.put("/{user_id}/role")
async def update_user_role(
    user_id: str,
    role: str = Query(..., description="New role: free, paid, or admin"),
    admin_type: Optional[str] = Query(None, description="Admin type if role is admin"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Update user role
    Requires: super_admin
    """
    try:
        # Verify super admin access
        admin = await AdminMiddleware.verify_super_admin(None, credentials)
        
        if role not in ["free", "paid", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role. Must be free, paid, or admin"
            )
        
        if role == "admin" and admin_type not in ["super_admin", "support_admin", "finance_admin"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid admin_type. Must be super_admin, support_admin, or finance_admin"
            )
        
        db = Database.get_db()
        
        # Check if user exists
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update role
        update_data = {"role": role}
        if role == "admin":
            update_data["admin_type"] = admin_type
        else:
            update_data["admin_type"] = None
        
        await db.users.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
        
        # Log action
        await AuditService.log_action(
            action="user.role.update",
            admin_id=admin["id"],
            admin_email=admin["email"],
            target_type="user",
            target_id=user_id,
            details={
                "old_role": user["role"],
                "new_role": role,
                "admin_type": admin_type,
                "user_email": user["email"]
            }
        )
        
        return {"message": "User role updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user role: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating user role"
        )

@router.post("/{user_id}/suspend")
async def suspend_user(
    user_id: str,
    reason: str = Query(..., description="Reason for suspension"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Suspend or unsuspend a user
    Requires: support_admin or super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_support_admin(None, credentials)
        
        db = Database.get_db()
        
        # Check if user exists
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Toggle suspension
        new_status = not user.get("is_suspended", False)
        
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"is_suspended": new_status}}
        )
        
        # Log action
        await AuditService.log_action(
            action="user.suspend" if new_status else "user.unsuspend",
            admin_id=admin["id"],
            admin_email=admin["email"],
            target_type="user",
            target_id=user_id,
            details={
                "reason": reason,
                "user_email": user["email"],
                "suspended": new_status
            }
        )
        
        return {
            "message": f"User {'suspended' if new_status else 'unsuspended'} successfully",
            "is_suspended": new_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error suspending user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating user suspension status"
        )

@router.post("/{user_id}/api-key/reset")
async def reset_user_api_key(
    user_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Reset user's API key
    Requires: support_admin or super_admin
    """
    try:
        # Verify admin access
        admin = await AdminMiddleware.verify_support_admin(None, credentials)
        
        db = Database.get_db()
        
        # Check if user exists
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Deactivate all existing API keys
        await db.api_keys.update_many(
            {"user_id": user_id},
            {"$set": {"is_active": False}}
        )
        
        # Log action
        await AuditService.log_action(
            action="user.api_key.reset",
            admin_id=admin["id"],
            admin_email=admin["email"],
            target_type="user",
            target_id=user_id,
            details={
                "user_email": user["email"]
            }
        )
        
        return {"message": "API keys reset successfully. User must generate new keys."}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting API key: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error resetting API key"
        )
