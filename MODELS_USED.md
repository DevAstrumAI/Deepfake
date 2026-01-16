# Models Used in Deepfake Detection System

This document provides a comprehensive overview of all models used for detecting deepfakes in images, videos, and audio files.

---

## 🖼️ Image Detection Models

The image detection system uses an **ensemble approach** combining multiple pre-trained models for maximum accuracy.

### Primary Models (Ensemble)

1. **EfficientNet-B3**
   - **Weight**: 40% (0.4)
   - **Input Size**: 300×300 pixels
   - **Architecture**: EfficientNet-B3 backbone with custom binary classifier
   - **Purpose**: Primary model for deepfake detection
   - **Source**: Pre-trained on ImageNet, fine-tuned for binary classification

2. **ResNet-50**
   - **Weight**: 30% (0.3)
   - **Input Size**: 224×224 pixels
   - **Architecture**: ResNet-50 with custom binary classifier
   - **Purpose**: Secondary model providing complementary features
   - **Source**: Pre-trained on ImageNet, fine-tuned for binary classification

3. **Vision Transformer (ViT-Base)**
   - **Weight**: 30% (0.3)
   - **Input Size**: 224×224 pixels
   - **Architecture**: ViT-Base-Patch16-224 with custom binary classifier
   - **Purpose**: Transformer-based model for attention-based detection
   - **Source**: Pre-trained on ImageNet, fine-tuned for binary classification

### Ensemble Method
- **Voting System**: Majority voting with weighted confidence scores
- **Final Prediction**: Based on ensemble of all three models
- **Confidence Calculation**: Weighted average of model confidences

### Supporting Analysis Modules

1. **Face Artifact Detector**
   - Analyzes face-specific artifacts and inconsistencies
   - Detects unnatural skin textures, lighting inconsistencies
   - Provides additional forensic evidence

2. **Fast Forensic Detector**
   - Quick forensic analysis focusing on key deepfake indicators
   - Analyzes: lighting, skin texture, symmetry, edges, frequency patterns
   - Provides fast preliminary analysis

3. **Enhanced Forensic Detector** (when available)
   - More comprehensive forensic analysis
   - Falls back to Fast Forensic Detector if unavailable

4. **Grad-CAM Visualization**
   - Generates heatmaps showing which regions the models focus on
   - Provides visual evidence of deepfake indicators
   - Available for EfficientNet-B3 and ResNet-50 models

---

## 🎬 Video Detection Models

Video detection uses **frame-by-frame analysis** with the same image detection models.

### Detection Method
- **Frame Extraction**: Extracts up to 50 frames per video
- **Frame Analysis**: Each frame is analyzed using the **Image Detection Models** (see above)
- **Temporal Analysis**: Analyzes consistency across frames
- **Final Prediction**: Based on frame-level predictions and temporal patterns

### Models Used
- **AdvancedDeepfakeDetector**: Same ensemble as image detection
  - EfficientNet-B3
  - ResNet-50
  - Vision Transformer
- **FaceArtifactDetector**: For face-specific analysis in video frames

### Analysis Process
1. Extract frames from video (up to 50 frames, sampled intelligently)
2. Analyze each frame using image detection models
3. Calculate frame-level statistics (fake/real ratio)
4. Apply temporal consistency checks
5. Generate overall video prediction with confidence score

---

## 🎵 Audio Detection Models

The audio detection system uses a **hybrid approach** combining multiple state-of-the-art audio deepfake detection models.

### Primary Models

1. **AASIST (Audio Anti-Spoofing using Integrated Spectro-Temporal Graph Attention Networks)**
   - **Type**: Graph Attention Network
   - **Input**: Mel-spectrogram (80 mel bands)
   - **Architecture**: 
     - Mel-spectrogram encoder (Conv2D layers)
     - Graph attention layers (3 layers)
     - Temporal attention (Multi-head attention)
     - Classification head
   - **Purpose**: State-of-the-art model for audio deepfake detection
   - **Features**: Analyzes spectro-temporal relationships

