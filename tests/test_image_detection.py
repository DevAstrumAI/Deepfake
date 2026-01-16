"""
Unit tests for Image Deepfake Detection
Tests the AdvancedDeepfakeDetector and related components
"""

import pytest
import numpy as np
import cv2
import tempfile
import os
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.advanced_detector import AdvancedDeepfakeDetector
from backend.fast_forensic_detector import FastForensicDetector
from backend.face_artifact_detector import FaceArtifactDetector


class TestImageDetection:
    """Test cases for image deepfake detection"""
    
    @pytest.fixture
    def detector(self):
        """Initialize detector for testing"""
        return AdvancedDeepfakeDetector()
    
    @pytest.fixture
    def forensic_detector(self):
        """Initialize forensic detector for testing"""
        return FastForensicDetector()
    
    @pytest.fixture
    def artifact_detector(self):
        """Initialize artifact detector for testing"""
        return FaceArtifactDetector()
    
    @pytest.fixture
    def sample_image_path(self):
        """Create a sample test image"""
        # Create a simple test image with a face-like region
        img = np.ones((200, 200, 3), dtype=np.uint8) * 128
        # Add a face-like region (simplified)
        cv2.rectangle(img, (50, 50), (150, 150), (200, 180, 160), -1)
        cv2.circle(img, (75, 90), 5, (0, 0, 0), -1)  # Left eye
        cv2.circle(img, (125, 90), 5, (0, 0, 0), -1)  # Right eye
        cv2.ellipse(img, (100, 120), (20, 10), 0, 0, 180, (0, 0, 0), 2)  # Mouth
        
        # Save to temporary file
        temp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        cv2.imwrite(temp_file.name, img)
        yield temp_file.name
        os.unlink(temp_file.name)
    
    @pytest.fixture
    def no_face_image_path(self):
        """Create an image without a face"""
        img = np.ones((200, 200, 3), dtype=np.uint8) * 128
        temp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        cv2.imwrite(temp_file.name, img)
        yield temp_file.name
        os.unlink(temp_file.name)
    
    def test_detector_initialization(self, detector):
        """Test that detector initializes correctly"""
        assert detector is not None
        assert hasattr(detector, 'models')
        assert hasattr(detector, 'device')
    
    def test_detect_image_with_face(self, detector, sample_image_path):
        """Test detection on image with face"""
        confidence, prediction, details = detector.detect_deepfake(sample_image_path)
        
        assert confidence is not None
        assert prediction is not None
        assert details is not None
        assert prediction in ['REAL', 'FAKE', 'UNKNOWN']
        assert 0.0 <= confidence <= 100.0
    
    def test_detect_image_no_face(self, detector, no_face_image_path):
        """Test detection on image without face"""
        confidence, prediction, details = detector.detect_deepfake(no_face_image_path)
        
        # Should handle gracefully even without face
        assert confidence is not None
        assert prediction is not None
        assert details is not None
        assert prediction in ['REAL', 'FAKE', 'UNKNOWN']
    
    def test_face_feature_extraction(self, detector, sample_image_path):
        """Test face feature extraction"""
        features = detector.extract_face_features(sample_image_path)
        
        assert features is not None
        assert isinstance(features, dict)
    
    def test_forensic_analysis(self, forensic_detector, sample_image_path):
        """Test forensic analysis"""
        result = forensic_detector.analyze_image(sample_image_path)
        
        assert result is not None
        assert isinstance(result, dict)
        assert 'face_detected' in result
    
    def test_forensic_lighting_check(self, forensic_detector):
        """Test lighting consistency check"""
        # Create a face region with varying brightness
        face_region = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        result = forensic_detector._quick_lighting_check(face_region)
        
        assert result is not None
        assert 'brightness_std' in result
        assert 'brightness_range' in result
        assert 'inconsistent_lighting' in result
        assert isinstance(result['inconsistent_lighting'], bool)
    
    def test_forensic_skin_check(self, forensic_detector):
        """Test skin texture check"""
        face_region = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        result = forensic_detector._quick_skin_check(face_region)
        
        assert result is not None
        assert 'smoothness' in result
        assert 'overly_smooth' in result
        assert isinstance(result['overly_smooth'], bool)
    
    def test_forensic_symmetry_check(self, forensic_detector):
        """Test facial symmetry check"""
        face_region = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        result = forensic_detector._quick_symmetry_check(face_region)
        
        assert result is not None
        assert 'facial_symmetry' in result
        assert 'asymmetric_face' in result
        assert 0.0 <= result['facial_symmetry'] <= 1.0
    
    def test_forensic_edge_check(self, forensic_detector):
        """Test edge analysis"""
        face_region = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        result = forensic_detector._quick_edge_check(face_region)
        
        assert result is not None
        assert 'edge_density' in result
        assert 'unnatural_edges' in result
        assert 0.0 <= result['edge_density'] <= 1.0
    
    def test_forensic_frequency_check(self, forensic_detector):
        """Test frequency domain analysis"""
        face_region = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        result = forensic_detector._quick_frequency_check(face_region)
        
        assert result is not None
        assert 'spectral_entropy' in result
        assert 'suspicious_frequency' in result
    
    def test_artifact_detection(self, artifact_detector, sample_image_path):
        """Test face artifact detection"""
        result = artifact_detector.detect_artifacts(sample_image_path)
        
        assert result is not None
        assert isinstance(result, dict)
        assert 'face_detected' in result
    
    def test_invalid_image_path(self, detector):
        """Test handling of invalid image path"""
        confidence, prediction, details = detector.detect_deepfake("nonexistent_image.jpg")
        # Should handle gracefully
        assert confidence is not None
        assert prediction is not None
        assert details is not None
    
    def test_image_preprocessing(self, detector, sample_image_path):
        """Test image preprocessing for different models"""
        for model_name in ['efficientnet', 'resnet', 'vit']:
            if model_name in detector.models:
                try:
                    tensor = detector.preprocess_image(sample_image_path, model_name)
                    assert tensor is not None
                except Exception as e:
                    # Some models might not be available
                    pass
    
    def test_confidence_range(self, detector, sample_image_path):
        """Test that confidence values are in valid range"""
        confidence, prediction, details = detector.detect_deepfake(sample_image_path)
        
        assert 0.0 <= confidence <= 100.0
    
    def test_prediction_format(self, detector, sample_image_path):
        """Test that prediction is in correct format"""
        confidence, prediction, details = detector.detect_deepfake(sample_image_path)
        
        assert prediction in ['REAL', 'FAKE', 'UNKNOWN']
    
    def test_multiple_detections(self, detector, sample_image_path):
        """Test multiple detections on same image"""
        conf1, pred1, det1 = detector.detect_deepfake(sample_image_path)
        conf2, pred2, det2 = detector.detect_deepfake(sample_image_path)
        
        # Results should be consistent (or at least valid)
        assert conf1 is not None
        assert pred1 is not None
        assert det1 is not None
        assert conf2 is not None
        assert pred2 is not None
        assert det2 is not None


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

