"""
Phileon Jewelry API Tests
Tests for: metal prices, collections, products, admin login, and public endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndRoot:
    """Health check and root endpoint tests"""
    
    def test_health_check(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_root_endpoint(self):
        """Test /api/ returns API info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Phileon" in data["message"]


class TestMetalPrices:
    """Metal prices ticker endpoint tests"""
    
    def test_metal_prices_returns_all_metals(self):
        """Test /api/metal-prices returns GOLD, SILVER, PLATINUM, PALLADIUM"""
        response = requests.get(f"{BASE_URL}/api/metal-prices")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "prices" in data
        assert "timestamp" in data
        assert "source" in data
        
        # Verify all 4 metals are present
        prices = data["prices"]
        assert len(prices) == 4
        
        symbols = [p["symbol"] for p in prices]
        assert "GOLD" in symbols
        assert "SILVER" in symbols
        assert "PLATINUM" in symbols
        assert "PALLADIUM" in symbols
        
        # Verify each metal has required fields
        for metal in prices:
            assert "symbol" in metal
            assert "price" in metal
            assert "change" in metal
            assert "currency" in metal
            assert metal["currency"] == "USD"
            assert isinstance(metal["price"], (int, float))
            assert isinstance(metal["change"], (int, float))
    
    def test_metal_prices_realistic_values(self):
        """Test metal prices are within realistic ranges"""
        response = requests.get(f"{BASE_URL}/api/metal-prices")
        data = response.json()
        
        for metal in data["prices"]:
            if metal["symbol"] == "GOLD":
                assert 2000 < metal["price"] < 3500  # Gold typically $2000-3500/oz
            elif metal["symbol"] == "SILVER":
                assert 20 < metal["price"] < 50  # Silver typically $20-50/oz
            elif metal["symbol"] == "PLATINUM":
                assert 800 < metal["price"] < 1500  # Platinum typically $800-1500/oz
            elif metal["symbol"] == "PALLADIUM":
                assert 800 < metal["price"] < 1500  # Palladium typically $800-1500/oz


class TestPublicEndpoints:
    """Public API endpoint tests"""
    
    def test_get_collections(self):
        """Test /api/collections returns list"""
        response = requests.get(f"{BASE_URL}/api/collections")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_products(self):
        """Test /api/products returns list"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_products_featured(self):
        """Test /api/products?featured=true returns list"""
        response = requests.get(f"{BASE_URL}/api/products?featured=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_testimonials(self):
        """Test /api/testimonials returns list"""
        response = requests.get(f"{BASE_URL}/api/testimonials")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_faq(self):
        """Test /api/faq returns list"""
        response = requests.get(f"{BASE_URL}/api/faq")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_settings(self):
        """Test /api/settings returns settings object"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)


class TestAdminLogin:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with default credentials"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "admin", "password": "phileon2024"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert len(data["access_token"]) > 0
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with wrong credentials"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "admin", "password": "wrongpassword"}
        )
        assert response.status_code == 401
    
    def test_admin_protected_endpoint_without_token(self):
        """Test admin endpoint without token returns 403"""
        response = requests.get(f"{BASE_URL}/api/admin/collections")
        assert response.status_code == 403
    
    def test_admin_protected_endpoint_with_token(self):
        """Test admin endpoint with valid token"""
        # First login
        login_response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "admin", "password": "phileon2024"}
        )
        token = login_response.json()["access_token"]
        
        # Access protected endpoint
        response = requests.get(
            f"{BASE_URL}/api/admin/collections",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200


class TestInquiryCreation:
    """Inquiry form submission tests"""
    
    def test_create_inquiry(self):
        """Test creating a new inquiry"""
        inquiry_data = {
            "name": "TEST_John Doe",
            "email": "test@example.com",
            "phone": "+1234567890",
            "inquiry_type": "custom_design",
            "message": "I'm interested in a custom engagement ring."
        }
        response = requests.post(f"{BASE_URL}/api/inquiries", json=inquiry_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == inquiry_data["name"]
        assert data["email"] == inquiry_data["email"]
        assert "id" in data


class TestConsultationCreation:
    """Consultation booking tests"""
    
    def test_create_consultation(self):
        """Test creating a new consultation"""
        consultation_data = {
            "name": "TEST_Jane Smith",
            "email": "jane@example.com",
            "phone": "+1987654321",
            "preferred_date": "2026-02-15",
            "preferred_time": "morning",
            "consultation_type": "in_person",
            "interest": "engagement_ring",
            "message": "Looking for a custom engagement ring."
        }
        response = requests.post(f"{BASE_URL}/api/consultations", json=consultation_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == consultation_data["name"]
        assert data["email"] == consultation_data["email"]
        assert "id" in data


class TestAdminStats:
    """Admin statistics endpoint tests"""
    
    def test_admin_stats(self):
        """Test admin stats endpoint returns counts"""
        # Login first
        login_response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "admin", "password": "phileon2024"}
        )
        token = login_response.json()["access_token"]
        
        # Get stats
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "collections" in data
        assert "products" in data
        assert "new_inquiries" in data
        assert "pending_consultations" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
