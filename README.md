# Deepfake Detection System

A state-of-the-art web application for detecting deepfakes in images, videos, and audio files using OpenAI's GPT-4 Vision and Whisper APIs for high-accuracy detection.

## ⚡ Quick Start

### Prerequisites
- Python 3.8+ (for backend)
- Node.js 14+ and npm (for frontend)
- OpenAI API Key (set as environment variable `OPENAI_API_KEY`)

### Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

---

## 📖 Full Documentation

## 🚀 Features

- **Multi-Modal Detection**: Analyze images, videos, and audio files for deepfakes
- **High Accuracy**: Uses OpenAI GPT-4 Vision for image/video analysis and Whisper + GPT-4 for audio analysis
- **Modern Web Interface**: Beautiful, responsive React-based web application
- **Real-time Analysis**: Fast detection with detailed confidence scores
- **Visual Evidence**: Detailed analysis reports showing suspicious regions
- **Comprehensive Reports**: Downloadable PDF reports with detailed analysis
- **AI-Powered Analysis**: Leverages OpenAI's advanced vision and language models
- **Audio Deepfake Detection**: Uses OpenAI Whisper for transcription and GPT-4 for analysis
- **Video Frame Analysis**: Frame-by-frame analysis using GPT-4 Vision
- **User Authentication**: Secure user accounts and file management
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 📋 Requirements

### Backend
- Python 3.8 or higher
- 4GB+ RAM recommended
- GPU support (optional, for faster processing)

### Frontend
- Node.js 14.x or higher
- npm 6.x or higher

## 🛠️ Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd "Deepfake 2"
   ```

2. **Set up OpenAI API Key**
   ```bash
   # Create a .env file in the backend directory
   echo "OPENAI_API_KEY=your-api-key-here" > backend/.env
   ```
   Or set it as an environment variable:
   ```bash
   export OPENAI_API_KEY=your-api-key-here
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

4. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

## 🚀 Running the Application

### Start Backend Server

Open a terminal and navigate to the backend folder:

```bash
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The backend API will be available at `http://localhost:8000`

### Start Frontend Application

Open a **new terminal** and navigate to the frontend folder:

```bash
cd frontend
npm start
```

The frontend application will automatically open in your browser at `http://localhost:3000`

### Quick Start (Using Start Script)

Alternatively, you can use the provided start script:

```bash
./start.sh
```

This will start both backend and frontend services automatically.

## 🎯 Usage

### Web Application (Recommended)

1. **Start the backend server** (see Running the Application section above)
2. **Start the frontend application** (see Running the Application section above)
3. **Open your browser** and navigate to `http://localhost:3000`
4. **Upload and analyze** images, videos, or audio files through the web interface

**Features:**
- Upload images, videos, or audio files
- Real-time deepfake detection analysis
- Detailed results with confidence scores
- Visual evidence and charts
- Downloadable PDF reports

### Command Line Usage (Legacy)

```python
from deepfake_detector import DeepfakeDetector

# Initialize detector
detector = DeepfakeDetector()

# Analyze a single image
confidence, prediction, details = detector.detect_deepfake("path/to/image.jpg")
print(f"Prediction: {prediction}")
print(f"Confidence: {confidence:.2f}%")

# Analyze multiple images
results = detector.batch_detect(["image1.jpg", "image2.jpg", "image3.jpg"])
for result in results:
    print(f"{result['image_path']}: {result['prediction']} ({result['confidence']:.2f}%)")
```

### Advanced Usage

```python
from image_utils import ImagePreprocessor

# Initialize preprocessor
preprocessor = ImagePreprocessor()

# Validate image
is_valid, error_msg = preprocessor.validate_image("image.jpg")
if is_valid:
    # Preprocess for better detection
    processed_image = preprocessor.preprocess_for_detection("image.jpg")
    
    # Analyze artifacts
    artifacts = preprocessor.analyze_image_artifacts("image.jpg")
    print("Artifact analysis:", artifacts)
```

## 📊 Model Information

### Architecture
- **Image/Video Detection**: OpenAI GPT-4 Vision (gpt-4o)
- **Audio Detection**: OpenAI Whisper (whisper-1) + GPT-4 (gpt-4o)
- **Output**: Real / Fake classification with confidence scores
- **Analysis**: Detailed reasoning and artifact detection

### Supported Formats

**Images:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- BMP (.bmp)
- TIFF (.tiff)
- WebP (.webp)

