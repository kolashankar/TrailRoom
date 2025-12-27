"""Unit tests for image service."""
import pytest
import base64
import sys
from pathlib import Path
from PIL import Image
import io

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.image_service import ImageService

class TestImageService:
    """Test image validation and processing."""
    
    def create_test_image(self, width=100, height=100, format='PNG'):
        """Helper to create a test image."""
        img = Image.new('RGB', (width, height), color='red')
        buffer = io.BytesIO()
        img.save(buffer, format=format)
        buffer.seek(0)
        return base64.b64encode(buffer.read()).decode('utf-8')
    
    def test_validate_base64_success(self):
        """Test successful base64 validation."""
        service = ImageService()
        base64_image = self.create_test_image()
        
        result = service.validate_base64(base64_image)
        assert result is True
    
    def test_validate_base64_invalid(self):
        """Test base64 validation with invalid data."""
        service = ImageService()
        invalid_base64 = "not-valid-base64!"
        
        result = service.validate_base64(invalid_base64)
        assert result is False
    
    def test_clean_base64(self):
        """Test cleaning base64 string."""
        service = ImageService()
        base64_with_prefix = f"data:image/png;base64,{self.create_test_image()}"
        
        cleaned = service.clean_base64(base64_with_prefix)
        
        # Should remove the data URL prefix
        assert not cleaned.startswith('data:')
        assert service.validate_base64(cleaned)
    
    def test_get_image_size(self):
        """Test getting image dimensions."""
        service = ImageService()
        base64_image = self.create_test_image(width=200, height=150)
        
        width, height = service.get_image_size(base64_image)
        
        assert width == 200
        assert height == 150
    
    def test_validate_image_size_success(self):
        """Test image size validation (under limit)."""
        service = ImageService()
        # Small image, should be under 5MB
        base64_image = self.create_test_image(width=100, height=100)
        
        result = service.validate_image_size(base64_image, max_size_mb=5)
        assert result is True
    
    def test_validate_image_format_success(self):
        """Test image format validation."""
        service = ImageService()
        base64_image = self.create_test_image(format='PNG')
        
        result = service.validate_image_format(
            base64_image,
            allowed_formats=['PNG', 'JPEG', 'JPG']
        )
        assert result is True
