import base64
import io
from PIL import Image
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class ImageService:
    """Service for image processing operations"""
    
    @staticmethod
    def validate_base64_image(base64_str: str) -> bool:
        """Validate if string is a valid base64 encoded image"""
        try:
            # Remove data URL prefix if present
            if ',' in base64_str:
                base64_str = base64_str.split(',', 1)[1]
            
            # Try to decode
            img_data = base64.b64decode(base64_str)
            img = Image.open(io.BytesIO(img_data))
            img.verify()
            return True
        except Exception as e:
            logger.error(f"Invalid base64 image: {str(e)}")
            return False
    
    @staticmethod
    def clean_base64_string(base64_str: str) -> str:
        """Remove data URL prefix from base64 string"""
        if ',' in base64_str:
            return base64_str.split(',', 1)[1]
        return base64_str
    
    @staticmethod
    def get_image_info(base64_str: str) -> Optional[dict]:
        """Get image dimensions and format"""
        try:
            base64_str = ImageService.clean_base64_string(base64_str)
            img_data = base64.b64decode(base64_str)
            img = Image.open(io.BytesIO(img_data))
            return {
                "width": img.width,
                "height": img.height,
                "format": img.format,
                "mode": img.mode
            }
        except Exception as e:
            logger.error(f"Error getting image info: {str(e)}")
            return None
    
    @staticmethod
    def resize_image_if_needed(base64_str: str, max_size: Tuple[int, int] = (1024, 1024)) -> str:
        """Resize image if it exceeds max dimensions"""
        try:
            base64_str = ImageService.clean_base64_string(base64_str)
            img_data = base64.b64decode(base64_str)
            img = Image.open(io.BytesIO(img_data))
            
            # Check if resize needed
            if img.width > max_size[0] or img.height > max_size[1]:
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                logger.info(f"Resized image to {img.width}x{img.height}")
            
            # Convert back to base64
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            return base64.b64encode(buffered.getvalue()).decode('utf-8')
        except Exception as e:
            logger.error(f"Error resizing image: {str(e)}")
            return base64_str
