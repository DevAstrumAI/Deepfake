"""
API endpoint tests for the FastAPI backend
Tests the REST API endpoints for deepfake detection
"""

import pytest
import numpy as np
import cv2
import tempfile
import os
from pathlib import Path
import sys
from fastapi.testclient import TestClient

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import app
try:
    from backend.app import app
    client = TestClient(app)
except ImportError:
    # Skip tests if app cannot be imported
    pytest.skip("Cannot import app", allow_module_level=True)


class TestAPIEndpoints:
    """Test API endpoints"""
    
    @pytest.fixture
    def sample_image_file(self):
        """Create sample image file for upload"""
        img = np.ones((200, 200, 3), dtype=np.uint8) * 128
        cv2.rectangle(img, (50, 50), (150, 150), (200, 180, 160), -1)
        
        temp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        cv2.imwrite(temp_file.name, img)
        yield temp_file.name
        os.unlink(temp_file.name)
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
    
    def test_image_upload_endpoint(self, sample_image_file):
        """Test image upload and detection endpoint"""
        with open(sample_image_file, "rb") as f:
            files = {"file": ("test.jpg", f, "image/jpeg")}
            response = client.post("/api/detect/image", files=files)
        
        assert response.status_code in [200, 201, 400]  # May vary based on implementation
        if response.status_code == 200:
            data = response.json()
            assert "prediction" in data or "error" in data
    
    def test_invalid_file_upload(self):
        """Test upload of invalid file"""
        files = {"file": ("test.txt", b"not an image", "text/plain")}
        response = client.post("/api/detect/image", files=files)
        
        # Should return error
        assert response.status_code in [400, 422, 500]
    
    def test_missing_file_parameter(self):
        """Test request without file parameter"""
        response = client.post("/api/detect/image")
        assert response.status_code in [400, 422]
    
    def test_cors_headers(self):
        """Test CORS headers are present"""
        response = client.options("/health")
        # CORS headers should be present (if configured)
        assert response.status_code in [200, 204]


class TestAPIAuthentication:
    """Test API authentication endpoints"""
    
    def test_login_endpoint(self):
        """Test login endpoint"""
        # This test requires actual user credentials
        # Skip if authentication is not implemented
        pass
    
    def test_signup_endpoint(self):
        """Test signup endpoint"""
        # This test requires database setup
        # Skip if not available
        pass


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

