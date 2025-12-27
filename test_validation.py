#!/usr/bin/env python3
"""
Test specific validation case
"""

import requests
import json
import base64
import io
from PIL import Image

BACKEND_URL = "https://admin-control-85.preview.emergentagent.com/api/v1"
TEST_USER_EMAIL = "testuser@trailroom.com"
TEST_USER_PASSWORD = "TestPassword123!"

def create_test_image_base64(width=512, height=512, color=(255, 0, 0)):
    """Create a test image and return as base64"""
    img = Image.new('RGB', (width, height), color)
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

def test_validation():
    # Login first
    login_payload = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    
    response = requests.post(f"{BACKEND_URL}/auth/login", json=login_payload)
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test full mode without bottom image
    person_image = create_test_image_base64(512, 512, (100, 150, 200))
    clothing_image = create_test_image_base64(256, 256, (200, 100, 100))
    
    payload = {
        "mode": "full",
        "person_image_base64": person_image,
        "clothing_image_base64": clothing_image
        # Missing bottom_image_base64
    }
    
    print("Testing full mode without bottom image...")
    response = requests.post(f"{BACKEND_URL}/tryon", json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_validation()