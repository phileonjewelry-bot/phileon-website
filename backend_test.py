import requests
import sys
import json
from datetime import datetime

class PhileonAPITester:
    def __init__(self, base_url="https://code-continue-17.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_public_endpoints(self):
        """Test all public API endpoints"""
        print("\n" + "="*50)
        print("TESTING PUBLIC ENDPOINTS")
        print("="*50)
        
        # Test root endpoint
        self.run_test("API Root", "GET", "api/", 200)
        
        # Test health check
        self.run_test("Health Check", "GET", "api/health", 200)
        
        # Test collections
        success, collections = self.run_test("Get Collections", "GET", "api/collections", 200)
        
        # Test products
        self.run_test("Get Products", "GET", "api/products", 200)
        self.run_test("Get Featured Products", "GET", "api/products?featured=true", 200)
        
        # Test testimonials
        self.run_test("Get Testimonials", "GET", "api/testimonials", 200)
        self.run_test("Get Featured Testimonials", "GET", "api/testimonials?featured=true", 200)
        
        # Test FAQ
        self.run_test("Get FAQ", "GET", "api/faq", 200)
        
        # Test site settings
        self.run_test("Get Site Settings", "GET", "api/settings", 200)
        
        return collections

    def test_inquiry_creation(self):
        """Test inquiry creation"""
        print("\n" + "="*50)
        print("TESTING INQUIRY CREATION")
        print("="*50)
        
        inquiry_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+1234567890",
            "inquiry_type": "general",
            "message": "This is a test inquiry for API testing"
        }
        
        success, response = self.run_test(
            "Create Inquiry", 
            "POST", 
            "api/inquiries", 
            200, 
            data=inquiry_data
        )
        
        if success and 'id' in response:
            print(f"   Created inquiry with ID: {response['id']}")
            return response['id']
        return None

    def test_consultation_creation(self):
        """Test consultation creation"""
        print("\n" + "="*50)
        print("TESTING CONSULTATION CREATION")
        print("="*50)
        
        consultation_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+1234567890",
            "preferred_date": "2024-12-25",
            "preferred_time": "Morning (9AM - 12PM)",
            "consultation_type": "virtual",
            "interest": "rings",
            "message": "This is a test consultation request"
        }
        
        success, response = self.run_test(
            "Create Consultation", 
            "POST", 
            "api/consultations", 
            200, 
            data=consultation_data
        )
        
        if success and 'id' in response:
            print(f"   Created consultation with ID: {response['id']}")
            return response['id']
        return None

    def test_admin_login(self):
        """Test admin login"""
        print("\n" + "="*50)
        print("TESTING ADMIN LOGIN")
        print("="*50)
        
        login_data = {
            "username": "admin",
            "password": "phileon2024"
        }
        
        success, response = self.run_test(
            "Admin Login", 
            "POST", 
            "api/admin/login", 
            200, 
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Login successful, token obtained")
            return True
        return False

    def test_admin_endpoints(self):
        """Test admin endpoints (requires authentication)"""
        print("\n" + "="*50)
        print("TESTING ADMIN ENDPOINTS")
        print("="*50)
        
        if not self.token:
            print("❌ No admin token available, skipping admin tests")
            return
        
        # Test admin stats
        self.run_test("Admin Stats", "GET", "api/admin/stats", 200)
        
        # Test admin collections
        self.run_test("Admin Get Collections", "GET", "api/admin/collections", 200)
        
        # Test admin products
        self.run_test("Admin Get Products", "GET", "api/admin/products", 200)
        
        # Test admin inquiries
        self.run_test("Admin Get Inquiries", "GET", "api/admin/inquiries", 200)
        
        # Test admin consultations
        self.run_test("Admin Get Consultations", "GET", "api/admin/consultations", 200)
        
        # Test admin testimonials
        self.run_test("Admin Get Testimonials", "GET", "api/admin/testimonials", 200)
        
        # Test admin FAQ
        self.run_test("Admin Get FAQ", "GET", "api/admin/faq", 200)
        
        # Test admin settings
        self.run_test("Admin Get Settings", "GET", "api/admin/settings", 200)

    def test_collection_detail(self, collections):
        """Test collection detail endpoints if collections exist"""
        if collections and len(collections) > 0:
            collection_slug = collections[0].get('slug')
            if collection_slug:
                print(f"\n🔍 Testing collection detail for slug: {collection_slug}")
                self.run_test(
                    f"Get Collection Detail ({collection_slug})", 
                    "GET", 
                    f"api/collections/{collection_slug}", 
                    200
                )

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                print(f"  • {test['name']}")
                if 'error' in test:
                    print(f"    Error: {test['error']}")
                else:
                    print(f"    Expected: {test['expected']}, Got: {test['actual']}")
        
        return len(self.failed_tests) == 0

def main():
    print("🚀 Starting Phileon Jewelry API Tests")
    print(f"Testing against: https://code-continue-17.preview.emergentagent.com")
    
    tester = PhileonAPITester()
    
    # Test public endpoints
    collections = tester.test_public_endpoints()
    
    # Test collection detail if available
    if collections:
        tester.test_collection_detail(collections)
    
    # Test form submissions
    tester.test_inquiry_creation()
    tester.test_consultation_creation()
    
    # Test admin functionality
    if tester.test_admin_login():
        tester.test_admin_endpoints()
    
    # Print summary
    success = tester.print_summary()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())