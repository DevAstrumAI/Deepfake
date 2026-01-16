#!/usr/bin/env python3
"""
Startup script for Render deployment
Reads PORT from environment and starts uvicorn server
"""
import os
import sys
import uvicorn

# Get port from environment (Render sets this automatically)
port = int(os.environ.get("PORT", 8000))

print(f"Starting server on port {port}")

# Start uvicorn
uvicorn.run(
    "app:app",
    host="0.0.0.0",
    port=port,
    timeout_keep_alive=75,
    workers=1,
    log_level="info"
)

