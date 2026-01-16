#!/bin/bash
# Startup script for Render deployment
# Ensures fast startup by not loading models on startup

# Get port from environment variable (Render provides this automatically)
# Render sets PORT automatically, so we use it directly
PORT=${PORT:-8000}

echo "Starting server on port $PORT"

# Start uvicorn with optimized settings
# Use exec to replace shell process with uvicorn
exec uvicorn app:app \
    --host 0.0.0.0 \
    --port ${PORT} \
    --timeout-keep-alive 75 \
    --workers 1 \
    --log-level info

