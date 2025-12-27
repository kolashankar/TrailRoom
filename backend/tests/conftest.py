"""Pytest configuration and fixtures for TrailRoom backend tests."""
import pytest
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.testclient import TestClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def test_db():
    """Create a test database connection."""
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017/')
    client = AsyncIOMotorClient(mongo_url)
    db = client["trailroom_test"]
    
    yield db
    
    # Cleanup after tests
    await client.drop_database("trailroom_test")
    client.close()

@pytest.fixture(scope="function")
async def clean_db(test_db):
    """Clean database before each test."""
    # Drop all collections before each test
    collection_names = await test_db.list_collection_names()
    for collection_name in collection_names:
        await test_db[collection_name].delete_many({})
    
    yield test_db

@pytest.fixture()
def test_user_data():
    """Sample user data for testing."""
    return {
        "email": "test@example.com",
        "password": "TestPassword123!",
        "role": "user"
    }

@pytest.fixture()
def test_admin_data():
    """Sample admin data for testing."""
    return {
        "email": "admin@example.com",
        "password": "AdminPassword123!",
        "role": "super_admin"
    }
