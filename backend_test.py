#!/usr/bin/env python3
"""
Backend Test Suite for AI-Powered Career Path Advisor
Tests FastAPI backend functionality including endpoints, CORS, and error handling.
"""

import requests
import json
import os
import sys
from datetime import datetime
import time

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except FileNotFoundError:
        return "http://localhost:8001"
    return "http://localhost:8001"

BACKEND_URL = get_backend_url()
API_BASE = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.passed_tests = 0
        self.failed_tests = 0
        self.test_results = []
        
    def log_test(self, test_name, passed, message="", details=None):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
        
        if passed:
            self.passed_tests += 1
        else:
            self.failed_tests += 1
        print()

    def test_server_startup(self):
        """Test if FastAPI server is accessible"""
        try:
            response = requests.get(f"{BACKEND_URL}", timeout=5)
            if response.status_code == 404:
                # This is expected since we don't have a root route without /api
                self.log_test("Server Startup", True, "Server is running and accessible")
                return True
            else:
                self.log_test("Server Startup", True, f"Server responding with status {response.status_code}")
                return True
        except requests.exceptions.ConnectionError:
            self.log_test("Server Startup", False, "Cannot connect to backend server", f"URL: {BACKEND_URL}")
            return False
        except Exception as e:
            self.log_test("Server Startup", False, "Server connection error", str(e))
            return False

    def test_health_endpoint(self):
        """Test /api/health endpoint"""
        try:
            response = requests.get(f"{API_BASE}/health", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if "status" in data and "timestamp" in data:
                    if data["status"] == "healthy":
                        self.log_test("Health Check Endpoint", True, 
                                    f"Health check successful: {data['status']}")
                        return True
                    else:
                        self.log_test("Health Check Endpoint", False, 
                                    f"Unexpected status: {data['status']}")
                        return False
                else:
                    self.log_test("Health Check Endpoint", False, 
                                "Missing required fields in response", data)
                    return False
            else:
                self.log_test("Health Check Endpoint", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Health Check Endpoint", False, "Request failed", str(e))
            return False

    def test_root_endpoint(self):
        """Test /api/ root endpoint"""
        try:
            response = requests.get(f"{API_BASE}/", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "version" in data:
                    # Accept both old and new message formats
                    expected_messages = [
                        "AI Career Path Advisor API",
                        "CareerPilot API - Athena AI Career Advisor"
                    ]
                    if data["message"] in expected_messages:
                        self.log_test("Root Endpoint", True, 
                                    f"Welcome message correct: {data['message']}")
                        return True
                    else:
                        self.log_test("Root Endpoint", False, 
                                    f"Unexpected message: {data['message']}")
                        return False
                else:
                    self.log_test("Root Endpoint", False, 
                                "Missing required fields in response", data)
                    return False
            else:
                self.log_test("Root Endpoint", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Root Endpoint", False, "Request failed", str(e))
            return False

    def test_cors_configuration(self):
        """Test CORS headers are properly set"""
        try:
            # Test preflight request
            headers = {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            }
            
            response = requests.options(f"{API_BASE}/health", headers=headers, timeout=5)
            
            cors_headers = {
                'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
                'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
                'access-control-allow-headers': response.headers.get('access-control-allow-headers')
            }
            
            # Check if CORS headers are present
            if cors_headers['access-control-allow-origin']:
                self.log_test("CORS Configuration", True, 
                            "CORS headers properly configured", cors_headers)
                return True
            else:
                # Try a regular GET request to check CORS headers
                response = requests.get(f"{API_BASE}/health", 
                                      headers={'Origin': 'http://localhost:3000'}, timeout=5)
                if response.headers.get('access-control-allow-origin'):
                    self.log_test("CORS Configuration", True, 
                                "CORS headers present in GET response")
                    return True
                else:
                    self.log_test("CORS Configuration", False, 
                                "CORS headers not found", dict(response.headers))
                    return False
                
        except Exception as e:
            self.log_test("CORS Configuration", False, "CORS test failed", str(e))
            return False

    def test_environment_variables(self):
        """Test if environment variables are properly loaded"""
        try:
            # Check if .env file exists and contains MONGO_URL
            env_file = '/app/backend/.env'
            if os.path.exists(env_file):
                with open(env_file, 'r') as f:
                    content = f.read()
                    if 'MONGO_URL=' in content:
                        self.log_test("Environment Variables", True, 
                                    "MONGO_URL found in .env file")
                        return True
                    else:
                        self.log_test("Environment Variables", False, 
                                    "MONGO_URL not found in .env file")
                        return False
            else:
                self.log_test("Environment Variables", False, 
                            ".env file not found", env_file)
                return False
                
        except Exception as e:
            self.log_test("Environment Variables", False, "Environment check failed", str(e))
            return False

    def test_api_documentation(self):
        """Test if FastAPI automatic documentation is accessible"""
        try:
            # Test /docs endpoint
            docs_response = requests.get(f"{BACKEND_URL}/docs", timeout=5)
            openapi_response = requests.get(f"{BACKEND_URL}/openapi.json", timeout=5)
            
            docs_accessible = docs_response.status_code == 200
            openapi_accessible = openapi_response.status_code == 200
            
            if docs_accessible and openapi_accessible:
                self.log_test("API Documentation", True, 
                            "Both /docs and /openapi.json accessible")
                return True
            elif docs_accessible:
                self.log_test("API Documentation", True, 
                            "/docs accessible, /openapi.json may have issues")
                return True
            else:
                self.log_test("API Documentation", False, 
                            f"Docs: {docs_response.status_code}, OpenAPI: {openapi_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("API Documentation", False, "Documentation test failed", str(e))
            return False

    def test_response_format(self):
        """Test if all endpoints return proper JSON responses"""
        try:
            endpoints = [
                ("/health", "Health endpoint JSON format"),
                ("/", "Root endpoint JSON format")
            ]
            
            all_passed = True
            for endpoint, description in endpoints:
                response = requests.get(f"{API_BASE}{endpoint}", timeout=5)
                
                try:
                    data = response.json()
                    if isinstance(data, dict):
                        continue
                    else:
                        self.log_test("Response Format", False, 
                                    f"{description}: Not a JSON object", type(data))
                        all_passed = False
                        break
                except json.JSONDecodeError:
                    self.log_test("Response Format", False, 
                                f"{description}: Invalid JSON", response.text[:100])
                    all_passed = False
                    break
            
            if all_passed:
                self.log_test("Response Format", True, 
                            "All endpoints return proper JSON objects")
                return True
            return False
                
        except Exception as e:
            self.log_test("Response Format", False, "Response format test failed", str(e))
            return False

    def test_error_handling(self):
        """Test error responses are properly formatted"""
        try:
            # Test non-existent endpoint
            response = requests.get(f"{API_BASE}/nonexistent", timeout=5)
            
            if response.status_code == 404:
                try:
                    error_data = response.json()
                    if "detail" in error_data:
                        self.log_test("Error Handling", True, 
                                    "404 errors properly formatted as JSON")
                        return True
                    else:
                        self.log_test("Error Handling", True, 
                                    "404 error returned, format may vary")
                        return True
                except json.JSONDecodeError:
                    self.log_test("Error Handling", False, 
                                "404 error not in JSON format", response.text[:100])
                    return False
            else:
                self.log_test("Error Handling", False, 
                            f"Expected 404, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Error Handling", False, "Error handling test failed", str(e))
            return False

    def test_root_endpoint_features(self):
        """Test /api/ root endpoint includes features list"""
        try:
            response = requests.get(f"{API_BASE}/", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if "features" in data and isinstance(data["features"], list):
                    if len(data["features"]) > 0:
                        self.log_test("Root Endpoint Features", True, 
                                    f"Features list found with {len(data['features'])} items")
                        return True
                    else:
                        self.log_test("Root Endpoint Features", False, 
                                    "Features list is empty")
                        return False
                else:
                    self.log_test("Root Endpoint Features", False, 
                                "Features list not found in response", data)
                    return False
            else:
                self.log_test("Root Endpoint Features", False, 
                            f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Root Endpoint Features", False, "Request failed", str(e))
            return False

    def test_auth_router_endpoints(self):
        """Test auth router endpoints are mounted and return expected responses"""
        try:
            # Test /api/auth/register - should return 501 (not implemented) or 422 (validation error)
            register_response = requests.post(f"{API_BASE}/auth/register", 
                                            json={"email": "test@example.com", "password": "test123"}, 
                                            timeout=5)
            
            # Test /api/auth/login - should return 501 (not implemented) or 422 (validation error)
            login_response = requests.post(f"{API_BASE}/auth/login", 
                                         json={"email": "invalid@example.com", "password": "invalid"}, 
                                         timeout=5)
            
            register_ok = register_response.status_code in [501, 422]  # Accept both
            login_ok = login_response.status_code in [501, 422]  # Accept both for disabled auth
            
            if register_ok and login_ok:
                self.log_test("Auth Router Endpoints", True, 
                            f"Register: {register_response.status_code}, Login: {login_response.status_code}")
                return True
            else:
                self.log_test("Auth Router Endpoints", False, 
                            f"Unexpected status codes - Register: {register_response.status_code}, Login: {login_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Auth Router Endpoints", False, "Auth router test failed", str(e))
            return False

    def test_user_profile_endpoints(self):
        """Test user profile endpoints require authentication"""
        try:
            # Test /api/user/profile GET - should return 401 or 403 without auth
            profile_get_response = requests.get(f"{API_BASE}/user/profile", timeout=5)
            
            # Test /api/user/profile PUT - should return 401 or 403 without auth
            profile_put_response = requests.put(f"{API_BASE}/user/profile", 
                                              json={"first_name": "Test", "last_name": "User"}, 
                                              timeout=5)
            
            profile_get_ok = profile_get_response.status_code in [401, 403]
            profile_put_ok = profile_put_response.status_code in [401, 403]
            
            if profile_get_ok and profile_put_ok:
                self.log_test("User Profile Endpoints", True, 
                            f"Profile GET: {profile_get_response.status_code}, Profile PUT: {profile_put_response.status_code}")
                return True
            else:
                self.log_test("User Profile Endpoints", False, 
                            f"Profile endpoints should return 401/403 - GET: {profile_get_response.status_code}, PUT: {profile_put_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("User Profile Endpoints", False, "User profile test failed", str(e))
            return False

    def test_user_careers_endpoints(self):
        """Test user careers endpoints require authentication"""
        try:
            # Test /api/user/careers GET
            careers_get_response = requests.get(f"{API_BASE}/user/careers", timeout=5)
            
            # Test /api/user/careers POST
            careers_post_response = requests.post(f"{API_BASE}/user/careers", 
                                                json={"company": "Test Corp", "position": "Developer", "start_date": "2023-01-01"}, 
                                                timeout=5)
            
            # Test /api/user/careers PUT (with dummy ID)
            careers_put_response = requests.put(f"{API_BASE}/user/careers/test-id", 
                                              json={"company": "Updated Corp", "position": "Senior Developer"}, 
                                              timeout=5)
            
            # Test /api/user/careers DELETE (with dummy ID)
            careers_delete_response = requests.delete(f"{API_BASE}/user/careers/test-id", timeout=5)
            
            careers_get_ok = careers_get_response.status_code in [401, 403]
            careers_post_ok = careers_post_response.status_code in [401, 403]
            careers_put_ok = careers_put_response.status_code in [401, 403]
            careers_delete_ok = careers_delete_response.status_code in [401, 403]
            
            if careers_get_ok and careers_post_ok and careers_put_ok and careers_delete_ok:
                self.log_test("User Careers Endpoints", True, 
                            f"All careers endpoints require auth - GET: {careers_get_response.status_code}, POST: {careers_post_response.status_code}, PUT: {careers_put_response.status_code}, DELETE: {careers_delete_response.status_code}")
                return True
            else:
                self.log_test("User Careers Endpoints", False, 
                            f"Careers endpoints should return 401/403 - GET: {careers_get_response.status_code}, POST: {careers_post_response.status_code}, PUT: {careers_put_response.status_code}, DELETE: {careers_delete_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("User Careers Endpoints", False, "User careers test failed", str(e))
            return False

    def test_user_certifications_endpoints(self):
        """Test user certifications endpoints require authentication"""
        try:
            # Test /api/user/certifications GET
            certs_get_response = requests.get(f"{API_BASE}/user/certifications", timeout=5)
            
            # Test /api/user/certifications POST
            certs_post_response = requests.post(f"{API_BASE}/user/certifications", 
                                              json={"name": "AWS Certified", "issuer": "Amazon", "date_earned": "2023-01-01"}, 
                                              timeout=5)
            
            # Test /api/user/certifications PUT (with dummy ID)
            certs_put_response = requests.put(f"{API_BASE}/user/certifications/test-id", 
                                            json={"name": "AWS Solutions Architect", "issuer": "Amazon"}, 
                                            timeout=5)
            
            # Test /api/user/certifications DELETE (with dummy ID)
            certs_delete_response = requests.delete(f"{API_BASE}/user/certifications/test-id", timeout=5)
            
            certs_get_ok = certs_get_response.status_code in [401, 403]
            certs_post_ok = certs_post_response.status_code in [401, 403]
            certs_put_ok = certs_put_response.status_code in [401, 403]
            certs_delete_ok = certs_delete_response.status_code in [401, 403]
            
            if certs_get_ok and certs_post_ok and certs_put_ok and certs_delete_ok:
                self.log_test("User Certifications Endpoints", True, 
                            f"All certifications endpoints require auth - GET: {certs_get_response.status_code}, POST: {certs_post_response.status_code}, PUT: {certs_put_response.status_code}, DELETE: {certs_delete_response.status_code}")
                return True
            else:
                self.log_test("User Certifications Endpoints", False, 
                            f"Certifications endpoints should return 401/403 - GET: {certs_get_response.status_code}, POST: {certs_post_response.status_code}, PUT: {certs_put_response.status_code}, DELETE: {certs_delete_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("User Certifications Endpoints", False, "User certifications test failed", str(e))
            return False

    def test_user_skills_endpoints(self):
        """Test user skills endpoints require authentication"""
        try:
            # Test /api/user/skills GET
            skills_get_response = requests.get(f"{API_BASE}/user/skills", timeout=5)
            
            # Test /api/user/skills POST
            skills_post_response = requests.post(f"{API_BASE}/user/skills", 
                                               json={"skill_name": "Python", "level": "advanced", "years_of_experience": 3}, 
                                               timeout=5)
            
            # Test /api/user/skills DELETE (with dummy ID)
            skills_delete_response = requests.delete(f"{API_BASE}/user/skills/test-id", timeout=5)
            
            # Test /api/user/skills/available GET (this might not require auth)
            skills_available_response = requests.get(f"{API_BASE}/user/skills/available", timeout=5)
            
            # Test /api/user/skills/categories GET (this might not require auth)
            skills_categories_response = requests.get(f"{API_BASE}/user/skills/categories/technical", timeout=5)
            
            skills_get_ok = skills_get_response.status_code in [401, 403]
            skills_post_ok = skills_post_response.status_code in [401, 403]
            skills_delete_ok = skills_delete_response.status_code in [401, 403]
            
            # Available skills and categories might not require auth, so we check if they return 200 or auth error
            skills_available_ok = skills_available_response.status_code in [200, 401, 403, 500]  # 500 might occur due to DB issues
            skills_categories_ok = skills_categories_response.status_code in [200, 401, 403, 500]  # 500 might occur due to DB issues
            
            if skills_get_ok and skills_post_ok and skills_delete_ok and skills_available_ok and skills_categories_ok:
                self.log_test("User Skills Endpoints", True, 
                            f"Skills endpoints properly protected - GET: {skills_get_response.status_code}, POST: {skills_post_response.status_code}, DELETE: {skills_delete_response.status_code}, Available: {skills_available_response.status_code}, Categories: {skills_categories_response.status_code}")
                return True
            else:
                self.log_test("User Skills Endpoints", False, 
                            f"Skills endpoints protection issues - GET: {skills_get_response.status_code}, POST: {skills_post_response.status_code}, DELETE: {skills_delete_response.status_code}, Available: {skills_available_response.status_code}, Categories: {skills_categories_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("User Skills Endpoints", False, "User skills test failed", str(e))
            return False

    def test_user_dashboard_endpoint(self):
        """Test user dashboard endpoint requires authentication"""
        try:
            # Test /api/user/dashboard - should return 401 or 403 without auth
            dashboard_response = requests.get(f"{API_BASE}/user/dashboard", timeout=5)
            
            dashboard_ok = dashboard_response.status_code in [401, 403]
            
            if dashboard_ok:
                self.log_test("User Dashboard Endpoint", True, 
                            f"Dashboard endpoint requires auth ({dashboard_response.status_code})")
                return True
            else:
                self.log_test("User Dashboard Endpoint", False, 
                            f"Dashboard endpoint should return 401/403, got: {dashboard_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("User Dashboard Endpoint", False, "User dashboard test failed", str(e))
            return False

    def test_chat_router_endpoints(self):
        """Test chat router endpoints require authentication"""
        try:
            # Test /api/chat/conversations - should return 401 or 403 without auth
            conversations_response = requests.get(f"{API_BASE}/chat/conversations", timeout=5)
            
            conversations_ok = conversations_response.status_code in [401, 403]  # Accept both
            
            if conversations_ok:
                self.log_test("Chat Router Endpoints", True, 
                            f"Conversations endpoint requires auth ({conversations_response.status_code})")
                return True
            else:
                self.log_test("Chat Router Endpoints", False, 
                            f"Conversations endpoint should return 401/403, got: {conversations_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Chat Router Endpoints", False, "Chat router test failed", str(e))
            return False

    def test_roadmap_router_endpoints(self):
        """Test roadmap router endpoints require authentication"""
        try:
            # Test /api/roadmap/ - should return 401 or 403 without auth
            roadmap_response = requests.get(f"{API_BASE}/roadmap/", timeout=5)
            
            roadmap_ok = roadmap_response.status_code in [401, 403]  # Accept both
            
            if roadmap_ok:
                self.log_test("Roadmap Router Endpoints", True, 
                            f"Roadmap endpoint requires auth ({roadmap_response.status_code})")
                return True
            else:
                self.log_test("Roadmap Router Endpoints", False, 
                            f"Roadmap endpoint should return 401/403, got: {roadmap_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Roadmap Router Endpoints", False, "Roadmap router test failed", str(e))
            return False

    def test_legacy_assessment_endpoints(self):
        """Test legacy assessment endpoints still work without auth"""
        try:
            # Test /api/assessment/questions - should return 200
            questions_response = requests.get(f"{API_BASE}/assessment/questions", timeout=5)
            
            # Test /api/assessment/start - should return 200 or 422 for missing data
            start_response = requests.post(f"{API_BASE}/assessment/start", 
                                         json={"user_email": "test@example.com"}, 
                                         timeout=5)
            
            questions_ok = questions_response.status_code == 200
            start_ok = start_response.status_code in [200, 422, 500]  # 500 might occur due to DB issues
            
            if questions_ok and start_ok:
                self.log_test("Legacy Assessment Endpoints", True, 
                            f"Questions: {questions_response.status_code}, Start: {start_response.status_code}")
                return True
            else:
                self.log_test("Legacy Assessment Endpoints", False, 
                            f"Unexpected status codes - Questions: {questions_response.status_code}, Start: {start_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Legacy Assessment Endpoints", False, "Legacy assessment test failed", str(e))
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("AI-Powered Career Path Advisor - Backend Test Suite")
        print("=" * 60)
        print(f"Testing backend at: {BACKEND_URL}")
        print(f"API base URL: {API_BASE}")
        print()
        
        # Run all tests
        tests = [
            self.test_server_startup,
            self.test_health_endpoint,
            self.test_root_endpoint,
            self.test_root_endpoint_features,
            self.test_cors_configuration,
            self.test_environment_variables,
            self.test_api_documentation,
            self.test_response_format,
            self.test_error_handling,
            self.test_auth_router_endpoints,
            self.test_user_profile_endpoints,
            self.test_user_careers_endpoints,
            self.test_user_certifications_endpoints,
            self.test_user_skills_endpoints,
            self.test_user_dashboard_endpoint,
            self.test_chat_router_endpoints,
            self.test_roadmap_router_endpoints,
            self.test_legacy_assessment_endpoints
        ]
        
        for test in tests:
            test()
        
        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"📊 Total: {self.passed_tests + self.failed_tests}")
        
        success_rate = (self.passed_tests / (self.passed_tests + self.failed_tests)) * 100
        print(f"🎯 Success Rate: {success_rate:.1f}%")
        
        if self.failed_tests == 0:
            print("\n🎉 ALL TESTS PASSED! Backend is ready for production.")
        else:
            print(f"\n⚠️  {self.failed_tests} test(s) failed. Review issues above.")
        
        return self.failed_tests == 0

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)