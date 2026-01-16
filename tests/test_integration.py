"""
Integration tests for the complete deepfake detection system
Tests the full pipeline including API endpoints
"""

import pytest
import numpy as np
import cv2
import tempfile
import os
from pathlib import Path
import sys
import json

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.advanced_detector import AdvancedDeepfakeDetector
from backend.safe_video_detector import SafeVideoDeepfakeDetector
from backend.hybrid_audio_detector import HybridAudioDeepfakeDetector


class TestIntegration:
    """Integration tests for the complete system"""
    
    @pytest.fixture
    def image_detector(self):
        """Initialize image detector"""
        return AdvancedDeepfakeDetector()
    
    @pytest.fixture
    def video_detector(self):
        """Initialize video detector"""
        return SafeVideoDeepfakeDetector()
    
    @pytest.fixture
    def audio_detector(self):
        """Initialize audio detector"""
        return HybridAudioDeepfakeDetector(device='cpu')
    
    @pytest.fixture
    def sample_image(self):
        """Create sample image"""
        img = np.ones((200, 200, 3), dtype=np.uint8) * 128
        cv2.rectangle(img, (50, 50), (150, 150), (200, 180, 160), -1)
        cv2.circle(img, (75, 90), 5, (0, 0, 0), -1)
        cv2.circle(img, (125, 90), 5, (0, 0, 0), -1)
        
        temp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        cv2.imwrite(temp_file.name, img)
        yield temp_file.name
        os.unlink(temp_file.name)
    
    @pytest.fixture
    def sample_video(self):
        """Create sample video"""
        temp_file = tempfile.NamedTemporaryFile(suffix='.mp4', delete=False)
        video_path = temp_file.name
        temp_file.close()
        
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(video_path, fourcc, 20.0, (640, 480))
        
        for i in range(20):
            frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
            out.write(frame)
        
        out.release()
        yield video_path
        if os.path.exists(video_path):
            os.unlink(video_path)
    
    @pytest.fixture
    def sample_audio(self):
        """Create sample audio"""
        sample_rate = 16000
        duration = 2.0
        waveform = np.sin(2 * np.pi * 440 * np.linspace(0, duration, int(sample_rate * duration)))
        waveform = waveform / np.max(np.abs(waveform))
        
        temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        temp_path = temp_file.name
        temp_file.close()
        
        import soundfile as sf
        sf.write(temp_path, waveform, sample_rate)
        
        yield temp_path
        if os.path.exists(temp_path):
            os.unlink(temp_path)
    
    def test_image_pipeline(self, image_detector, sample_image):
        """Test complete image detection pipeline"""
        # Step 1: Detect deepfake
        confidence, prediction, details = image_detector.detect_deepfake(sample_image)
        
        assert confidence is not None
        assert prediction is not None
        assert details is not None
        
        # Step 2: Extract features
        features = image_detector.extract_face_features(sample_image)
        assert features is not None
        
        # Step 3: Verify consistency
        assert prediction in ['REAL', 'FAKE', 'UNKNOWN']
        assert 0.0 <= confidence <= 100.0
    
    def test_video_pipeline(self, video_detector, sample_video):
        """Test complete video detection pipeline"""
        # Step 1: Detect deepfake
        result = video_detector.detect_video_deepfake(sample_video)
        
        assert result is not None
        assert 'video_info' in result
        assert 'frame_analysis' in result
        assert 'prediction' in result
        
        # Step 2: Verify video info
        video_info = result['video_info']
        assert 'frame_count' in video_info
        assert 'fps' in video_info
        
        # Step 3: Verify frame analysis
        frame_analysis = result['frame_analysis']
        assert isinstance(frame_analysis, list)
        assert len(frame_analysis) > 0
    
    def test_audio_pipeline(self, audio_detector, sample_audio):
        """Test complete audio detection pipeline"""
        # Step 1: Detect deepfake
        confidence, prediction, details = audio_detector.detect_deepfake(sample_audio)
        
        assert confidence is not None
        assert prediction is not None
        assert details is not None
        
        # Step 2: Verify details
        assert isinstance(details, dict)
        assert 'features' in details or 'indicators' in details
    
    def test_multi_modal_consistency(self, image_detector, video_detector, audio_detector):
        """Test that different detectors handle edge cases consistently"""
        # Test with invalid paths
        invalid_path = "nonexistent_file.xyz"
        
        # All should handle gracefully
        img_confidence, img_prediction, img_details = image_detector.detect_deepfake(invalid_path)
        vid_result = video_detector.detect_video_deepfake(invalid_path)
        
        assert img_confidence is not None
        assert img_prediction is not None
        assert img_details is not None
        assert vid_result is not None
    
    def test_result_format_consistency(self, image_detector, sample_image):
        """Test that results have consistent format"""
        confidence, prediction, details = image_detector.detect_deepfake(sample_image)
        
        # Check return types
        assert isinstance(prediction, str), f"prediction should be str, got {type(prediction)}"
        assert isinstance(confidence, (int, float)), f"confidence should be numeric, got {type(confidence)}"
        assert isinstance(details, dict), f"details should be dict, got {type(details)}"
        
        # Check value ranges
        assert prediction in ['REAL', 'FAKE', 'UNKNOWN']
        assert 0.0 <= confidence <= 100.0
    
    def test_performance_basic(self, image_detector, sample_image):
        """Test basic performance (should complete in reasonable time)"""
        import time
        
        start_time = time.time()
        confidence, prediction, details = image_detector.detect_deepfake(sample_image)
        elapsed_time = time.time() - start_time
        
        # Should complete in reasonable time (adjust threshold as needed)
        assert elapsed_time < 60.0  # 60 seconds max
        assert confidence is not None
        assert prediction is not None
        assert details is not None
    
    def test_error_handling(self, image_detector, video_detector, audio_detector):
        """Test error handling across all detectors"""
        # Test with None
        try:
            image_detector.detect_deepfake(None)
        except Exception:
            pass  # Exception is acceptable
        
        # Test with empty string
        try:
            video_detector.detect_video_deepfake("")
        except Exception:
            pass  # Exception is acceptable
        
        # Test with wrong file type
        try:
            audio_detector.detect_deepfake("test.txt")
        except Exception:
            pass  # Exception is acceptable


