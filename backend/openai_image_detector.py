"""
OpenAI-based Image Deepfake Detection System
Uses GPT-4 Vision API for deepfake detection
"""

import os
import base64
import logging
from typing import Dict, Tuple, Optional
from pathlib import Path
from PIL import Image
import cv2
import numpy as np
from openai import OpenAI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OpenAIImageDeepfakeDetector:
    """
    Image deepfake detector using OpenAI GPT-4 Vision API
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the OpenAI image detector"""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        self.client = OpenAI(api_key=self.api_key)
        self.model = "gpt-4o"  # Use latest GPT-4 Vision model
        
        logger.info("OpenAI Image Deepfake Detector initialized")
    
    def _encode_image_to_base64(self, image_path: str) -> str:
        """Encode image to base64 for API"""
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            logger.error(f"Error encoding image: {e}")
            raise
    
    def _detect_face_opencv(self, image_path: str) -> Dict:
        """Detect face using OpenCV as fallback"""
        try:
            image = cv2.imread(image_path)
            if image is None:
                return {'face_detected': False}
            
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) > 0:
                # Use the largest face
                largest_face = max(faces, key=lambda x: x[2] * x[3])
                x, y, w, h = largest_face
                
                return {
                    'face_detected': True,
                    'face_confidence': 1.0,
                    'face_region': {
                        'x': int(x),
                        'y': int(y),
                        'width': int(w),
                        'height': int(h),
                        'left': int(x),
                        'top': int(y),
                        'right': int(x + w),
                        'bottom': int(y + h)
                    }
                }
            else:
                return {'face_detected': False, 'face_confidence': 0.0}
        except Exception as e:
            logger.error(f"Error detecting face: {e}")
            return {'face_detected': False, 'error': str(e)}
    
    def _analyze_image_quality(self, image_path: str) -> Dict:
        """Analyze overall image quality metrics"""
        try:
            image = cv2.imread(image_path)
            if image is None:
                return {}
            
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            quality_metrics = {
                'brightness': float(np.mean(gray)),
                'contrast': float(np.std(gray)),
                'sharpness': float(cv2.Laplacian(gray, cv2.CV_64F).var()),
                'noise_level': float(np.std(cv2.GaussianBlur(gray, (5, 5), 0) - gray)),
                'blur_detection': float(cv2.Laplacian(gray, cv2.CV_64F).var())
            }
            
            return quality_metrics
        except Exception as e:
            logger.error(f"Error analyzing image quality: {e}")
            return {}
    
    def _analyze_frequency_domain(self, image_path: str) -> Dict:
        """Analyze frequency domain for GAN artifacts"""
        try:
            image = cv2.imread(image_path)
            if image is None:
                return {}
            
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # FFT analysis
            f_transform = np.fft.fft2(gray)
            f_shift = np.fft.fftshift(f_transform)
            magnitude_spectrum = np.log(np.abs(f_shift) + 1)
            
            # Frequency domain features
            h, w = magnitude_spectrum.shape
            center_y, center_x = h // 2, w // 2
            
            # Center region analysis (low frequencies)
            center_region = magnitude_spectrum[center_y-20:center_y+20, center_x-20:center_x+20]
            
            # High frequency analysis
            high_freq_mask = np.ones(magnitude_spectrum.shape, dtype=np.uint8) * 255
            cv2.circle(high_freq_mask, (center_x, center_y), 50, 0, -1)
            high_freq_mask_float = high_freq_mask.astype(np.float64) / 255.0
            high_freq_region = magnitude_spectrum * high_freq_mask_float
            
            frequency_features = {
                'center_intensity': float(np.mean(center_region)),
                'center_variance': float(np.var(center_region)),
                'high_freq_energy': float(np.sum(high_freq_region)),
                'spectral_entropy': float(self._calculate_spectral_entropy(magnitude_spectrum))
            }
            
            return frequency_features
        except Exception as e:
            logger.error(f"Error analyzing frequency domain: {e}")
            return {}
    
    def _calculate_spectral_entropy(self, magnitude_spectrum: np.ndarray) -> float:
        """Calculate spectral entropy"""
        try:
            normalized = magnitude_spectrum / np.sum(magnitude_spectrum)
            entropy = -np.sum(normalized * np.log2(normalized + 1e-10))
            return entropy
        except Exception as e:
            logger.error(f"Error calculating spectral entropy: {e}")
            return 0.0
    
    def _analyze_face_symmetry(self, face_region: np.ndarray) -> float:
        """Analyze facial symmetry"""
        try:
            gray = cv2.cvtColor(face_region, cv2.COLOR_RGB2GRAY)
            flipped = cv2.flip(gray, 1)
            similarity = cv2.matchTemplate(gray, flipped, cv2.TM_CCOEFF_NORMED)[0, 0]
            return float(similarity)
        except Exception as e:
            logger.error(f"Error analyzing face symmetry: {e}")
            return 0.0
    
    def _analyze_skin_texture(self, face_region: np.ndarray) -> Dict:
        """Analyze skin texture for artifacts"""
        try:
            hsv = cv2.cvtColor(face_region, cv2.COLOR_RGB2HSV)
            lab = cv2.cvtColor(face_region, cv2.COLOR_RGB2LAB)
            
            texture_metrics = {
                'skin_smoothness': float(np.std(cv2.GaussianBlur(hsv[:, :, 2], (5, 5), 0))),
                'color_consistency': float(np.std(lab[:, :, 1])),
                'brightness_variation': float(np.std(hsv[:, :, 2])),
                'saturation_uniformity': float(np.std(hsv[:, :, 1]))
            }
            
            return texture_metrics
        except Exception as e:
            logger.error(f"Error analyzing skin texture: {e}")
            return {}
    
    def _extract_comprehensive_face_features(self, image_path: str) -> Dict:
        """Extract comprehensive face features with all analysis"""
        face_features = self._detect_face_opencv(image_path)
        
        try:
            image = cv2.imread(image_path)
            if image is None:
                return face_features
            
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # If face detected, do additional analysis
            if face_features.get('face_detected', False):
                face_region_dict = face_features.get('face_region', {})
                if face_region_dict:
                    top = face_region_dict.get('top', 0)
                    left = face_region_dict.get('left', 0)
                    bottom = face_region_dict.get('bottom', 0)
                    right = face_region_dict.get('right', 0)
                    
                    if bottom > top and right > left:
                        face_region = rgb_image[top:bottom, left:right]
                        
                        # Face symmetry
                        face_features['face_symmetry'] = self._analyze_face_symmetry(face_region)
                        
                        # Skin texture analysis
                        skin_texture = self._analyze_skin_texture(face_region)
                        face_features['skin_texture'] = skin_texture
                        
                        # Calculate skin naturalness score (0-1)
                        skin_smoothness = skin_texture.get('skin_smoothness', 0)
                        skin_naturalness = min(1.0, max(0.0, skin_smoothness / 10.0))
                        
                        # Artifact analysis structure
                        face_features['artifact_analysis'] = {
                            'border_analysis': {
                                'border_quality': 0.7  # Default, will be updated by OpenAI
                            },
                            'edge_analysis': {
                                'edge_uniformity': 0.7  # Default
                            },
                            'texture_analysis': {
                                'texture_consistency': min(1.0, max(0.0, skin_smoothness / 10.0))
                            },
                            'lighting_analysis': {
                                'brightness_uniformity': 0.7  # Default
                            }
                        }
                        
                        # Forensic analysis structure
                        face_features['forensic_analysis'] = {
                            'lighting_analysis': {
                                'brightness_uniformity': 0.7,  # Default
                                'brightness_std': float(np.std(cv2.cvtColor(face_region, cv2.COLOR_RGB2GRAY)))
                            },
                            'skin_analysis': {
                                'skin_naturalness': skin_naturalness,
                                'smoothness': skin_smoothness,
                                'skin_smoothness': skin_naturalness
                            },
                            'symmetry_analysis': {
                                'face_symmetry': face_features['face_symmetry']
                            }
                        }
            
            # Image quality
            face_features['image_quality'] = self._analyze_image_quality(image_path)
            
            # Frequency analysis
            face_features['frequency_analysis'] = self._analyze_frequency_domain(image_path)
            
        except Exception as e:
            logger.error(f"Error extracting comprehensive face features: {e}")
        
        return face_features
    
    def detect_deepfake(self, image_path: str) -> Tuple[float, str, Dict]:
        """
        Detect deepfake using OpenAI GPT-4 Vision API with comprehensive analysis
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Tuple of (confidence, prediction, details)
        """
        try:
            logger.info(f"Analyzing image with OpenAI: {image_path}")
            
            # Encode image
            base64_image = self._encode_image_to_base64(image_path)
            
            # Extract comprehensive face features with CV analysis
            face_features = self._extract_comprehensive_face_features(image_path)
            
            # Prepare comprehensive prompt for deepfake detection
            prompt = """You are an expert deepfake detection analyst. Analyze this image carefully and determine if it is REAL (authentic) or FAKE (deepfake/AI-generated).

CRITICAL: You must be accurate. Look carefully at:
- Facial features and their naturalness
- Skin texture and pores
- Lighting consistency across the face
- Edge quality around face boundaries
- Eye reflections and consistency
- Overall image artifacts

Provide your analysis as a JSON object with EXACTLY this structure (no markdown, just pure JSON):
{
  "prediction": "REAL" or "FAKE" (choose one based on your analysis),
  "confidence": 0.0-1.0 (0.0 = very uncertain, 1.0 = very certain),
  "reasoning": "Provide a comprehensive, detailed explanation (3-5 sentences) explaining WHY you determined this media is REAL or FAKE. Describe specific visual evidence you observed, such as: unnatural skin texture, inconsistent lighting patterns, blurry edges, artifacts around facial features, eye reflections, or any other indicators. Be specific about what you see that led to your conclusion. This explanation should help users understand the reasoning behind the detection.",
  "border_quality": 0.0-1.0 (0.0 = very blurry/suspicious borders, 1.0 = sharp/natural borders),
  "edge_uniformity": 0.0-1.0 (0.0 = inconsistent edges, 1.0 = uniform edges),
  "lighting_consistency": 0.0-1.0 (0.0 = inconsistent lighting, 1.0 = consistent lighting),
  "skin_texture_score": 0.0-1.0 (0.0 = unnatural/smooth skin, 1.0 = natural textured skin),
  "facial_symmetry_score": 0.0-1.0 (0.0 = very asymmetric, 1.0 = symmetric),
  "artifacts_detected": ["list specific artifacts you found, if any"],
  "confidence_factors": ["list factors that influenced your confidence"]
}

IMPORTANT: 
- If the image looks natural and authentic, set prediction to "REAL" with high confidence (0.7-1.0)
- If you see clear signs of deepfake/AI generation, set prediction to "FAKE" with high confidence (0.7-1.0)
- Only use low confidence (0.3-0.6) if you're genuinely uncertain
- Be honest and accurate in your assessment
- The "reasoning" field is critical - provide a clear, detailed explanation that users can understand"""
            
            # Call OpenAI API with JSON response format if supported
            try:
                # Try with response_format for structured output (gpt-4o supports this)
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert deepfake detection analyst. Always respond with valid JSON only."
                        },
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": prompt
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{base64_image}"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens=2000,
                    temperature=0.2,  # Lower temperature for more consistent results
                    response_format={"type": "json_object"}  # Force JSON output
                )
            except Exception as e:
                # Fallback if response_format not supported
                logger.warning(f"JSON response format not supported, using standard format: {e}")
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": prompt
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{base64_image}"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens=2000,
                    temperature=0.2
                )
            
            # Parse response
            response_text = response.choices[0].message.content
            logger.info(f"OpenAI raw response: {response_text[:500]}...")  # Log first 500 chars
            
            # Try to extract JSON from response
            import json
            import re
            
            # Try multiple JSON extraction methods
            analysis_result = None
            
            # Method 1: Look for JSON code block
            json_block_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
            if json_block_match:
                try:
                    analysis_result = json.loads(json_block_match.group(1))
                    logger.info("Successfully parsed JSON from code block")
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse JSON from code block: {e}")
            
            # Method 2: Look for JSON object
            if analysis_result is None:
                json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_text, re.DOTALL)
                if json_match:
                    try:
                        analysis_result = json.loads(json_match.group())
                        logger.info("Successfully parsed JSON from object")
                    except json.JSONDecodeError as e:
                        logger.warning(f"Failed to parse JSON from object: {e}")
            
            # Method 3: Try parsing the entire response as JSON
            if analysis_result is None:
                try:
                    analysis_result = json.loads(response_text.strip())
                    logger.info("Successfully parsed entire response as JSON")
                except json.JSONDecodeError:
                    pass
            
            # Method 4: Fallback to text parsing
            if analysis_result is None:
                logger.warning("Could not parse JSON, using text parsing fallback")
                analysis_result = self._parse_text_response(response_text)
            
            # Extract prediction and confidence with validation
            prediction_raw = analysis_result.get('prediction', '').upper().strip()
            confidence_raw = analysis_result.get('confidence', 0.5)
            
            # Determine prediction
            if prediction_raw == 'REAL' or 'REAL' in prediction_raw:
                prediction = 'REAL'
            elif prediction_raw == 'FAKE' or 'FAKE' in prediction_raw or 'DEEPFAKE' in prediction_raw or 'SYNTHETIC' in prediction_raw:
                prediction = 'FAKE'
            else:
                # If prediction is unclear, use confidence to determine
                logger.warning(f"Unclear prediction '{prediction_raw}', using confidence to determine")
                confidence_val = float(confidence_raw) if isinstance(confidence_raw, (int, float)) else 0.5
                # If confidence > 0.6, likely FAKE; if < 0.4, likely REAL; otherwise UNKNOWN
                if confidence_val > 0.6:
                    prediction = 'FAKE'
                elif confidence_val < 0.4:
                    prediction = 'REAL'
                else:
                    prediction = 'UNKNOWN'
            
            # Extract and validate confidence
            try:
                confidence = float(confidence_raw)
                if confidence > 1.0:
                    confidence = confidence / 100.0
                confidence = max(0.0, min(1.0, confidence))  # Clamp to 0-1
            except (ValueError, TypeError):
                logger.warning(f"Invalid confidence value '{confidence_raw}', using 0.5")
                confidence = 0.5
            
            logger.info(f"Parsed prediction: {prediction}, confidence: {confidence}")
            
            # Update face_features with OpenAI analysis scores
            if face_features.get('artifact_analysis'):
                face_features['artifact_analysis']['border_analysis']['border_quality'] = float(
                    analysis_result.get('border_quality', 0.7)
                )
                face_features['artifact_analysis']['edge_analysis']['edge_uniformity'] = float(
                    analysis_result.get('edge_uniformity', 0.7)
                )
                face_features['artifact_analysis']['texture_analysis']['texture_consistency'] = float(
                    analysis_result.get('skin_texture_score', 0.7)
                )
                face_features['artifact_analysis']['lighting_analysis']['brightness_uniformity'] = float(
                    analysis_result.get('lighting_consistency', 0.7)
                )
            
            # Complete forensic analysis with all metrics
            if face_features.get('forensic_analysis'):
                lighting_consistency = float(analysis_result.get('lighting_consistency', 0.7))
                skin_texture_score = float(analysis_result.get('skin_texture_score', 0.7))
                facial_symmetry_score = float(analysis_result.get('facial_symmetry_score', 0.7))
                border_quality = float(analysis_result.get('border_quality', 0.7))
                edge_uniformity = float(analysis_result.get('edge_uniformity', 0.7))
                
                # Enhanced lighting analysis
                lighting_analysis = face_features['forensic_analysis'].get('lighting_analysis', {})
                if face_features.get('face_detected') and 'face_region' in face_features:
                    try:
                        image = cv2.imread(image_path)
                        if image is not None:
                            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                            face_region_dict = face_features.get('face_region', {})
                            top = face_region_dict.get('top', 0)
                            left = face_region_dict.get('left', 0)
                            bottom = face_region_dict.get('bottom', 0)
                            right = face_region_dict.get('right', 0)
                            
                            if bottom > top and right > left:
                                face_region = rgb_image[top:bottom, left:right]
                                gray_face = cv2.cvtColor(face_region, cv2.COLOR_RGB2GRAY).astype(np.float32)
                                
                                # Calculate additional lighting metrics
                                brightness_std = float(np.std(gray_face))
                                brightness_range = float(np.max(gray_face) - np.min(gray_face))
                                
                                lighting_analysis.update({
                                    'brightness_uniformity': lighting_consistency,
                                    'brightness_std': brightness_std,
                                    'brightness_range': brightness_range,
                                    'gradient_std': float(np.std(cv2.Sobel(gray_face, cv2.CV_64F, 1, 0, ksize=3))),
                                    'color_temperature_consistency': lighting_consistency * 0.9,
                                    'lighting_consistency': lighting_consistency,
                                    'inconsistent_lighting': lighting_consistency < 0.5
                                })
                    except Exception as e:
                        logger.warning(f"Error calculating enhanced lighting metrics: {e}")
                
                face_features['forensic_analysis']['lighting_analysis'] = lighting_analysis
                
                # Enhanced skin analysis
                skin_analysis = face_features['forensic_analysis'].get('skin_analysis', {})
                skin_analysis.update({
                    'skin_naturalness': skin_texture_score,
                    'smoothness': (1.0 - skin_texture_score) * 10.0,  # Inverse for smoothness
                    'skin_smoothness': skin_texture_score,
                    'texture_variation': skin_texture_score,
                    'pore_visibility': skin_texture_score * 0.8,
                    'texture_consistency': skin_texture_score
                })
                face_features['forensic_analysis']['skin_analysis'] = skin_analysis
                
                # Enhanced symmetry analysis
                symmetry_analysis = face_features['forensic_analysis'].get('symmetry_analysis', {})
                symmetry_analysis.update({
                    'face_symmetry': facial_symmetry_score,
                    'left_right_symmetry': facial_symmetry_score,
                    'vertical_symmetry': facial_symmetry_score * 0.95
                })
                face_features['forensic_analysis']['symmetry_analysis'] = symmetry_analysis
                
                # Add edge analysis to forensic
                face_features['forensic_analysis']['edge_analysis'] = {
                    'edge_uniformity': edge_uniformity,
                    'edge_consistency': edge_uniformity,
                    'border_quality': border_quality
                }
                
                # Calculate comprehensive forensic score
                forensic_score = (
                    lighting_consistency * 0.3 +
                    skin_texture_score * 0.3 +
                    facial_symmetry_score * 0.2 +
                    border_quality * 0.1 +
                    edge_uniformity * 0.1
                )
                
                face_features['forensic_analysis']['forensic_score'] = {
                    'overall_score': forensic_score,
                    'is_likely_deepfake': forensic_score < 0.5,
                    'confidence': confidence
                }
            
            # Convert confidence to percentage
            confidence_percent = confidence * 100
            
            # Generate heatmaps based on analysis scores
            heatmaps = self._generate_heatmaps_from_scores(
                image_path,
                analysis_result,
                face_features,
                prediction
            )
            
            # Prepare comprehensive details
            details = {
                'model_predictions': {'openai_gpt4_vision': prediction},
                'model_confidences': {'openai_gpt4_vision': confidence},
                'ensemble_confidence': confidence,
                'face_features': face_features,
                'heatmaps': heatmaps,  # Add heatmaps
                'openai_analysis': {
                    'reasoning': analysis_result.get('reasoning', response_text),
                    'artifacts_detected': analysis_result.get('artifacts_detected', []),
                    'confidence_factors': analysis_result.get('confidence_factors', []),
                    'detailed_scores': {
                        'border_quality': analysis_result.get('border_quality', 0.7),
                        'edge_uniformity': analysis_result.get('edge_uniformity', 0.7),
                        'lighting_consistency': analysis_result.get('lighting_consistency', 0.7),
                        'skin_texture_score': analysis_result.get('skin_texture_score', 0.7),
                        'facial_symmetry_score': analysis_result.get('facial_symmetry_score', 0.7)
                    },
                    'raw_response': response_text
                },
                'model_info': {
                    'models_used': ['openai_gpt4_vision'],
                    'model_name': self.model
                }
            }
            
            logger.info(f"OpenAI analysis complete: {prediction} ({confidence_percent:.1f}% confidence)")
            
            return confidence_percent, prediction, details
            
        except Exception as e:
            logger.error(f"Error in OpenAI image detection: {e}")
            # Return default result with basic structure
            face_features = self._extract_comprehensive_face_features(image_path)
            details = {
                'error': str(e),
                'face_features': face_features,
                'model_info': {
                    'models_used': [],
                    'error': f'OpenAI detection failed: {str(e)}'
                }
            }
            return 50.0, 'UNKNOWN', details
    
    def _generate_heatmaps_from_scores(self, image_path: str, analysis_result: Dict, 
                                       face_features: Dict, prediction: str) -> Dict:
        """Generate heatmaps based on analysis scores"""
        try:
            from heatmap_utils import apply_colormap, overlay_heatmap
            import base64
            from PIL import Image
            from io import BytesIO
            
            image = cv2.imread(image_path)
            if image is None:
                return {}
            
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            h, w = rgb_image.shape[:2]
            
            heatmaps = {}
            
            # Get scores
            border_quality = float(analysis_result.get('border_quality', 0.7))
            edge_uniformity = float(analysis_result.get('edge_uniformity', 0.7))
            lighting_consistency = float(analysis_result.get('lighting_consistency', 0.7))
            skin_texture_score = float(analysis_result.get('skin_texture_score', 0.7))
            
            # Create heatmap based on face region if available
            face_region_dict = face_features.get('face_region', {})
            if face_region_dict and face_features.get('face_detected', False):
                top = face_region_dict.get('top', 0)
                left = face_region_dict.get('left', 0)
                bottom = face_region_dict.get('bottom', h)
                right = face_region_dict.get('right', w)
                
                # Create synthetic heatmap based on scores
                # Lower scores = more suspicious = higher heatmap values
                suspicious_score = 1.0 - ((border_quality + edge_uniformity + lighting_consistency + skin_texture_score) / 4.0)
                
                # Create heatmap: suspicious areas (low scores) = high values
                heatmap = np.zeros((h, w), dtype=np.float32)
                
                # Focus on face region
                if bottom > top and right > left:
                    face_heat = suspicious_score
                    # Create gradient from center of face
                    center_y = (top + bottom) // 2
                    center_x = (left + right) // 2
                    
                    for y in range(h):
                        for x in range(w):
                            if top <= y < bottom and left <= x < right:
                                # Distance from center
                                dist_y = abs(y - center_y) / max((bottom - top) / 2, 1)
                                dist_x = abs(x - center_x) / max((right - left) / 2, 1)
                                dist = np.sqrt(dist_y**2 + dist_x**2)
                                
                                # Higher values near center, lower at edges
                                heatmap[y, x] = face_heat * (1.0 - min(dist, 1.0))
                            else:
                                # Lower values outside face
                                heatmap[y, x] = suspicious_score * 0.3
                else:
                    # If no face region, use uniform suspicious score
                    heatmap.fill(suspicious_score * 0.5)
                
                # Normalize to 0-1
                if heatmap.max() > heatmap.min():
                    heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min())
                
                # Create overlay
                overlay_img = overlay_heatmap(rgb_image, heatmap, alpha=0.65, threshold=0.3, binary=True)
                
                # Convert to base64
                pil_img = Image.fromarray(overlay_img)
                buffer = BytesIO()
                pil_img.save(buffer, format='PNG')
                img_str = base64.b64encode(buffer.getvalue()).decode()
                
                # Normalize heatmap for storage (0-255)
                heatmap_normalized = ((heatmap - heatmap.min()) / (heatmap.max() - heatmap.min() + 1e-8) * 255).astype(np.uint8)
                
                heatmaps['openai_gpt4_vision'] = {
                    'heatmap_data': heatmap_normalized.tolist(),
                    'shape': list(heatmap.shape),
                    'model': 'openai_gpt4_vision',
                    'prediction': prediction,
                    'image_data': f'data:image/png;base64,{img_str}',
                    'description': f'OpenAI GPT-4 Vision Analysis Heatmap - RED regions show areas of concern, BLUE regions show natural/authentic areas'
                }
                
                logger.info(f"Generated heatmap with suspicious score: {suspicious_score:.2f}")
            else:
                logger.warning("No face region found, skipping heatmap generation")
            
            return heatmaps
            
        except Exception as e:
            logger.error(f"Error generating heatmaps: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return {}
    
    def _parse_text_response(self, text: str) -> Dict:
        """Parse text response when JSON parsing fails"""
        result = {
            'prediction': 'UNKNOWN',
            'confidence': 0.5,
            'reasoning': text,
            'artifacts_detected': [],
            'confidence_factors': [],
            'border_quality': 0.7,
            'edge_uniformity': 0.7,
            'lighting_consistency': 0.7,
            'skin_texture_score': 0.7,
            'facial_symmetry_score': 0.7
        }
        
        # Try to extract prediction
        text_upper = text.upper()
        if 'FAKE' in text_upper or 'DEEPFAKE' in text_upper or 'SYNTHETIC' in text_upper:
            result['prediction'] = 'FAKE'
        elif 'REAL' in text_upper or 'AUTHENTIC' in text_upper or 'GENUINE' in text_upper:
            result['prediction'] = 'REAL'
        
        # Try to extract confidence
        import re
        confidence_match = re.search(r'confidence[:\s]+([0-9.]+)', text, re.IGNORECASE)
        if confidence_match:
            try:
                conf = float(confidence_match.group(1))
                if conf > 1.0:
                    conf = conf / 100.0
                result['confidence'] = conf
            except ValueError:
                pass
        
        # Try to extract scores from text
        score_patterns = {
            'border_quality': r'border[_\s]?quality[:\s]+([0-9.]+)',
            'edge_uniformity': r'edge[_\s]?uniformity[:\s]+([0-9.]+)',
            'lighting_consistency': r'lighting[_\s]?consistency[:\s]+([0-9.]+)',
            'skin_texture_score': r'skin[_\s]?texture[:\s]+([0-9.]+)',
            'facial_symmetry_score': r'facial[_\s]?symmetry[:\s]+([0-9.]+)'
        }
        
        for key, pattern in score_patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    score = float(match.group(1))
                    if score > 1.0:
                        score = score / 100.0
                    result[key] = score
                except ValueError:
                    pass
        
        return result

