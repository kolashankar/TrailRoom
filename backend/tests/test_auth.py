"""Unit tests for authentication services."""
import pytest
import sys
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from auth.password_utils import hash_password, verify_password
from auth.jwt_handler import create_access_token, create_refresh_token, decode_token
import time

class TestPasswordUtils:
    """Test password hashing and verification."""
    
    def test_hash_password(self):
        """Test password hashing."""
        password = "TestPassword123!"
        hashed = hash_password(password)
        
        assert hashed is not None
        assert hashed != password
        assert len(hashed) > 0
    
    def test_verify_password_success(self):
        """Test successful password verification."""
        password = "TestPassword123!"
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_password_failure(self):
        """Test failed password verification."""
        password = "TestPassword123!"
        wrong_password = "WrongPassword123!"
        hashed = hash_password(password)
        
        assert verify_password(wrong_password, hashed) is False

class TestJWTHandler:
    """Test JWT token generation and validation."""
    
    def test_create_access_token(self):
        """Test access token creation."""
        user_id = "test-user-123"
        token = create_access_token(user_id)
        
        assert token is not None
        assert len(token) > 0
        assert isinstance(token, str)
    
    def test_create_refresh_token(self):
        """Test refresh token creation."""
        user_id = "test-user-123"
        token = create_refresh_token(user_id)
        
        assert token is not None
        assert len(token) > 0
        assert isinstance(token, str)
    
    def test_decode_token_success(self):
        """Test successful token decoding."""
        user_id = "test-user-123"
        token = create_access_token(user_id)
        
        decoded = decode_token(token)
        assert decoded is not None
        assert decoded.get("sub") == user_id
    
    def test_decode_invalid_token(self):
        """Test decoding invalid token."""
        invalid_token = "invalid.token.here"
        
        decoded = decode_token(invalid_token)
        assert decoded is None
