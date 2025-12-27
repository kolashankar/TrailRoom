#!/usr/bin/env python3
"""
Backend API Testing for TrailRoom Virtual Try-On Platform
Tests Phase 2 implementation with Gemini 2.5 Flash integration
"""

import requests
import json
import base64
import time
import os
from PIL import Image
import io

# Configuration
BACKEND_URL = "https://tryon-dashboard-1.preview.emergentagent.com/api/v1"
TEST_USER_EMAIL = "testuser@trailroom.com"
TEST_USER_PASSWORD = "TestPassword123!"
TEST_USER_FIRST_NAME = "Test"

class TryOnAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.access_token = None
        self.user_id = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
    
    def create_test_image_base64(self, width=512, height=512, color=(255, 0, 0)):
        """Create a test image and return as base64"""
        img = Image.new('RGB', (width, height), color)
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
    
    def test_health_check(self):
        """Test basic health check"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                self.log_result("Health Check", True, "Backend is healthy")
                return True
            else:
                self.log_result("Health Check", False, f"Health check failed with status {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Health Check", False, f"Health check failed: {str(e)}")
            return False
    
    def test_user_registration(self):
        """Test user registration"""
        try:
            payload = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD,
                "first_name": TEST_USER_FIRST_NAME
            }
            
            response = requests.post(f"{self.base_url}/auth/register", json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get("access_token")
                self.user_id = data.get("user", {}).get("id")
                self.log_result("User Registration", True, "User registered successfully", 
                              {"user_id": self.user_id, "credits": data.get("user", {}).get("credits")})
                return True
            elif response.status_code == 400 and "already exists" in response.text:
                # User already exists, try login
                return self.test_user_login()
            else:
                self.log_result("User Registration", False, f"Registration failed: {response.text}")
                return False
        except Exception as e:
            self.log_result("User Registration", False, f"Registration error: {str(e)}")
            return False
    
    def test_user_login(self):
        """Test user login"""
        try:
            payload = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
            
            response = requests.post(f"{self.base_url}/auth/login", json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get("access_token")
                self.user_id = data.get("user", {}).get("id")
                user_credits = data.get("user", {}).get("credits", 0)
                self.log_result("User Login", True, "User logged in successfully", 
                              {"user_id": self.user_id, "credits": user_credits})
                return True
            else:
                self.log_result("User Login", False, f"Login failed: {response.text}")
                return False
        except Exception as e:
            self.log_result("User Login", False, f"Login error: {str(e)}")
            return False
    
    def get_auth_headers(self):
        """Get authorization headers"""
        return {"Authorization": f"Bearer {self.access_token}"}
    
    def test_tryon_job_creation_top_mode(self):
        """Test try-on job creation in top mode"""
        try:
            # Create test images
            person_image = self.create_test_image_base64(512, 512, (100, 150, 200))  # Blue person
            clothing_image = self.create_test_image_base64(256, 256, (200, 100, 100))  # Red clothing
            
            payload = {
                "mode": "top",
                "person_image_base64": person_image,
                "clothing_image_base64": clothing_image
            }
            
            response = requests.post(
                f"{self.base_url}/tryon",
                json=payload,
                headers=self.get_auth_headers(),
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                job_id = data.get("id")
                status = data.get("status")
                self.log_result("Try-On Job Creation (Top Mode)", True, 
                              f"Job created successfully with status: {status}", 
                              {"job_id": job_id, "mode": data.get("mode")})
                return job_id
            else:
                self.log_result("Try-On Job Creation (Top Mode)", False, 
                              f"Job creation failed: {response.text}")
                return None
        except Exception as e:
            self.log_result("Try-On Job Creation (Top Mode)", False, 
                          f"Job creation error: {str(e)}")
            return None
    
    def test_tryon_job_creation_full_mode(self):
        """Test try-on job creation in full mode"""
        try:
            # Create test images
            person_image = self.create_test_image_base64(512, 512, (100, 150, 200))  # Blue person
            clothing_image = self.create_test_image_base64(256, 256, (200, 100, 100))  # Red top
            bottom_image = self.create_test_image_base64(256, 256, (100, 200, 100))  # Green bottom
            
            payload = {
                "mode": "full",
                "person_image_base64": person_image,
                "clothing_image_base64": clothing_image,
                "bottom_image_base64": bottom_image
            }
            
            response = requests.post(
                f"{self.base_url}/tryon",
                json=payload,
                headers=self.get_auth_headers(),
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                job_id = data.get("id")
                status = data.get("status")
                self.log_result("Try-On Job Creation (Full Mode)", True, 
                              f"Job created successfully with status: {status}", 
                              {"job_id": job_id, "mode": data.get("mode")})
                return job_id
            else:
                self.log_result("Try-On Job Creation (Full Mode)", False, 
                              f"Job creation failed: {response.text}")
                return None
        except Exception as e:
            self.log_result("Try-On Job Creation (Full Mode)", False, 
                          f"Job creation error: {str(e)}")
            return None
    
    def test_tryon_job_creation_invalid_data(self):
        """Test try-on job creation with invalid data"""
        try:
            # Test with invalid base64
            payload = {
                "mode": "top",
                "person_image_base64": "invalid_base64_data",
                "clothing_image_base64": "also_invalid"
            }
            
            response = requests.post(
                f"{self.base_url}/tryon",
                json=payload,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 400:
                self.log_result("Try-On Job Creation (Invalid Data)", True, 
                              "Correctly rejected invalid base64 data")
                return True
            else:
                self.log_result("Try-On Job Creation (Invalid Data)", False, 
                              f"Should have rejected invalid data but got: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Try-On Job Creation (Invalid Data)", False, 
                          f"Error testing invalid data: {str(e)}")
            return False
    
    def test_tryon_job_creation_full_mode_missing_bottom(self):
        """Test try-on job creation in full mode without bottom image"""
        try:
            person_image = self.create_test_image_base64(512, 512, (100, 150, 200))
            clothing_image = self.create_test_image_base64(256, 256, (200, 100, 100))
            
            payload = {
                "mode": "full",
                "person_image_base64": person_image,
                "clothing_image_base64": clothing_image
                # Missing bottom_image_base64
            }
            
            response = requests.post(
                f"{self.base_url}/tryon",
                json=payload,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 400:
                self.log_result("Try-On Job Creation (Full Mode Missing Bottom)", True, 
                              "Correctly rejected full mode without bottom image")
                return True
            else:
                self.log_result("Try-On Job Creation (Full Mode Missing Bottom)", False, 
                              f"Should have rejected missing bottom image but got: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Try-On Job Creation (Full Mode Missing Bottom)", False, 
                          f"Error testing missing bottom image: {str(e)}")
            return False
    
    def test_job_status_retrieval(self, job_id):
        """Test job status retrieval"""
        if not job_id:
            self.log_result("Job Status Retrieval", False, "No job ID provided")
            return None
        
        try:
            response = requests.get(
                f"{self.base_url}/tryon/{job_id}",
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                status = data.get("status")
                self.log_result("Job Status Retrieval", True, 
                              f"Job status retrieved: {status}", 
                              {"job_id": job_id, "status": status})
                return data
            elif response.status_code == 404:
                self.log_result("Job Status Retrieval", False, "Job not found")
                return None
            else:
                self.log_result("Job Status Retrieval", False, 
                              f"Status retrieval failed: {response.text}")
                return None
        except Exception as e:
            self.log_result("Job Status Retrieval", False, 
                          f"Status retrieval error: {str(e)}")
            return None
    
    def test_job_completion_polling(self, job_id, max_wait_time=60):
        """Test job completion by polling status"""
        if not job_id:
            self.log_result("Job Completion Polling", False, "No job ID provided")
            return False
        
        start_time = time.time()
        last_status = None
        
        try:
            while time.time() - start_time < max_wait_time:
                job_data = self.test_job_status_retrieval(job_id)
                if not job_data:
                    break
                
                status = job_data.get("status")
                if status != last_status:
                    print(f"   Job {job_id} status: {status}")
                    last_status = status
                
                if status == "completed":
                    result_image = job_data.get("result_image_base64")
                    if result_image:
                        self.log_result("Job Completion Polling", True, 
                                      f"Job completed successfully with result image", 
                                      {"job_id": job_id, "result_length": len(result_image)})
                        return True
                    else:
                        self.log_result("Job Completion Polling", False, 
                                      "Job completed but no result image")
                        return False
                elif status == "failed":
                    error_msg = job_data.get("error_message", "Unknown error")
                    self.log_result("Job Completion Polling", False, 
                                  f"Job failed: {error_msg}")
                    return False
                
                time.sleep(3)  # Wait 3 seconds before next poll
            
            # Timeout reached
            self.log_result("Job Completion Polling", False, 
                          f"Job did not complete within {max_wait_time} seconds. Last status: {last_status}")
            return False
            
        except Exception as e:
            self.log_result("Job Completion Polling", False, 
                          f"Polling error: {str(e)}")
            return False
    
    def test_history_retrieval(self):
        """Test history retrieval"""
        try:
            response = requests.get(
                f"{self.base_url}/tryon/history/list",
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                jobs = data.get("jobs", [])
                self.log_result("History Retrieval", True, 
                              f"Retrieved {len(jobs)} jobs from history", 
                              {"job_count": len(jobs), "skip": data.get("skip"), "limit": data.get("limit")})
                return jobs
            else:
                self.log_result("History Retrieval", False, 
                              f"History retrieval failed: {response.text}")
                return []
        except Exception as e:
            self.log_result("History Retrieval", False, 
                          f"History retrieval error: {str(e)}")
            return []
    
    def test_history_pagination(self):
        """Test history pagination"""
        try:
            # Test with pagination parameters
            response = requests.get(
                f"{self.base_url}/tryon/history/list?skip=0&limit=5",
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                jobs = data.get("jobs", [])
                skip = data.get("skip")
                limit = data.get("limit")
                self.log_result("History Pagination", True, 
                              f"Pagination working correctly", 
                              {"job_count": len(jobs), "skip": skip, "limit": limit})
                return True
            else:
                self.log_result("History Pagination", False, 
                              f"Pagination test failed: {response.text}")
                return False
        except Exception as e:
            self.log_result("History Pagination", False, 
                          f"Pagination test error: {str(e)}")
            return False
    
    def test_job_deletion(self, job_id):
        """Test job deletion"""
        if not job_id:
            self.log_result("Job Deletion", False, "No job ID provided")
            return False
        
        try:
            response = requests.delete(
                f"{self.base_url}/tryon/{job_id}",
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                self.log_result("Job Deletion", True, 
                              f"Job deleted successfully", 
                              {"job_id": job_id})
                return True
            elif response.status_code == 404:
                self.log_result("Job Deletion", False, "Job not found for deletion")
                return False
            else:
                self.log_result("Job Deletion", False, 
                              f"Job deletion failed: {response.text}")
                return False
        except Exception as e:
            self.log_result("Job Deletion", False, 
                          f"Job deletion error: {str(e)}")
            return False
    
    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        try:
            # Test without auth token
            response = requests.get(f"{self.base_url}/tryon/history/list", timeout=10)
            
            if response.status_code == 401:
                self.log_result("Unauthorized Access", True, 
                              "Correctly rejected unauthorized request")
                return True
            else:
                self.log_result("Unauthorized Access", False, 
                              f"Should have rejected unauthorized request but got: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Unauthorized Access", False, 
                          f"Unauthorized access test error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting TrailRoom Backend API Tests")
        print("=" * 60)
        
        # Basic connectivity
        if not self.test_health_check():
            print("❌ Health check failed - aborting tests")
            return
        
        # Authentication
        if not self.test_user_registration():
            print("❌ Authentication failed - aborting tests")
            return
        
        # Test unauthorized access
        self.test_unauthorized_access()
        
        # Test job creation scenarios
        job_id_top = self.test_tryon_job_creation_top_mode()
        job_id_full = self.test_tryon_job_creation_full_mode()
        
        # Test error scenarios
        self.test_tryon_job_creation_invalid_data()
        self.test_tryon_job_creation_full_mode_missing_bottom()
        
        # Test job status and completion (only for successful jobs)
        if job_id_top:
            print(f"\n⏳ Polling job completion for top mode job: {job_id_top}")
            self.test_job_completion_polling(job_id_top, max_wait_time=45)
        
        if job_id_full:
            print(f"\n⏳ Polling job completion for full mode job: {job_id_full}")
            self.test_job_completion_polling(job_id_full, max_wait_time=45)
        
        # Test history functionality
        self.test_history_retrieval()
        self.test_history_pagination()
        
        # Test job deletion (use one of the created jobs)
        if job_id_top:
            self.test_job_deletion(job_id_top)
        
        # Print summary
        self.print_test_summary()
    
    def print_test_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n" + "=" * 60)

if __name__ == "__main__":
    tester = TryOnAPITester()
    tester.run_all_tests()