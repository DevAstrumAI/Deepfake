"""
PDF Report Generator with LLM Integration
Generates detailed, layman-friendly PDF reports for deepfake detection analysis
"""

import os
import json
import re
from datetime import datetime
from typing import Dict, Optional
from pathlib import Path
import logging
import requests

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

logger = logging.getLogger(__name__)

# Try to import ollama, fallback to requests if not available
OLLAMA_AVAILABLE = False
try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    pass  # Will use HTTP requests instead

class PDFReportGenerator:
    """Generate detailed PDF reports with LLM-enhanced explanations"""
    
    def __init__(self):
        self.ollama_available = OLLAMA_AVAILABLE
        self.ollama_model = "llama3.2"  # Default model, can be changed
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        
    def _call_llm(self, prompt: str, max_retries: int = 3) -> Optional[str]:
        """Call LLM to generate explanations"""
        # Try using ollama package if available
        if self.ollama_available:
            try:
                response = ollama.generate(
                    model=self.ollama_model,
                    prompt=prompt,
                    options={
                        "temperature": 0.7,
                        "top_p": 0.9,
                    }
                )
                return response.get("response", "")
            except Exception as e:
                logger.warning(f"Ollama call failed: {e}, trying HTTP fallback")
        
        # Fallback to HTTP (works even if ollama package not installed)
        try:
            response = requests.post(
                f"{self.ollama_base_url}/api/generate",
                json={
                    "model": self.ollama_model,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=60
            )
            if response.status_code == 200:
                return response.json().get("response", "")
        except Exception as e:
            logger.warning(f"Ollama HTTP request failed: {e}")
        
        return None
    
    def _generate_layman_explanation(self, analysis_result: Dict, file_type: str) -> str:
        """Generate layman-friendly explanation using LLM"""
        
        # Extract key information
        prediction = analysis_result.get('prediction', 'UNKNOWN')
        confidence = analysis_result.get('confidence', 0.0)
        details = analysis_result.get('details', {})
        
        # Create prompt for LLM
        prompt = f"""You are an expert in deepfake detection explaining results to a non-technical person.

Analysis Results:
- File Type: {file_type}
- Prediction: {prediction}
- Confidence: {confidence:.1f}%

Technical Details (simplify these for the user):
{json.dumps(details, indent=2)[:1000]}

Please provide a clear, easy-to-understand explanation that:
1. Explains what a deepfake is in simple terms
2. Describes what was analyzed (image/video/audio)
3. Explains the prediction result ({prediction}) and what it means
4. Explains the confidence level ({confidence:.1f}%) in simple terms
5. Describes the key indicators that led to this conclusion
6. Provides context about what this means for the user

Write in a friendly, conversational tone. Avoid technical jargon. Keep it to 3-4 paragraphs maximum.
"""
        
        explanation = self._call_llm(prompt)
        
        # Fallback to template-based explanation if LLM fails
        if not explanation:
            explanation = self._generate_fallback_explanation(analysis_result, file_type)
        
        return explanation
    
    def _generate_fallback_explanation(self, analysis_result: Dict, file_type: str) -> str:
        """Generate explanation without LLM (fallback)"""
        prediction = analysis_result.get('prediction', 'UNKNOWN')
        confidence = analysis_result.get('confidence', 0.0)
        
        prediction_text = "likely authentic" if prediction == "REAL" else "likely a deepfake or manipulated"
        confidence_text = "very confident" if confidence > 80 else "moderately confident" if confidence > 60 else "somewhat uncertain"
        
        explanation = f"""
This report analyzes a {file_type} file to determine if it contains deepfake content. Deepfakes are artificially created or manipulated media that use artificial intelligence to make it appear as if someone said or did something they didn't.

Our analysis indicates that this {file_type} is {prediction_text}. The system is {confidence_text} about this conclusion (confidence level: {confidence:.1f}%).

The analysis examined various technical characteristics of the {file_type}, including visual artifacts, audio patterns, and other indicators that can reveal manipulation. These indicators help distinguish between authentic media and AI-generated or altered content.

Please note that while this analysis provides valuable insights, no detection system is 100% accurate. If you have concerns about the authenticity of this media, consider consulting additional experts or sources.
"""
        
        return explanation
    
    def _generate_detailed_analysis_section(self, analysis_result: Dict, file_type: str) -> str:
        """Generate detailed analysis section using LLM"""
        details = analysis_result.get('details', {})
        prediction = analysis_result.get('prediction', 'UNKNOWN')
        confidence = analysis_result.get('confidence', 0.0)
        
        # Create a comprehensive summary of all analysis data for the LLM
        analysis_summary = self._extract_analysis_summary(analysis_result, file_type)
        
        prompt = f"""You are an expert explaining deepfake detection results to a non-technical person.

Analysis Summary:
- File Type: {file_type}
- Prediction: {prediction}
- Confidence: {confidence:.1f}%

Detailed Technical Data:
{analysis_summary}

Provide a comprehensive, detailed explanation (6-8 paragraphs) that covers:

1. **What was analyzed**: Explain what aspects of the {file_type} were examined
2. **Specific findings**: Describe the specific indicators, measurements, and patterns that were detected
3. **What each finding means**: Explain in simple terms what each indicator reveals about authenticity
4. **How findings support the conclusion**: Connect the specific findings to why the system concluded "{prediction}"
5. **Notable patterns**: Highlight any particularly strong or weak indicators
6. **Confidence explanation**: Explain what the {confidence:.1f}% confidence level means in practical terms
7. **Context and limitations**: Provide context about what this analysis can and cannot determine

Write in clear, conversational language. Avoid jargon. Make it detailed and thorough. Use specific numbers and findings from the data.
"""
        
        detailed_analysis = self._call_llm(prompt)
        
        if not detailed_analysis:
            # Fallback - use comprehensive fallback
            detailed_analysis = self._generate_fallback_detailed_analysis(analysis_result, file_type)
        
        return detailed_analysis
    
    def _extract_analysis_summary(self, analysis_result: Dict, file_type: str) -> str:
        """Extract and format analysis data into a readable summary"""
        details = analysis_result.get('details', {})
        prediction = analysis_result.get('prediction', 'UNKNOWN')
        confidence = analysis_result.get('confidence', 0.0)
        
        summary_parts = []
        
        if file_type == 'image':
            # Model predictions
            if 'model_predictions' in details:
                model_preds = details.get('model_predictions', {})
                summary_parts.append(f"Model Predictions: {json.dumps(model_preds, indent=2)}")
            
            # Forensic features
            if 'forensic_features' in details:
                forensic = details.get('forensic_features', {})
                summary_parts.append(f"Forensic Analysis: {json.dumps(forensic, indent=2)[:500]}")
            
            # Face analysis
            if 'face_analysis' in details:
                face = details.get('face_analysis', {})
                summary_parts.append(f"Face Analysis: {json.dumps(face, indent=2)[:500]}")
            
            # Texture analysis
            if 'texture_analysis' in details:
                texture = details.get('texture_analysis', {})
                summary_parts.append(f"Texture Analysis: {json.dumps(texture, indent=2)[:500]}")
        
        elif file_type == 'video':
            # Frame analysis
            if 'frame_analysis' in details:
                frame_info = details.get('frame_analysis', {})
                total_frames = frame_info.get('total_frames', 0)
                fake_frames = frame_info.get('fake_frames', 0)
                real_frames = frame_info.get('real_frames', 0)
                summary_parts.append(f"Frame Analysis: {total_frames} total frames, {fake_frames} flagged as fake, {real_frames} as real")
                
                # Frame results sample
                frame_results = frame_info.get('frame_results', [])
                if frame_results:
                    sample_frames = frame_results[:5]  # First 5 frames
                    summary_parts.append(f"Sample Frame Results: {json.dumps(sample_frames, indent=2)[:800]}")
            
            # Video score
            if 'video_score' in details:
                video_score = details.get('video_score', {})
                summary_parts.append(f"Video Score: {json.dumps(video_score, indent=2)[:500]}")
        
        elif file_type == 'audio':
            # Model predictions
            if 'model_predictions' in details:
                model_preds = details.get('model_predictions', {})
                model_confs = details.get('model_confidences', {})
                summary_parts.append(f"Model Predictions: {json.dumps(model_preds, indent=2)}")
                summary_parts.append(f"Model Confidences: {json.dumps(model_confs, indent=2)}")
            
            # Comprehensive features
            if 'comprehensive_features' in details:
                features = details.get('comprehensive_features', {})
                # Extract key features
                key_features = {
                    'energy_mean': features.get('energy_mean'),
                    'zcr_mean': features.get('zcr_mean'),
                    'f0_mean': features.get('f0_mean'),
                    'spectral_centroid_mean': features.get('spectral_centroid_mean'),
                    'mfcc_features': 'present' if 'mfcc_features' in features else 'not present'
                }
                summary_parts.append(f"Audio Features: {json.dumps(key_features, indent=2)}")
            
            # Deepfake indicators
            if 'deepfake_indicators' in details:
                indicators = details.get('deepfake_indicators', {})
                summary_parts.append(f"Deepfake Indicators: {json.dumps(indicators, indent=2)}")
            
            # Preprocessing info
            if 'preprocessing_info' in details:
                preprocess = details.get('preprocessing_info', {})
                summary_parts.append(f"Audio Properties: Duration={preprocess.get('duration', 0):.2f}s, Sample Rate={preprocess.get('sample_rate', 0)}Hz")
        
        # Model info
        if 'model_info' in analysis_result:
            model_info = analysis_result.get('model_info', {})
            models_used = model_info.get('models_used', [])
            if models_used:
                summary_parts.append(f"AI Models Used: {', '.join(models_used)}")
        
        return "\n\n".join(summary_parts)
    
    def _generate_fallback_detailed_analysis(self, analysis_result: Dict, file_type: str) -> str:
        """Generate comprehensive fallback detailed analysis without LLM"""
        details = analysis_result.get('details', {})
        prediction = analysis_result.get('prediction', 'UNKNOWN')
        confidence = analysis_result.get('confidence', 0.0)
        
        text_parts = []
        
        # Introduction
        text_parts.append(
            f"This comprehensive analysis examined the {file_type} using multiple advanced detection techniques. "
            f"The system analyzed various technical characteristics to determine whether the content is authentic or has been manipulated. "
            f"Based on the examination, the content was classified as {prediction} with a confidence level of {confidence:.1f}%."
        )
        
        if file_type == 'image':
            text_parts.append("\n**Image Analysis Details:**\n")
            
            # Model predictions
            if 'model_predictions' in details:
                model_preds = details.get('model_predictions', {})
                text_parts.append(
                    f"The analysis employed multiple AI models to examine the image. Each model independently assessed the content: "
                )
                for model, pred in model_preds.items():
                    model_name = model.replace('_', ' ').title()
                    text_parts.append(f"• {model_name} model: Predicted {pred}")
            
            # Forensic features
            if 'forensic_features' in details:
                forensic = details.get('forensic_features', {})
                text_parts.append(
                    "\n**Forensic Analysis:**\n"
                    "The forensic examination looked for digital artifacts and inconsistencies that often appear in manipulated images. "
                    "This includes analyzing compression patterns, noise characteristics, and pixel-level anomalies that can reveal editing or AI generation."
                )
                if isinstance(forensic, dict):
                    for key, value in list(forensic.items())[:5]:  # First 5 features
                        if isinstance(value, (int, float)):
                            feature_name = key.replace('_', ' ').title()
                            text_parts.append(f"• {feature_name}: {value:.4f}")
            
            # Face analysis
            if 'face_analysis' in details:
                face = details.get('face_analysis', {})
                text_parts.append(
                    "\n**Facial Feature Analysis:**\n"
                    "The system examined facial features, proportions, and symmetry. Authentic images typically show natural variations "
                    "and consistent lighting, while manipulated images may show subtle inconsistencies in facial geometry, skin texture, or lighting patterns."
                )
                if isinstance(face, dict):
                    for key, value in list(face.items())[:5]:
                        if isinstance(value, (int, float)):
                            feature_name = key.replace('_', ' ').title()
                            text_parts.append(f"• {feature_name}: {value:.4f}")
            
            # Texture analysis
            if 'texture_analysis' in details:
                texture = details.get('texture_analysis', {})
                text_parts.append(
                    "\n**Texture and Quality Analysis:**\n"
                    "Image texture patterns were analyzed to detect inconsistencies. Natural images have consistent texture patterns, "
                    "while AI-generated or heavily edited images may show unusual texture patterns or quality variations."
                )
        
        elif file_type == 'video':
            text_parts.append("\n**Video Analysis Details:**\n")
            
            if 'frame_analysis' in details:
                frame_info = details.get('frame_analysis', {})
                total_frames = frame_info.get('total_frames', 0)
                fake_frames = frame_info.get('fake_frames', 0)
                real_frames = frame_info.get('real_frames', 0)
                fake_percentage = (fake_frames / total_frames * 100) if total_frames > 0 else 0
                
                text_parts.append(
                    f"The video was analyzed frame-by-frame to detect any manipulation. Out of {total_frames} total frames examined, "
                    f"{fake_frames} frames ({fake_percentage:.1f}%) showed signs of manipulation, while {real_frames} frames appeared authentic. "
                    f"This frame-by-frame analysis allows the system to detect deepfakes that may only affect certain portions of the video."
                )
                
                # Frame results details
                frame_results = frame_info.get('frame_results', [])
                if frame_results:
                    text_parts.append(
                        "\n**Frame-by-Frame Assessment:**\n"
                        "Each frame was individually analyzed for signs of manipulation. The system looked for:"
                    )
                    text_parts.append("• Inconsistencies in facial features across frames")
                    text_parts.append("• Unusual lighting or shadow patterns")
                    text_parts.append("• Texture and quality variations")
                    text_parts.append("• Compression artifacts that suggest editing")
                    
                    # Show sample frame confidences
                    sample_frames = frame_results[:10]
                    if sample_frames:
                        avg_confidence = sum(f.get('confidence', 0) for f in sample_frames) / len(sample_frames) if sample_frames else 0
                        text_parts.append(
                            f"\nThe average confidence across sampled frames was {avg_confidence:.1f}%, indicating "
                            f"{'strong' if avg_confidence > 70 else 'moderate' if avg_confidence > 50 else 'uncertain'} evidence of manipulation."
                        )
            
            # Video score
            if 'video_score' in details:
                video_score = details.get('video_score', {})
                if isinstance(video_score, dict):
                    text_parts.append(
                        "\n**Overall Video Assessment:**\n"
                        "The system calculated an overall video score based on the frame analysis and other video characteristics."
                    )
        
        elif file_type == 'audio':
            text_parts.append("\n**Audio Analysis Details:**\n")
            
            # Model predictions
            if 'model_predictions' in details:
                model_preds = details.get('model_predictions', {})
                model_confs = details.get('model_confidences', {})
                
                text_parts.append(
                    "The audio was analyzed using multiple specialized AI models, each trained to detect different types of audio manipulation:"
                )
                
                for model, pred in model_preds.items():
                    model_name = model.upper() if model in ['aasist', 'rawnet2'] else model.replace('_', ' ').title()
                    conf = model_confs.get(model, 0) * 100 if model in model_confs else 0
                    pred_text = "FAKE" if pred == 1 else "REAL"
                    text_parts.append(f"• {model_name} model: Predicted {pred_text} with {conf:.1f}% confidence")
            
            # Comprehensive features
            if 'comprehensive_features' in details:
                features = details.get('comprehensive_features', {})
                text_parts.append(
                    "\n**Audio Feature Analysis:**\n"
                    "The system extracted and analyzed various audio characteristics that can reveal manipulation:"
                )
                
                if 'energy_mean' in features:
                    energy = features.get('energy_mean', 0)
                    text_parts.append(
                        f"• Audio Energy: {energy:.4f} - This measures the overall loudness and intensity of the audio. "
                        f"{'Normal' if 0.05 < energy < 0.2 else 'Unusually high' if energy > 0.2 else 'Unusually low'} energy levels may indicate manipulation."
                    )
                
                if 'zcr_mean' in features:
                    zcr = features.get('zcr_mean', 0)
                    text_parts.append(
                        f"• Zero Crossing Rate: {zcr:.4f} - This measures how often the audio signal crosses zero, indicating speech patterns. "
                        f"{'Natural' if 0.05 < zcr < 0.15 else 'Unusual'} patterns may suggest artificial generation."
                    )
                
                if 'f0_mean' in features:
                    f0 = features.get('f0_mean', 0)
                    text_parts.append(
                        f"• Fundamental Frequency (Pitch): {f0:.1f} Hz - This represents the pitch of the voice. "
                        f"Unusual pitch patterns can indicate voice synthesis or manipulation."
                    )
                
                if 'spectral_centroid_mean' in features:
                    spec = features.get('spectral_centroid_mean', 0)
                    text_parts.append(
                        f"• Spectral Centroid: {spec:.1f} Hz - This measures the 'brightness' of the audio. "
                        f"Natural speech typically falls within expected ranges."
                    )
            
            # Deepfake indicators
            if 'deepfake_indicators' in details:
                indicators = details.get('deepfake_indicators', {})
                if indicators:
                    text_parts.append(
                        "\n**Deepfake Indicators:**\n"
                        "The system identified specific indicators that suggest audio manipulation:"
                    )
                    for indicator, value in list(indicators.items())[:5]:
                        if isinstance(value, (int, float)):
                            indicator_name = indicator.replace('_', ' ').title()
                            severity = "High" if value > 0.7 else "Medium" if value > 0.4 else "Low"
                            text_parts.append(f"• {indicator_name}: {value:.3f} ({severity} concern)")
            
            # Preprocessing info
            if 'preprocessing_info' in details:
                preprocess = details.get('preprocessing_info', {})
                duration = preprocess.get('duration', 0)
                sample_rate = preprocess.get('sample_rate', 0)
                text_parts.append(
                    f"\n**Audio Properties:**\n"
                    f"The analyzed audio had a duration of {duration:.2f} seconds and was sampled at {sample_rate} Hz. "
                    f"These properties were used to ensure proper analysis and feature extraction."
                )
        
        # Model info
        if 'model_info' in analysis_result:
            model_info = analysis_result.get('model_info', {})
            models_used = model_info.get('models_used', [])
            if models_used:
                text_parts.append(
                    f"\n**Analysis Methods:**\n"
                    f"The following AI models and techniques were used: {', '.join(models_used)}. "
                    f"Using multiple models provides a more robust and reliable assessment."
                )
        
        # Conclusion
        text_parts.append(
            f"\n**Conclusion:**\n"
            f"Based on the comprehensive analysis of all these indicators, the system concluded that the {file_type} is {prediction} "
            f"with {confidence:.1f}% confidence. This confidence level indicates "
            f"{'very strong' if confidence > 80 else 'strong' if confidence > 60 else 'moderate' if confidence > 40 else 'weak'} "
            f"evidence supporting this conclusion. "
            f"{'The analysis found clear and consistent indicators' if confidence > 70 else 'The analysis found some indicators' if confidence > 50 else 'The analysis found limited indicators'} "
            f"that {f'support the {prediction} classification' if prediction != 'UNKNOWN' else 'suggest the content may be manipulated'}."
        )
        
        return "\n".join(text_parts)
    
    def _generate_technical_details(self, analysis_result: Dict, file_type: str) -> str:
        """Generate comprehensive technical details section"""
        try:
            details = analysis_result.get('details', {})
            if not details:
                return "No technical details available in the analysis results."
            
            tech_parts = []
            tech_parts.append("The following technical indicators and measurements were extracted and analyzed:")
            
            if file_type == 'image':
                tech_parts.append("\n**Model Predictions:**")
            if 'model_predictions' in details:
                model_preds = details.get('model_predictions', {})
                model_confs = details.get('model_confidences', {})
                for model, pred in model_preds.items():
                    model_name = model.replace('_', ' ').title()
                    conf = model_confs.get(model, 0) * 100 if model in model_confs else 0
                    pred_text = "FAKE" if pred == 1 else "REAL"
                    tech_parts.append(f"• {model_name}: {pred_text} (confidence: {conf:.2f}%)")
                # Ensemble confidence
                ensemble_conf_val = details.get('ensemble_confidence', 0)
                final_conf_val = details.get('final_confidence', 0)
                if isinstance(ensemble_conf_val, (int, float)):
                    ensemble_conf = ensemble_conf_val * 100
                    tech_parts.append(f"• Ensemble Confidence: {ensemble_conf:.2f}%")
                if isinstance(final_conf_val, (int, float)):
                    final_conf = final_conf_val * 100
                    tech_parts.append(f"• Final Confidence: {final_conf:.2f}%")
            else:
                tech_parts.append("• No model predictions available")
            
            # Extract face_features which contains all the analysis data
            face_features = details.get('face_features', {})
            if not face_features:
                face_features = {}
            
            tech_parts.append("\n**Forensic Features:**")
            forensic_analysis = face_features.get('forensic_analysis', {}) if face_features else {}
            if forensic_analysis and isinstance(forensic_analysis, dict):
                # Extract all forensic metrics
                if 'forensic_score' in forensic_analysis:
                    forensic_score = forensic_analysis.get('forensic_score', 0)
                    if isinstance(forensic_score, (int, float)):
                        tech_parts.append(f"• Forensic Score: {forensic_score:.6f}")
                    elif isinstance(forensic_score, dict):
                        tech_parts.append("• Forensic Score: (complex data structure)")
                        for key, value in list(forensic_score.items())[:5]:
                            if isinstance(value, (int, float)):
                                tech_parts.append(f"  - {key.replace('_', ' ').title()}: {value:.6f}")
                
                # Lighting analysis
                lighting = forensic_analysis.get('lighting_analysis', {})
                if lighting and isinstance(lighting, dict):
                    tech_parts.append("• Lighting Analysis:")
                    for key, value in lighting.items():
                        if isinstance(value, (int, float)):
                            feature_name = key.replace('_', ' ').title()
                            tech_parts.append(f"  - {feature_name}: {value:.6f}")
                
                # Skin analysis
                skin = forensic_analysis.get('skin_analysis', {})
                if skin and isinstance(skin, dict):
                    tech_parts.append("• Skin Texture Analysis:")
                    for key, value in skin.items():
                        if isinstance(value, (int, float)):
                            feature_name = key.replace('_', ' ').title()
                            tech_parts.append(f"  - {feature_name}: {value:.6f}")
                
                # Symmetry analysis
                symmetry = forensic_analysis.get('symmetry_analysis', {})
                if symmetry and isinstance(symmetry, dict):
                    tech_parts.append("• Facial Symmetry:")
                    for key, value in symmetry.items():
                        if isinstance(value, (int, float)):
                            feature_name = key.replace('_', ' ').title()
                            tech_parts.append(f"  - {feature_name}: {value:.6f}")
                
                # Edge analysis
                edge = forensic_analysis.get('edge_analysis', {})
                if edge and isinstance(edge, dict):
                    tech_parts.append("• Edge Consistency:")
                    for key, value in edge.items():
                        if isinstance(value, (int, float)):
                            feature_name = key.replace('_', ' ').title()
                            tech_parts.append(f"  - {feature_name}: {value:.6f}")
                
                # Frequency analysis
                frequency = forensic_analysis.get('frequency_analysis', {})
                if frequency and isinstance(frequency, dict):
                    tech_parts.append("• Frequency Domain Analysis:")
                    for key, value in frequency.items():
                        if isinstance(value, (int, float)):
                            feature_name = key.replace('_', ' ').title()
                            tech_parts.append(f"  - {feature_name}: {value:.6f}")
                
                # Any other forensic metrics
                for key, value in forensic_analysis.items():
                    if key not in ['lighting_analysis', 'skin_analysis', 'symmetry_analysis', 
                                  'edge_analysis', 'frequency_analysis', 'forensic_score', 
                                  'face_detected', 'face_region', 'error']:
                        if isinstance(value, (int, float)):
                            feature_name = key.replace('_', ' ').title()
                            tech_parts.append(f"• {feature_name}: {value:.6f}")
            else:
                tech_parts.append("• Forensic analysis was not performed or no data available")
            
            tech_parts.append("\n**Face Analysis:**")
            if face_features:
                # Face detection info
                face_detected = face_features.get('face_detected', False)
                tech_parts.append(f"• Face Detected: {'Yes' if face_detected else 'No'}")
                
                if face_detected:
                    face_region = face_features.get('face_region', {})
                    if face_region and isinstance(face_region, dict):
                        width = face_region.get('width', 0)
                        height = face_region.get('height', 0)
                        if isinstance(width, (int, float)):
                            tech_parts.append(f"• Face Region Width: {width} pixels")
                        if isinstance(height, (int, float)):
                            tech_parts.append(f"• Face Region Height: {height} pixels")
                    
                    face_confidence = face_features.get('face_confidence', 0)
                    if isinstance(face_confidence, (int, float)) and face_confidence:
                        tech_parts.append(f"• Face Detection Confidence: {face_confidence:.4f}")
                
                # Artifact analysis
                artifact_analysis = face_features.get('artifact_analysis', {})
                if artifact_analysis and isinstance(artifact_analysis, dict):
                    tech_parts.append("• Artifact Detection:")
                    
                    # Border analysis
                    border = artifact_analysis.get('border_analysis', {})
                    if border and isinstance(border, dict):
                        tech_parts.append("  - Border Analysis:")
                        for key, value in border.items():
                            if isinstance(value, (int, float)):
                                feature_name = key.replace('_', ' ').title()
                                tech_parts.append(f"    • {feature_name}: {value:.6f}")
                    
                    # Edge analysis
                    edge_art = artifact_analysis.get('edge_analysis', {})
                    if edge_art and isinstance(edge_art, dict):
                        tech_parts.append("  - Edge Analysis:")
                        for key, value in edge_art.items():
                            if isinstance(value, (int, float)):
                                feature_name = key.replace('_', ' ').title()
                                tech_parts.append(f"    • {feature_name}: {value:.6f}")
                    
                    # Lighting analysis
                    lighting_art = artifact_analysis.get('lighting_analysis', {})
                    if lighting_art and isinstance(lighting_art, dict):
                        tech_parts.append("  - Lighting Analysis:")
                        for key, value in lighting_art.items():
                            if isinstance(value, (int, float)):
                                feature_name = key.replace('_', ' ').title()
                                tech_parts.append(f"    • {feature_name}: {value:.6f}")
                    
                    # Texture analysis (in artifacts)
                    texture_art = artifact_analysis.get('texture_analysis', {})
                    if texture_art and isinstance(texture_art, dict):
                        tech_parts.append("  - Texture Analysis:")
                        for key, value in texture_art.items():
                            if isinstance(value, (int, float)):
                                feature_name = key.replace('_', ' ').title()
                                tech_parts.append(f"    • {feature_name}: {value:.6f}")
                
                # Face symmetry
                face_symmetry = face_features.get('face_symmetry', None)
                if face_symmetry is not None and isinstance(face_symmetry, (int, float)):
                    tech_parts.append(f"• Face Symmetry Score: {face_symmetry:.6f}")
                
                # Face size ratio
                face_size_ratio = face_features.get('face_size_ratio', None)
                if face_size_ratio is not None and isinstance(face_size_ratio, (int, float)):
                    tech_parts.append(f"• Face Size Ratio: {face_size_ratio:.6f}")
            else:
                tech_parts.append("• No face analysis data available")
            
            tech_parts.append("\n**Texture Analysis:**")
            # Check for texture in artifact_analysis
            artifact_analysis = face_features.get('artifact_analysis', {}) if face_features else {}
            texture_analysis = artifact_analysis.get('texture_analysis', {}) if artifact_analysis else {}
            
            # Look for texture-related features in face_features
            texture_keys = []
            texture_metrics = {}
            if face_features and isinstance(face_features, dict):
                try:
                    texture_keys = [k for k in face_features.keys() if 'texture' in k.lower()]
                    for key, value in face_features.items():
                        if 'texture' in key.lower() and isinstance(value, (int, float)):
                            texture_metrics[key] = value
                except Exception as e:
                    logger.warning(f"Error extracting texture features: {e}")
            
            # Display texture analysis from artifact_analysis
            if texture_analysis and isinstance(texture_analysis, dict):
                tech_parts.append("• Texture Pattern Analysis:")
                for key, value in texture_analysis.items():
                    if isinstance(value, (int, float)):
                        feature_name = key.replace('_', ' ').title()
                        tech_parts.append(f"  - {feature_name}: {value:.6f}")
                    elif isinstance(value, dict):
                        tech_parts.append(f"  - {key.replace('_', ' ').title()}:")
                        for sub_key, sub_value in value.items():
                            if isinstance(sub_value, (int, float)):
                                sub_name = sub_key.replace('_', ' ').title()
                                tech_parts.append(f"    • {sub_name}: {sub_value:.6f}")
            
            # Display texture metrics from face_features
            if texture_keys:
                for key in texture_keys:
                    if key not in texture_metrics:  # Avoid duplicates
                        value = face_features[key]
                        if isinstance(value, (int, float)):
                            feature_name = key.replace('_', ' ').title()
                            tech_parts.append(f"• {feature_name}: {value:.6f}")
            
            if texture_metrics:
                for key, value in texture_metrics.items():
                    feature_name = key.replace('_', ' ').title()
                    tech_parts.append(f"• {feature_name}: {value:.6f}")
            
            if not texture_analysis and not texture_keys and not texture_metrics:
                tech_parts.append("• Texture analysis was not performed or no data available")
            
            elif file_type == 'video':
                tech_parts.append("\n**Frame Analysis:**")
                if 'frame_analysis' in details:
                    frame_info = details.get('frame_analysis', {})
                    total_frames = frame_info.get('total_frames', 0)
                    fake_frames = frame_info.get('fake_frames', 0)
                    real_frames = frame_info.get('real_frames', 0)
                    tech_parts.append(f"• Total frames analyzed: {total_frames}")
                    tech_parts.append(f"• Frames flagged as fake: {fake_frames}")
                    tech_parts.append(f"• Frames flagged as real: {real_frames}")
                    tech_parts.append(f"• Fake frame percentage: {(fake_frames/total_frames*100) if total_frames > 0 else 0:.2f}%")
                    
                    frame_results = frame_info.get('frame_results', [])
                    if frame_results:
                        tech_parts.append(f"• Individual frame results: {len(frame_results)} frames analyzed")
                        # Show sample frame data
                        sample_frames = frame_results[:5]
                        for i, frame in enumerate(sample_frames, 1):
                            frame_pred = frame.get('prediction', 'UNKNOWN')
                            frame_conf = frame.get('confidence', 0)
                            if isinstance(frame_conf, (int, float)):
                                tech_parts.append(f"  - Frame {i}: {frame_pred} ({frame_conf:.1f}% confidence)")
                            else:
                                tech_parts.append(f"  - Frame {i}: {frame_pred}")
                else:
                    tech_parts.append("• No frame analysis data available")
                
                tech_parts.append("\n**Video Score:**")
                if 'video_score' in details:
                    video_score = details.get('video_score', {})
                    if isinstance(video_score, dict):
                        for key, value in video_score.items():
                            if isinstance(value, (int, float)):
                                score_name = key.replace('_', ' ').title()
                                tech_parts.append(f"• {score_name}: {value:.6f}")
                    else:
                        tech_parts.append(f"• Overall video score: {video_score}")
                else:
                    tech_parts.append("• No video score available")
            
            elif file_type == 'audio':
                tech_parts.append("\n**Model Predictions and Confidences:**")
                if 'model_predictions' in details:
                    model_preds = details.get('model_predictions', {})
                    model_confs = details.get('model_confidences', {})
                    for model, pred in model_preds.items():
                        model_name = model.upper() if model in ['aasist', 'rawnet2'] else model.replace('_', ' ').title()
                        conf = model_confs.get(model, 0) * 100 if model in model_confs else 0
                        pred_text = "FAKE" if pred == 1 else "REAL"
                        tech_parts.append(f"• {model_name}: {pred_text} (confidence: {conf:.2f}%)")
                else:
                    tech_parts.append("• No model predictions available")
                
                tech_parts.append("\n**Comprehensive Audio Features:**")
                if 'comprehensive_features' in details:
                    features = details.get('comprehensive_features', {})
                    if isinstance(features, dict) and features:
                        # Key audio features
                        key_features = [
                            'energy_mean', 'energy_std', 'zcr_mean', 'zcr_std',
                            'f0_mean', 'f0_std', 'spectral_centroid_mean', 'spectral_centroid_std',
                            'spectral_rolloff_mean', 'spectral_rolloff_std', 'mfcc_features'
                        ]
                        for feature in key_features:
                            if feature in features:
                                value = features[feature]
                                if isinstance(value, (int, float)):
                                    feature_name = feature.replace('_', ' ').title()
                                    tech_parts.append(f"• {feature_name}: {value:.6f}")
                                elif isinstance(value, (list, tuple)):
                                    feature_name = feature.replace('_', ' ').title()
                                    tech_parts.append(f"• {feature_name}: Array of {len(value)} values")
                        # Add any other features
                        for key, value in features.items():
                            if key not in key_features and isinstance(value, (int, float)):
                                feature_name = key.replace('_', ' ').title()
                                tech_parts.append(f"• {feature_name}: {value:.6f}")
                    else:
                        tech_parts.append("• Audio features extracted and analyzed")
                else:
                    tech_parts.append("• No comprehensive features available")
                
                tech_parts.append("\n**Deepfake Indicators:**")
                if 'deepfake_indicators' in details:
                    indicators = details.get('deepfake_indicators', {})
                    if isinstance(indicators, dict) and indicators:
                        for indicator, value in indicators.items():
                            if isinstance(value, (int, float)):
                                indicator_name = indicator.replace('_', ' ').title()
                                severity = "High" if value > 0.7 else "Medium" if value > 0.4 else "Low"
                                tech_parts.append(f"• {indicator_name}: {value:.4f} ({severity} risk)")
                    else:
                        tech_parts.append("• Deepfake indicators calculated")
                else:
                    tech_parts.append("• No deepfake indicators available")
                
                tech_parts.append("\n**Audio Properties:**")
                if 'preprocessing_info' in details:
                    preprocess = details.get('preprocessing_info', {})
                    tech_parts.append(f"• Duration: {preprocess.get('duration', 0):.2f} seconds")
                    tech_parts.append(f"• Sample Rate: {preprocess.get('sample_rate', 0)} Hz")
                    tech_parts.append(f"• Mel Bands: {preprocess.get('n_mels', 'N/A')}")
                    tech_parts.append(f"• FFT Size: {preprocess.get('n_fft', 'N/A')}")
                    tech_parts.append(f"• Hop Length: {preprocess.get('hop_length', 'N/A')}")
                else:
                    tech_parts.append("• No preprocessing information available")
            
            # Analysis methods
            if 'analysis_methods' in details:
                tech_parts.append("\n**Analysis Methods Used:**")
                methods = details.get('analysis_methods', [])
                for method in methods:
                    tech_parts.append(f"• {method}")
            
            # Model info from top level
            if 'model_info' in analysis_result:
                model_info = analysis_result.get('model_info', {})
                models_used = model_info.get('models_used', [])
                if models_used:
                    tech_parts.append("\n**AI Models:**")
                    for model in models_used:
                        tech_parts.append(f"• {model}")
        
            return "\n".join(tech_parts)
        except Exception as e:
            logger.error(f"Error generating technical details: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return f"Error generating technical details: {str(e)}"
    
    def generate_report(self, file_id: str, file_info: Dict, analysis_result: Dict, output_path: str) -> str:
        """Generate complete PDF report"""
        try:
            # Create PDF document
            doc = SimpleDocTemplate(
                output_path,
                pagesize=letter,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=18
            )
            
            # Container for the 'Flowable' objects
            elements = []
            
            # Define styles
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#1e40af'),
                spaceAfter=30,
                alignment=TA_CENTER
            )
            
            heading_style = ParagraphStyle(
                'CustomHeading',
                parent=styles['Heading2'],
                fontSize=16,
                textColor=colors.HexColor('#1e40af'),
                spaceAfter=12,
                spaceBefore=12
            )
            
            body_style = ParagraphStyle(
                'CustomBody',
                parent=styles['BodyText'],
                fontSize=11,
                leading=14,
                alignment=TA_JUSTIFY,
                spaceAfter=12
            )
            
            # Title
            elements.append(Paragraph("Deepfake Detection Analysis Report", title_style))
            elements.append(Spacer(1, 0.2*inch))
            
            # Report metadata
            metadata_data = [
                ['Report Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
                ['File ID:', file_id],
                ['Original Filename:', file_info.get('filename', 'N/A')],
                ['File Type:', file_info.get('file_type', 'N/A').upper()],
                ['File Size:', f"{file_info.get('file_size', 0) / 1024:.2f} KB"],
            ]
            
            metadata_table = Table(metadata_data, colWidths=[2*inch, 4*inch])
            metadata_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('TOPPADDING', (0, 0), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.grey)
            ]))
            elements.append(metadata_table)
            elements.append(Spacer(1, 0.3*inch))
            
            # Executive Summary
            elements.append(Paragraph("Executive Summary", heading_style))
            
            file_type = file_info.get('file_type', 'file')
            explanation = self._generate_layman_explanation(analysis_result, file_type)
            elements.append(Paragraph(explanation, body_style))
            elements.append(Spacer(1, 0.2*inch))
            
            # Key Findings
            elements.append(Paragraph("Key Findings", heading_style))
            
            prediction = analysis_result.get('prediction', 'UNKNOWN')
            confidence = analysis_result.get('confidence', 0.0)
            
            findings_data = [
                ['Prediction:', prediction],
                ['Confidence Level:', f"{confidence:.1f}%"],
                ['Analysis Date:', analysis_result.get('analysis_time', datetime.now().isoformat())],
            ]
            
            if 'model_info' in analysis_result:
                models_used = analysis_result['model_info'].get('models_used', [])
                if models_used:
                    findings_data.append(['Models Used:', ', '.join(models_used)])
            
            findings_table = Table(findings_data, colWidths=[2*inch, 4*inch])
            findings_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#dbeafe')),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 11),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#93c5fd'))
            ]))
            elements.append(findings_table)
            elements.append(Spacer(1, 0.3*inch))
            
            # Detailed Analysis
            elements.append(Paragraph("Detailed Analysis", heading_style))
            detailed_analysis = self._generate_detailed_analysis_section(analysis_result, file_type)
            
            # Split into paragraphs and format properly
            # Handle markdown-style bold (**text**) and split by double newlines
            paragraphs = detailed_analysis.split('\n\n')
            for para_text in paragraphs:
                if not para_text.strip():
                    continue
                
                # Convert markdown bold (**text**) to HTML bold for ReportLab
                para_text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', para_text)
                
                # Split by single newlines for bullet points
                lines = para_text.split('\n')
                formatted_para = []
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    # Handle bullet points
                    if line.startswith('•'):
                        formatted_para.append(f"&nbsp;&nbsp;&nbsp;&nbsp;{line}")
                    else:
                        formatted_para.append(line)
                
                para_content = '<br/>'.join(formatted_para)
                elements.append(Paragraph(para_content, body_style))
                elements.append(Spacer(1, 0.1*inch))
            
            elements.append(Spacer(1, 0.2*inch))
            
            # Technical Details
            elements.append(Paragraph("Technical Details", heading_style))
            technical_details = self._generate_technical_details(analysis_result, file_type)
            
            # Split technical details into paragraphs
            tech_paragraphs = technical_details.split('\n\n')
            for tech_para in tech_paragraphs:
                if not tech_para.strip():
                    continue
                # Convert markdown bold to HTML
                tech_para = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', tech_para)
                # Split by newlines for formatting
                lines = tech_para.split('\n')
                formatted_lines = []
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    if line.startswith('•') or line.startswith('-'):
                        formatted_lines.append(f"&nbsp;&nbsp;&nbsp;&nbsp;{line}")
                    else:
                        formatted_lines.append(line)
                para_content = '<br/>'.join(formatted_lines)
                elements.append(Paragraph(para_content, body_style))
                elements.append(Spacer(1, 0.1*inch))
            
            elements.append(Spacer(1, 0.3*inch))
            
            # Important Notes
            elements.append(Paragraph("Important Notes", heading_style))
            notes_text = """
• This analysis is based on current deepfake detection technology and is not 100% accurate.
• Results should be considered alongside other evidence and context.
• Deepfake technology is constantly evolving, and detection methods may not catch all forms of manipulation.
• If you have serious concerns about media authenticity, consult with additional experts.
• This report is for informational purposes and should not be the sole basis for important decisions.
"""
            elements.append(Paragraph(notes_text, body_style))
            elements.append(Spacer(1, 0.3*inch))
            
            # Footer
            footer_text = f"Report generated by Deepfake Detection System on {datetime.now().strftime('%B %d, %Y at %H:%M:%S')}"
            elements.append(Paragraph(footer_text, ParagraphStyle(
                'Footer',
                parent=styles['Normal'],
                fontSize=9,
                textColor=colors.grey,
                alignment=TA_CENTER
            )))
            
            # Build PDF
            doc.build(elements)
            
            logger.info(f"PDF report generated successfully: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Error generating PDF report: {e}")
            raise

