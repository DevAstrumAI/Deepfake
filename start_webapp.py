#!/usr/bin/env python3
"""
Startup script for the Deepfake Detection Web Application
This script helps you start the web application easily
"""

import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    # Check Docker
    try:
        subprocess.run(["docker", "--version"], check=True, capture_output=True)
        print("✅ Docker is installed")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Docker is not installed. Please install Docker first.")
        return False
    
    # Check Docker Compose
    try:
        subprocess.run(["docker-compose", "--version"], check=True, capture_output=True)
        print("✅ Docker Compose is installed")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Docker Compose is not installed. Please install Docker Compose first.")
        return False
    
    return True

def check_files():
    """Check if required files exist"""
    print("🔍 Checking required files...")
    
    required_files = [
        "docker-compose.yml",
        "backend/app.py",
        "backend/requirements.txt",
        "frontend/package.json",
        "nginx.conf"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ Missing required files:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        return False
    
    print("✅ All required files are present")
    return True

def start_services():
    """Start the Docker services"""
    print("🚀 Starting services...")
    
    try:
        # Build and start services
        subprocess.run([
            "docker-compose", "up", "--build", "-d"
        ], check=True)
        print("✅ Services started successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start services: {e}")
        return False

def wait_for_services():
    """Wait for services to be ready"""
    print("⏳ Waiting for services to be ready...")
    
    services = [
        ("Backend API", "http://localhost:8000/health"),
        ("Frontend", "http://localhost:3000")
    ]
    
    max_attempts = 30
    for service_name, url in services:
        print(f"   Checking {service_name}...")
        
        for attempt in range(max_attempts):
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    print(f"   ✅ {service_name} is ready")
                    break
            except requests.RequestException:
                pass
            
            if attempt == max_attempts - 1:
                print(f"   ❌ {service_name} failed to start")
                return False
            
            time.sleep(2)
    
    return True

def show_status():
    """Show the status of running services"""
    print("\n" + "="*50)
    print("🎉 Deepfake Detection Web Application is running!")
    print("="*50)
    print()
    print("📱 Frontend (Web Interface):")
    print("   http://localhost:3000")
    print()
    print("🔧 Backend API:")
    print("   http://localhost:8000")
    print("   API Documentation: http://localhost:8000/docs")
    print()
    print("📊 Service Status:")
    try:
        subprocess.run(["docker-compose", "ps"], check=True)
    except subprocess.CalledProcessError:
        print("   Unable to show service status")
    print()
    print("🛑 To stop the application:")
    print("   docker-compose down")
    print()
    print("📝 For more information, see README_WEBAPP.md")
    print("="*50)

def main():
    """Main function"""
    print("🤖 Deepfake Detection Web Application Startup")
    print("="*50)
    
    # Check if we're in the right directory
    if not Path("docker-compose.yml").exists():
        print("❌ Please run this script from the project root directory")
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Please install the missing dependencies and try again")
        sys.exit(1)
    
    # Check files
    if not check_files():
        print("\n❌ Please ensure all required files are present")
        sys.exit(1)
    
    # Start services
    if not start_services():
        print("\n❌ Failed to start services")
        sys.exit(1)
    
    # Wait for services
    if not wait_for_services():
        print("\n❌ Services failed to start properly")
        print("Check the logs with: docker-compose logs")
        sys.exit(1)
    
    # Show status
    show_status()

if __name__ == "__main__":
    main()
