#!/usr/bin/env python3
"""
Test runner script for Deepfake Detection System
Provides easy way to run all tests or specific test categories
"""

import sys
import subprocess
import argparse
from pathlib import Path

def run_tests(test_type="all", verbose=True, coverage=False):
    """
    Run tests based on type
    
    Args:
        test_type: Type of tests to run ('all', 'unit', 'integration', 'validation', 'api')
        verbose: Show verbose output
        coverage: Generate coverage report
    """
    test_dir = Path(__file__).parent / "tests"
    
    if not test_dir.exists():
        print(f"Error: Test directory not found: {test_dir}")
        return 1
    
    # Build pytest command - use the same Python interpreter running this script
    cmd = [sys.executable, "-m", "pytest"]
    
    if verbose:
        cmd.append("-v")
    
    if coverage:
        cmd.extend(["--cov=.", "--cov-report=html", "--cov-report=term"])
    
    # Select test files based on type
    if test_type == "all":
        cmd.append(str(test_dir))
    elif test_type == "unit":
        cmd.extend([
            str(test_dir / "test_image_detection.py"),
            str(test_dir / "test_video_detection.py"),
            str(test_dir / "test_audio_detection.py"),
        ])
    elif test_type == "integration":
        cmd.append(str(test_dir / "test_integration.py"))
    elif test_type == "validation":
        cmd.append(str(test_dir / "test_validation.py"))
    elif test_type == "api":
        cmd.append(str(test_dir / "test_api_endpoints.py"))
    else:
        print(f"Error: Unknown test type: {test_type}")
        print("Available types: all, unit, integration, validation, api")
        return 1
    
    print(f"Running {test_type} tests...")
    print(f"Command: {' '.join(cmd)}")
    print("-" * 60)
    
    # Run tests
    result = subprocess.run(cmd, cwd=Path(__file__).parent)
    
    if result.returncode == 0:
        print("-" * 60)
        print("✅ All tests passed!")
        if coverage:
            print("📊 Coverage report generated in htmlcov/index.html")
    else:
        print("-" * 60)
        print("❌ Some tests failed")
    
    return result.returncode


def main():
    parser = argparse.ArgumentParser(description="Run deepfake detection system tests")
    parser.add_argument(
        "--type",
        choices=["all", "unit", "integration", "validation", "api"],
        default="all",
        help="Type of tests to run (default: all)"
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Run tests in quiet mode"
    )
    parser.add_argument(
        "--coverage",
        action="store_true",
        help="Generate coverage report"
    )
    
    args = parser.parse_args()
    
    return run_tests(
        test_type=args.type,
        verbose=not args.quiet,
        coverage=args.coverage
    )


if __name__ == "__main__":
    sys.exit(main())

