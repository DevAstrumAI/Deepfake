"""
Unified Deepfake Detection Application
Handles both images and videos in one interface
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from PIL import Image, ImageTk
import threading
import os
import sys
from pathlib import Path
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import numpy as np
import json

# Import detectors from backend
from backend.advanced_detector import AdvancedDeepfakeDetector
from backend.safe_video_detector import SafeVideoDeepfakeDetector
from backend.hybrid_audio_detector import HybridAudioDeepfakeDetector

class UnifiedDeepfakeDetectionGUI:
    """Unified GUI application for both image and video deepfake detection"""
    
    def __init__(self, root):
        self.root = root
        self.root.title("Unified Deepfake Detection System")
        self.root.geometry("1200x800")
        self.root.configure(bg='#f0f0f0')
        
        # Initialize detectors
        self.image_detector = None
        self.video_detector = None
        self.audio_detector = None
        self.current_file_path = None
        self.current_file_type = None
        self.analysis_results = None
        
        # Setup GUI
        self.setup_gui()
        self.initialize_detectors()
    
    def setup_gui(self):
        """Setup the unified GUI components"""
        # Main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(2, weight=1)
        
        # Title
        title_label = ttk.Label(main_frame, text="Unified Deepfake Detection System", 
                               font=('Arial', 18, 'bold'))
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 20))
        
        # Left panel - File selection and controls
        left_frame = ttk.LabelFrame(main_frame, text="File Selection & Controls", padding="10")
        left_frame.grid(row=1, column=0, rowspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 10))
        
        # File type selection
        file_type_frame = ttk.Frame(left_frame)
        file_type_frame.grid(row=0, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        
        ttk.Label(file_type_frame, text="File Type:").grid(row=0, column=0, padx=(0, 10))
        
        self.file_type_var = tk.StringVar(value="auto")
        file_type_combo = ttk.Combobox(file_type_frame, textvariable=self.file_type_var, 
                                      values=["auto", "image", "video", "audio"], state="readonly", width=10)
        file_type_combo.grid(row=0, column=1)
        
        # File selection
        file_frame = ttk.Frame(left_frame)
        file_frame.grid(row=1, column=0, sticky=(tk.W, tk.E), pady=(0, 20))
        
        ttk.Button(file_frame, text="Select File", 
                  command=self.select_file).grid(row=0, column=0, padx=(0, 10))
        
        self.file_path_var = tk.StringVar()
        ttk.Entry(file_frame, textvariable=self.file_path_var, 
                 state='readonly', width=40).grid(row=0, column=1, sticky=(tk.W, tk.E))
        
        file_frame.columnconfigure(1, weight=1)
        
        # File info
        self.file_info_text = tk.Text(left_frame, height=8, width=50, wrap=tk.WORD)
        file_info_scrollbar = ttk.Scrollbar(left_frame, orient="vertical", command=self.file_info_text.yview)
        self.file_info_text.configure(yscrollcommand=file_info_scrollbar.set)
        
        self.file_info_text.grid(row=2, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 20))
        file_info_scrollbar.grid(row=2, column=1, sticky=(tk.N, tk.S))
        
        # Analysis button
        self.analyze_button = ttk.Button(left_frame, text="Analyze File", 
                                        command=self.analyze_file, state='disabled')
        self.analyze_button.grid(row=3, column=0, columnspan=2, pady=(0, 20), sticky=(tk.W, tk.E))
        
        # Progress bar
        self.progress_var = tk.DoubleVar()
        self.progress_bar = ttk.Progressbar(left_frame, variable=self.progress_var, 
                                           maximum=100)
        self.progress_bar.grid(row=4, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        
        # Status label
        self.status_label = ttk.Label(left_frame, text="Ready")
        self.status_label.grid(row=5, column=0, columnspan=2, pady=(5, 0))
        
        # Configure left frame grid
        left_frame.columnconfigure(0, weight=1)
        left_frame.rowconfigure(2, weight=1)
        
        # Right panel - Results
        right_frame = ttk.LabelFrame(main_frame, text="Analysis Results", padding="10")
        right_frame.grid(row=1, column=1, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Create notebook for tabs
        self.notebook = ttk.Notebook(right_frame)
        self.notebook.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Summary tab
        self.summary_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.summary_frame, text="Summary")
        
        self.summary_text = tk.Text(self.summary_frame, wrap=tk.WORD)
        summary_scrollbar = ttk.Scrollbar(self.summary_frame, orient="vertical", command=self.summary_text.yview)
        self.summary_text.configure(yscrollcommand=summary_scrollbar.set)
        
        self.summary_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        summary_scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
        # Detailed Analysis tab
        self.details_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.details_frame, text="Detailed Analysis")
        
        self.details_text = tk.Text(self.details_frame, wrap=tk.WORD)
        details_scrollbar = ttk.Scrollbar(self.details_frame, orient="vertical", command=self.details_text.yview)
        self.details_text.configure(yscrollcommand=details_scrollbar.set)
        
        self.details_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        details_scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
        # Charts tab (for videos)
        self.charts_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.charts_frame, text="Charts")
        
        # Configure right frame grid
        right_frame.columnconfigure(0, weight=1)
        right_frame.rowconfigure(0, weight=1)
        
        # Configure notebook frames
        for frame in [self.summary_frame, self.details_frame, self.charts_frame]:
            frame.columnconfigure(0, weight=1)
            frame.rowconfigure(0, weight=1)
    
    def initialize_detectors(self):
        """Initialize both image and video detectors"""
        def load_detectors():
            try:
                self.status_label.config(text="Loading detection systems...")
                self.progress_var.set(20)
                
                # Load image detector
                self.image_detector = AdvancedDeepfakeDetector()
                self.progress_var.set(60)
                
                # Load video detector
                self.video_detector = SafeVideoDeepfakeDetector()
                self.progress_var.set(80)
                
                # Load audio detector
                self.audio_detector = HybridAudioDeepfakeDetector()
                self.progress_var.set(100)
                
                self.status_label.config(text="Detection systems ready!")
                
                # Enable analyze button if file is loaded
                if self.current_file_path:
                    self.analyze_button.config(state='normal')
                
            except Exception as e:
                self.status_label.config(text=f"Error loading systems: {str(e)}")
                messagebox.showerror("Error", f"Failed to load detection systems: {str(e)}")
        
        # Start loading in background thread
        threading.Thread(target=load_detectors, daemon=True).start()
    
    def select_file(self):
        """Select a file (image or video)"""
        file_types = [
            ('All supported files', '*.jpg *.jpeg *.png *.bmp *.tiff *.webp *.mp4 *.avi *.mov *.mkv *.webm *.flv *.wmv *.m4v *.3gp *.ogv *.wav *.mp3 *.flac *.aac *.ogg'),
            ('Image files', '*.jpg *.jpeg *.png *.bmp *.tiff *.webp'),
            ('Video files', '*.mp4 *.avi *.mov *.mkv *.webm *.flv *.wmv *.m4v *.3gp *.ogv'),
            ('Audio files', '*.wav *.mp3 *.flac *.aac *.ogg'),
            ('All files', '*.*')
        ]
        
        file_path = filedialog.askopenfilename(
            title="Select an image, video, or audio file to analyze",
            filetypes=file_types
        )
        
        if file_path:
            self.load_file(file_path)
    
    def load_file(self, file_path):
        """Load and analyze the selected file"""
        try:
            self.current_file_path = file_path
            self.file_path_var.set(os.path.basename(file_path))
            
            # Determine file type
            file_ext = Path(file_path).suffix.lower()
            image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
            video_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv', '.m4v', '.3gp', '.ogv'}
            audio_extensions = {'.wav', '.mp3', '.flac', '.aac', '.ogg'}
            
            if file_ext in image_extensions:
                self.current_file_type = 'image'
            elif file_ext in video_extensions:
                self.current_file_type = 'video'
            elif file_ext in audio_extensions:
                self.current_file_type = 'audio'
            else:
                # Use user selection or default to image
                selected_type = self.file_type_var.get()
                if selected_type == 'auto':
                    self.current_file_type = 'image'  # Default to image
                else:
                    self.current_file_type = selected_type
            
            # Display file information
            self.display_file_info()
            
            # Enable analyze button
            if self.image_detector and self.video_detector and self.audio_detector:
                self.analyze_button.config(state='normal')
            
            # Clear previous results
            self.clear_results()
            self.status_label.config(text="File loaded successfully")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load file: {str(e)}")
    
    def display_file_info(self):
        """Display file information"""
        try:
            file_path = self.current_file_path
            file_type = self.current_file_type
            
            info_text = f"File Information:\n"
            info_text += f"{'='*40}\n\n"
            info_text += f"File: {os.path.basename(file_path)}\n"
            info_text += f"Type: {file_type.upper()}\n"
            info_text += f"Size: {os.path.getsize(file_path) / (1024*1024):.1f} MB\n"
            
            if file_type == 'image':
                # Get image info
                try:
                    with Image.open(file_path) as img:
                        info_text += f"Dimensions: {img.size[0]}x{img.size[1]}\n"
                        info_text += f"Mode: {img.mode}\n"
                        info_text += f"Format: {img.format}\n"
                except Exception as e:
                    info_text += f"Error reading image info: {e}\n"
            
            elif file_type == 'video':
                # Get video info
                try:
                    import cv2
                    cap = cv2.VideoCapture(file_path)
                    if cap.isOpened():
                        info_text += f"Frames: {int(cap.get(cv2.CAP_PROP_FRAME_COUNT))}\n"
                        info_text += f"FPS: {cap.get(cv2.CAP_PROP_FPS):.1f}\n"
                        info_text += f"Duration: {int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) / cap.get(cv2.CAP_PROP_FPS):.1f}s\n"
                        info_text += f"Resolution: {int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))}x{int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))}\n"
                        cap.release()
                    else:
                        info_text += "Error reading video info\n"
                except Exception as e:
                    info_text += f"Error reading video info: {e}\n"
            
            elif file_type == 'audio':
                # Get audio info
                try:
                    import librosa
                    y, sr = librosa.load(file_path, sr=None)
                    duration = len(y) / sr
                    info_text += f"Duration: {duration:.1f}s\n"
                    info_text += f"Sample Rate: {sr} Hz\n"
                    info_text += f"Samples: {len(y)}\n"
                    info_text += f"Channels: 1 (mono)\n"
                except Exception as e:
                    info_text += f"Error reading audio info: {e}\n"
            
            self.file_info_text.delete(1.0, tk.END)
            self.file_info_text.insert(1.0, info_text)
            
        except Exception as e:
            logger.error(f"Error displaying file info: {e}")
    
    def analyze_file(self):
        """Analyze the selected file"""
        if not self.current_file_path or not self.image_detector or not self.video_detector or not self.audio_detector:
            messagebox.showwarning("Warning", "Please select a file and wait for systems to load")
            return
        
        def analysis_thread():
            try:
                if self.current_file_type == 'image':
                    self.analyze_image()
                elif self.current_file_type == 'video':
                    self.analyze_video()
                elif self.current_file_type == 'audio':
                    self.analyze_audio()
                else:
                    self.root.after(0, lambda: self.show_error("Unknown file type"))
                
            except Exception as e:
                self.root.after(0, lambda: self.show_error(f"Analysis failed: {str(e)}"))
        
        # Start analysis in background thread
        threading.Thread(target=analysis_thread, daemon=True).start()
    
    def analyze_image(self):
        """Analyze image file"""
        try:
            self.root.after(0, lambda: self.status_label.config(text="Analyzing image..."))
            self.root.after(0, lambda: self.progress_var.set(30))
            
            # Perform image analysis
            confidence, prediction, details = self.image_detector.detect_deepfake(self.current_file_path)
            
            self.root.after(0, lambda: self.status_label.config(text="Processing results..."))
            self.root.after(0, lambda: self.progress_var.set(80))
            
            # Store results
            self.analysis_results = {
                'type': 'image',
                'prediction': prediction,
                'confidence': confidence,
                'details': details
            }
            
            self.root.after(0, lambda: self.status_label.config(text="Finalizing results..."))
            self.root.after(0, lambda: self.progress_var.set(100))
            
            # Display results
            self.root.after(0, lambda: self.display_image_results())
            
        except Exception as e:
            self.root.after(0, lambda: self.show_error(f"Image analysis failed: {str(e)}"))
    
    def analyze_video(self):
        """Analyze video file"""
        try:
            self.root.after(0, lambda: self.status_label.config(text="Analyzing video..."))
            self.root.after(0, lambda: self.progress_var.set(30))
            
            # Perform video analysis
            results = self.video_detector.detect_video_deepfake(self.current_file_path)
            
            self.root.after(0, lambda: self.status_label.config(text="Processing results..."))
            self.root.after(0, lambda: self.progress_var.set(80))
            
            # Store results
            self.analysis_results = {
                'type': 'video',
                'results': results
            }
            
            self.root.after(0, lambda: self.status_label.config(text="Finalizing results..."))
            self.root.after(0, lambda: self.progress_var.set(100))
            
            # Display results
            self.root.after(0, lambda: self.display_video_results())
            
        except Exception as e:
            self.root.after(0, lambda: self.show_error(f"Video analysis failed: {str(e)}"))
    
    def analyze_audio(self):
        """Analyze audio file"""
        try:
            self.root.after(0, lambda: self.status_label.config(text="Analyzing audio..."))
            self.root.after(0, lambda: self.progress_var.set(30))
            
            # Perform audio analysis
            confidence, prediction, details = self.audio_detector.detect_deepfake(self.current_file_path)
            
            self.root.after(0, lambda: self.status_label.config(text="Processing results..."))
            self.root.after(0, lambda: self.progress_var.set(80))
            
            # Store results
            self.analysis_results = {
                'type': 'audio',
                'prediction': prediction,
                'confidence': confidence,
                'details': details
            }
            
            self.root.after(0, lambda: self.status_label.config(text="Finalizing results..."))
            self.root.after(0, lambda: self.progress_var.set(100))
            
            # Display results
            self.root.after(0, lambda: self.display_audio_results())
            
        except Exception as e:
            self.root.after(0, lambda: self.show_error(f"Audio analysis failed: {str(e)}"))
    
    def display_image_results(self):
        """Display image analysis results"""
        if not self.analysis_results or self.analysis_results['type'] != 'image':
            return
        
        try:
            prediction = self.analysis_results['prediction']
            confidence = self.analysis_results['confidence']
            details = self.analysis_results['details']
            
            # Display summary in layman terms
            summary = f"🔍 DEEPFAKE DETECTION RESULTS\n"
            summary += f"{'='*50}\n\n"
            
            # Main result in simple terms
            if prediction == "FAKE":
                summary += f"🚨 RESULT: This image appears to be FAKE or AI-generated\n"
                summary += f"📊 Confidence: {confidence:.0f}% sure\n\n"
            else:
                summary += f"✅ RESULT: This image appears to be REAL and authentic\n"
                summary += f"📊 Confidence: {confidence:.0f}% sure\n\n"
            
            # Simple explanation of what was checked
            summary += f"🔬 WHAT WE CHECKED:\n"
            summary += f"• Face detection and analysis\n"
            summary += f"• Lighting and shadows\n"
            summary += f"• Skin texture and smoothness\n"
            summary += f"• Facial symmetry\n"
            summary += f"• Edge quality and blending\n"
            summary += f"• Filter detection\n\n"
            
            # Face analysis in simple terms
            face_features = details.get('face_features', {})
            if face_features.get('face_detected', False):
                summary += f"👤 FACE ANALYSIS:\n"
                summary += f"• Face found: ✅ Yes\n"
                
                # Face symmetry in simple terms
                symmetry = face_features.get('face_symmetry', 0)
                if symmetry > 0.8:
                    summary += f"• Face symmetry: ✅ Good (looks natural)\n"
                elif symmetry > 0.6:
                    summary += f"• Face symmetry: ⚠️  Okay (slightly uneven)\n"
                else:
                    summary += f"• Face symmetry: ❌ Poor (very uneven)\n"
                
                # Face size in simple terms
                size_ratio = face_features.get('face_size_ratio', 0)
                if size_ratio > 0.1:
                    summary += f"• Face size: ✅ Good (clear and visible)\n"
                else:
                    summary += f"• Face size: ⚠️  Small (hard to analyze)\n"
                summary += f"\n"
            
            # Filter detection in simple terms
            artifact_analysis = face_features.get('artifact_analysis', {})
            filter_analysis = artifact_analysis.get('filter_analysis', {})
            if filter_analysis.get('likely_has_filter', False):
                summary += f"🎨 FILTER DETECTION:\n"
                summary += f"• Social media filter: ✅ Detected\n"
                summary += f"• Analysis adjusted: ✅ Yes (more lenient)\n"
                summary += f"• Reason: Filters can make real images look artificial\n\n"
            
            # Forensic analysis in simple terms
            forensic_analysis = face_features.get('forensic_analysis', {})
            if forensic_analysis and 'forensic_score' in forensic_analysis:
                forensic_score = forensic_analysis['forensic_score']
                summary += f"🔍 FORENSIC ANALYSIS:\n"
                
                if forensic_score.get('is_likely_deepfake', False):
                    summary += f"• Overall assessment: ❌ Likely fake\n"
                    summary += f"• Deepfake indicators: {forensic_score.get('deepfake_indicators', 0)} found\n"
                else:
                    summary += f"• Overall assessment: ✅ Likely real\n"
                    summary += f"• Deepfake indicators: {forensic_score.get('deepfake_indicators', 0)} found\n"
                
                # Specific checks in simple terms
                lighting = forensic_analysis.get('lighting_analysis', {})
                if lighting.get('inconsistent_lighting', False):
                    summary += f"• Lighting: ❌ Inconsistent (artificial)\n"
                else:
                    summary += f"• Lighting: ✅ Natural and consistent\n"
                
                skin = forensic_analysis.get('skin_analysis', {})
                if skin.get('overly_smooth', False):
                    summary += f"• Skin texture: ❌ Too smooth (artificial)\n"
                else:
                    summary += f"• Skin texture: ✅ Natural texture\n"
                
                symmetry = forensic_analysis.get('symmetry_analysis', {})
                if symmetry.get('asymmetric_face', False):
                    summary += f"• Face features: ❌ Uneven (artificial)\n"
                else:
                    summary += f"• Face features: ✅ Well-balanced\n"
                
                summary += f"\n"
            
            # Final interpretation in simple terms
            if prediction == "FAKE":
                summary += f"⚠️  WHAT THIS MEANS:\n"
                summary += f"This image shows signs of being created or modified by AI.\n"
                summary += f"It may be a deepfake, face swap, or AI-generated image.\n"
                summary += f"Be cautious about trusting this image.\n\n"
            else:
                summary += f"✅ WHAT THIS MEANS:\n"
                summary += f"This image appears to be a real, unmodified photograph.\n"
                summary += f"The person in the image is likely authentic.\n"
                summary += f"You can be confident this is a real image.\n\n"
            
            summary += f"ℹ️  IMPORTANT NOTE:\n"
            summary += f"This is an AI analysis tool. While highly accurate,\n"
            summary += f"results should be used as guidance, not absolute proof.\n"
            summary += f"For legal or professional use, consult experts."
            
            self.summary_text.delete(1.0, tk.END)
            self.summary_text.insert(1.0, summary)
            
            # Display detailed analysis
            self.display_detailed_analysis(details)
            
            self.status_label.config(text="Image analysis complete")
            self.progress_var.set(0)
            
        except Exception as e:
            self.show_error(f"Error displaying image results: {str(e)}")
    
    def display_video_results(self):
        """Display video analysis results"""
        if not self.analysis_results or self.analysis_results['type'] != 'video':
            return
        
        try:
            results = self.analysis_results['results']
            
            if 'error' in results:
                self.show_error(f"Video analysis error: {results['error']}")
                return
            
            # Display summary in layman terms
            summary = f"🎬 VIDEO DEEPFAKE ANALYSIS RESULTS\n"
            summary += f"{'='*50}\n\n"
            
            # Main result in simple terms
            if results['prediction'] == "FAKE":
                summary += f"🚨 RESULT: This video appears to contain FAKE or AI-generated content\n"
                summary += f"📊 Confidence: {results['confidence']:.0f}% sure\n\n"
            else:
                summary += f"✅ RESULT: This video appears to be REAL and authentic\n"
                summary += f"📊 Confidence: {results['confidence']:.0f}% sure\n\n"
            
            # Simple explanation of what was checked
            summary += f"🔬 WHAT WE CHECKED:\n"
            summary += f"• Analyzed multiple video frames\n"
            summary += f"• Checked face consistency over time\n"
            summary += f"• Looked for unnatural movements\n"
            summary += f"• Examined lighting and shadows\n"
            summary += f"• Detected artificial patterns\n\n"
            
            # Frame analysis in simple terms
            frame_analysis = results.get('frame_analysis', {})
            if frame_analysis:
                total_frames = frame_analysis.get('total_frames_analyzed', 0)
                fake_frames = frame_analysis.get('fake_frames', 0)
                real_frames = frame_analysis.get('real_frames', 0)
                fake_ratio = frame_analysis.get('fake_ratio', 0)
                
                summary += f"📹 FRAME ANALYSIS:\n"
                summary += f"• Frames analyzed: {total_frames}\n"
                summary += f"• Frames that look fake: {fake_frames}\n"
                summary += f"• Frames that look real: {real_frames}\n"
                
                if fake_ratio > 0.7:
                    summary += f"• Overall assessment: ❌ Mostly fake frames\n"
                elif fake_ratio < 0.3:
                    summary += f"• Overall assessment: ✅ Mostly real frames\n"
                else:
                    summary += f"• Overall assessment: ⚠️  Mixed results\n"
                summary += f"\n"
            
            # Video score in simple terms
            video_score = results.get('video_score', {})
            if video_score:
                overall_score = video_score.get('overall_score', 0.5)
                summary += f"📊 OVERALL VIDEO QUALITY:\n"
                
                if overall_score > 0.8:
                    summary += f"• Video quality: ✅ Excellent (very likely real)\n"
                elif overall_score > 0.6:
                    summary += f"• Video quality: ✅ Good (likely real)\n"
                elif overall_score > 0.4:
                    summary += f"• Video quality: ⚠️  Uncertain (mixed signals)\n"
                else:
                    summary += f"• Video quality: ❌ Poor (likely fake)\n"
                summary += f"\n"
            
            # Final interpretation in simple terms
            if results['prediction'] == "FAKE":
                summary += f"⚠️  WHAT THIS MEANS:\n"
                summary += f"This video shows signs of being created or modified by AI.\n"
                summary += f"It may contain deepfake faces, face swaps, or AI-generated content.\n"
                summary += f"Be very cautious about trusting this video.\n\n"
            else:
                summary += f"✅ WHAT THIS MEANS:\n"
                summary += f"This video appears to be authentic and unmodified.\n"
                summary += f"The people in the video are likely real and genuine.\n"
                summary += f"You can be confident this is a real video.\n\n"
            
            summary += f"ℹ️  IMPORTANT NOTE:\n"
            summary += f"This is an AI analysis tool. While highly accurate,\n"
            summary += f"results should be used as guidance, not absolute proof.\n"
            summary += f"For legal or professional use, consult experts."
            
            self.summary_text.delete(1.0, tk.END)
            self.summary_text.insert(1.0, summary)
            
            # Display detailed analysis
            self.display_detailed_video_analysis(results)
            
            # Create charts for video
            self.create_video_charts(results)
            
            self.status_label.config(text="Video analysis complete")
            self.progress_var.set(0)
            
        except Exception as e:
            self.show_error(f"Error displaying video results: {str(e)}")
    
    def display_audio_results(self):
        """Display audio analysis results"""
        if not self.analysis_results or self.analysis_results['type'] != 'audio':
            return
        
        try:
            prediction = self.analysis_results['prediction']
            confidence = self.analysis_results['confidence']
            details = self.analysis_results['details']
            
            # Display summary in layman terms
            summary = f"🎵 AUDIO DEEPFAKE ANALYSIS RESULTS\n"
            summary += f"{'='*50}\n\n"
            
            # Main result in simple terms
            if prediction == "FAKE":
                summary += f"🚨 RESULT: This audio appears to be FAKE or AI-generated\n"
                summary += f"📊 Confidence: {confidence:.0f}% sure\n\n"
            else:
                summary += f"✅ RESULT: This audio appears to be REAL and authentic\n"
                summary += f"📊 Confidence: {confidence:.0f}% sure\n\n"
            
            # Simple explanation of what was checked
            summary += f"🔬 WHAT WE CHECKED:\n"
            summary += f"• Audio waveform patterns\n"
            summary += f"• Spectral characteristics\n"
            summary += f"• Mel-frequency features\n"
            summary += f"• Temporal consistency\n"
            summary += f"• Harmonic structure\n"
            summary += f"• Noise patterns\n\n"
            
            # Model analysis in simple terms
            model_predictions = details.get('model_predictions', {})
            model_confidences = details.get('model_confidences', {})
            
            if model_predictions:
                summary += f"🤖 AI MODEL ANALYSIS:\n"
                for model_name, pred in model_predictions.items():
                    model_conf = model_confidences.get(model_name, 0) * 100
                    pred_text = "FAKE" if pred == 1 else "REAL"
                    
                    # Convert model names to simple terms
                    if 'aasist' in model_name.lower():
                        model_display = "Advanced Audio Model 1 (Graph Attention)"
                    elif 'rawnet2' in model_name.lower():
                        model_display = "Advanced Audio Model 2 (Raw Waveform)"
                    else:
                        model_display = model_name
                    
                    summary += f"• {model_display}: {pred_text} ({model_conf:.0f}% sure)\n"
                summary += f"\n"
            
            # Audio features in simple terms
            audio_features = details.get('audio_features', {})
            if audio_features:
                summary += f"🎼 AUDIO CHARACTERISTICS:\n"
                
                # Duration
                duration = audio_features.get('duration', 0)
                summary += f"• Duration: {duration:.1f} seconds\n"
                
                # Energy
                rms_energy = audio_features.get('rms_energy', 0)
                if rms_energy > 0.1:
                    summary += f"• Audio energy: ✅ Strong and clear\n"
                elif rms_energy > 0.05:
                    summary += f"• Audio energy: ⚠️  Moderate\n"
                else:
                    summary += f"• Audio energy: ❌ Weak or quiet\n"
                
                # Zero crossing rate
                zcr = audio_features.get('zero_crossing_rate', 0)
                if zcr > 0.1:
                    summary += f"• Speech patterns: ✅ Natural speech characteristics\n"
                else:
                    summary += f"• Speech patterns: ⚠️  Unusual characteristics\n"
                
                # Spectral centroid
                spec_centroid = audio_features.get('spectral_centroid_mean', 0)
                if spec_centroid > 1000:
                    summary += f"• Frequency content: ✅ Rich and varied\n"
                else:
                    summary += f"• Frequency content: ⚠️  Limited range\n"
                
                summary += f"\n"
            
            # Analysis methods in simple terms
            analysis_methods = details.get('analysis_methods', [])
            if analysis_methods:
                summary += f"🔍 ANALYSIS METHODS USED:\n"
                for method in analysis_methods:
                    summary += f"• {method}\n"
                summary += f"\n"
            
            # Final interpretation in simple terms
            if prediction == "FAKE":
                summary += f"⚠️  WHAT THIS MEANS:\n"
                summary += f"This audio shows signs of being created or modified by AI.\n"
                summary += f"It may be synthetic speech, voice cloning, or AI-generated audio.\n"
                summary += f"Be cautious about trusting this audio content.\n\n"
            else:
                summary += f"✅ WHAT THIS MEANS:\n"
                summary += f"This audio appears to be authentic and unmodified.\n"
                summary += f"The speaker in the audio is likely real and genuine.\n"
                summary += f"You can be confident this is real audio.\n\n"
            
            summary += f"ℹ️  IMPORTANT NOTE:\n"
            summary += f"This is an AI analysis tool. While highly accurate,\n"
            summary += f"results should be used as guidance, not absolute proof.\n"
            summary += f"For legal or professional use, consult experts."
            
            self.summary_text.delete(1.0, tk.END)
            self.summary_text.insert(1.0, summary)
            
            # Display detailed analysis
            self.display_detailed_audio_analysis(details)
            
            self.status_label.config(text="Audio analysis complete")
            self.progress_var.set(0)
            
        except Exception as e:
            self.show_error(f"Error displaying audio results: {str(e)}")
    
    def display_detailed_analysis(self, details):
        """Display detailed analysis for images in layman terms"""
        try:
            details_text = f"🔍 DETAILED ANALYSIS BREAKDOWN\n"
            details_text += f"{'='*50}\n\n"
            
            # Face features in simple terms
            face_features = details.get('face_features', {})
            if face_features:
                details_text += f"👤 FACE ANALYSIS DETAILS:\n"
                
                if face_features.get('face_detected', False):
                    details_text += f"• Face detection: ✅ Successfully found a face\n"
                    
                    # Face symmetry explanation
                    symmetry = face_features.get('face_symmetry', 0)
                    if symmetry > 0.8:
                        details_text += f"• Face balance: ✅ Very well balanced (natural)\n"
                    elif symmetry > 0.6:
                        details_text += f"• Face balance: ⚠️  Somewhat uneven (could be natural)\n"
                    else:
                        details_text += f"• Face balance: ❌ Very uneven (suspicious)\n"
                    
                    # Face size explanation
                    size_ratio = face_features.get('face_size_ratio', 0)
                    if size_ratio > 0.1:
                        details_text += f"• Face clarity: ✅ Clear and well-defined\n"
                    else:
                        details_text += f"• Face clarity: ⚠️  Small or unclear\n"
                else:
                    details_text += f"• Face detection: ❌ No face found\n"
                details_text += f"\n"
            
            # Artifact analysis in simple terms
            artifact_analysis = face_features.get('artifact_analysis', {})
            if artifact_analysis:
                details_text += f"🎨 IMAGE QUALITY ANALYSIS:\n"
                
                # Border analysis
                border_analysis = artifact_analysis.get('border_analysis', {})
                if border_analysis:
                    border_quality = border_analysis.get('border_quality', 1.0)
                    if border_quality > 0.8:
                        details_text += f"• Face edges: ✅ Smooth and natural\n"
                    elif border_quality > 0.6:
                        details_text += f"• Face edges: ⚠️  Somewhat rough\n"
                    else:
                        details_text += f"• Face edges: ❌ Very rough or artificial\n"
                
                # Edge analysis
                edge_analysis = artifact_analysis.get('edge_analysis', {})
                if edge_analysis:
                    edge_uniformity = edge_analysis.get('edge_uniformity', 1.0)
                    if edge_uniformity > 0.8:
                        details_text += f"• Edge patterns: ✅ Natural and consistent\n"
                    else:
                        details_text += f"• Edge patterns: ❌ Inconsistent or artificial\n"
                
                # Lighting analysis
                lighting_analysis = artifact_analysis.get('lighting_analysis', {})
                if lighting_analysis:
                    brightness_uniformity = lighting_analysis.get('brightness_uniformity', 1.0)
                    if brightness_uniformity > 0.8:
                        details_text += f"• Lighting: ✅ Natural and even\n"
                    else:
                        details_text += f"• Lighting: ❌ Uneven or artificial\n"
                
                details_text += f"\n"
            
            # Forensic analysis in simple terms
            forensic_analysis = face_features.get('forensic_analysis', {})
            if forensic_analysis and 'forensic_score' in forensic_analysis:
                forensic_score = forensic_analysis['forensic_score']
                details_text += f"🔬 FORENSIC ANALYSIS DETAILS:\n"
                
                # Overall assessment
                if forensic_score.get('is_likely_deepfake', False):
                    details_text += f"• Overall assessment: ❌ Likely fake or AI-generated\n"
                else:
                    details_text += f"• Overall assessment: ✅ Likely real and authentic\n"
                
                # Specific indicators
                indicators = forensic_score.get('deepfake_indicators', 0)
                total = forensic_score.get('total_indicators', 0)
                details_text += f"• Suspicious indicators found: {indicators} out of {total}\n"
                
                # Detailed breakdown
                details_text += f"\nSPECIFIC CHECKS:\n"
                
                # Lighting check
                lighting = forensic_analysis.get('lighting_analysis', {})
                if lighting.get('inconsistent_lighting', False):
                    details_text += f"• Lighting consistency: ❌ Inconsistent (artificial lighting)\n"
                else:
                    details_text += f"• Lighting consistency: ✅ Consistent (natural lighting)\n"
                
                # Skin check
                skin = forensic_analysis.get('skin_analysis', {})
                if skin.get('overly_smooth', False):
                    details_text += f"• Skin texture: ❌ Too smooth (artificially enhanced)\n"
                else:
                    details_text += f"• Skin texture: ✅ Natural texture (realistic)\n"
                
                # Symmetry check
                symmetry = forensic_analysis.get('symmetry_analysis', {})
                if symmetry.get('asymmetric_face', False):
                    details_text += f"• Face symmetry: ❌ Very uneven (artificial)\n"
                else:
                    details_text += f"• Face symmetry: ✅ Well-balanced (natural)\n"
                
                # Edge check
                edge = forensic_analysis.get('edge_analysis', {})
                if edge.get('unnatural_edges', False):
                    details_text += f"• Edge quality: ❌ Unnatural edges (artificial)\n"
                else:
                    details_text += f"• Edge quality: ✅ Natural edges (realistic)\n"
                
                # Frequency check
                frequency = forensic_analysis.get('frequency_analysis', {})
                if frequency.get('suspicious_frequency', False):
                    details_text += f"• Image patterns: ❌ Artificial patterns detected\n"
                else:
                    details_text += f"• Image patterns: ✅ Natural patterns (realistic)\n"
                
                details_text += f"\n"
            
            # Model predictions in simple terms
            if 'model_predictions' in details:
                details_text += f"🤖 AI MODEL PREDICTIONS:\n"
                for model_name, pred in details['model_predictions'].items():
                    model_confidence = details['model_confidences'].get(model_name, 0) * 100
                    pred_text = "FAKE" if pred == 1 else "REAL"
                    
                    # Convert model names to simple terms
                    if 'efficientnet' in model_name.lower():
                        model_display = "Advanced AI Model 1"
                    elif 'resnet' in model_name.lower():
                        model_display = "Advanced AI Model 2"
                    elif 'vit' in model_name.lower():
                        model_display = "Advanced AI Model 3"
                    else:
                        model_display = model_name
                    
                    details_text += f"• {model_display}: {pred_text} ({model_confidence:.0f}% sure)\n"
                details_text += f"\n"
            
            # Final explanation
            details_text += f"💡 HOW TO INTERPRET THESE RESULTS:\n"
            details_text += f"• ✅ = Good/Natural (supports real image)\n"
            details_text += f"• ⚠️  = Okay/Uncertain (neutral)\n"
            details_text += f"• ❌ = Poor/Artificial (supports fake image)\n"
            details_text += f"\n"
            details_text += f"The more ✅ marks, the more likely the image is real.\n"
            details_text += f"The more ❌ marks, the more likely the image is fake.\n"
            
            self.details_text.delete(1.0, tk.END)
            self.details_text.insert(1.0, details_text)
            
        except Exception as e:
            logger.error(f"Error displaying detailed analysis: {e}")
    
    def display_detailed_video_analysis(self, results):
        """Display detailed analysis for videos in layman terms"""
        try:
            details_text = f"🎬 DETAILED VIDEO ANALYSIS BREAKDOWN\n"
            details_text += f"{'='*50}\n\n"
            
            # Frame analysis details in simple terms
            frame_analysis = results.get('frame_analysis', {})
            if frame_analysis:
                details_text += f"📹 FRAME-BY-FRAME ANALYSIS:\n"
                frame_results = frame_analysis.get('frame_results', [])
                
                # Show first 10 frames with simple explanations
                for i, result in enumerate(frame_results[:10]):
                    frame_num = result['frame_number']
                    prediction = result['prediction']
                    confidence = result['confidence']
                    
                    if prediction == "FAKE":
                        details_text += f"• Frame {frame_num}: ❌ Looks fake ({confidence:.0f}% sure)\n"
                    else:
                        details_text += f"• Frame {frame_num}: ✅ Looks real ({confidence:.0f}% sure)\n"
                
                if len(frame_results) > 10:
                    details_text += f"• ... and {len(frame_results) - 10} more frames analyzed\n"
                
                # Overall frame assessment
                fake_frames = frame_analysis.get('fake_frames', 0)
                real_frames = frame_analysis.get('real_frames', 0)
                total_frames = len(frame_results)
                
                details_text += f"\nFRAME SUMMARY:\n"
                details_text += f"• Total frames analyzed: {total_frames}\n"
                details_text += f"• Frames that look real: {real_frames}\n"
                details_text += f"• Frames that look fake: {fake_frames}\n"
                
                if fake_frames > real_frames:
                    details_text += f"• Overall trend: ❌ More fake-looking frames\n"
                elif real_frames > fake_frames:
                    details_text += f"• Overall trend: ✅ More real-looking frames\n"
                else:
                    details_text += f"• Overall trend: ⚠️  Mixed results\n"
                
                details_text += f"\n"
            
            # Video score details in simple terms
            video_score = results.get('video_score', {})
            if video_score:
                details_text += f"📊 VIDEO QUALITY BREAKDOWN:\n"
                component_scores = video_score.get('component_scores', {})
                
                # Convert component names to simple terms
                component_names = {
                    'frame_analysis': 'Frame Analysis',
                    'temporal_analysis': 'Consistency Over Time',
                    'face_tracking': 'Face Movement',
                    'motion_analysis': 'Motion Patterns'
                }
                
                for component, score in component_scores.items():
                    display_name = component_names.get(component, component.replace('_', ' ').title())
                    
                    if score > 0.8:
                        details_text += f"• {display_name}: ✅ Excellent ({score:.0%})\n"
                    elif score > 0.6:
                        details_text += f"• {display_name}: ✅ Good ({score:.0%})\n"
                    elif score > 0.4:
                        details_text += f"• {display_name}: ⚠️  Okay ({score:.0%})\n"
                    else:
                        details_text += f"• {display_name}: ❌ Poor ({score:.0%})\n"
                
                details_text += f"\n"
            
            # Temporal analysis in simple terms
            temporal_analysis = results.get('temporal_analysis', {})
            if temporal_analysis:
                details_text += f"⏱️  CONSISTENCY OVER TIME:\n"
                
                stability = temporal_analysis.get('prediction_stability', 0)
                if stability > 0.8:
                    details_text += f"• Prediction stability: ✅ Very consistent\n"
                elif stability > 0.6:
                    details_text += f"• Prediction stability: ✅ Mostly consistent\n"
                else:
                    details_text += f"• Prediction stability: ❌ Inconsistent (suspicious)\n"
                
                consistency = temporal_analysis.get('confidence_consistency', 0)
                if consistency > 0.8:
                    details_text += f"• Confidence stability: ✅ Very stable\n"
                else:
                    details_text += f"• Confidence stability: ❌ Unstable (suspicious)\n"
                
                details_text += f"\n"
            
            # Face tracking in simple terms
            face_tracking = results.get('face_tracking', {})
            if face_tracking:
                details_text += f"👤 FACE TRACKING ANALYSIS:\n"
                
                detection_rate = face_tracking.get('face_detection_rate', 0)
                if detection_rate > 0.8:
                    details_text += f"• Face detection: ✅ Faces found in most frames\n"
                elif detection_rate > 0.5:
                    details_text += f"• Face detection: ⚠️  Faces found in some frames\n"
                else:
                    details_text += f"• Face detection: ❌ Few faces found (suspicious)\n"
                
                movement_consistency = face_tracking.get('movement_consistency', 0)
                if movement_consistency > 0.8:
                    details_text += f"• Face movement: ✅ Natural and smooth\n"
                else:
                    details_text += f"• Face movement: ❌ Unnatural or jerky\n"
                
                details_text += f"\n"
            
            # Motion analysis in simple terms
            motion_analysis = results.get('motion_analysis', {})
            if motion_analysis:
                details_text += f"🏃 MOTION ANALYSIS:\n"
                
                motion_consistency = motion_analysis.get('motion_consistency', 0)
                if motion_consistency > 0.8:
                    details_text += f"• Motion patterns: ✅ Natural and consistent\n"
                else:
                    details_text += f"• Motion patterns: ❌ Unnatural or inconsistent\n"
                
                motion_stability = motion_analysis.get('motion_stability', 0)
                if motion_stability > 0.8:
                    details_text += f"• Motion stability: ✅ Smooth and stable\n"
                else:
                    details_text += f"• Motion stability: ❌ Jerky or unstable\n"
                
                details_text += f"\n"
            
            # Final explanation
            details_text += f"💡 HOW TO INTERPRET VIDEO RESULTS:\n"
            details_text += f"• ✅ = Good/Natural (supports real video)\n"
            details_text += f"• ⚠️  = Okay/Uncertain (neutral)\n"
            details_text += f"• ❌ = Poor/Artificial (supports fake video)\n"
            details_text += f"\n"
            details_text += f"For videos, consistency over time is key.\n"
            details_text += f"Real videos have consistent patterns, fake videos often have inconsistencies.\n"
            
            self.details_text.delete(1.0, tk.END)
            self.details_text.insert(1.0, details_text)
            
        except Exception as e:
            logger.error(f"Error displaying detailed video analysis: {e}")
    
    def display_detailed_audio_analysis(self, details):
        """Display detailed analysis for audio in layman terms"""
        try:
            details_text = f"🎵 DETAILED AUDIO ANALYSIS BREAKDOWN\n"
            details_text += f"{'='*50}\n\n"
            
            # Model predictions in simple terms
            model_predictions = details.get('model_predictions', {})
            model_confidences = details.get('model_confidences', {})
            
            if model_predictions:
                details_text += f"🤖 AI MODEL PREDICTIONS:\n"
                for model_name, pred in model_predictions.items():
                    model_conf = model_confidences.get(model_name, 0) * 100
                    pred_text = "FAKE" if pred == 1 else "REAL"
                    
                    # Convert model names to simple terms
                    if 'aasist' in model_name.lower():
                        model_display = "Advanced Audio Model 1 (Graph Attention Networks)"
                        model_desc = "Analyzes spectro-temporal relationships using graph attention"
                    elif 'rawnet2' in model_name.lower():
                        model_display = "Advanced Audio Model 2 (Raw Waveform Analysis)"
                        model_desc = "Processes raw audio waveforms end-to-end"
                    else:
                        model_display = model_name
                        model_desc = "Advanced audio analysis model"
                    
                    details_text += f"• {model_display}: {pred_text} ({model_conf:.0f}% sure)\n"
                    details_text += f"  Description: {model_desc}\n"
                details_text += f"\n"
            
            # Audio features in simple terms
            audio_features = details.get('audio_features', {})
            if audio_features:
                details_text += f"🎼 AUDIO FEATURE ANALYSIS:\n"
                
                # Basic properties
                duration = audio_features.get('duration', 0)
                sample_rate = audio_features.get('sample_rate', 0)
                details_text += f"• Duration: {duration:.1f} seconds\n"
                details_text += f"• Sample Rate: {sample_rate} Hz\n"
                
                # Energy analysis
                rms_energy = audio_features.get('rms_energy', 0)
                details_text += f"• Audio Energy: {rms_energy:.3f} (higher = louder)\n"
                if rms_energy > 0.1:
                    details_text += f"  Assessment: ✅ Strong and clear audio\n"
                elif rms_energy > 0.05:
                    details_text += f"  Assessment: ⚠️  Moderate audio level\n"
                else:
                    details_text += f"  Assessment: ❌ Weak or quiet audio\n"
                
                # Zero crossing rate
                zcr = audio_features.get('zero_crossing_rate', 0)
                details_text += f"• Speech Patterns: {zcr:.3f} (higher = more speech-like)\n"
                if zcr > 0.1:
                    details_text += f"  Assessment: ✅ Natural speech characteristics\n"
                else:
                    details_text += f"  Assessment: ⚠️  Unusual speech patterns\n"
                
                # Spectral features
                spec_centroid = audio_features.get('spectral_centroid_mean', 0)
                spec_centroid_std = audio_features.get('spectral_centroid_std', 0)
                details_text += f"• Frequency Content: {spec_centroid:.0f} Hz (average)\n"
                details_text += f"• Frequency Variation: {spec_centroid_std:.0f} Hz (variability)\n"
                if spec_centroid > 1000:
                    details_text += f"  Assessment: ✅ Rich and varied frequencies\n"
                else:
                    details_text += f"  Assessment: ⚠️  Limited frequency range\n"
                
                # MFCC features
                mfcc_mean = audio_features.get('mfcc_mean', [])
                if mfcc_mean:
                    details_text += f"• Speech Characteristics: {len(mfcc_mean)} features analyzed\n"
                    details_text += f"  Assessment: ✅ Comprehensive speech analysis\n"
                
                # Chroma features
                chroma_mean = audio_features.get('chroma_mean', [])
                if chroma_mean:
                    details_text += f"• Musical Content: {len(chroma_mean)} pitch classes analyzed\n"
                    details_text += f"  Assessment: ✅ Musical structure detected\n"
                
                # Tempo and rhythm
                tempo = audio_features.get('tempo', 0)
                beat_count = audio_features.get('beat_count', 0)
                if tempo > 0:
                    details_text += f"• Tempo: {tempo:.1f} BPM\n"
                    details_text += f"• Beat Count: {beat_count} beats detected\n"
                    details_text += f"  Assessment: ✅ Rhythmic structure present\n"
                
                details_text += f"\n"
            
            # Preprocessing information
            preprocessing_info = details.get('preprocessing_info', {})
            if preprocessing_info:
                details_text += f"⚙️  AUDIO PROCESSING DETAILS:\n"
                details_text += f"• Sample Rate: {preprocessing_info.get('sample_rate', 0)} Hz\n"
                details_text += f"• Duration: {preprocessing_info.get('duration', 0):.1f} seconds\n"
                details_text += f"• Mel Bins: {preprocessing_info.get('n_mels', 0)} frequency bins\n"
                details_text += f"• FFT Size: {preprocessing_info.get('n_fft', 0)} samples\n"
                details_text += f"• Hop Length: {preprocessing_info.get('hop_length', 0)} samples\n"
                details_text += f"\n"
            
            # Analysis methods
            analysis_methods = details.get('analysis_methods', [])
            if analysis_methods:
                details_text += f"🔍 ANALYSIS METHODS USED:\n"
                for i, method in enumerate(analysis_methods, 1):
                    details_text += f"{i}. {method}\n"
                details_text += f"\n"
            
            # Final explanation
            details_text += f"💡 HOW TO INTERPRET AUDIO RESULTS:\n"
            details_text += f"• ✅ = Good/Natural (supports real audio)\n"
            details_text += f"• ⚠️  = Okay/Uncertain (neutral)\n"
            details_text += f"• ❌ = Poor/Artificial (supports fake audio)\n"
            details_text += f"\n"
            details_text += f"For audio deepfakes, look for:\n"
            details_text += f"• Unnatural speech patterns\n"
            details_text += f"• Inconsistent frequency content\n"
            details_text += f"• Artificial noise characteristics\n"
            details_text += f"• Unusual harmonic structure\n"
            details_text += f"• Temporal inconsistencies\n"
            
            self.details_text.delete(1.0, tk.END)
            self.details_text.insert(1.0, details_text)
            
        except Exception as e:
            logger.error(f"Error displaying detailed audio analysis: {e}")
    
    def create_video_charts(self, results):
        """Create charts for video analysis"""
        try:
            # Clear previous charts
            for widget in self.charts_frame.winfo_children():
                widget.destroy()
            
            # Create figure with subplots
            fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(12, 8))
            fig.suptitle('Video Deepfake Analysis Charts', fontsize=16)
            
            # Chart 1: Frame predictions over time
            frame_analysis = results.get('frame_analysis', {})
            frame_results = frame_analysis.get('frame_results', [])
            
            if frame_results:
                timestamps = [r['timestamp'] for r in frame_results]
                predictions = [1 if r['prediction'] == 'FAKE' else 0 for r in frame_results]
                confidences = [r['confidence'] for r in frame_results]
                
                ax1.plot(timestamps, predictions, 'b-', alpha=0.7, label='Predictions')
                ax1.set_xlabel('Time (seconds)')
                ax1.set_ylabel('Prediction (0=Real, 1=Fake)')
                ax1.set_title('Frame Predictions Over Time')
                ax1.grid(True, alpha=0.3)
                ax1.legend()
            
            # Chart 2: Confidence over time
            if frame_results:
                ax2.plot(timestamps, confidences, 'r-', alpha=0.7)
                ax2.set_xlabel('Time (seconds)')
                ax2.set_ylabel('Confidence (%)')
                ax2.set_title('Confidence Over Time')
                ax2.grid(True, alpha=0.3)
            
            # Chart 3: Component scores
            video_score = results.get('video_score', {})
            component_scores = video_score.get('component_scores', {})
            
            if component_scores:
                components = list(component_scores.keys())
                scores = list(component_scores.values())
                
                ax3.bar(components, scores, alpha=0.7, color=['blue', 'green', 'orange', 'red'])
                ax3.set_xlabel('Analysis Components')
                ax3.set_ylabel('Score')
                ax3.set_title('Component Scores')
                ax3.tick_params(axis='x', rotation=45)
                ax3.grid(True, alpha=0.3)
            
            # Chart 4: Fake/Real frame distribution
            if frame_analysis:
                fake_frames = frame_analysis.get('fake_frames', 0)
                real_frames = frame_analysis.get('real_frames', 0)
                
                ax4.pie([real_frames, fake_frames], labels=['Real', 'Fake'], 
                       autopct='%1.1f%%', startangle=90, colors=['green', 'red'])
                ax4.set_title('Frame Distribution')
            
            plt.tight_layout()
            
            # Embed chart in tkinter
            canvas = FigureCanvasTkAgg(fig, self.charts_frame)
            canvas.draw()
            canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
            
        except Exception as e:
            # If chart creation fails, show error message
            error_label = ttk.Label(self.charts_frame, text=f"Error creating charts: {str(e)}")
            error_label.pack(expand=True)
    
    def clear_results(self):
        """Clear all result displays"""
        self.summary_text.delete(1.0, tk.END)
        self.details_text.delete(1.0, tk.END)
        
        # Clear charts
        for widget in self.charts_frame.winfo_children():
            widget.destroy()
    
    def show_error(self, error_message):
        """Show error message"""
        self.status_label.config(text="Error occurred")
        self.progress_var.set(0)
        messagebox.showerror("Error", error_message)

def main():
    """Main function to run the unified GUI application"""
    root = tk.Tk()
    app = UnifiedDeepfakeDetectionGUI(root)
    
    # Center the window
    root.update_idletasks()
    x = (root.winfo_screenwidth() // 2) - (root.winfo_width() // 2)
    y = (root.winfo_screenheight() // 2) - (root.winfo_height() // 2)
    root.geometry(f"+{x}+{y}")
    
    root.mainloop()

if __name__ == "__main__":
    main()
