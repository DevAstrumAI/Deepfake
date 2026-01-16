#!/usr/bin/env python3
"""
Installation script for Deepfake Detection System
Handles installation of dependencies and model setup
"""

import subprocess
import sys
import os
import platform

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def install_dependencies():
    """Install all required dependencies"""
    print("🚀 Installing Deepfake Detection System Dependencies")
    print("=" * 60)
    
    # Check Python version
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        return False
    
    print(f"✅ Python {python_version.major}.{python_version.minor} detected")
    
    # Upgrade pip
    if not run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip"):
        return False
    
    # Install basic dependencies
    basic_deps = [
        "torch>=2.0.0",
        "torchvision>=0.15.0", 
        "timm>=0.9.0",
        "opencv-python>=4.8.0",
        "pillow>=10.0.0",
        "numpy>=1.24.0",
        "matplotlib>=3.7.0",
        "scikit-learn>=1.3.0",
        "albumentations>=1.3.0",
        "seaborn>=0.12.0"
    ]
    
    for dep in basic_deps:
        if not run_command(f"{sys.executable} -m pip install {dep}", f"Installing {dep.split('>=')[0]}"):
            print(f"⚠️  Warning: Failed to install {dep}, continuing...")
    
    # Install face recognition dependencies
    print("\n🔍 Installing face recognition dependencies...")
    
    # Install dlib (this can be tricky on some systems)
    if platform.system() == "Darwin":  # macOS
        if not run_command(f"{sys.executable} -m pip install dlib", "Installing dlib (macOS)"):
            print("⚠️  dlib installation failed. Face detection may not work.")
    elif platform.system() == "Linux":
        if not run_command(f"{sys.executable} -m pip install dlib", "Installing dlib (Linux)"):
            print("⚠️  dlib installation failed. Face detection may not work.")
    else:  # Windows
        if not run_command(f"{sys.executable} -m pip install dlib", "Installing dlib (Windows)"):
            print("⚠️  dlib installation failed. Face detection may not work.")
    
    # Install face-recognition
    if not run_command(f"{sys.executable} -m pip install face-recognition", "Installing face-recognition"):
        print("⚠️  face-recognition installation failed. Face detection may not work.")
    
    print("\n🎉 Installation completed!")
    print("\n📋 Next steps:")
    print("1. Run: python gui_app.py (for GUI)")
    print("2. Run: python run_app.py --mode cli --image path/to/image.jpg (for CLI)")
    print("3. Check README.md for detailed usage instructions")
    
    return True

def test_installation():
    """Test if the installation works"""
    print("\n🧪 Testing installation...")
    
    try:
        # Test basic imports
        import torch
        import torchvision
        import timm
        import cv2
        import numpy as np
        from PIL import Image
        import matplotlib.pyplot as plt
        import sklearn
        
        print("✅ Basic dependencies imported successfully")
        
        # Test advanced imports
        try:
            import face_recognition
            import dlib
            print("✅ Face recognition dependencies imported successfully")
        except ImportError as e:
            print(f"⚠️  Face recognition dependencies not available: {e}")
        
        # Test model loading
        try:
            from backend.advanced_detector import AdvancedDeepfakeDetector
            print("✅ Advanced detector module imported successfully")
        except ImportError as e:
            print(f"❌ Advanced detector import failed: {e}")
            return False
        
        print("🎉 All tests passed! The system is ready to use.")
        return True
        
    except ImportError as e:
        print(f"❌ Import test failed: {e}")
        return False

def main():
    """Main installation function"""
    print("🤖 Deepfake Detection System - Installation Script")
    print("=" * 60)
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Installation failed. Please check the errors above.")
        sys.exit(1)
    
    # Test installation
    if not test_installation():
        print("❌ Installation test failed. Some features may not work.")
        sys.exit(1)
    
    print("\n🚀 Installation completed successfully!")
    print("You can now run the deepfake detection system.")

if __name__ == "__main__":
    main()
