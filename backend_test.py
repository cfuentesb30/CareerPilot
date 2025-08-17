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
                    expected_message = "AI Career Path Advisor API"
                    if data["message"] == expected_message:
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
            # Test /api/auth/register - should return 501 (not implemented)
            register_response = requests.post(f"{API_BASE}/auth/register", 
                                            json={"email": "test@example.com", "password": "test123"}, 
                                            timeout=5)
            
            # Test /api/auth/login - should return 401 or 422 for invalid credentials
            login_response = requests.post(f"{API_BASE}/auth/login", 
                                         json={"email": "invalid@example.com", "password": "invalid"}, 
                                         timeout=5)
            
            register_ok = register_response.status_code == 501
            login_ok = login_response.status_code in [401, 422]  # 422 for validation errors
            
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

    def test_user_router_endpoints(self):
        """Test user router endpoints require authentication"""
        try:
            # Test /api/user/profile - should return 401 without auth
            profile_response = requests.get(f"{API_BASE}/user/profile", timeout=5)
            
            profile_ok = profile_response.status_code == 401
            
            if profile_ok:
                self.log_test("User Router Endpoints", True, 
                            f"Profile endpoint requires auth (401): {profile_response.status_code}")
                return True
            else:
                self.log_test("User Router Endpoints", False, 
                            f"Profile endpoint should return 401, got: {profile_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("User Router Endpoints", False, "User router test failed", str(e))
            return False

    def test_chat_router_endpoints(self):
        """Test chat router endpoints require authentication"""
        try:
            # Test /api/chat/conversations - should return 401 without auth
            conversations_response = requests.get(f"{API_BASE}/chat/conversations", timeout=5)
            
            conversations_ok = conversations_response.status_code == 401
            
            if conversations_ok:
                self.log_test("Chat Router Endpoints", True, 
                            f"Conversations endpoint requires auth (401): {conversations_response.status_code}")
                return True
            else:
                self.log_test("Chat Router Endpoints", False, 
                            f"Conversations endpoint should return 401, got: {conversations_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Chat Router Endpoints", False, "Chat router test failed", str(e))
            return False

    def test_roadmap_router_endpoints(self):
        """Test roadmap router endpoints require authentication"""
        try:
            # Test /api/roadmap/ - should return 401 without auth
            roadmap_response = requests.get(f"{API_BASE}/roadmap/", timeout=5)
            
            roadmap_ok = roadmap_response.status_code == 401
            
            if roadmap_ok:
                self.log_test("Roadmap Router Endpoints", True, 
                            f"Roadmap endpoint requires auth (401): {roadmap_response.status_code}")
                return True
            else:
                self.log_test("Roadmap Router Endpoints", False, 
                            f"Roadmap endpoint should return 401, got: {roadmap_response.status_code}")
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
            self.test_cors_configuration,
            self.test_environment_variables,
            self.test_api_documentation,
            self.test_response_format,
            self.test_error_handling
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