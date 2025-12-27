from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import timedelta
from ..models.user_model import UserCreate, UserLogin, UserResponse
from ..services.user_service import UserService
from ..services.api_key_service import APIKeyService
from ..auth.jwt_handler import create_access_token, create_refresh_token, decode_token
from ..middleware.auth_middleware import get_current_user
from ..models.user_model import UserInDB
from fastapi import Depends
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        # Create user
        user = await UserService.create_user(user_data)
        
        # Generate API key for the user
        await APIKeyService.create_api_key(user.id, "Default API Key")
        
        # Create tokens
        access_token = create_access_token(data={"sub": user.id, "email": user.email})
        refresh_token = create_refresh_token(data={"sub": user.id, "email": user.email})
        
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            credits=user.credits,
            daily_free_credits=user.daily_free_credits,
            is_active=user.is_active,
            created_at=user.created_at
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_response
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login with email and password"""
    try:
        user = await UserService.authenticate_user(credentials.email, credentials.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create tokens
        access_token = create_access_token(data={"sub": user.id, "email": user.email})
        refresh_token = create_refresh_token(data={"sub": user.id, "email": user.email})
        
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            credits=user.credits,
            daily_free_credits=user.daily_free_credits,
            is_active=user.is_active,
            created_at=user.created_at
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_response
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@router.post("/refresh")
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token using refresh token"""
    payload = decode_token(request.refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    email = payload.get("email")
    
    # Create new access token
    access_token = create_access_token(data={"sub": user_id, "email": email})
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserInDB = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role,
        credits=current_user.credits,
        daily_free_credits=current_user.daily_free_credits,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )

@router.post("/logout")
async def logout(current_user: UserInDB = Depends(get_current_user)):
    """Logout user"""
    # In a stateless JWT system, logout is handled client-side
    # by removing the tokens from storage
    return {"message": "Logged out successfully"}


# Google OAuth routes
@router.get("/google")
async def google_login():
    """Initiate Google OAuth flow"""
    try:
        from ..auth.oauth_handler import OAuthHandler
        import secrets
        
        # Generate state for CSRF protection
        state = secrets.token_urlsafe(32)
        
        # Generate authorization URL
        auth_url = OAuthHandler.get_google_auth_url(state)
        
        return {"auth_url": auth_url, "state": state}
    except Exception as e:
        logger.error(f"Google OAuth initiation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate Google authentication")

@router.get("/google/callback")
async def google_callback(code: str, state: str):
    """Handle Google OAuth callback"""
    try:
        from ..auth.oauth_handler import OAuthHandler
        
        # Verify the token and get user info
        user_info = OAuthHandler.verify_google_token(code)
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Invalid authorization code")
        
        # Check if user exists
        user = await UserService.get_user_by_email(user_info["email"])
        
        if not user:
            # Create new user with Google auth
            from ..models.user_model import UserCreate
            user_data = UserCreate(
                email=user_info["email"],
                password="",  # No password for OAuth users
                auth_provider="google",
                first_name=user_info.get("given_name"),
                last_name=user_info.get("family_name")
            )
            user = await UserService.create_user(user_data)
            
            # Generate API key for new user
            await APIKeyService.create_api_key(user.id, "Default API Key")
        
        # Update profile picture if available
        if user_info.get("picture"):
            db = get_database()
            from ..database import get_database
            await db.users.update_one(
                {"id": user.id},
                {"$set": {"profile_picture": user_info["picture"]}}
            )
        
        # Create tokens
        access_token = create_access_token(data={"sub": user.id, "email": user.email})
        refresh_token = create_refresh_token(data={"sub": user.id, "email": user.email})
        
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            credits=user.credits,
            daily_free_credits=user.daily_free_credits,
            is_active=user.is_active,
            created_at=user.created_at
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_response
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google OAuth callback error: {e}")
        raise HTTPException(status_code=500, detail="Failed to complete Google authentication")
