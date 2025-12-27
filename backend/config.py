import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class Settings:
    # MongoDB
    MONGO_URL: str = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    DB_NAME: str = os.environ.get('DB_NAME', 'trailroom_db')
    
    # JWT
    JWT_SECRET: str = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
    JWT_ALGORITHM: str = 'HS256'
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # OAuth
    GOOGLE_CLIENT_ID: str = os.environ.get('GOOGLE_CLIENT_ID', '')
    GOOGLE_CLIENT_SECRET: str = os.environ.get('GOOGLE_CLIENT_SECRET', '')
    GOOGLE_REDIRECT_URI: str = os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:8001/api/v1/auth/google/callback')
    
    # OpenAI
    OPENAI_API_KEY: str = os.environ.get('OPENAI_API_KEY', '')
    
    # Razorpay
    RAZORPAY_KEY_ID: str = os.environ.get('RAZORPAY_KEY_ID', '')
    RAZORPAY_KEY_SECRET: str = os.environ.get('RAZORPAY_KEY_SECRET', '')
    
    # CORS
    CORS_ORIGINS: str = os.environ.get('CORS_ORIGINS', '*')
    
    # Credits
    FREE_DAILY_CREDITS: int = 3
    CREDIT_COST_TOP_ONLY: int = 1
    CREDIT_COST_FULL_OUTFIT: int = 1
    
    # Base Pricing
    BASE_CREDIT_PRICE: float = 1.0  # ₹1 per credit

settings = Settings()
