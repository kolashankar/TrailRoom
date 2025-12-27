from datetime import datetime
from typing import Optional
from database import get_database
from models.user_model import UserCreate, UserInDB, UserResponse
from auth.password_utils import hash_password, verify_password
from config import settings
import logging

logger = logging.getLogger(__name__)

class UserService:
    @staticmethod
    async def create_user(user_data: UserCreate) -> UserInDB:
        """Create a new user"""
        db = get_database()
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Create user object
        user_dict = user_data.model_dump(exclude={"password"})
        user = UserInDB(**user_dict)
        
        # Hash password if email auth
        if user_data.auth_provider == "email":
            user.password_hash = hash_password(user_data.password)
        
        # Initialize free credits
        user.credits = settings.FREE_DAILY_CREDITS
        user.last_free_credit_reset = datetime.utcnow()
        
        # Save to database
        user_doc = user.model_dump()
        user_doc['created_at'] = user_doc['created_at'].isoformat()
        user_doc['updated_at'] = user_doc['updated_at'].isoformat()
        if user_doc.get('last_free_credit_reset'):
            user_doc['last_free_credit_reset'] = user_doc['last_free_credit_reset'].isoformat()
        if user_doc.get('last_login'):
            user_doc['last_login'] = user_doc['last_login'].isoformat()
        
        await db.users.insert_one(user_doc)
        logger.info(f"Created user: {user.email}")
        return user
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[UserInDB]:
        """Get user by email"""
        db = get_database()
        user_doc = await db.users.find_one({"email": email}, {"_id": 0})
        
        if not user_doc:
            return None
        
        # Convert ISO strings back to datetime
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        if isinstance(user_doc.get('updated_at'), str):
            user_doc['updated_at'] = datetime.fromisoformat(user_doc['updated_at'])
        if isinstance(user_doc.get('last_free_credit_reset'), str):
            user_doc['last_free_credit_reset'] = datetime.fromisoformat(user_doc['last_free_credit_reset'])
        if isinstance(user_doc.get('last_login'), str):
            user_doc['last_login'] = datetime.fromisoformat(user_doc['last_login'])
        
        return UserInDB(**user_doc)
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[UserInDB]:
        """Get user by ID"""
        db = get_database()
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
        
        if not user_doc:
            return None
        
        # Convert ISO strings back to datetime
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        if isinstance(user_doc.get('updated_at'), str):
            user_doc['updated_at'] = datetime.fromisoformat(user_doc['updated_at'])
        if isinstance(user_doc.get('last_free_credit_reset'), str):
            user_doc['last_free_credit_reset'] = datetime.fromisoformat(user_doc['last_free_credit_reset'])
        if isinstance(user_doc.get('last_login'), str):
            user_doc['last_login'] = datetime.fromisoformat(user_doc['last_login'])
        
        return UserInDB(**user_doc)
    
    @staticmethod
    async def authenticate_user(email: str, password: str) -> Optional[UserInDB]:
        """Authenticate user with email and password"""
        user = await UserService.get_user_by_email(email)
        if not user:
            return None
        
        if not user.password_hash:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        # Update last login
        db = get_database()
        await db.users.update_one(
            {"id": user.id},
            {"$set": {"last_login": datetime.utcnow().isoformat()}}
        )
        
        return user
    
    @staticmethod
    async def update_user_credits(user_id: str, credits: int) -> bool:
        """Update user credits"""
        db = get_database()
        result = await db.users.update_one(
            {"id": user_id},
            {"$set": {"credits": credits, "updated_at": datetime.utcnow().isoformat()}}
        )
        return result.modified_count > 0
