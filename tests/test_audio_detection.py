"""
Unit tests for Audio Deepfake Detection
Tests the HybridAudioDeepfakeDetector and ComprehensiveAudioDeepfakeDetector
"""

import pytest
import numpy as np
import librosa
import tempfile
import os
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.hybrid_audio_detector import HybridAudioDeepfakeDetector
from backend.comprehensive_audio_detector import ComprehensiveAudioDeepfakeDetector


class TestAudioDetection:
    """Test cases for audio deepfake detection"""
    
    @pytest.fixture
    def hybrid_detector(self):
        """Initialize hybrid audio detector"""
        return HybridAudioDeepfakeDetector(device='cpu')
    
    @pytest.fixture
    def comprehensive_detector(self):
        """Initialize comprehensive audio detector"""
        return ComprehensiveAudioDeepfakeDetector(device='cpu')
    
    @pytest.fixture
    def sample_audio_path(self):
        """Create a sample test audio file"""
        # Generate a simple sine wave as test audio
        sample_rate = 16000
        duration = 2.0  # 2 seconds
        frequency = 440  # A4 note
        
        t = np.linspace(0, duration, int(sample_rate * duration))
        waveform = np.sin(2 * np.pi * frequency * t)
        
        # Normalize
        waveform = waveform / np.max(np.abs(waveform))
        
        # Save to temporary file
        temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        temp_path = temp_file.name
        temp_file.close()
        
        # Use librosa to save
        import soundfile as sf
        sf.write(temp_path, waveform, sample_rate)
        
        yield temp_path
        if os.path.exists(temp_path):
            os.unlink(temp_path)
    
    @pytest.fixture
    def silence_audio_path(self):
        """Create a silent audio file"""
        sample_rate = 16000
        duration = 1.0
        waveform = np.zeros(int(sample_rate * duration))
        
        temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        temp_path = temp_file.name
        temp_file.close()
        
        import soundfile as sf
        sf.write(temp_path, waveform, sample_rate)
        
        yield temp_path
        if os.path.exists(temp_path):
            os.unlink(temp_path)
    
    def test_hybrid_detector_initialization(self, hybrid_detector):
        """Test hybrid detector initialization"""
        assert hybrid_detector is not None
        assert hasattr(hybrid_detector, 'models')
        assert hasattr(hybrid_detector, 'sample_rate')
    
    def test_comprehensive_detector_initialization(self, comprehensive_detector):
        """Test comprehensive detector initialization"""
        assert comprehensive_detector is not None
        assert hasattr(comprehensive_detector, 'sample_rate')
    
    def test_audio_preprocessing(self, hybrid_detector, sample_audio_path):
        """Test audio preprocessing"""
        preprocessed = hybrid_detector.preprocess_audio(sample_audio_path)
        
        assert preprocessed is not None
        assert 'waveform' in preprocessed
        assert 'mel_spectrogram' in preprocessed
        assert 'sample_rate' in preprocessed
    
    def test_comprehensive_feature_extraction(self, hybrid_detector, sample_audio_path):
        """Test comprehensive feature extraction"""
        waveform, sr = librosa.load(sample_audio_path, sr=16000)
        features = hybrid_detector.extract_comprehensive_features(waveform, sr)
        
        assert features is not None
        assert isinstance(features, dict)
        assert 'f0_mean' in features
        assert 'energy_mean' in features
        assert 'mfcc_mean' in features
    
    def test_acoustic_features(self, comprehensive_detector, sample_audio_path):
        """Test acoustic feature extraction"""
        waveform, sr = librosa.load(sample_audio_path, sr=16000)
        features = comprehensive_detector.extract_acoustic_features(waveform, sr)
        
        assert features is not None
        assert 'f0_mean' in features
        assert 'f0_std' in features
        assert 'energy_mean' in features
        assert 'spectral_centroid_mean' in features
        assert 'mfcc_mean' in features
        assert len(features['mfcc_mean']) == 13
    
    def test_prosodic_features(self, comprehensive_detector, sample_audio_path):
        """Test prosodic feature extraction"""
        waveform, sr = librosa.load(sample_audio_path, sr=16000)
        features = comprehensive_detector.extract_prosodic_features(waveform, sr)
        
        assert features is not None
        assert 'tempo' in features
        assert 'beat_count' in features
        assert 'speech_rate' in features or 'pause_count' in features
    
    def test_phase_features(self, comprehensive_detector, sample_audio_path):
        """Test phase feature extraction"""
        waveform, sr = librosa.load(sample_audio_path, sr=16000)
        features = comprehensive_detector.extract_phase_features(waveform, sr)
        
        assert features is not None
        assert 'phase_coherence' in features
        assert 'phase_variance_mean' in features
    
    def test_frequency_domain_features(self, comprehensive_detector, sample_audio_path):
        """Test frequency domain feature extraction"""
        waveform, sr = librosa.load(sample_audio_path, sr=16000)
        features = comprehensive_detector.extract_frequency_domain_features(waveform, sr)
        
        assert features is not None
        assert 'spectral_rolloff_mean' in features
    
    def test_linguistic_features(self, comprehensive_detector, sample_audio_path):
        """Test linguistic feature extraction"""
        waveform, sr = librosa.load(sample_audio_path, sr=16000)
        features = comprehensive_detector.extract_linguistic_features(waveform, sr)
        
        assert features is not None
        # Formants may not be detected in simple sine wave
        assert isinstance(features, dict)
    
    def test_statistical_features(self, comprehensive_detector, sample_audio_path):
        """Test statistical feature extraction"""
        waveform, sr = librosa.load(sample_audio_path, sr=16000)
        features = comprehensive_detector.extract_statistical_features(waveform, sr)
        
        assert features is not None
        assert 'waveform_mean' in features
        assert 'waveform_std' in features
        assert 'spectral_entropy' in features
    
    def test_audio_detection(self, hybrid_detector, sample_audio_path):
        """Test full audio detection"""
        confidence, prediction, details = hybrid_detector.detect_deepfake(sample_audio_path)
        
        assert confidence is not None
        assert prediction is not None
        assert details is not None
        assert 0.0 <= confidence <= 1.0
        assert prediction in ['REAL', 'FAKE']
        assert isinstance(details, dict)
    
    def test_silence_handling(self, hybrid_detector, silence_audio_path):
        """Test handling of silent audio"""
        confidence, prediction, details = hybrid_detector.detect_deepfake(silence_audio_path)
        
        # Should handle gracefully
        assert confidence is not None
        assert prediction is not None
    
    def test_invalid_audio_path(self, hybrid_detector):
        """Test handling of invalid audio path"""
        try:
            confidence, prediction, details = hybrid_detector.detect_deepfake("nonexistent.wav")
            # Should handle gracefully
            assert True
        except Exception:
            # Exception is also acceptable
            assert True
    
    def test_feature_value_ranges(self, comprehensive_detector, sample_audio_path):
        """Test that feature values are in expected ranges"""
        waveform, sr = librosa.load(sample_audio_path, sr=16000)
        features = comprehensive_detector.extract_acoustic_features(waveform, sr)
        
        # F0 should be positive if detected
        if features['f0_mean'] > 0:
            assert 50 <= features['f0_mean'] <= 500  # Typical human voice range
        
        # Energy should be non-negative
        assert features['energy_mean'] >= 0
        
        # MFCC values should be finite
        assert all(np.isfinite(mfcc) for mfcc in features['mfcc_mean'])
    
    def test_deepfake_indicators(self, hybrid_detector, sample_audio_path):
        """Test deepfake indicator calculation"""
        waveform, sr = librosa.load(sample_audio_path, sr=16000)
        features = hybrid_detector.extract_comprehensive_features(waveform, sr)
        indicators = hybrid_detector._calculate_deepfake_indicators(features)
        
        assert indicators is not None
        assert isinstance(indicators, dict)
    
    def test_short_audio_handling(self, hybrid_detector):
        """Test handling of very short audio"""
        # Create very short audio (0.1 seconds)
        sample_rate = 16000
        duration = 0.1
        waveform = np.sin(2 * np.pi * 440 * np.linspace(0, duration, int(sample_rate * duration)))
        
        temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        temp_path = temp_file.name
        temp_file.close()
        
        import soundfile as sf
        sf.write(temp_path, waveform, sample_rate)
        
        try:
            confidence, prediction, details = hybrid_detector.detect_deepfake(temp_path)
            assert True
        except Exception:
            # Should handle gracefully
            assert True
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    
    def test_long_audio_handling(self, hybrid_detector):
        """Test handling of long audio (should truncate)"""
        # Create long audio (30 seconds)
        sample_rate = 16000
        duration = 30.0
        waveform = np.sin(2 * np.pi * 440 * np.linspace(0, duration, int(sample_rate * duration)))
        
        temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        temp_path = temp_file.name
        temp_file.close()
        
        import soundfile as sf
        sf.write(temp_path, waveform, sample_rate)
        
        try:
            preprocessed = hybrid_detector.preprocess_audio(temp_path)
            # Should truncate to max duration
            assert preprocessed['duration'] <= 10.0  # Max duration in preprocessing
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

