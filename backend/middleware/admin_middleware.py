from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Literal
import logging

from auth.jwt_handler import decode_access_token
from database import Database

logger = logging.getLogger(__name__)
security = HTTPBearer()

AdminRole = Literal["super_admin", "support_admin", "finance_admin"]

class AdminMiddleware:
    """
    Middleware to check if user has admin privileges
    """
    
    @staticmethod
    async def verify_admin(
        request: Request,
        credentials: HTTPAuthorizationCredentials,
        required_roles: list[str] = None
    ):
        """
        Verify if user is admin and has required role
        """
        try:
            # Decode JWT token
            token = credentials.credentials
            payload = decode_access_token(token)
            
            if not payload:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials"
                )
            
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload"
                )
            
            # Get user from database
            db = Database.get_db()
            user = await db.users.find_one({"id": user_id})
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # Check if user is active
            if not user.get("is_active", False):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User account is inactive"
                )
            
            # Check if user is suspended
            if user.get("is_suspended", False):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User account is suspended"
                )
            
            # Check if user has admin role
            user_role = user.get("role")
            admin_type = user.get("admin_type")  # super_admin, support_admin, finance_admin
            
            if user_role != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admin access required"
                )
            
            # Check specific admin role if required
            if required_roles and admin_type not in required_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient permissions. Required roles: {', '.join(required_roles)}"
                )
            
            # Attach user to request state
            request.state.user = user
            return user
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Admin verification error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error verifying admin access"
            )

    @staticmethod
    async def verify_super_admin(request: Request, credentials: HTTPAuthorizationCredentials):
        """Verify super admin access"""
        return await AdminMiddleware.verify_admin(request, credentials, ["super_admin"])
    
    @staticmethod
    async def verify_support_admin(request: Request, credentials: HTTPAuthorizationCredentials):
        """Verify support or super admin access"""
        return await AdminMiddleware.verify_admin(request, credentials, ["super_admin", "support_admin"])
    
    @staticmethod
    async def verify_finance_admin(request: Request, credentials: HTTPAuthorizationCredentials):
        """Verify finance or super admin access"""
        return await AdminMiddleware.verify_admin(request, credentials, ["super_admin", "finance_admin"])
