"""
OpenAI-based Audio Deepfake Detection System
Uses Whisper for transcription and GPT-4 for analysis
"""

import os
import logging
from typing import Dict, Tuple, Optional
from pathlib import Path
import numpy as np
from openai import OpenAI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OpenAIAudioDeepfakeDetector:
    """
    Audio deepfake detector using OpenAI Whisper and GPT-4
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the OpenAI audio detector"""
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        self.client = OpenAI(api_key=self.api_key)
        self.whisper_model = "whisper-1"
        self.gpt_model = "gpt-4o"
        
        logger.info("OpenAI Audio Deepfake Detector initialized")
    
    def _transcribe_audio(self, audio_path: str) -> Dict:
        """Transcribe audio using Whisper"""
        try:
            with open(audio_path, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model=self.whisper_model,
                    file=audio_file,
                    response_format="verbose_json"
                )
            
            return {
                'text': transcript.text,
                'language': transcript.language,
                'duration': transcript.duration,
                'segments': [
                    {
                        'start': seg.start,
                        'end': seg.end,
                        'text': seg.text
                    } for seg in (transcript.segments if hasattr(transcript, 'segments') else [])
                ]
            }
        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            return {'error': str(e)}
    
    def _analyze_audio_features(self, audio_path: str) -> Dict:
        """Extract comprehensive audio features"""
        try:
            import librosa
            
            # Load audio
            waveform, sr = librosa.load(audio_path, sr=16000)
            duration = len(waveform) / sr
            
            # Basic features
            rms_energy = np.sqrt(np.mean(waveform**2))
            zcr = librosa.feature.zero_crossing_rate(waveform)
            
            # Spectral features
            spectral_centroids = librosa.feature.spectral_centroid(y=waveform, sr=sr)
            spectral_rolloff = librosa.feature.spectral_rolloff(y=waveform, sr=sr)
            spectral_bandwidth = librosa.feature.spectral_bandwidth(y=waveform, sr=sr)
            
            # MFCC features
            mfccs = librosa.feature.mfcc(y=waveform, sr=sr, n_mfcc=13)
            
            # Chroma features
            chroma = librosa.feature.chroma_stft(y=waveform, sr=sr)
            
            # Tonnetz features
            tonnetz = librosa.feature.tonnetz(y=waveform, sr=sr)
            
            # Spectral contrast
            spectral_contrast = librosa.feature.spectral_contrast(y=waveform, sr=sr)
            
            # Pitch (F0) estimation
            try:
                pitches, magnitudes = librosa.piptrack(y=waveform, sr=sr)
                pitch_values = []
                for t in range(pitches.shape[1]):
                    index = magnitudes[:, t].argmax()
                    pitch = pitches[index, t]
                    if pitch > 0:
                        pitch_values.append(pitch)
                f0_mean = np.mean(pitch_values) if pitch_values else 0.0
                f0_std = np.std(pitch_values) if pitch_values else 0.0
            except:
                f0_mean = 0.0
                f0_std = 0.0
            
            # Rhythm features
            tempo, beats = librosa.beat.beat_track(y=waveform, sr=sr)
            
            # Harmonic and percussive components
            harmonic, percussive = librosa.effects.hpss(waveform)
            harmonic_ratio = np.mean(harmonic**2) / (np.mean(percussive**2) + 1e-8)
            
            # Comprehensive features structure
            comprehensive_features = {
                'energy_mean': float(np.mean(rms_energy)),
                'energy_std': float(np.std(rms_energy)),
                'zcr_mean': float(np.mean(zcr)),
                'zcr_std': float(np.std(zcr)),
                'f0_mean': float(f0_mean),
                'f0_std': float(f0_std),
                'spectral_centroid_mean': float(np.mean(spectral_centroids)),
                'spectral_centroid_std': float(np.std(spectral_centroids)),
                'spectral_rolloff_mean': float(np.mean(spectral_rolloff)),
                'spectral_rolloff_std': float(np.std(spectral_rolloff)),
                'spectral_bandwidth_mean': float(np.mean(spectral_bandwidth)),
                'spectral_bandwidth_std': float(np.std(spectral_bandwidth)),
                'mfcc_mean': [float(x) for x in np.mean(mfccs, axis=1)],
                'mfcc_std': [float(x) for x in np.std(mfccs, axis=1)],
                'chroma_mean': [float(x) for x in np.mean(chroma, axis=1)],
                'chroma_std': [float(x) for x in np.std(chroma, axis=1)],
                'tonnetz_mean': [float(x) for x in np.mean(tonnetz, axis=1)],
                'tonnetz_std': [float(x) for x in np.std(tonnetz, axis=1)],
                'spectral_contrast_mean': [float(x) for x in np.mean(spectral_contrast, axis=1)],
                'spectral_contrast_std': [float(x) for x in np.std(spectral_contrast, axis=1)],
                'tempo': float(tempo),
                'beat_count': len(beats),
                'harmonic_ratio': float(harmonic_ratio)
            }
            
            features = {
                'duration': duration,
                'sample_rate': sr,
                'rms_energy': float(rms_energy),
                'zero_crossing_rate': float(np.mean(zcr)),
                'comprehensive_features': comprehensive_features
            }
            
            return features
        except Exception as e:
            logger.warning(f"Could not extract comprehensive audio features: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return {
                'duration': 0,
                'sample_rate': 16000,
                'rms_energy': 0.0,
                'zero_crossing_rate': 0.0
            }
    
    def _calculate_deepfake_indicators(self, audio_features: Dict, analysis_scores: Dict) -> Dict:
        """Calculate deepfake indicators from features and analysis"""
        try:
            comp_features = audio_features.get('comprehensive_features', {})
            
            # Calculate indicators based on features
            indicators = {}
            
            # Energy consistency indicator (low variation = suspicious)
            energy_std = comp_features.get('energy_std', 0)
            indicators['energy_inconsistency'] = min(1.0, energy_std / 0.1) if energy_std > 0 else 0.5
            
            # ZCR consistency (unnatural ZCR patterns)
            zcr_std = comp_features.get('zcr_std', 0)
            indicators['zcr_anomaly'] = min(1.0, zcr_std / 0.05) if zcr_std > 0 else 0.5
            
            # Pitch consistency (F0 variation)
            f0_std = comp_features.get('f0_std', 0)
            indicators['pitch_inconsistency'] = min(1.0, f0_std / 50.0) if f0_std > 0 else 0.5
            
            # Spectral anomalies
            spectral_centroid_std = comp_features.get('spectral_centroid_std', 0)
            indicators['spectral_anomaly'] = min(1.0, spectral_centroid_std / 500.0) if spectral_centroid_std > 0 else 0.5
            
            # MFCC consistency (unnatural MFCC patterns)
            mfcc_std = comp_features.get('mfcc_std', [])
            if mfcc_std:
                avg_mfcc_std = np.mean(mfcc_std)
                indicators['mfcc_anomaly'] = min(1.0, avg_mfcc_std / 5.0)
            else:
                indicators['mfcc_anomaly'] = 0.5
            
            # Prosody indicators from analysis scores
            prosody_score = analysis_scores.get('prosody_consistency', 0.5)
            indicators['prosody_anomaly'] = 1.0 - prosody_score
            
            # Naturalness indicator
            naturalness_score = analysis_scores.get('naturalness_score', 0.5)
            indicators['unnatural_speech'] = 1.0 - naturalness_score
            
            # Voice quality indicator
            voice_quality = analysis_scores.get('voice_quality', 0.5)
            indicators['voice_inconsistency'] = 1.0 - voice_quality
            
            # Overall suspiciousness
            suspicious_score = np.mean(list(indicators.values()))
            indicators['overall_suspiciousness'] = suspicious_score
            
            return indicators
        except Exception as e:
            logger.error(f"Error calculating deepfake indicators: {e}")
            return {
                'energy_inconsistency': 0.5,
                'zcr_anomaly': 0.5,
                'pitch_inconsistency': 0.5,
                'spectral_anomaly': 0.5,
                'mfcc_anomaly': 0.5,
                'prosody_anomaly': 0.5,
                'unnatural_speech': 0.5,
                'voice_inconsistency': 0.5,
                'overall_suspiciousness': 0.5
            }
    
    def _analyze_with_gpt4(self, transcript: str, audio_features: Dict) -> Dict:
        """Analyze transcript and audio features with GPT-4"""
        try:
            comp_features = audio_features.get('comprehensive_features', {})
            
            prompt = f"""You are an expert audio deepfake detection analyst. Analyze this audio transcription and technical features comprehensively.

CRITICAL: You must be accurate. Look carefully at:
- Speech naturalness and flow
- Prosody and intonation patterns
- Voice consistency and quality
- Linguistic coherence
- Pause and rhythm patterns
- Technical audio anomalies

Technical Audio Features:
- Duration: {audio_features.get('duration', 'N/A')} seconds
- RMS Energy: {audio_features.get('rms_energy', 'N/A'):.4f}
- Zero Crossing Rate: {audio_features.get('zero_crossing_rate', 'N/A'):.4f}
- F0 Mean (Pitch): {comp_features.get('f0_mean', 'N/A'):.2f} Hz
- F0 Std (Pitch Variation): {comp_features.get('f0_std', 'N/A'):.2f} Hz
- Spectral Centroid: {comp_features.get('spectral_centroid_mean', 'N/A'):.2f} Hz
- Tempo: {comp_features.get('tempo', 'N/A'):.2f} BPM
- Energy Std: {comp_features.get('energy_std', 'N/A'):.4f}

Transcription:
{transcript}

Provide your analysis as a JSON object with EXACTLY this structure (no markdown, just pure JSON):
{{
  "prediction": "REAL" or "FAKE" (choose one based on your analysis),
  "confidence": 0.0-1.0 (0.0 = very uncertain, 1.0 = very certain),
  "reasoning": "detailed explanation of why you chose REAL or FAKE",
  "naturalness_score": 0.0-1.0 (0.0 = very unnatural, 1.0 = very natural),
  "prosody_consistency": 0.0-1.0 (0.0 = inconsistent, 1.0 = consistent),
  "voice_quality": 0.0-1.0 (0.0 = inconsistent, 1.0 = consistent),
  "linguistic_coherence": 0.0-1.0 (0.0 = incoherent, 1.0 = coherent),
  "pause_patterns": 0.0-1.0 (0.0 = unnatural, 1.0 = natural),
  "audio_quality_score": 0.0-1.0 (0.0 = poor quality, 1.0 = high quality),
  "indicators": ["list specific deepfake indicators found, if any"],
  "detailed_analysis": "comprehensive technical analysis"
}}

IMPORTANT: 
- If the audio sounds natural and authentic, set prediction to "REAL" with high confidence (0.7-1.0)
- If you detect clear signs of deepfake/AI generation, set prediction to "FAKE" with high confidence (0.7-1.0)
- Only use low confidence (0.3-0.6) if you're genuinely uncertain
- Be honest and accurate in your assessment"""
            
            try:
                # Try with JSON response format
                response = self.client.chat.completions.create(
                    model=self.gpt_model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert in audio deepfake detection. Always respond with valid JSON only."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    max_tokens=2000,
                    temperature=0.2,
                    response_format={"type": "json_object"}
                )
            except Exception as e:
                # Fallback if JSON format not supported
                logger.warning(f"JSON response format not supported, using standard format: {e}")
                response = self.client.chat.completions.create(
                    model=self.gpt_model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert in audio deepfake detection. Analyze audio transcriptions and features to detect synthetic or AI-generated speech."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    max_tokens=2000,
                    temperature=0.2
                )
            
            response_text = response.choices[0].message.content
            logger.info(f"OpenAI raw response: {response_text[:500]}...")
            
            # Parse response with multiple methods
            import json
            import re
            
            analysis = None
            
            # Method 1: Look for JSON code block
            json_block_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response_text, re.DOTALL)
            if json_block_match:
                try:
                    analysis = json.loads(json_block_match.group(1))
                    logger.info("Successfully parsed JSON from code block")
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse JSON from code block: {e}")
            
            # Method 2: Look for JSON object
            if analysis is None:
                json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_text, re.DOTALL)
                if json_match:
                    try:
                        analysis = json.loads(json_match.group())
                        logger.info("Successfully parsed JSON from object")
                    except json.JSONDecodeError as e:
                        logger.warning(f"Failed to parse JSON from object: {e}")
            
            # Method 3: Try parsing entire response
            if analysis is None:
                try:
                    analysis = json.loads(response_text.strip())
                    logger.info("Successfully parsed entire response as JSON")
                except json.JSONDecodeError:
                    pass
            
            # Method 4: Fallback to text parsing
            if analysis is None:
                logger.warning("Could not parse JSON, using text parsing fallback")
                analysis = self._parse_text_response(response_text)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing with GPT-4: {e}")
            return {
                'prediction': 'UNKNOWN',
                'confidence': 0.5,
                'reasoning': f'Analysis error: {str(e)}',
                'indicators': [],
                'naturalness_score': 0.5
            }
    
    def _parse_text_response(self, text: str) -> Dict:
        """Parse text response"""
        result = {
            'prediction': 'UNKNOWN',
            'confidence': 0.5,
            'reasoning': text,
            'detailed_analysis': text,
            'indicators': [],
            'naturalness_score': 0.5,
            'prosody_consistency': 0.5,
            'voice_quality': 0.5,
            'linguistic_coherence': 0.5,
            'pause_patterns': 0.5,
            'audio_quality_score': 0.5
        }
        
        text_upper = text.upper()
        if 'FAKE' in text_upper or 'SYNTHETIC' in text_upper or 'AI-GENERATED' in text_upper:
            result['prediction'] = 'FAKE'
        elif 'REAL' in text_upper or 'AUTHENTIC' in text_upper or 'NATURAL' in text_upper:
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
            'naturalness_score': r'naturalness[:\s]+([0-9.]+)',
            'prosody_consistency': r'prosody[:\s]+([0-9.]+)',
            'voice_quality': r'voice[_\s]?quality[:\s]+([0-9.]+)',
            'linguistic_coherence': r'coherence[:\s]+([0-9.]+)',
            'pause_patterns': r'pause[:\s]+([0-9.]+)',
            'audio_quality_score': r'audio[_\s]?quality[:\s]+([0-9.]+)'
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
    
    def detect_deepfake(self, audio_path: str) -> Tuple[float, str, Dict]:
        """
        Detect audio deepfake using OpenAI Whisper and GPT-4
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            Tuple of (confidence, prediction, details)
        """
        try:
            logger.info(f"Analyzing audio with OpenAI: {audio_path}")
            
            # Extract audio features
            audio_features = self._analyze_audio_features(audio_path)
            
            # Transcribe audio
            transcript_data = self._transcribe_audio(audio_path)
            
            if 'error' in transcript_data:
                raise ValueError(f"Transcription failed: {transcript_data['error']}")
            
            transcript_text = transcript_data.get('text', '')
            
            # Analyze with GPT-4
            analysis = self._analyze_with_gpt4(transcript_text, audio_features)
            
            # Extract prediction and confidence with validation
            prediction_raw = analysis.get('prediction', '').upper().strip()
            confidence_raw = analysis.get('confidence', 0.5)
            
            # Determine prediction
            if prediction_raw == 'REAL' or 'REAL' in prediction_raw:
                prediction = 'REAL'
            elif prediction_raw == 'FAKE' or 'FAKE' in prediction_raw or 'SYNTHETIC' in prediction_raw:
                prediction = 'FAKE'
            else:
                # Use confidence to determine if prediction unclear
                logger.warning(f"Unclear prediction '{prediction_raw}', using confidence to determine")
                confidence_val = float(confidence_raw) if isinstance(confidence_raw, (int, float)) else 0.5
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
                confidence = max(0.0, min(1.0, confidence))
            except (ValueError, TypeError):
                logger.warning(f"Invalid confidence value '{confidence_raw}', using 0.5")
                confidence = 0.5
            
            logger.info(f"Parsed prediction: {prediction}, confidence: {confidence}")
            
            # Calculate deepfake indicators
            analysis_scores = {
                'naturalness_score': float(analysis.get('naturalness_score', 0.5)),
                'prosody_consistency': float(analysis.get('prosody_consistency', 0.5)),
                'voice_quality': float(analysis.get('voice_quality', 0.5)),
                'linguistic_coherence': float(analysis.get('linguistic_coherence', 0.5)),
                'pause_patterns': float(analysis.get('pause_patterns', 0.5)),
                'audio_quality_score': float(analysis.get('audio_quality_score', 0.5))
            }
            
            deepfake_indicators = self._calculate_deepfake_indicators(audio_features, analysis_scores)
            
            confidence_percent = confidence * 100
            
            # Prepare comprehensive details
            details = {
                'model_predictions': {'openai_whisper_gpt4': prediction},
                'model_confidences': {'openai_whisper_gpt4': confidence},
                'ensemble_confidence': confidence,
                'audio_features': audio_features,
                'comprehensive_features': audio_features.get('comprehensive_features', {}),
                'deepfake_indicators': deepfake_indicators,
                'transcription': {
                    'text': transcript_text,
                    'language': transcript_data.get('language', 'unknown'),
                    'duration': transcript_data.get('duration', audio_features.get('duration', 0)),
                    'segments': transcript_data.get('segments', [])
                },
                'openai_analysis': {
                    'reasoning': analysis.get('reasoning', ''),
                    'detailed_analysis': analysis.get('detailed_analysis', ''),
                    'indicators': analysis.get('indicators', []),
                    'naturalness_score': analysis_scores['naturalness_score'],
                    'prosody_consistency': analysis_scores['prosody_consistency'],
                    'voice_quality': analysis_scores['voice_quality'],
                    'linguistic_coherence': analysis_scores['linguistic_coherence'],
                    'pause_patterns': analysis_scores['pause_patterns'],
                    'audio_quality_score': analysis_scores['audio_quality_score'],
                    'raw_analysis': analysis
                },
                'audio_quality_metrics': {
                    'naturalness': analysis_scores['naturalness_score'],
                    'prosody': analysis_scores['prosody_consistency'],
                    'voice_consistency': analysis_scores['voice_quality'],
                    'coherence': analysis_scores['linguistic_coherence'],
                    'rhythm': analysis_scores['pause_patterns'],
                    'overall_quality': analysis_scores['audio_quality_score']
                },
                'model_info': {
                    'models_used': ['openai_whisper', 'openai_gpt4'],
                    'whisper_model': self.whisper_model,
                    'gpt_model': self.gpt_model
                },
                'analysis_methods': [
                    'OpenAI Whisper Transcription',
                    'OpenAI GPT-4 Analysis',
                    'Comprehensive Audio Feature Extraction',
                    'Prosody Analysis',
                    'Voice Quality Analysis',
                    'Linguistic Coherence Analysis',
                    'Spectral Analysis',
                    'Pitch Analysis',
                    'Energy Analysis',
                    'Deepfake Indicator Calculation'
                ]
            }
            
            logger.info(f"Audio analysis complete: {prediction} ({confidence_percent:.1f}% confidence)")
            
            return confidence_percent, prediction, details
            
        except Exception as e:
            logger.error(f"Error in audio detection: {e}")
            # Return default result
            audio_features = self._analyze_audio_features(audio_path)
            details = {
                'error': str(e),
                'audio_features': audio_features,
                'model_info': {
                    'models_used': [],
                    'error': f'OpenAI detection failed: {str(e)}'
                }
            }
            return 50.0, 'UNKNOWN', details

