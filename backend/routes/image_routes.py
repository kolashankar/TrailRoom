from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from middleware.auth_middleware import get_current_user
from services.image_processing_service import ImageProcessingService

router = APIRouter(prefix="/api/v1/images", tags=["images"])
image_service = ImageProcessingService()

class CropRequest(BaseModel):
    image_base64: str
    x: int
    y: int
    width: int
    height: int

class ResizeRequest(BaseModel):
    image_base64: str
    width: int
    height: int

class AdjustBrightnessRequest(BaseModel):
    image_base64: str
    factor: float

class AdjustContrastRequest(BaseModel):
    image_base64: str
    factor: float

class RemoveBackgroundRequest(BaseModel):
    image_base64: str

class ImageInfoRequest(BaseModel):
    image_base64: str

@router.post("/crop")
async def crop_image(request: CropRequest, current_user: dict = Depends(get_current_user)):
    """Crop an image"""
    try:
        result = image_service.crop_image(
            request.image_base64,
            request.x,
            request.y,
            request.width,
            request.height
        )
        return {"image_base64": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/resize")
async def resize_image(request: ResizeRequest, current_user: dict = Depends(get_current_user)):
    """Resize an image"""
    try:
        result = image_service.resize_image(
            request.image_base64,
            request.width,
            request.height
        )
        return {"image_base64": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/adjust-brightness")
async def adjust_brightness(request: AdjustBrightnessRequest, current_user: dict = Depends(get_current_user)):
    """Adjust image brightness"""
    try:
        result = image_service.adjust_brightness(
            request.image_base64,
            request.factor
        )
        return {"image_base64": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/adjust-contrast")
async def adjust_contrast(request: AdjustContrastRequest, current_user: dict = Depends(get_current_user)):
    """Adjust image contrast"""
    try:
        result = image_service.adjust_contrast(
            request.image_base64,
            request.factor
        )
        return {"image_base64": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/remove-background")
async def remove_background(request: RemoveBackgroundRequest, current_user: dict = Depends(get_current_user)):
    """Remove background from image"""
    try:
        result = image_service.remove_background(request.image_base64)
        return {"image_base64": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/info")
async def get_image_info(request: ImageInfoRequest, current_user: dict = Depends(get_current_user)):
    """Get image information"""
    try:
        info = image_service.get_image_info(request.image_base64)
        return info
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
