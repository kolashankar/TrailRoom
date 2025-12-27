from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
import logging
from contextlib import asynccontextmanager

# Import configuration and database
from config import settings
from database import Database

# Import routes
from routes import auth_routes, credit_routes, api_key_routes, tryon_routes

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting TrailRoom API...")
    await Database.connect_db()
    logger.info("Database connected")
    
    # Start daily credit reset scheduler
    from schedulers.daily_reset_scheduler import get_scheduler
    scheduler = get_scheduler()
    scheduler.start()
    logger.info("Scheduler started")
    
    yield
    # Shutdown
    logger.info("Shutting down TrailRoom API...")
    scheduler.shutdown()
    await Database.close_db()

# Create the main app
app = FastAPI(
    title="TrailRoom API",
    description="API-First Virtual Try-On Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Create API v1 router
api_v1_router = APIRouter(prefix="/api/v1")

# Include route modules
api_v1_router.include_router(auth_routes.router)
api_v1_router.include_router(credit_routes.router)
api_v1_router.include_router(api_key_routes.router)
api_v1_router.include_router(tryon_routes.router)

# Add root endpoint
@api_v1_router.get("/")
async def root():
    return {
        "message": "TrailRoom API",
        "version": "1.0.0",
        "status": "running"
    }

@api_v1_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include the API router in the main app
app.include_router(api_v1_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=settings.CORS_ORIGINS.split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)