class TestEdgeCases:
    """Test edge cases and error conditions"""
    
    @pytest.fixture
    def image_detector(self):
        return AdvancedDeepfakeDetector()
    
    def test_very_large_image(self, image_detector):
        """Test handling of very large images"""
        # Create a large image (5000x5000)
        large_img = np.ones((5000, 5000, 3), dtype=np.uint8) * 128
        
        temp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        cv2.imwrite(temp_file.name, large_img)
        
        try:
            confidence, prediction, details = image_detector.detect_deepfake(temp_file.name)
            # Should handle gracefully (may take longer or resize)
            assert confidence is not None
            assert prediction is not None
            assert details is not None
        finally:
            os.unlink(temp_file.name)
    
    def test_very_small_image(self, image_detector):
        """Test handling of very small images"""
        # Create a tiny image (10x10)
        small_img = np.ones((10, 10, 3), dtype=np.uint8) * 128
        
        temp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        cv2.imwrite(temp_file.name, small_img)
        
        try:
            confidence, prediction, details = image_detector.detect_deepfake(temp_file.name)
            # Should handle gracefully
            assert confidence is not None
            assert prediction is not None
            assert details is not None
        finally:
            os.unlink(temp_file.name)
    
    def test_corrupted_image(self, image_detector):
        """Test handling of corrupted image file"""
        # Create a file with invalid image data
        temp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        temp_file.write(b"This is not an image file")
        temp_file.close()
        
        try:
            confidence, prediction, details = image_detector.detect_deepfake(temp_file.name)
            # Should handle gracefully and return a result (even if UNKNOWN)
            assert confidence is not None
            assert prediction is not None
            assert details is not None
            # Prediction should be UNKNOWN or REAL/FAKE, not raise exception
            assert prediction in ['REAL', 'FAKE', 'UNKNOWN']
        finally:
            os.unlink(temp_file.name)
    
    def test_unicode_paths(self, image_detector):
        """Test handling of unicode file paths"""
        # This test may not work on all systems
        # Skip if not supported
        pass  # Placeholder for unicode path testing


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