**Videos:**
- MP4 (.mp4)
- AVI (.avi)
- MOV (.mov)
- WebM (.webm)
- MKV (.mkv)

**Audio:**
- WAV (.wav) - PCM format recommended for browser compatibility
- MP3 (.mp3)
- FLAC (.flac)
- AAC (.aac)
- OGG (.ogg)

### Image Requirements
- **Minimum Size**: 64x64 pixels
- **Maximum Size**: 2048x2048 pixels
- **Maximum File Size**: 50MB
- **Color**: RGB/Grayscale

## 🔍 How It Works

1. **Image/Video Analysis**
   - Images/frames are encoded and sent to GPT-4 Vision API
   - GPT-4 analyzes for deepfake indicators (facial inconsistencies, lighting issues, artifacts)
   - Returns detailed reasoning and confidence scores

2. **Audio Analysis**
   - Audio is transcribed using OpenAI Whisper
   - Transcription and audio features are analyzed by GPT-4
   - Detects unnatural speech patterns, prosody issues, and audio artifacts

3. **Classification**
   - Binary classification (Real/Fake)
   - Confidence scoring based on AI analysis
   - Detailed reasoning provided

4. **Quality Analysis**
   - Face detection using OpenCV
   - Artifact identification
   - Consistency checks
   - Naturalness scoring

## 📈 Performance Metrics

The system provides detailed analysis including:

- **Prediction**: Real or Fake
- **Confidence**: Percentage confidence in prediction
- **Probabilities**: Detailed probability scores
- **Quality Metrics**: Brightness, contrast, saturation, sharpness
- **Artifact Analysis**: Frequency patterns, edge density, texture uniformity

## ⚠️ Important Notes

- **AI-Based Analysis**: Results are probabilistic and should be interpreted with caution
- **Not Definitive Proof**: This tool is for analysis, not legal evidence
- **Model Limitations**: Performance may vary on different types of deepfakes
- **Continuous Updates**: Models are regularly updated for better accuracy

## 🛡️ Privacy & Security

- **OpenAI API**: Media files are sent to OpenAI's API for analysis
- **API Key Security**: Keep your OpenAI API key secure and never commit it to version control
- **Data Privacy**: Files are processed by OpenAI according to their privacy policy
- **User Authentication**: Secure user accounts and file management

## 🔧 Troubleshooting

### Common Issues

1. **Model Loading Error**
   ```bash
   # Reinstall PyTorch
   pip uninstall torch torchvision
   pip install torch torchvision
   ```

2. **GUI Not Opening**
   ```bash
   # Install tkinter (Linux)
   sudo apt-get install python3-tk
   ```

3. **Memory Issues**
   - Close other applications
   - Use smaller images
   - Enable GPU acceleration if available

### Performance Tips

- **GPU Acceleration**: Install CUDA for faster processing
- **Batch Processing**: Analyze multiple images together
- **Image Optimization**: Use appropriately sized images (300x300 recommended)

## 📚 Technical Details

### Backend Dependencies
- `openai>=1.0.0`: OpenAI API client for GPT-4 Vision and Whisper
- `opencv-python-headless>=4.8.0`: Image processing and face detection
- `pillow>=10.0.0`: Image manipulation
- `numpy>=1.24.0`: Numerical computing
- `fastapi>=0.104.0`: Web framework for API
- `uvicorn>=0.24.0`: ASGI server
- `librosa>=0.10.0`: Audio feature extraction

### Frontend Dependencies
- `react>=18.0.0`: React framework
- `react-router-dom>=6.0.0`: Routing
- `axios>=1.0.0`: HTTP client
- `recharts>=2.0.0`: Charting library
- `framer-motion>=10.0.0`: Animations
- `tailwindcss>=3.0.0`: CSS framework

### Model Architecture
```
Image/Video:
    Media File → Base64 Encoding → GPT-4 Vision API → Analysis → Real/Fake

Audio:
    Audio File → Whisper API (Transcription) → GPT-4 API (Analysis) → Real/Fake
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 Vision and Whisper APIs
- OpenCV contributors
- Deepfake detection research community

## 📞 Support

For questions, issues, or support:
1. Check the troubleshooting section
2. Review existing GitHub issues
3. Create a new issue with detailed information

---

**Disclaimer**: This tool is for educational and research purposes. Results should not be used as definitive proof of image authenticity in legal or professional contexts.
