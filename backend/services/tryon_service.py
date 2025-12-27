import os
import base64
import asyncio
import logging
from datetime import datetime
from typing import Optional, Tuple
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

from database import Database
from models.tryon_job_model import TryOnJobModel
from services.credit_service import CreditService
from services.image_service import ImageService

load_dotenv()
logger = logging.getLogger(__name__)

class TryOnService:
    """Service for virtual try-on generation using Gemini"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        self.credit_service = CreditService()
        self.image_service = ImageService()
    
    async def create_tryon_job(self, user_id: str, mode: str, person_image: str, 
                               clothing_image: str, bottom_image: Optional[str] = None) -> TryOnJobModel:
        """Create a new try-on job"""
        # Validate images
        if not self.image_service.validate_base64_image(person_image):
            raise ValueError("Invalid person image format")
        if not self.image_service.validate_base64_image(clothing_image):
            raise ValueError("Invalid clothing image format")
        
        if mode == "full" and bottom_image:
            if not self.image_service.validate_base64_image(bottom_image):
                raise ValueError("Invalid bottom image format")
        
        # Check user credits
        db = Database.get_db()
        user = await db.users.find_one({"id": user_id})
        if not user or user.get('credits', 0) < 1:
            raise ValueError("Insufficient credits")
        
        # Clean base64 strings
        person_image_clean = self.image_service.clean_base64_string(person_image)
        clothing_image_clean = self.image_service.clean_base64_string(clothing_image)
        bottom_image_clean = self.image_service.clean_base64_string(bottom_image) if bottom_image else None
        
        # Create job
        job = TryOnJobModel(
            user_id=user_id,
            mode=mode,
            status="queued",
            person_image_base64=person_image_clean[:50] + "...",  # Store truncated for reference
            clothing_image_base64=clothing_image_clean[:50] + "...",
            bottom_image_base64=bottom_image_clean[:50] + "..." if bottom_image_clean else None
        )
        
        # Save to database
        db = Database.get_db()
        await db.tryon_jobs.insert_one(job.model_dump())
        
        # Process job asynchronously
        asyncio.create_task(self._process_job(job.id, user_id, mode, person_image_clean, 
                                              clothing_image_clean, bottom_image_clean))
        
        return job
    
    async def _process_job(self, job_id: str, user_id: str, mode: str, 
                          person_image: str, clothing_image: str, bottom_image: Optional[str] = None):
        """Process the try-on job using Gemini"""
        try:
            # Update status to processing
            db = Database.get_db()
            await db.tryon_jobs.update_one(
                {"id": job_id},
                {"$set": {"status": "processing", "updated_at": datetime.utcnow()}}
            )
            
            # Generate prompt based on mode
            if mode == "top":
                prompt = (
                    "You are a virtual try-on AI. Generate a realistic image showing the person "
                    "wearing the clothing item provided. The person's body, face, and pose should remain "
                    "the same, but they should be wearing the new top/clothing item naturally. "
                    "Ensure proper fit, lighting, shadows, and realistic fabric draping. "
                    "The background should remain similar to the original person image."
                )
            else:  # full mode
                prompt = (
                    "You are a virtual try-on AI. Generate a realistic image showing the person "
                    "wearing both the top clothing item and bottom clothing item provided. "
                    "The person's body, face, and pose should remain the same, but they should be "
                    "wearing the complete outfit naturally. Ensure proper fit, lighting, shadows, "
                    "and realistic fabric draping for both pieces. The background should remain "
                    "similar to the original person image."
                )
            
            # Initialize Gemini chat
            chat = LlmChat(
                api_key=self.api_key,
                session_id=job_id,
                system_message="You are an expert virtual try-on AI assistant."
            )
            chat.with_model("gemini", "gemini-2.5-flash-image-preview").with_params(modalities=["image", "text"])
            
            # Prepare message with images
            file_contents = [
                ImageContent(person_image),
                ImageContent(clothing_image)
            ]
            if bottom_image:
                file_contents.append(ImageContent(bottom_image))
            
            msg = UserMessage(text=prompt, file_contents=file_contents)
            
            # Generate image
            logger.info(f"Generating try-on image for job {job_id}")
            text_response, images = await chat.send_message_multimodal_response(msg)
            
            if images and len(images) > 0:
                result_image = images[0]['data']  # Get first generated image
                logger.info(f"Successfully generated image for job {job_id}")
                
                # Deduct credits
                await self.credit_service.deduct_credits(
                    user_id=user_id,
                    amount=1,
                    description=f"Try-on generation ({mode} mode)"
                )
                
                # Update job with result
                await db.tryon_jobs.update_one(
                    {"id": job_id},
                    {"$set": {
                        "status": "completed",
                        "result_image_base64": result_image,
                        "completed_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }}
                )
            else:
                raise Exception("No image generated")
                
        except Exception as e:
            logger.error(f"Error processing job {job_id}: {str(e)}")
            
            # Update job with error
            await Database.get_collection('tryon_jobs').update_one(
                {"id": job_id},
                {"$set": {
                    "status": "failed",
                    "error_message": str(e),
                    "updated_at": datetime.utcnow()
                }}
            )
    
    async def get_job(self, job_id: str, user_id: str) -> Optional[dict]:
        """Get job by ID"""
        job = await Database.get_collection('tryon_jobs').find_one({
            "id": job_id,
            "user_id": user_id
        })
        return job
    
    async def get_user_jobs(self, user_id: str, skip: int = 0, limit: int = 20) -> list:
        """Get all jobs for a user"""
        cursor = Database.get_collection('tryon_jobs').find(
            {"user_id": user_id}
        ).sort("created_at", -1).skip(skip).limit(limit)
        
        jobs = await cursor.to_list(length=limit)
        return jobs
    
    async def delete_job(self, job_id: str, user_id: str) -> bool:
        """Delete a job"""
        result = await Database.get_collection('tryon_jobs').delete_one({
            "id": job_id,
            "user_id": user_id
        })
        return result.deleted_count > 0