2. **RawNet2**
   - **Type**: End-to-end raw waveform model
   - **Input**: Raw audio waveform (16kHz sample rate)
   - **Architecture**:
     - Initial convolution layer
     - Residual blocks (4 blocks: 128→256→512→1024 channels)
     - Global average pooling
     - Classification head
   - **Purpose**: Lightweight but effective model for raw audio analysis
   - **Features**: Processes raw waveforms without feature extraction

3. **Hybrid Feature Fusion Model**
   - **Type**: Neural network fusion model
   - **Input**: 
     - Comprehensive audio features (100 dimensions)
     - Model predictions from AASIST and RawNet2
   - **Architecture**:
     - Feature fusion network
     - Model prediction fusion network
     - Final ensemble network
   - **Purpose**: Combines feature-based and model-based predictions

### Audio Processing Parameters
- **Sample Rate**: 16,000 Hz
- **Mel Bands**: 80
- **FFT Size**: 1024
- **Hop Length**: 256
- **Duration**: 1-10 seconds (truncated to 10 seconds max)

### Comprehensive Feature Analysis
The system also extracts and analyzes:
- **Acoustic Features**: RMS energy, zero-crossing rate
- **Spectral Features**: Spectral centroid, rolloff, contrast
- **MFCC Features**: 13 MFCC coefficients
- **Chroma Features**: Chroma-based pitch analysis
- **Tonnetz Features**: Harmonic network features
- **Rhythm Features**: Tempo, beat tracking
- **Quality Metrics**: SNR, dynamic range, harmonic-to-noise ratio

### Ensemble Method
- **Weighted Fusion**: Combines AASIST and RawNet2 predictions
- **Feature Integration**: Incorporates comprehensive audio features
- **Final Prediction**: Ensemble of all models and features

---

## 📊 Model Summary Table

| Detection Type | Models Used | Ensemble Method | Primary Purpose |
|----------------|-------------|-----------------|-----------------|
| **Image** | EfficientNet-B3 (40%)<br>ResNet-50 (30%)<br>Vision Transformer (30%) | Weighted majority voting | Deepfake image detection |
| **Video** | Same as Image models<br>(frame-by-frame analysis) | Frame-level ensemble + temporal analysis | Deepfake video detection |
| **Audio** | AASIST<br>RawNet2<br>Hybrid Feature Fusion | Weighted fusion + feature integration | Audio deepfake detection |

---

## 🔧 Technical Details

### Model Loading
- **Lazy Initialization**: Models are loaded on first use (not at startup)
- **Device Support**: Automatically uses GPU if available, falls back to CPU
- **Memory Management**: Models are loaded once and reused for all requests

### Model Sources
- **Image Models**: Pre-trained from `timm` library (PyTorch Image Models)
- **Audio Models**: Custom implementations based on research papers
  - AASIST: Based on "AASIST: Audio Anti-Spoofing using Integrated Spectro-Temporal Graph Attention Networks"
  - RawNet2: Based on "RawNet2: End-to-end Raw Waveform Deepfake Detection"

### Performance
- **Image Detection**: ~2-5 seconds per image (depending on hardware)
- **Video Detection**: ~10-30 seconds per video (depends on length and frame count)
- **Audio Detection**: ~1-3 seconds per audio file (depends on length)

---

## 📚 References

### Image Models
- EfficientNet: [EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks](https://arxiv.org/abs/1905.11946)
- ResNet: [Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385)
- Vision Transformer: [An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale](https://arxiv.org/abs/2010.11929)

### Audio Models
- AASIST: [AASIST: Audio Anti-Spoofing using Integrated Spectro-Temporal Graph Attention Networks](https://arxiv.org/abs/2110.01200)
- RawNet2: [RawNet2: End-to-end Raw Waveform Deepfake Detection](https://arxiv.org/abs/2007.08558)

---

## 🔄 Future Enhancements

Potential model additions:
- **ConvNeXt-Base**: Currently disabled due to dimension issues, may be re-enabled
- **Additional Audio Models**: Wav2Vec2, ECAPA-TDNN
- **Video-Specific Models**: 3D CNNs, Temporal Convolutional Networks

---

**Last Updated**: Based on current codebase analysis
**Model Versions**: As implemented in the codebase

