# Render Deployment Guide

## Deployment Configuration

### Root Directory
**`backend`** - This is where your `app.py` and all backend files are located.

### Run Command
You have two options:

#### Option 1: Using start_server.py (Recommended)
```
python start_server.py
```

#### Option 2: Direct uvicorn command
```
uvicorn app:app --host 0.0.0.0 --port $PORT
```

### Render Configuration

#### Using Render Dashboard (Manual Setup):

1. **Go to Render Dashboard** → New → Web Service
2. **Connect your repository**
3. **Configure the service:**
   - **Name**: `deepfake-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt`
   - **Start Command**: `python start_server.py`
   - **Plan**: Starter (or Free tier for testing)

4. **Environment Variables:**
   - `OPENAI_API_KEY` - Your OpenAI API key (required)
   - `SECRET_KEY` - JWT secret key (generate a random 32+ character string)
   - `PORT` - Automatically set by Render (don't set manually)

5. **Health Check:**
   - **Health Check Path**: `/health`
   - **Health Check Grace Period**: 60 seconds

#### Using render.yaml (Infrastructure as Code):

If you're using `render.yaml`, the configuration is already set up. Just:
1. Push your code to GitHub/GitLab
2. Connect the repository to Render
3. Render will automatically detect `render.yaml` and use those settings

### Important Notes:

1. **Root Directory**: Must be set to `backend` in Render dashboard
2. **Port**: Render automatically sets `PORT` environment variable - don't hardcode it
3. **OpenAI API Key**: Must be set as environment variable `OPENAI_API_KEY`
4. **Database**: SQLite database will be created automatically in the `uploads/` directory
5. **File Storage**: Files are stored in `uploads/` directory (ephemeral on free tier)

### Quick Start Checklist:

- [ ] Set Root Directory to `backend`
- [ ] Set Start Command to `python start_server.py`
- [ ] Add `OPENAI_API_KEY` environment variable
- [ ] Add `SECRET_KEY` environment variable (for JWT)
- [ ] Set Health Check Path to `/health`
- [ ] Deploy!

### Testing Deployment:

After deployment, test the health endpoint:
```
https://your-service-name.onrender.com/health
```

You should see:
```json
{
  "status": "healthy",
  "offline_mode": false,
  "models_loaded": {
    "image_detector": false,
    "video_detector": false,
    "audio_detector": false
  },
  "message": "API is ready - models load on first use"
}
```

Note: `models_loaded` will be `false` initially - this is normal! Models (OpenAI clients) load lazily on first use.

