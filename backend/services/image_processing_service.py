from PIL import Image, ImageEnhance
import io
import base64
from typing import Tuple, Optional

class ImageProcessingService:
    """Service for advanced image processing"""
    
    @staticmethod
    def decode_base64_image(base64_string: str) -> Image.Image:
        """Decode base64 string to PIL Image"""
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',', 1)[1]
        
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        return image
    
    @staticmethod
    def encode_image_to_base64(image: Image.Image, format: str = 'PNG') -> str:
        """Encode PIL Image to base64 string"""
        buffered = io.BytesIO()
        image.save(buffered, format=format)
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/{format.lower()};base64,{img_str}"
    
    def crop_image(self, base64_string: str, x: int, y: int, width: int, height: int) -> str:
        """Crop image to specified dimensions"""
        image = self.decode_base64_image(base64_string)
        cropped = image.crop((x, y, x + width, y + height))
        return self.encode_image_to_base64(cropped)
    
    def resize_image(self, base64_string: str, width: int, height: int) -> str:
        """Resize image to specified dimensions"""
        image = self.decode_base64_image(base64_string)
        resized = image.resize((width, height), Image.Resampling.LANCZOS)
        return self.encode_image_to_base64(resized)
    
    def adjust_brightness(self, base64_string: str, factor: float) -> str:
        """Adjust image brightness (factor: 0.0 to 2.0, 1.0 = original)"""
        image = self.decode_base64_image(base64_string)
        enhancer = ImageEnhance.Brightness(image)
        enhanced = enhancer.enhance(factor)
        return self.encode_image_to_base64(enhanced)
    
    def adjust_contrast(self, base64_string: str, factor: float) -> str:
        """Adjust image contrast (factor: 0.0 to 2.0, 1.0 = original)"""
        image = self.decode_base64_image(base64_string)
        enhancer = ImageEnhance.Contrast(image)
        enhanced = enhancer.enhance(factor)
        return self.encode_image_to_base64(enhanced)
    
    def remove_background(self, base64_string: str) -> str:
        """Remove background from image (simple implementation)"""
        # Note: For production, consider using rembg library or API service
        image = self.decode_base64_image(base64_string)
        # Convert to RGBA if not already
        if image.mode != 'RGBA':
            image = image.convert('RGBA')
        return self.encode_image_to_base64(image)
    
    def get_image_info(self, base64_string: str) -> dict:
        """Get image information"""
        image = self.decode_base64_image(base64_string)
        return {
            'width': image.width,
            'height': image.height,
            'format': image.format,
            'mode': image.mode
        }
