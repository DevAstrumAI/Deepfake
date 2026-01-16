"""
Unit tests for Video Deepfake Detection
Tests the SafeVideoDeepfakeDetector
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

from backend.safe_video_detector import SafeVideoDeepfakeDetector


class TestVideoDetection:
    """Test cases for video deepfake detection"""
    
    @pytest.fixture
    def detector(self):
        """Initialize video detector for testing"""
        return SafeVideoDeepfakeDetector()
    
    @pytest.fixture
    def sample_video_path(self):
        """Create a sample test video"""
        # Create a simple test video
        temp_file = tempfile.NamedTemporaryFile(suffix='.mp4', delete=False)
        video_path = temp_file.name
        temp_file.close()
        
        # Create video with OpenCV
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(video_path, fourcc, 20.0, (640, 480))
        
        # Write 30 frames
        for i in range(30):
            frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
            # Add a face-like region
            cv2.rectangle(frame, (200, 150), (400, 350), (200, 180, 160), -1)
            out.write(frame)
        
        out.release()
        
        yield video_path
        if os.path.exists(video_path):
            os.unlink(video_path)
    
    def test_detector_initialization(self, detector):
        """Test that detector initializes correctly"""
        assert detector is not None
        assert hasattr(detector, 'image_detector')
        assert hasattr(detector, 'analysis_params')
    
    def test_video_info_extraction(self, detector, sample_video_path):
        """Test video information extraction"""
        info = detector._get_video_info(sample_video_path)
        
        assert info is not None
        assert 'file_path' in info
        assert 'frame_count' in info
        assert 'fps' in info
        assert 'width' in info
        assert 'height' in info
    
    def test_video_validation(self, detector, sample_video_path):
        """Test video file validation"""
        assert detector._validate_video_file(sample_video_path) == True
        assert detector._validate_video_file("nonexistent.mp4") == False
    
    def test_frame_extraction(self, detector, sample_video_path):
        """Test frame extraction from video"""
        frames = detector._extract_frames_safe(sample_video_path)
        
        assert frames is not None
        assert isinstance(frames, list)
        assert len(frames) > 0
        
        # Check frame structure
        if len(frames) > 0:
            frame = frames[0]
            assert 'frame_number' in frame
            assert 'timestamp' in frame
            assert 'frame' in frame
    
    def test_video_detection(self, detector, sample_video_path):
        """Test full video detection"""
        result = detector.detect_video_deepfake(sample_video_path)
        
        assert result is not None
        assert isinstance(result, dict)
        assert 'video_info' in result
        assert 'frame_analysis' in result
        assert 'video_score' in result
        assert 'prediction' in result
        assert result['prediction'] in ['REAL', 'FAKE']
    
    def test_temporal_analysis(self, detector):
        """Test temporal analysis calculations"""
        # Mock frame analysis results
        frame_analysis = [
            {'frame_number': 0, 'prediction': 'REAL', 'confidence': 0.8},
            {'frame_number': 1, 'prediction': 'REAL', 'confidence': 0.75},
            {'frame_number': 2, 'prediction': 'FAKE', 'confidence': 0.6},
            {'frame_number': 3, 'prediction': 'FAKE', 'confidence': 0.65},
        ]
        
        video_score = detector._calculate_safe_video_score(frame_analysis)
        
        assert video_score is not None
        assert isinstance(video_score, dict)
        assert 'confidence' in video_score or 'is_likely_fake' in video_score
    
    def test_invalid_video_path(self, detector):
        """Test handling of invalid video path"""
        result = detector.detect_video_deepfake("nonexistent_video.mp4")
        
        assert result is not None
        assert 'error' in result
    
    def test_empty_video_handling(self, detector):
        """Test handling of empty or corrupted video"""
        # Create empty file
        temp_file = tempfile.NamedTemporaryFile(suffix='.mp4', delete=False)
        empty_path = temp_file.name
        temp_file.close()
        
        result = detector.detect_video_deepfake(empty_path)
        
        assert result is not None
        # Should handle gracefully
        assert 'error' in result or 'video_info' in result
        
        if os.path.exists(empty_path):
            os.unlink(empty_path)
    
    def test_video_formats(self, detector):
        """Test different video format support"""
        supported_formats = detector.supported_formats
        
        assert isinstance(supported_formats, set)
        assert '.mp4' in supported_formats
        assert '.avi' in supported_formats
    
    def test_frame_interval_analysis(self, detector, sample_video_path):
        """Test that frame interval is respected"""
        frames = detector._extract_frames_safe(sample_video_path)
        
        if len(frames) > 1:
            # Check that frames are spaced appropriately
            frame_numbers = [f['frame_number'] for f in frames]
            intervals = [frame_numbers[i+1] - frame_numbers[i] for i in range(len(frame_numbers)-1)]
            
            # All intervals should be positive
            assert all(interval > 0 for interval in intervals)
    
    def test_max_frames_limit(self, detector, sample_video_path):
        """Test that max_frames limit is respected"""
        max_frames = detector.analysis_params['max_frames']
        frames = detector._extract_frames_safe(sample_video_path)
        
        assert len(frames) <= max_frames
    
    def test_video_score_calculation(self, detector):
        """Test video score calculation logic"""
        # Test with all REAL frames
        all_real = [
            {'prediction': 'REAL', 'confidence': 0.9} for _ in range(10)
        ]
        score_real = detector._calculate_safe_video_score(all_real)
        
        # Test with all FAKE frames
        all_fake = [
            {'prediction': 'FAKE', 'confidence': 0.9} for _ in range(10)
        ]
        score_fake = detector._calculate_safe_video_score(all_fake)
        
        assert score_real is not None
        assert score_fake is not None


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

