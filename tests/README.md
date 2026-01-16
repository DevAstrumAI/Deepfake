# Deepfake Detection System - Test Suite

This directory contains comprehensive test cases for validating the deepfake detection system.

## Test Structure

### Unit Tests

1. **`test_image_detection.py`**
   - Tests for image deepfake detection
   - Tests for AdvancedDeepfakeDetector
   - Tests for FastForensicDetector
   - Tests for FaceArtifactDetector
   - Edge cases: no face, invalid paths, corrupted images

2. **`test_video_detection.py`**
   - Tests for video deepfake detection
   - Tests for SafeVideoDeepfakeDetector
   - Frame extraction and temporal analysis
   - Video format validation

3. **`test_audio_detection.py`**
   - Tests for audio deepfake detection
   - Tests for HybridAudioDeepfakeDetector
   - Tests for ComprehensiveAudioDeepfakeDetector
   - Feature extraction validation
   - Edge cases: silence, short/long audio

### Integration Tests

4. **`test_integration.py`**
   - Full pipeline tests
   - Multi-modal consistency tests
   - Performance tests
   - Error handling across all detectors

### Validation Tests

5. **`test_validation.py`**
   - Threshold validation
   - Feature range validation
   - Known sample testing
   - Accuracy validation

## Running Tests

### Install Dependencies

```bash
pip install pytest pytest-cov
```

### Run All Tests

```bash
pytest tests/ -v
```

### Run Specific Test File

```bash
pytest tests/test_image_detection.py -v
```

### Run with Coverage

```bash
pytest tests/ --cov=. --cov-report=html
```

### Run Specific Test

```bash
pytest tests/test_image_detection.py::TestImageDetection::test_detector_initialization -v
```

## Test Categories

### Unit Tests
- Test individual components in isolation
- Fast execution
- Mock dependencies where needed

### Integration Tests
- Test complete workflows
- May require actual model files
- Longer execution time

### Validation Tests
- Test accuracy and correctness
- Validate thresholds and ranges
- Test with known characteristics

## Expected Test Results

### Passing Tests
- ✅ Detector initialization
- ✅ Feature extraction
- ✅ Basic detection functionality
- ✅ Error handling
- ✅ Edge cases

### Tests Requiring Models
Some tests may require pre-trained model files:
- Deep learning model tests (EfficientNet, ResNet, ViT)
- AASIST and RawNet2 audio models

If models are not available, these tests will be skipped or marked as expected failures.

## Adding New Tests

1. **Unit Test**: Add to appropriate test file
2. **Integration Test**: Add to `test_integration.py`
3. **Validation Test**: Add to `test_validation.py`

### Test Naming Convention

- Test classes: `Test<ComponentName>`
- Test methods: `test_<what_is_being_tested>`

### Example Test Structure

```python
def test_feature_extraction(self, detector, sample_data):
    """Test that features are extracted correctly"""
    features = detector.extract_features(sample_data)
    
    assert features is not None
    assert 'expected_feature' in features
    assert isinstance(features['expected_feature'], (int, float))
```

## Continuous Integration

Tests can be integrated into CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    pip install -r requirements.txt
    pip install pytest pytest-cov
    pytest tests/ --cov=. --cov-report=xml
```

## Test Data

Test data is generated programmatically in fixtures to avoid storing large files in the repository.

For validation with real datasets:
1. Download FaceForensics++, Celeb-DF, or DFDC datasets
2. Create test fixtures that load from dataset paths
3. Add dataset-specific validation tests

## Troubleshooting

### Import Errors
- Ensure parent directory is in Python path
- Check that all dependencies are installed

### Model Loading Errors
- Some tests may fail if models are not available
- These are expected and can be skipped

### File Permission Errors
- Ensure write permissions for temporary files
- Tests create temporary files that are cleaned up automatically

## Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical paths covered
- **Validation Tests**: All thresholds and ranges validated

