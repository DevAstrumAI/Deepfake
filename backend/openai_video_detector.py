"""
OpenAI-based Video Deepfake Detection System
Uses GPT-4 Vision API to analyze video frames
"""

import os
import base64
import logging
import tempfile
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import cv2
import numpy as np
from openai import OpenAI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OpenAIVideoDeepfakeDetector:
    """
    Video deepfake detector using OpenAI GPT-4 Vision API
    Analyzes key frames from the video
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the OpenAI video detector"""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        self.client = OpenAI(api_key=self.api_key)
        self.model = "gpt-4o"
        
        # Analysis parameters
        self.max_frames = 10  # Analyze up to 10 frames
        self.frame_interval = 2  # Analyze every 2nd frame
        
        logger.info("OpenAI Video Deepfake Detector initialized")
    
    def _get_video_info(self, video_path: str) -> Dict:
        """Get video information"""
        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return {}
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            duration = frame_count / fps if fps > 0 else 0
            
            cap.release()
            
            return {
                'fps': float(fps),
                'frame_count': frame_count,
                'width': width,
                'height': height,
                'duration': float(duration)
            }
        except Exception as e:
            logger.error(f"Error getting video info: {e}")
            return {}
    
    def _extract_frames(self, video_path: str) -> List[Dict]:
        """Extract frames from video for analysis"""
        frames_data = []
        
        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                logger.error(f"Could not open video: {video_path}")
                return frames_data
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            frame_number = 0
            extracted_count = 0
            
            while cap.isOpened() and extracted_count < self.max_frames:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Extract frame at intervals
                if frame_number % self.frame_interval == 0:
                    # Save frame to temporary file
                    temp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
                    cv2.imwrite(temp_file.name, frame)
                    
                    frames_data.append({
                        'frame_number': frame_number,
                        'timestamp': frame_number / fps if fps > 0 else 0,
                        'file_path': temp_file.name
                    })
                    
                    extracted_count += 1
                
                frame_number += 1
            
            cap.release()
            logger.info(f"Extracted {len(frames_data)} frames from video")
            
        except Exception as e:
            logger.error(f"Error extracting frames: {e}")
        
        return frames_data
    
    def _encode_image_to_base64(self, image_path: str) -> str:
        """Encode image to base64"""
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            logger.error(f"Error encoding image: {e}")
            raise
    
    def _analyze_frame_with_openai(self, frame_path: str, frame_number: int) -> Dict:
        """Analyze a single frame with OpenAI"""
        try:
            base64_image = self._encode_image_to_base64(frame_path)
            
            prompt = f"""Analyze this video frame (frame {frame_number}) comprehensively for signs of deepfake or AI-generated content. Provide detailed metrics.

Analyze and provide scores (0.0-1.0) for:
1. Border Quality: Blur artifacts around face boundaries (0.0 = very blurry, 1.0 = sharp)
2. Edge Uniformity: Edge consistency (0.0 = inconsistent, 1.0 = uniform)
3. Lighting Consistency: Lighting uniformity (0.0 = inconsistent, 1.0 = uniform)
4. Skin Texture: Skin texture naturalness (0.0 = unnatural, 1.0 = natural)
5. Facial Symmetry: Face symmetry (0.0 = asymmetric, 1.0 = symmetric)
6. Overall Artifacts: List specific artifacts

Respond with JSON:
{{
  "prediction": "REAL" or "FAKE",
  "confidence": 0.0-1.0,
  "reasoning": "Provide a comprehensive, detailed explanation (3-5 sentences) explaining WHY you determined this video frame is REAL or FAKE. Describe specific visual evidence you observed, such as: unnatural skin texture, inconsistent lighting patterns, blurry edges, artifacts around facial features, temporal inconsistencies, or any other indicators. Be specific about what you see that led to your conclusion. This explanation should help users understand the reasoning behind the detection.",
  "border_quality": 0.0-1.0,
  "edge_uniformity": 0.0-1.0,
  "lighting_consistency": 0.0-1.0,
  "skin_texture_score": 0.0-1.0,
  "facial_symmetry_score": 0.0-1.0,
  "artifacts": ["list of detected artifacts"]
}}"""
            
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
                max_tokens=500,
                temperature=0.3
            )
            
            response_text = response.choices[0].message.content
            
            # Parse response
            import json
            import re
            
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                try:
                    analysis = json.loads(json_match.group())
                except json.JSONDecodeError:
                    analysis = self._parse_text_response(response_text)
            else:
                analysis = self._parse_text_response(response_text)
            
            prediction = analysis.get('prediction', 'UNKNOWN').upper()
            if 'REAL' in prediction or 'AUTHENTIC' in prediction:
                prediction = 'REAL'
            elif 'FAKE' in prediction or 'DEEPFAKE' in prediction:
                prediction = 'FAKE'
            else:
                prediction = 'UNKNOWN'
            
            confidence = float(analysis.get('confidence', 0.5))
            
            return {
                'frame_number': frame_number,
                'prediction': prediction,
                'confidence': confidence,
                'reasoning': analysis.get('reasoning', response_text),
                'artifacts': analysis.get('artifacts', []),
                'border_quality': float(analysis.get('border_quality', 0.7)),
                'edge_uniformity': float(analysis.get('edge_uniformity', 0.7)),
                'lighting_consistency': float(analysis.get('lighting_consistency', 0.7)),
                'skin_texture_score': float(analysis.get('skin_texture_score', 0.7)),
                'facial_symmetry_score': float(analysis.get('facial_symmetry_score', 0.7))
            }
            
        except Exception as e:
            logger.error(f"Error analyzing frame {frame_number}: {e}")
            return {
                'frame_number': frame_number,
                'prediction': 'UNKNOWN',
                'confidence': 0.5,
                'error': str(e)
            }
    
    def _parse_text_response(self, text: str) -> Dict:
        """Parse text response"""
        result = {
            'prediction': 'UNKNOWN',
            'confidence': 0.5,
            'reasoning': text,
            'artifacts': [],
            'border_quality': 0.7,
            'edge_uniformity': 0.7,
            'lighting_consistency': 0.7,
            'skin_texture_score': 0.7,
            'facial_symmetry_score': 0.7
        }
        
        text_upper = text.upper()
        if 'FAKE' in text_upper or 'DEEPFAKE' in text_upper:
            result['prediction'] = 'FAKE'
        elif 'REAL' in text_upper or 'AUTHENTIC' in text_upper:
            result['prediction'] = 'REAL'
        
        import re
        conf_match = re.search(r'confidence[:\s]+([0-9.]+)', text, re.IGNORECASE)
        if conf_match:
            try:
                conf = float(conf_match.group(1))
                if conf > 1.0:
                    conf = conf / 100.0
                result['confidence'] = conf
            except ValueError:
                pass
        
        # Try to extract scores
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
    
    def detect_video_deepfake(self, video_path: str) -> Dict:
        """
        Detect deepfake in video using OpenAI
        
        Args:
            video_path: Path to video file
            
        Returns:
            Dictionary with analysis results
        """
        try:
            logger.info(f"Analyzing video with OpenAI: {video_path}")
            
            # Get video info
            video_info = self._get_video_info(video_path)
            
            # Extract frames
            frames_data = self._extract_frames(video_path)
            
            if not frames_data:
                return {
                    'error': 'Could not extract frames from video',
                    'video_info': video_info
                }
            
            # Analyze each frame
            frame_results = []
            fake_count = 0
            real_count = 0
            total_confidence = 0.0
            
            for frame_data in frames_data:
                frame_result = self._analyze_frame_with_openai(
                    frame_data['file_path'],
                    frame_data['frame_number']
                )
                
                frame_result['timestamp'] = frame_data['timestamp']
                
                # Extract detailed scores from frame_result
                artifacts = frame_result.get('artifacts', [])
                border_quality = float(frame_result.get('border_quality', 0.7))
                edge_uniformity = float(frame_result.get('edge_uniformity', 0.7))
                lighting_consistency = float(frame_result.get('lighting_consistency', 0.7))
                skin_texture_score = float(frame_result.get('skin_texture_score', 0.7))
                facial_symmetry_score = float(frame_result.get('facial_symmetry_score', 0.7))
                
                # Add comprehensive details structure
                frame_result['details'] = {
                    'model_predictions': {'openai_gpt4_vision': frame_result['prediction']},
                    'model_confidences': {'openai_gpt4_vision': frame_result['confidence']},
                    'face_features': {
                        'face_detected': False,
                        'face_confidence': 0.0,
                        'artifact_analysis': {
                            'border_analysis': {
                                'border_quality': border_quality
                            },
                            'edge_analysis': {
                                'edge_uniformity': edge_uniformity
                            },
                            'texture_analysis': {
                                'texture_consistency': skin_texture_score
                            },
                            'lighting_analysis': {
                                'brightness_uniformity': lighting_consistency
                            }
                        },
                        'forensic_analysis': {
                            'lighting_analysis': {
                                'brightness_uniformity': lighting_consistency
                            },
                            'skin_analysis': {
                                'skin_naturalness': skin_texture_score
                            },
                            'symmetry_analysis': {
                                'face_symmetry': facial_symmetry_score
                            }
                        }
                    },
                    'openai_analysis': {
                        'reasoning': frame_result.get('reasoning', ''),
                        'artifacts': artifacts,
                        'detailed_scores': {
                            'border_quality': border_quality,
                            'edge_uniformity': edge_uniformity,
                            'lighting_consistency': lighting_consistency,
                            'skin_texture_score': skin_texture_score,
                            'facial_symmetry_score': facial_symmetry_score
                        }
                    }
                }
                
                frame_results.append(frame_result)
                
                if frame_result['prediction'] == 'FAKE':
                    fake_count += 1
                elif frame_result['prediction'] == 'REAL':
                    real_count += 1
                
                total_confidence += frame_result['confidence']
                
                # Clean up temporary file
                try:
                    os.unlink(frame_data['file_path'])
                except:
                    pass
            
            # Calculate overall prediction
            if fake_count > real_count:
                overall_prediction = 'FAKE'
            elif real_count > fake_count:
                overall_prediction = 'REAL'
            else:
                overall_prediction = 'UNKNOWN'
            
            overall_confidence = total_confidence / len(frame_results) if frame_results else 0.5
            
            # Calculate video score
            video_score = {
                'overall_score': overall_confidence,
                'fake_ratio': fake_count / len(frame_results) if frame_results else 0,
                'real_ratio': real_count / len(frame_results) if frame_results else 0
            }
            
            # Frame analysis summary
            frame_analysis = {
                'total_frames_analyzed': len(frame_results),
                'fake_frames': fake_count,
                'real_frames': real_count,
                'frame_results': frame_results
            }
            
            results = {
                'prediction': overall_prediction,
                'confidence': overall_confidence * 100,
                'video_info': video_info,
                'frame_analysis': frame_analysis,
                'video_score': video_score,
                'model_info': {
                    'models_used': ['openai_gpt4_vision'],
                    'model_name': self.model,
                    'frames_analyzed': len(frame_results)
                }
            }
            
            logger.info(f"Video analysis complete: {overall_prediction} ({overall_confidence * 100:.1f}% confidence)")
            
            return results
            
        except Exception as e:
            logger.error(f"Error in video detection: {e}")
            return {
                'error': str(e),
                'prediction': 'UNKNOWN',
                'confidence': 50.0
            }

