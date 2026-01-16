"""
FastAPI Backend for Deepfake Detection Web Application
Integrates with existing detection models while providing a modern web interface
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, List
import os
import uuid
import shutil
import tempfile
import json
import asyncio
from datetime import datetime, timedelta
import logging
from pathlib import Path
import sys
import numpy as np
import base64
from io import BytesIO
from PIL import Image as PILImage
import cv2
from jose import JWTError, jwt
from passlib.context import CryptContext
import bcrypt
# Import OpenAI-based detection modules
from openai_image_detector import OpenAIImageDeepfakeDetector
from openai_video_detector import OpenAIVideoDeepfakeDetector
from openai_audio_detector import OpenAIAudioDeepfakeDetector

# Import PDF report generator
from pdf_report_generator import PDFReportGenerator
# Utility function to convert numpy types to JSON-serializable types
def convert_numpy_types(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    # Handle numpy scalars
    if isinstance(obj, (np.integer, np.floating, np.bool_, np.complexfloating)):
        return obj.item()
    # Handle numpy arrays
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    # Handle numpy dtypes
    elif isinstance(obj, np.dtype):
        return str(obj)
    # Handle dictionaries recursively
    elif isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    # Handle lists recursively
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    # Handle tuples recursively
    elif isinstance(obj, tuple):
        return tuple(convert_numpy_types(item) for item in obj)
    # Handle sets recursively
    elif isinstance(obj, set):
        return {convert_numpy_types(item) for item in obj}
    # For any other numpy types, try to convert to string
    elif hasattr(obj, 'dtype') and hasattr(obj, 'item'):
        return obj.item()
    else:
        return obj



# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Deepfake Detection API",
    description="Professional deepfake detection system with AI-powered analysis",
    version="1.0.0"
)

# CORS middleware
# Get allowed origins from environment variable or use defaults
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]
else:
    # Default origins: local development + Vercel frontend
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://deepfake-theta.vercel.app"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for detectors
image_detector = None
video_detector = None
audio_detector = None

# Analysis results storage (in production, use a database)
analysis_results = {}

# Persistent storage for file metadata
import json
import sqlite3
from pathlib import Path

# Database configuration
DB_DIR = Path("uploads")
DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DB_DIR / "file_metadata.db"

# Ensure database directory exists
DB_DIR.mkdir(parents=True, exist_ok=True)

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-min-32-chars")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

# Password hashing - use bcrypt directly to avoid passlib compatibility issues
import bcrypt

def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt directly"""
    # Bcrypt has a strict 72-byte limit
    password_bytes = password.encode('utf-8')
    
    # Truncate if necessary
    if len(password_bytes) > 72:
        logger.warning(f"Password too long ({len(password_bytes)} bytes), truncating to 72")
        password_bytes = password_bytes[:72]
        password = password_bytes.decode('utf-8', errors='ignore')
        # Verify truncation
        verify_bytes = password.encode('utf-8')
        if len(verify_bytes) > 72:
            password = verify_bytes[:72].decode('utf-8', errors='ignore')
    
    # Hash using bcrypt directly (12 rounds)
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        # Truncate password if necessary (bcrypt 72-byte limit)
        password_bytes = plain_password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
            plain_password = password_bytes.decode('utf-8', errors='ignore')
        
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False

# Keep pwd_context for backward compatibility (not used, but kept for compatibility)
pwd_context = CryptContext(
    schemes=["bcrypt"],
    bcrypt__rounds=12,
    deprecated="auto"
)

# Security
security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)

def init_database():
    """Initialize SQLite database for users and file metadata"""
    try:
        # Ensure database directory exists
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        
        # Connect to database with proper configuration
        conn = sqlite3.connect(
            str(DB_PATH),
            check_same_thread=False,  # Allow multi-threaded access
            timeout=30.0  # Wait up to 30 seconds for locks
        )
        # Enable foreign keys
        conn.execute('PRAGMA foreign_keys = ON')
        # Optimize for performance
        conn.execute('PRAGMA journal_mode = WAL')  # Write-Ahead Logging
        conn.execute('PRAGMA synchronous = NORMAL')
        conn.execute('PRAGMA cache_size = 10000')
        conn.execute('PRAGMA temp_store = MEMORY')
        
        cursor = conn.cursor()
        
        # Create table for users
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create index on username and email for faster lookups
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_users_username 
            ON users(username)
        ''')
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_users_email 
            ON users(email)
        ''')
        
        # Check if file_metadata table exists and if it has user_id column
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='file_metadata'")
        table_exists = cursor.fetchone() is not None
        
        if table_exists:
            # Check if user_id column exists
            cursor.execute("PRAGMA table_info(file_metadata)")
            columns = [column[1] for column in cursor.fetchall()]
            
            if 'user_id' not in columns:
                # Migration: Add user_id column (nullable initially for existing data)
                logger.info("Migrating database: Adding user_id column to file_metadata")
                cursor.execute('''
                    ALTER TABLE file_metadata 
                    ADD COLUMN user_id TEXT
                ''')
                
                # Delete existing files without user_id (they belong to no user)
                cursor.execute('''
                    DELETE FROM file_metadata 
                    WHERE user_id IS NULL
                ''')
                
                # Now make user_id NOT NULL
                # SQLite doesn't support ALTER COLUMN, so we need to recreate the table
                cursor.execute('''
                    CREATE TABLE file_metadata_new (
                        file_id TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        filename TEXT NOT NULL,
                        file_type TEXT NOT NULL,
                        file_size INTEGER NOT NULL,
                        upload_time TEXT NOT NULL,
                        file_path TEXT NOT NULL,
                        status TEXT DEFAULT 'uploaded',
                        analysis_result TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(user_id)
                    )
                ''')
                
                cursor.execute('''
                    INSERT INTO file_metadata_new 
                    SELECT file_id, user_id, filename, file_type, file_size, 
                           upload_time, file_path, status, analysis_result, 
                           created_at, updated_at
                    FROM file_metadata
                    WHERE user_id IS NOT NULL
                ''')
                
                cursor.execute('DROP TABLE file_metadata')
                cursor.execute('ALTER TABLE file_metadata_new RENAME TO file_metadata')
        
        # Create table for file metadata (if it doesn't exist)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS file_metadata (
                file_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                filename TEXT NOT NULL,
                file_type TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                upload_time TEXT NOT NULL,
                file_path TEXT NOT NULL,
                status TEXT DEFAULT 'uploaded',
                analysis_result TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Create index on user_id for faster queries
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_file_metadata_user_id 
            ON file_metadata(user_id)
        ''')
        
        conn.commit()
        conn.close()
        logger.info(f"Database initialized successfully at {DB_PATH}")
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise

def get_db_connection():
    """Get a database connection with proper configuration"""
    return sqlite3.connect(
        str(DB_PATH),
        check_same_thread=False,
        timeout=30.0
    )

def load_file_metadata():
    """Load file metadata from database into memory (without analysis results)"""
    global analysis_results
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT file_id, user_id, filename, file_type, file_size, upload_time, 
                   file_path, status
            FROM file_metadata
            ORDER BY created_at DESC
        ''')
        
        rows = cursor.fetchall()
        
        for row in rows:
            file_id, user_id, filename, file_type, file_size, upload_time, file_path, status = row
            
            # Check if file still exists
            if Path(file_path).exists():
                analysis_results[file_id] = {
                    'file_info': {
                        'file_id': file_id,
                        'filename': filename,
                        'file_type': file_type,
                        'file_size': file_size,
                        'upload_time': upload_time
                    },
                    'file_path': file_path,
                    'status': status,
                    'user_id': user_id
                }
                # Don't load analysis results from database
            else:
                # File doesn't exist, mark as deleted
                logger.warning(f"File {file_id} not found at {file_path}")
                cursor.execute('''
                    UPDATE file_metadata 
                    SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
                    WHERE file_id = ?
                ''', (file_id,))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Loaded {len(analysis_results)} file records from database (without analysis results)")
        
    except Exception as e:
        logger.error(f"Failed to load file metadata: {e}")

def save_file_metadata(file_id: str, file_info: dict, file_path: str, user_id: str, status: str = 'uploaded', analysis_result: dict = None):
    """Save file metadata to database (without analysis results)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Don't store analysis_result in database
        cursor.execute('''
            INSERT OR REPLACE INTO file_metadata 
            (file_id, user_id, filename, file_type, file_size, upload_time, file_path, status, analysis_result)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
        ''', (
            file_info['file_id'],
            user_id,
            file_info['filename'],
            file_info['file_type'],
            file_info['file_size'],
            file_info['upload_time'],
            file_path,
            status
        ))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        logger.error(f"Failed to save file metadata: {e}")

def update_file_status(file_id: str, status: str, analysis_result: dict = None):
    """Update file status in database (without storing analysis results)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Don't store analysis_result in database
        cursor.execute('''
            UPDATE file_metadata 
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE file_id = ?
        ''', (status, file_id))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        logger.error(f"Failed to update file status: {e}")

def delete_file_metadata(file_id: str):
    """Delete file metadata from database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM file_metadata WHERE file_id = ?', (file_id,))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        logger.error(f"Failed to delete file metadata: {e}")

def cleanup_old_files(max_age_hours: int = 24):
    """Clean up files older than specified hours"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Find files older than max_age_hours
        cursor.execute('''
            SELECT file_id, file_path FROM file_metadata 
            WHERE created_at < datetime('now', '-{} hours')
            AND status != 'deleted'
        '''.format(max_age_hours))
        
        old_files = cursor.fetchall()
        
        for file_id, file_path in old_files:
            # Delete physical file
            if Path(file_path).exists():
                Path(file_path).unlink()
                logger.info(f"Deleted old file: {file_path}")
            
            # Mark as deleted in database
            cursor.execute('''
                UPDATE file_metadata 
                SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
                WHERE file_id = ?
            ''', (file_id,))
        
        conn.commit()
        conn.close()
        
        if old_files:
            logger.info(f"Cleaned up {len(old_files)} old files")
        
    except Exception as e:
        logger.error(f"Failed to cleanup old files: {e}")

# Supported file formats
SUPPORTED_IMAGE_FORMATS = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
SUPPORTED_VIDEO_FORMATS = {'.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv', '.m4v', '.3gp', '.ogv'}
SUPPORTED_AUDIO_FORMATS = {'.wav', '.mp3', '.flac', '.aac', '.ogg'}

# Authentication helper functions are defined above (lines 126-151)
# These are kept for backward compatibility but the actual functions use bcrypt directly

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_username(username: str) -> Optional[Dict]:
    """Get user by username from database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT user_id, username, email, hashed_password
            FROM users
            WHERE username = ?
        ''', (username,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "user_id": row[0],
                "username": row[1],
                "email": row[2],
                "hashed_password": row[3]
            }
        return None
    except Exception as e:
        logger.error(f"Error getting user: {e}")
        return None

def get_user_by_email(email: str) -> Optional[Dict]:
    """Get user by email from database"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT user_id, username, email, hashed_password
            FROM users
            WHERE email = ?
        ''', (email,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "user_id": row[0],
                "username": row[1],
                "email": row[2],
                "hashed_password": row[3]
            }
        return None
    except Exception as e:
        logger.error(f"Error getting user: {e}")
        return None

def create_user(username: str, email: str, password: str) -> Optional[Dict]:
    """Create a new user in database"""
    try:
        # Ensure password is <= 72 bytes before hashing
        password_bytes = password.encode('utf-8')
        original_length = len(password_bytes)
        
        if original_length > 72:
            logger.warning(f"Password too long ({original_length} bytes), truncating to 72 bytes")
            # Truncate to 72 bytes and decode
            password = password_bytes[:72].decode('utf-8', errors='ignore')
            # Verify truncation worked
            verify_bytes = password.encode('utf-8')
            if len(verify_bytes) > 72:
                # Force truncate again if needed
                password = verify_bytes[:72].decode('utf-8', errors='ignore')
            logger.info(f"Password truncated from {original_length} to {len(password.encode('utf-8'))} bytes")
        
        user_id = str(uuid.uuid4())
        
        # Now hash the (guaranteed <= 72 bytes) password
        try:
            hashed_password = get_password_hash(password)
        except ValueError as e:
            # If bcrypt still complains, log the actual password length
            final_bytes = password.encode('utf-8')
            logger.error(f"Bcrypt error after truncation: {e}, final password length: {len(final_bytes)} bytes")
            raise
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (user_id, username, email, hashed_password)
            VALUES (?, ?, ?, ?)
        ''', (user_id, username, email, hashed_password))
        conn.commit()
        conn.close()
        
        return {
            "user_id": user_id,
            "username": username,
            "email": email
        }
    except sqlite3.IntegrityError as e:
        logger.error(f"User creation failed (duplicate): {e}")
        return None
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None

def _decode_user_from_token(token: str) -> Dict:
    """Decode JWT token and fetch user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Get user from database
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT user_id, username, email
            FROM users
            WHERE user_id = ?
        ''', (user_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row is None:
            raise credentials_exception
        
        return {
            "user_id": row[0],
            "username": row[1],
            "email": row[2]
        }
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        raise credentials_exception

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """Get current authenticated user from JWT token (Authorization header required)"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization credentials missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _decode_user_from_token(credentials.credentials)

# Pydantic models
class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict

class AnalysisRequest(BaseModel):
    file_id: str
    analysis_type: str  # 'image', 'video', 'audio'

class AnalysisResult(BaseModel):
    file_id: str
    status: str  # 'processing', 'completed', 'error'
    result: Optional[Dict] = None
    error: Optional[str] = None
    timestamp: datetime

class FileInfo(BaseModel):
    file_id: str
    filename: str
    file_type: str
    file_size: int
    upload_time: datetime

# Initialize detectors lazily (on first use) to avoid startup timeout
def get_image_detector():
    """Lazy initialization of OpenAI image detector"""
    global image_detector
    if image_detector is None:
        try:
            logger.info("Initializing OpenAI image detector...")
            image_detector = OpenAIImageDeepfakeDetector()
            logger.info("OpenAI image detector initialized")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI image detector: {e}")
    return image_detector

def get_video_detector():
    """Lazy initialization of OpenAI video detector"""
    global video_detector
    if video_detector is None:
        try:
            logger.info("Initializing OpenAI video detector...")
            video_detector = OpenAIVideoDeepfakeDetector()
            logger.info("OpenAI video detector initialized")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI video detector: {e}")
    return video_detector

def get_audio_detector():
    """Lazy initialization of OpenAI audio detector"""
    global audio_detector
    if audio_detector is None:
        try:
            logger.info("Initializing OpenAI audio detector...")
            audio_detector = OpenAIAudioDeepfakeDetector()
            logger.info("OpenAI audio detector initialized")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI audio detector: {e}")
    return audio_detector

# Initialize only essential services on startup (fast startup)
@app.on_event("startup")
async def startup_event():
    """Initialize essential services on startup (models load lazily)"""
    import os
    
    # Initialize database and load existing file metadata (fast)
    try:
        init_database()
        load_file_metadata()
        logger.info("Database initialized")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
    
    # Clean up old files in background (don't block startup)
    try:
        cleanup_old_files(max_age_hours=24)
    except Exception as e:
        logger.warning(f"File cleanup error: {e}")
    
    logger.info("Server started successfully - models will load on first use")

# Utility functions
def get_file_type(filename: str) -> str:
    """Determine file type from extension"""
    ext = Path(filename).suffix.lower()
    if ext in SUPPORTED_IMAGE_FORMATS:
        return 'image'
    elif ext in SUPPORTED_VIDEO_FORMATS:
        return 'video'
    elif ext in SUPPORTED_AUDIO_FORMATS:
        return 'audio'
    else:
        return 'unknown'

def save_uploaded_file(file: UploadFile, file_id: str) -> str:
    """Save uploaded file to temporary directory"""
    # Create uploads directory if it doesn't exist
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix
    saved_filename = f"{file_id}{file_extension}"
    file_path = upload_dir / saved_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return str(file_path)

def generate_visual_evidence_data(details: dict, file_path: str) -> dict:
    """Generate visual evidence data for frontend display"""
    try:
        # Load and encode image as base64 for frontend
        image_base64 = None
        if Path(file_path).exists():
            try:
                with open(file_path, 'rb') as f:
                    image_bytes = f.read()
                    image_b64 = base64.b64encode(image_bytes).decode('utf-8')
                    # Determine MIME type from file extension
                    file_ext = Path(file_path).suffix.lower()
                    mime_types = {
                        '.jpg': 'image/jpeg',
                        '.jpeg': 'image/jpeg',
                        '.png': 'image/png',
                        '.bmp': 'image/bmp',
                        '.tiff': 'image/tiff',
                        '.webp': 'image/webp'
                    }
                    mime_type = mime_types.get(file_ext, 'image/jpeg')
                    image_base64 = f"data:{mime_type};base64,{image_b64}"
                    logger.info(f"Encoded image as base64, size: {len(image_base64)} chars")
            except Exception as e:
                logger.warning(f"Failed to encode image as base64: {e}")
        
        visual_evidence = {
            'face_detection': {
                'detected': False,
                'confidence': 0.0,
                'bounding_box': None,
                'landmarks': []
            },
            'artifacts': {
                'border_regions': [],
                'edge_regions': [],
                'lighting_regions': [],
                'texture_regions': []
            },
            'forensic_analysis': {
                'problematic_regions': [],
                'anomaly_scores': {}
            },
            'heatmaps': [],
            'overlay_data': {},
            'image_data': image_base64  # Include base64 encoded image
        }

        # Extract face detection data
        face_features = details.get('face_features', {})
        logger.info(f"Face features in visual evidence: {face_features}")
        logger.info(f"Details keys: {list(details.keys())}")
        
        # Check if face was detected in details first
        face_detected_in_details = face_features.get('face_detected', False)
        face_region = face_features.get('face_region', {})
        logger.info(f"Face detected in details: {face_detected_in_details}, face_region: {face_region}")
        
        # Try to extract bounding box from face_region first (most reliable)
        bounding_box_from_details = None
        if face_region and isinstance(face_region, dict):
            # Try multiple possible formats
            left = face_region.get('left', face_region.get('x', None))
            top = face_region.get('top', face_region.get('y', None))
            width = face_region.get('width', None)
            height = face_region.get('height', None)
            
            # If width/height are missing, try to calculate from right/bottom
            if width is None or width == 0:
                if 'right' in face_region:
                    right = face_region.get('right')
                    if left is not None and right is not None:
                        width = right - left
            if height is None or height == 0:
                if 'bottom' in face_region:
                    bottom = face_region.get('bottom')
                    if top is not None and bottom is not None:
                        height = bottom - top
            
            # Validate and create bounding box
            if left is not None and top is not None and width is not None and height is not None:
                if width > 0 and height > 0:
                    bounding_box_from_details = {
                        'x': int(left),
                        'y': int(top),
                        'width': int(width),
                        'height': int(height)
                    }
                    logger.info(f"Created bounding box from face_region: {bounding_box_from_details}")
                else:
                    logger.warning(f"Invalid face region dimensions: width={width}, height={height}")
            else:
                logger.warning(f"Incomplete face region data: left={left}, top={top}, width={width}, height={height}")
        
        # Always try to detect face from image as fallback or verification
        # This ensures we always have a bounding box if a face exists
        face_detected_from_image = False
        bounding_box_from_image = None
        
        try:
            import cv2
            # Try face_recognition first, fallback to OpenCV
            try:
                import face_recognition
                HAS_FACE_RECOGNITION = True
            except ImportError:
                HAS_FACE_RECOGNITION = False
                face_recognition = None
                
            logger.info(f"Attempting face detection from image: {file_path}")
            image = cv2.imread(file_path)
            if image is not None:
                rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                if HAS_FACE_RECOGNITION:
                    face_locations = face_recognition.face_locations(rgb_image)
                else:
                    # Fallback to OpenCV face detection
                    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
                    face_locations = []
                    for (x, y, w, h) in faces:
                        face_locations.append((y, x+w, y+h, x))  # Convert to (top, right, bottom, left) format
                logger.info(f"Face locations found: {face_locations}")
                if face_locations:
                    face_detected_from_image = True
                    # Use the largest face
                    largest_face = max(face_locations, key=lambda x: (x[2] - x[0]) * (x[1] - x[3]))
                    top, right, bottom, left = largest_face
                    bounding_box_from_image = {
                        'x': int(left),
                        'y': int(top),
                        'width': int(right - left),
                        'height': int(bottom - top)
                    }
                    logger.info(f"Created bounding box from direct image detection: {bounding_box_from_image}")
        except ImportError as e:
            logger.warning(f"face_recognition or cv2 not available: {e}")
        except Exception as e:
            logger.warning(f"Failed to detect face from image: {e}")
            import traceback
            logger.error(traceback.format_exc())
        
        # If face_recognition failed, try OpenCV's Haar Cascade as fallback
        if not bounding_box_from_image and not bounding_box_from_details:
            try:
                import cv2
                logger.info(f"Trying OpenCV Haar Cascade face detection as fallback")
                image = cv2.imread(file_path)
                if image is not None:
                    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
                    if len(faces) > 0:
                        # Use the largest face
                        largest_face = max(faces, key=lambda x: x[2] * x[3])
                        x, y, w, h = largest_face
                        bounding_box_from_image = {
                            'x': int(x),
                            'y': int(y),
                            'width': int(w),
                            'height': int(h)
                        }
                        face_detected_from_image = True
                        logger.info(f"Created bounding box from OpenCV Haar Cascade: {bounding_box_from_image}")
            except Exception as e:
                logger.warning(f"OpenCV Haar Cascade detection failed: {e}")
        
        # Determine if face is detected and set confidence
        face_detected = face_detected_from_image or face_detected_in_details
        
        if face_detected:
            visual_evidence['face_detection']['detected'] = True
            visual_evidence['face_detection']['confidence'] = face_features.get('face_confidence', 1.0 if face_detected_from_image else 0.0)
            
            # Prefer bounding box from details (most accurate), then image detection
            if bounding_box_from_details:
                visual_evidence['face_detection']['bounding_box'] = bounding_box_from_details
                logger.info(f"Using bounding box from face_region: {bounding_box_from_details}")
            elif bounding_box_from_image:
                visual_evidence['face_detection']['bounding_box'] = bounding_box_from_image
                logger.info(f"Using bounding box from image detection: {bounding_box_from_image}")
        
        # Final check: if face is detected but still no bounding box, log error and try one more time
        if visual_evidence['face_detection'].get('detected') and not visual_evidence['face_detection'].get('bounding_box'):
            logger.error("CRITICAL: Face detected but bounding box is still missing after all detection attempts!")
            logger.error(f"face_detected_from_image: {face_detected_from_image}, bounding_box_from_image: {bounding_box_from_image}")
            logger.error(f"face_detected_in_details: {face_detected_in_details}, bounding_box_from_details: {bounding_box_from_details}")
            logger.error(f"face_region: {face_features.get('face_region', {})}")
            
            # Last resort: if face is detected but no bbox, try one more direct detection
            if face_detected_in_details and not bounding_box_from_image:
                try:
                    import cv2
                    image = cv2.imread(file_path)
                    if image is not None:
                        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
                        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
                        if len(faces) > 0:
                            largest_face = max(faces, key=lambda x: x[2] * x[3])
                            x, y, w, h = largest_face
                            visual_evidence['face_detection']['bounding_box'] = {
                                'x': int(x),
                                'y': int(y),
                                'width': int(w),
                                'height': int(h)
                            }
                            logger.info(f"Last resort: Created bounding box from OpenCV: {visual_evidence['face_detection']['bounding_box']}")
                except Exception as e:
                    logger.error(f"Last resort face detection also failed: {e}")

        # Extract artifact analysis data
        artifact_analysis = face_features.get('artifact_analysis', {})
        logger.info(f"Artifact analysis data: {artifact_analysis}")
        
        # Border analysis - show ALL results, not just problematic ones
        border_analysis = artifact_analysis.get('border_analysis', {})
        logger.info(f"Border analysis: {border_analysis}")
        if border_analysis and visual_evidence['face_detection']['bounding_box']:
            border_quality = border_analysis.get('border_quality')
            logger.info(f"Border quality value: {border_quality}")
            if border_quality is not None:
                # Always show border analysis, regardless of score
                visual_evidence['artifacts']['border_regions'].append({
                    'type': 'border_quality',
                    'score': float(border_quality),
                    'coordinates': visual_evidence['face_detection']['bounding_box'],
                    'description': f'Face border quality analysis',
                    'color': '#22c55e' if border_quality > 0.7 else '#f59e0b' if border_quality > 0.4 else '#ef4444'
                })

        # Edge analysis - show ALL results
        edge_analysis = artifact_analysis.get('edge_analysis', {})
        if edge_analysis and visual_evidence['face_detection']['bounding_box']:
            edge_uniformity = edge_analysis.get('edge_uniformity')
            if edge_uniformity is not None:
                # Always show edge analysis
                visual_evidence['artifacts']['edge_regions'].append({
                    'type': 'edge_uniformity',
                    'score': float(edge_uniformity),
                    'coordinates': visual_evidence['face_detection']['bounding_box'],
                    'description': f'Edge consistency analysis',
                    'color': '#22c55e' if edge_uniformity > 0.7 else '#f59e0b' if edge_uniformity > 0.4 else '#ef4444'
                })
        
        # Texture analysis - show ALL results
        texture_analysis = artifact_analysis.get('texture_analysis', {})
        if texture_analysis and visual_evidence['face_detection']['bounding_box']:
            texture_score = texture_analysis.get('texture_consistency')
            if texture_score is not None:
                visual_evidence['artifacts']['texture_regions'].append({
                    'type': 'texture_consistency',
                    'score': float(texture_score),
                    'coordinates': visual_evidence['face_detection']['bounding_box'],
                    'description': f'Texture consistency analysis',
                    'color': '#22c55e' if texture_score > 0.7 else '#f59e0b' if texture_score > 0.4 else '#ef4444'
                })

        # Extract forensic analysis data
        forensic_analysis = face_features.get('forensic_analysis', {})
        logger.info(f"Forensic analysis data: {forensic_analysis}")
        
        # Lighting analysis - extract actual values from OpenAI analysis
        lighting_analysis = forensic_analysis.get('lighting_analysis', {})
        logger.info(f"Lighting analysis: {lighting_analysis}")
        if lighting_analysis:
            # Enhanced detector returns brightness_uniformity directly (more accurate)
            brightness_uniformity = lighting_analysis.get('brightness_uniformity')
            if brightness_uniformity is not None:
                logger.info(f"Using enhanced brightness_uniformity: {brightness_uniformity}")
                visual_evidence['forensic_analysis']['anomaly_scores']['lighting'] = {
                    'score': float(brightness_uniformity),
                    'description': 'Lighting consistency analysis (enhanced CV)'
                }
            else:
                # Fallback: calculate from brightness_std (for backward compatibility)
                brightness_std = lighting_analysis.get('brightness_std')
                if brightness_std is not None:
                    if brightness_std <= 40:
                        brightness_uniformity = 1.0 - (brightness_std / 40.0) * 0.5
                    else:
                        brightness_uniformity = max(0.0, 0.5 - ((brightness_std - 40) / 60.0) * 0.5)
                    logger.info(f"Fallback: Brightness std: {brightness_std}, calculated uniformity: {brightness_uniformity}")
                    visual_evidence['forensic_analysis']['anomaly_scores']['lighting'] = {
                        'score': float(brightness_uniformity),
                        'description': 'Lighting consistency analysis'
                    }
                else:
                    logger.warning("No brightness_uniformity or brightness_std found in lighting_analysis")

        # Skin analysis - extract actual values from OpenAI analysis
        skin_analysis = forensic_analysis.get('skin_analysis', {})
        logger.info(f"Skin analysis: {skin_analysis}")
        if skin_analysis:
            # Enhanced detector returns skin_naturalness directly (more accurate, uses LBP, GLCM, etc.)
            skin_naturalness = skin_analysis.get('skin_naturalness')
            if skin_naturalness is not None:
                logger.info(f"Using enhanced skin_naturalness: {skin_naturalness}")
                visual_evidence['forensic_analysis']['anomaly_scores']['skin'] = {
                    'score': float(skin_naturalness),
                    'description': 'Skin texture analysis (enhanced CV)'
                }
            else:
                # Fallback: calculate from smoothness (for backward compatibility)
                smoothness = skin_analysis.get('smoothness')
                if smoothness is not None:
                    # Higher smoothness (std) = more natural texture = higher score
                    skin_smoothness = max(0.0, min(1.0, smoothness / 10.0))
                    logger.info(f"Fallback: Smoothness: {smoothness}, calculated score: {skin_smoothness}")
                    visual_evidence['forensic_analysis']['anomaly_scores']['skin'] = {
                        'score': float(skin_smoothness),
                        'description': 'Skin texture analysis'
                    }
                else:
                    # Try direct skin_smoothness if available (from OpenAI analysis)
                    skin_smoothness = skin_analysis.get('skin_smoothness')
                    if skin_smoothness is not None:
                        visual_evidence['forensic_analysis']['anomaly_scores']['skin'] = {
                            'score': float(skin_smoothness),
                            'description': 'Skin texture analysis'
                        }

        # Generate heatmaps - prioritize Grad-CAM heatmaps from models
        heatmaps = []
        
        # Check if Grad-CAM heatmaps are available in details
        model_heatmaps = details.get('heatmaps', {})
        if model_heatmaps:
            # Save heatmaps as images and create URLs
            from heatmap_utils import apply_colormap, overlay_heatmap
            
            # Load original image for overlay
            try:
                original_image = cv2.imread(file_path)
                if original_image is not None:
                    original_image_rgb = cv2.cvtColor(original_image, cv2.COLOR_BGR2RGB)
                else:
                    original_image_rgb = None
            except:
                original_image_rgb = None
            
            for model_name, heatmap_data in model_heatmaps.items():
                try:
                    # Reconstruct heatmap from stored data
                    heatmap_array = np.array(heatmap_data.get('heatmap_data', []))
                    shape = heatmap_data.get('shape', [])
                    
                    if len(heatmap_array) > 0 and len(shape) == 2:
                        # Reshape to original dimensions
                        heatmap = heatmap_array.reshape(shape).astype(np.float32) / 255.0
                        
                        # Create overlay image with high precision
                        if original_image_rgb is not None:
                            # Resize heatmap to match image with maximum precision
                            if heatmap.shape != original_image_rgb.shape[:2]:
                                # Use INTER_LANCZOS4 for highest quality interpolation
                                heatmap_resized = cv2.resize(
                                    heatmap, 
                                    (original_image_rgb.shape[1], original_image_rgb.shape[0]),
                                    interpolation=cv2.INTER_LANCZOS4  # Maximum precision interpolation
                                )
                                # Apply slight Gaussian blur to smooth while preserving detail
                                heatmap_resized = cv2.GaussianBlur(heatmap_resized, (3, 3), 0)
                            else:
                                heatmap_resized = heatmap
                            
                            # Create overlay with explicit binary visualization
                            # Use lower threshold (0.3) to ensure we show red regions even if values are low
                            overlay_img = overlay_heatmap(original_image_rgb, heatmap_resized, alpha=0.65, threshold=0.3, binary=True)
                        else:
                            # Just the colored heatmap with binary visualization
                            # Use lower threshold (0.3) to ensure we show red regions even if values are low
                            overlay_img = apply_colormap(heatmap, threshold=0.3, binary=True)
                        
                        # Convert to base64 for frontend
                        pil_img = PILImage.fromarray(overlay_img)
                        buffer = BytesIO()
                        pil_img.save(buffer, format='PNG')
                        img_str = base64.b64encode(buffer.getvalue()).decode()
                        
                        heatmaps.append({
                            'type': 'gradcam',
                            'model': model_name,
                            'image_data': f'data:image/png;base64,{img_str}',
                            'heatmap_data': heatmap_data.get('heatmap_data'),
                            'shape': shape,
                            'prediction': heatmap_data.get('prediction', 'UNKNOWN'),
                            'description': f'Grad-CAM++ Heatmap from {model_name} - RED regions show deepfake detected areas, BLUE regions show real/authentic areas'
                        })
                except Exception as e:
                    logger.warning(f"Error processing heatmap for {model_name}: {e}")
                    # Fallback: just store the data
                    heatmaps.append({
                        'type': 'gradcam',
                        'model': model_name,
                        'heatmap_data': heatmap_data.get('heatmap_data'),
                        'shape': heatmap_data.get('shape'),
                        'prediction': heatmap_data.get('prediction', 'UNKNOWN'),
                        'description': f'Grad-CAM Heatmap from {model_name} - Shows precise locations where deepfake artifacts are detected'
                    })
        
        # Add traditional analysis heatmaps as supplementary data
        # Border quality heatmap
        if border_analysis.get('border_quality') is not None:
            heatmaps.append({
                'type': 'border_quality',
                'intensity': border_analysis['border_quality'],
                'color': get_heatmap_color(border_analysis['border_quality']),
                'description': 'Border Quality Analysis'
            })

        # Edge uniformity heatmap
        if edge_analysis.get('edge_uniformity') is not None:
            heatmaps.append({
                'type': 'edge_uniformity',
                'intensity': edge_analysis['edge_uniformity'],
                'color': get_heatmap_color(edge_analysis['edge_uniformity']),
                'description': 'Edge Uniformity Analysis'
            })

        # Lighting uniformity heatmap
        if lighting_analysis.get('brightness_uniformity') is not None:
            heatmaps.append({
                'type': 'lighting_uniformity',
                'intensity': lighting_analysis['brightness_uniformity'],
                'color': get_heatmap_color(lighting_analysis['brightness_uniformity']),
                'description': 'Lighting Uniformity Analysis'
            })

        visual_evidence['heatmaps'] = heatmaps

        return visual_evidence

    except Exception as e:
        logger.error(f"Error generating visual evidence data: {e}")
        import traceback
        logger.error(traceback.format_exc())
        # Try to at least include the image data even if other processing fails
        image_base64 = None
        if Path(file_path).exists():
            try:
                with open(file_path, 'rb') as f:
                    image_bytes = f.read()
                    image_b64 = base64.b64encode(image_bytes).decode('utf-8')
                    file_ext = Path(file_path).suffix.lower()
                    mime_types = {
                        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
                        '.bmp': 'image/bmp', '.tiff': 'image/tiff', '.webp': 'image/webp'
                    }
                    mime_type = mime_types.get(file_ext, 'image/jpeg')
                    image_base64 = f"data:{mime_type};base64,{image_b64}"
            except Exception as img_err:
                logger.warning(f"Failed to encode image in error handler: {img_err}")
        
        return {
            'face_detection': {'detected': False, 'confidence': 0.0, 'bounding_box': None},
            'artifacts': {'border_regions': [], 'edge_regions': [], 'lighting_regions': [], 'texture_regions': []},
            'forensic_analysis': {'problematic_regions': [], 'anomaly_scores': {}},
            'heatmaps': [],
            'overlay_data': {},
            'image_data': image_base64
        }

def generate_video_visual_evidence_data(results: dict, file_path: str) -> dict:
    """Generate visual evidence data for video analysis"""
    try:
        visual_evidence = {
            'frame_analysis': {
                'total_frames': 0,
                'fake_frames': 0,
                'real_frames': 0,
                'frame_results': []
            },
            'temporal_analysis': {
                'consistency_score': 0.0,
                'motion_analysis': {},
                'transition_analysis': {}
            },
            'spatial_analysis': {
                'face_regions': [],
                'artifact_regions': [],
                'problematic_frames': []
            },
            'heatmaps': [],
            'overlay_data': {}
        }

        frame_analysis = results.get('frame_analysis', {})
        frame_results = frame_analysis.get('frame_results', [])
        
        visual_evidence['frame_analysis']['total_frames'] = frame_analysis.get('total_frames_analyzed', 0)
        visual_evidence['frame_analysis']['fake_frames'] = frame_analysis.get('fake_frames', 0)
        visual_evidence['frame_analysis']['real_frames'] = frame_analysis.get('real_frames', 0)

        # Process frame results
        for frame_result in frame_results[:10]:  # Limit to first 10 frames for performance
            frame_data = {
                'frame_number': frame_result.get('frame_number', 0),
                'timestamp': frame_result.get('timestamp', 0.0),
                'prediction': frame_result.get('prediction', 'UNKNOWN'),
                'confidence': frame_result.get('confidence', 0.0),
                'face_detection': {},
                'artifacts': {},
                'forensic_analysis': {}
            }

            # Extract face detection data
            details = frame_result.get('details', {})
            face_features = details.get('face_features', {})
            if face_features.get('face_detected', False):
                frame_data['face_detection'] = {
                    'detected': True,
                    'confidence': face_features.get('face_confidence', 0.0),
                    'bounding_box': {
                        'x': face_features.get('face_region', {}).get('left', 0),
                        'y': face_features.get('face_region', {}).get('top', 0),
                        'width': face_features.get('face_region', {}).get('width', 0),
                        'height': face_features.get('face_region', {}).get('height', 0)
                    }
                }

            # Extract artifact analysis
            artifact_analysis = face_features.get('artifact_analysis', {})
            if artifact_analysis:
                frame_data['artifacts'] = {
                    'border_quality': artifact_analysis.get('border_analysis', {}).get('border_quality', 0.0),
                    'edge_uniformity': artifact_analysis.get('edge_analysis', {}).get('edge_uniformity', 0.0),
                    'lighting_consistency': artifact_analysis.get('lighting_analysis', {}).get('brightness_uniformity', 0.0)
                }

            # Extract forensic analysis
            forensic_analysis = face_features.get('forensic_analysis', {})
            if forensic_analysis:
                frame_data['forensic_analysis'] = {
                    'lighting_score': forensic_analysis.get('lighting_analysis', {}).get('brightness_uniformity', 0.0),
                    'skin_score': forensic_analysis.get('skin_analysis', {}).get('skin_smoothness', 0.0),
                    'symmetry_score': forensic_analysis.get('symmetry_analysis', {}).get('face_symmetry', 0.0)
                }

            visual_evidence['frame_analysis']['frame_results'].append(frame_data)

        # Generate temporal analysis
        if len(frame_results) > 1:
            predictions = [f.get('prediction', 'UNKNOWN') for f in frame_results]
            confidences = [f.get('confidence', 0.0) for f in frame_results]
            
            # Calculate consistency score
            prediction_changes = sum(1 for i in range(1, len(predictions)) if predictions[i] != predictions[i-1])
            visual_evidence['temporal_analysis']['consistency_score'] = 1.0 - (prediction_changes / len(predictions))
            
            # Calculate confidence variance
            confidence_variance = np.var(confidences) if confidences else 0.0
            visual_evidence['temporal_analysis']['motion_analysis'] = {
                'confidence_variance': float(confidence_variance),
                'average_confidence': float(np.mean(confidences)) if confidences else 0.0
            }

        # Generate heatmaps for video analysis
        heatmaps = []
        
        # Overall video score heatmap
        video_score = results.get('video_score', {})
        if video_score.get('overall_score') is not None:
            heatmaps.append({
                'type': 'overall_score',
                'intensity': video_score['overall_score'],
                'color': get_heatmap_color(video_score['overall_score']),
                'description': 'Overall Video Score'
            })

        # Frame consistency heatmap
        if visual_evidence['temporal_analysis']['consistency_score'] is not None:
            heatmaps.append({
                'type': 'frame_consistency',
                'intensity': visual_evidence['temporal_analysis']['consistency_score'],
                'color': get_heatmap_color(visual_evidence['temporal_analysis']['consistency_score']),
                'description': 'Frame Consistency Analysis'
            })

        visual_evidence['heatmaps'] = heatmaps

        return visual_evidence

    except Exception as e:
        logger.error(f"Error generating video visual evidence data: {e}")
        return {
            'frame_analysis': {'total_frames': 0, 'fake_frames': 0, 'real_frames': 0, 'frame_results': []},
            'temporal_analysis': {'consistency_score': 0.0, 'motion_analysis': {}, 'transition_analysis': {}},
            'spatial_analysis': {'face_regions': [], 'artifact_regions': [], 'problematic_frames': []},
            'heatmaps': [],
            'overlay_data': {}
        }

def get_heatmap_color(score: float) -> str:
    """Get color for heatmap based on score"""
    if score > 0.7:
        return '#22c55e'  # Green for good scores
    elif score > 0.4:
        return '#f59e0b'  # Yellow for medium scores
    else:
        return '#ef4444'  # Red for poor scores

def cleanup_file(file_path: str, delay_audio: bool = True):
    """Clean up uploaded file after analysis"""
    try:
        if os.path.exists(file_path):
            file_type = get_file_type(file_path)
            
            # For all file types, delay cleanup to allow viewing/playback
            if delay_audio:
                # Schedule cleanup after 1 hour for all files
                import threading
                import time
                
                def delayed_cleanup():
                    time.sleep(3600)  # 1 hour delay
                    try:
                        if os.path.exists(file_path):
                            os.remove(file_path)
                            logger.info(f"Delayed cleanup completed for {file_type} file: {file_path}")
                    except Exception as e:
                        logger.error(f"Failed delayed cleanup for {file_path}: {e}")
                
                # Start cleanup in background thread
                cleanup_thread = threading.Thread(target=delayed_cleanup, daemon=True)
                cleanup_thread.start()
                logger.info(f"Scheduled delayed cleanup for {file_type} file: {file_path}")
            else:
                # Immediate cleanup when explicitly requested
                os.remove(file_path)
                logger.info(f"Cleaned up file: {file_path}")
    except Exception as e:
        logger.error(f"Failed to cleanup file {file_path}: {e}")

# API Routes
@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Deepfake Detection API", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint - responds immediately for deployment"""
    import os
    offline_mode = os.getenv('OFFLINE_MODE', '0') == '1'
    
    # Quick health check - don't initialize models here
    return {
        "status": "healthy",
        "offline_mode": offline_mode,
        "models_loaded": {
            "image_detector": image_detector is not None,
            "video_detector": video_detector is not None,
            "audio_detector": audio_detector is not None
        },
        "message": "API is ready - models load on first use"
    }

# Authentication endpoints
@app.post("/auth/signup", response_model=Token)
async def signup(user_data: UserSignup):
    """User registration endpoint"""
    # Check if username already exists
    if get_user_by_username(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    if get_user_by_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate password length
    if len(user_data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters"
        )
    
    # Validate and truncate password if necessary (bcrypt limit is 72 bytes)
    password = user_data.password
    password_bytes = password.encode('utf-8')
    
    if len(password_bytes) > 72:
        # Truncate to 72 bytes before creating user
        logger.warning(f"Password too long ({len(password_bytes)} bytes), truncating to 72 bytes")
        truncated_bytes = password_bytes[:72]
        # Decode, handling incomplete UTF-8 sequences
        while len(truncated_bytes) > 0:
            try:
                password = truncated_bytes.decode('utf-8')
                # Verify it's <= 72 bytes when re-encoded
                if len(password.encode('utf-8')) <= 72:
                    break
                truncated_bytes = truncated_bytes[:-1]
            except UnicodeDecodeError:
                truncated_bytes = truncated_bytes[:-1]
        else:
            # Fallback
            password = password[:72]
    
    # Create user with (possibly truncated) password
    user = create_user(user_data.username, user_data.email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user["user_id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "username": user["username"],
            "email": user["email"]
        }
    }

@app.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    """User login endpoint"""
    # Get user by username
    user = get_user_by_username(user_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Verify password
    if not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user["user_id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "username": user["username"],
            "email": user["email"]
        }
    }

@app.get("/auth/me")
async def get_current_user_info(current_user: Dict = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user

@app.get("/debug/analysis_results")
async def debug_analysis_results():
    """Debug endpoint to check analysis results state"""
    return {
        "total_files": len(analysis_results),
        "file_ids": list(analysis_results.keys()),
        "file_statuses": {file_id: data.get('status', 'unknown') for file_id, data in analysis_results.items()}
    }

@app.post("/cleanup")
async def manual_cleanup(max_age_hours: int = 24):
    """Manually trigger cleanup of old files"""
    try:
        cleanup_old_files(max_age_hours)
        return {"message": f"Cleanup completed for files older than {max_age_hours} hours"}
    except Exception as e:
        logger.error(f"Manual cleanup error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload", response_model=FileInfo)
async def upload_file(
    file: UploadFile = File(...),
    current_user: Dict = Depends(get_current_user)
):
    """Upload a file for analysis (requires authentication)"""
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        file_type = get_file_type(file.filename)
        if file_type == 'unknown':
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file format. Supported formats: {SUPPORTED_IMAGE_FORMATS | SUPPORTED_VIDEO_FORMATS | SUPPORTED_AUDIO_FORMATS}"
            )
        
        # Generate unique file ID
        file_id = str(uuid.uuid4())
        
        # Save file
        file_path = save_uploaded_file(file, file_id)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Create file info
        file_info = FileInfo(
            file_id=file_id,
            filename=file.filename,
            file_type=file_type,
            file_size=file_size,
            upload_time=datetime.now()
        )
        
        # Store file info in memory and database (with user_id)
        analysis_results[file_id] = {
            'file_info': file_info.dict(),
            'file_path': file_path,
            'status': 'uploaded',
            'user_id': current_user['user_id']
        }
        
        # Save to persistent database
        save_file_metadata(file_id, file_info.dict(), file_path, current_user['user_id'], 'uploaded')
        
        logger.info(f"File uploaded: {file.filename} ({file_type}) by user {current_user['username']}")
        return file_info
        
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/{file_id}")
async def analyze_file(
    file_id: str, 
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user)
):
    """Start analysis for uploaded file (requires authentication)"""
    try:
        if file_id not in analysis_results:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_data = analysis_results[file_id]
        
        # Check if file belongs to current user
        if file_data.get('user_id') != current_user['user_id']:
            raise HTTPException(status_code=403, detail="Access denied: File does not belong to you")
        
        file_path = file_data['file_path']
        file_type = file_data['file_info']['file_type']
        
        # Update status
        analysis_results[file_id]['status'] = 'processing'
        analysis_results[file_id]['timestamp'] = datetime.now()
        
        # Start background analysis
        background_tasks.add_task(perform_analysis, file_id, file_path, file_type)
        
        return {"message": "Analysis started", "file_id": file_id, "status": "processing"}
        
    except Exception as e:
        logger.error(f"Analysis start error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/results/{file_id}", response_model=AnalysisResult)
async def get_results(
    file_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get analysis results for a file (requires authentication)"""
    try:
        logger.info(f"Getting results for file_id: {file_id} for user {current_user['username']}")
        
        # First check in-memory cache
        if file_id in analysis_results:
            file_data = analysis_results[file_id]
            
            # Check if file belongs to current user
            if file_data.get('user_id') != current_user['user_id']:
                raise HTTPException(status_code=403, detail="Access denied: File does not belong to you")
            
            result_data = file_data.get('result')
            
            # Ensure visual_evidence is present and has bounding box for images/videos
            if result_data and result_data.get('type') in ['image', 'video']:
                file_path = file_data.get('file_path')
                if file_path and Path(file_path).exists():
                    visual_evidence = result_data.get('visual_evidence', {})
                    # Regenerate if missing or if bounding box is missing for images
                    needs_regeneration = False
                    if not visual_evidence:
                        needs_regeneration = True
                        logger.info(f"Visual evidence missing, regenerating for {file_id}")
                    elif result_data.get('type') == 'image':
                        face_detection = visual_evidence.get('face_detection', {})
                        # Always regenerate if face is detected but bounding box is missing
                        if face_detection.get('detected') and not face_detection.get('bounding_box'):
                            needs_regeneration = True
                            logger.warning(f"Bounding box missing in visual evidence (detected={face_detection.get('detected')}, bbox={face_detection.get('bounding_box')}), forcing regeneration for {file_id}")
                            logger.warning(f"Full visual_evidence: {visual_evidence}")
                            logger.warning(f"Full details: {result_data.get('details', {})}")
                    
                    if needs_regeneration:
                        try:
                            if result_data.get('type') == 'image':
                                logger.info(f"Calling generate_visual_evidence_data with details keys: {list(result_data.get('details', {}).keys())}")
                                new_visual_evidence = generate_visual_evidence_data(
                                    result_data.get('details', {}), 
                                    file_path
                                )
                                logger.info(f"Generated visual evidence - face_detected: {new_visual_evidence.get('face_detection', {}).get('detected')}, bounding_box: {new_visual_evidence.get('face_detection', {}).get('bounding_box')}")
                                result_data['visual_evidence'] = new_visual_evidence
                            elif result_data.get('type') == 'video':
                                result_data['visual_evidence'] = generate_video_visual_evidence_data(
                                    result_data, 
                                    file_path
                                )
                            # Update in memory only (no database storage)
                            analysis_results[file_id]['result'] = result_data
                            logger.info(f"Successfully regenerated visual evidence for {file_id} (in memory only)")
                        except Exception as e:
                            logger.error(f"Failed to regenerate visual evidence: {e}")
                            import traceback
                            logger.error(traceback.format_exc())
            
            result = AnalysisResult(
                file_id=file_id,
                status=file_data['status'],
                result=result_data,
                error=file_data.get('error'),
                timestamp=file_data.get('timestamp', datetime.now())
            )
            return result
        
        # If not in memory, results are not available (we don't store in database)
        raise HTTPException(status_code=404, detail="Analysis results not found. Results are only available in memory during the current session.")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get results error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/files")
async def list_files(current_user: Dict = Depends(get_current_user)):
    """List all uploaded files for current user (requires authentication)"""
    try:
        # Query database directly to ensure we get all files for this user
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT file_id, filename, file_type, file_size, upload_time, 
                   status, analysis_result, created_at
            FROM file_metadata
            WHERE user_id = ?
            ORDER BY created_at DESC
        ''', (current_user['user_id'],))
        
        rows = cursor.fetchall()
        conn.close()
        
        files = []
        for row in rows:
            file_id, filename, file_type, file_size, upload_time, status, analysis_result, created_at = row
            
            file_data = {
                'file_id': file_id,
                'original_name': filename,
                'file_type': file_type,
                'file_size': file_size,
                'status': status,
                'uploaded_at': upload_time,
                'created_at': created_at
            }
            
            # Include analysis results if available
            if analysis_result:
                try:
                    file_data['result'] = json.loads(analysis_result)
                except json.JSONDecodeError:
                    logger.warning(f"Failed to parse analysis result for {file_id}")
            
            files.append(file_data)
        
        logger.info(f"Retrieved {len(files)} files for user {current_user['username']}")
        return {"files": files}
        
    except Exception as e:
        logger.error(f"List files error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/files/{file_id}")
async def delete_file(
    file_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Delete a file and its analysis results (requires authentication)"""
    try:
        # Check in memory first
        file_path = None
        if file_id in analysis_results:
            file_data = analysis_results[file_id]
            
            # Check if file belongs to current user
            if file_data.get('user_id') != current_user['user_id']:
                raise HTTPException(status_code=403, detail="Access denied: File does not belong to you")
            
            file_path = file_data.get('file_path')
        else:
            # Check database if not in memory
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT user_id, file_path
                FROM file_metadata
                WHERE file_id = ?
            ''', (file_id,))
            
            row = cursor.fetchone()
            conn.close()
            
            if not row:
                raise HTTPException(status_code=404, detail="File not found")
            
            db_user_id, db_file_path = row
            
            # Check if file belongs to current user
            if db_user_id != current_user['user_id']:
                raise HTTPException(status_code=403, detail="Access denied: File does not belong to you")
            
            file_path = db_file_path
        
        # Clean up file immediately (override delay for manual deletion)
        if file_path and Path(file_path).exists():
            cleanup_file(file_path, delay_audio=False)
        
        # Remove from memory if present
        if file_id in analysis_results:
            del analysis_results[file_id]
        
        # Remove from database
        delete_file_metadata(file_id)
        
        logger.info(f"File {file_id} deleted by user {current_user['username']}")
        return {"message": "File deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete file error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cleanup-audio")
async def cleanup_audio_files():
    """Manually cleanup all audio files"""
    try:
        upload_dir = Path("uploads")
        if not upload_dir.exists():
            return {"message": "No uploads directory found"}
        
        cleaned_count = 0
        for file_path in upload_dir.glob("*"):
            if get_file_type(str(file_path)) == 'audio':
                try:
                    file_path.unlink()
                    cleaned_count += 1
                    logger.info(f"Manually cleaned up audio file: {file_path}")
                except Exception as e:
                    logger.error(f"Failed to cleanup {file_path}: {e}")
        
        return {"message": f"Cleaned up {cleaned_count} audio files"}
    except Exception as e:
        logger.error(f"Manual cleanup error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/educational-content")
async def get_educational_content():
    """Get educational content about deepfakes"""
    return {
        "sections": [
            {
                "title": "What are Deepfakes?",
                "content": "Deepfakes are AI-generated media that replace a person's likeness with someone else's. They use deep learning techniques to create realistic but fake images, videos, or audio.",
                "type": "text"
            },
            {
                "title": "How to Spot Deepfakes",
                "content": "Look for inconsistencies in lighting, facial movements, or audio synchronization. Our AI helps detect these subtle signs that humans might miss.",
                "type": "text"
            },
            {
                "title": "Detection Methods",
                "content": "Our system uses multiple AI models, forensic analysis, and computer vision techniques to identify deepfakes with high accuracy.",
                "type": "text"
            }
        ]
    }

# Background analysis function
async def perform_analysis(file_id: str, file_path: str, file_type: str):
    """Perform the actual analysis in background"""
    try:
        logger.info(f"Starting analysis for {file_id} ({file_type})")
        
        if file_type == 'image':
            result = await analyze_image(file_path)
        elif file_type == 'video':
            result = await analyze_video(file_path)
        elif file_type == 'audio':
            result = await analyze_audio(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
        
        # Update results in memory only (no database storage)
        logger.info(f"Storing results for {file_id}")
        analysis_results[file_id]['result'] = result
        analysis_results[file_id]['status'] = 'completed'
        analysis_results[file_id]['timestamp'] = datetime.now()
        
        logger.info(f"Results stored. Status: {analysis_results[file_id]['status']}")
        logger.info(f"Available file IDs after storing: {list(analysis_results.keys())}")
        
        # Clean up file after analysis (with delay for visual evidence)
        cleanup_file(file_path, delay_audio=True)
        
        logger.info(f"Analysis completed for {file_id}")
        
    except Exception as e:
        logger.error(f"Analysis error for {file_id}: {e}")
        analysis_results[file_id]['status'] = 'error'
        analysis_results[file_id]['error'] = str(e)
        analysis_results[file_id]['timestamp'] = datetime.now()
        
        # Clean up file even on error
        cleanup_file(file_path)

async def analyze_image(file_path: str) -> Dict:
    """Analyze image using existing detector"""
    try:
        # Use lazy initialization
        detector = get_image_detector()
        if detector is None:
            raise HTTPException(status_code=503, detail="Image detector not available")
        
        # Use existing detection method
        confidence, prediction, details = detector.detect_deepfake(file_path)
        
        # Convert details to ensure JSON serializable
        details_serializable = convert_numpy_types(details)
        
        # Format result for web interface
        result = {
            'type': 'image',
            'prediction': str(prediction),  # Ensure string
            'confidence': float(confidence),
            'details': details_serializable,
            'analysis_time': datetime.now().isoformat(),
            'model_info': {
                'models_used': list(details.get('model_predictions', {}).keys()),
                'ensemble_confidence': float(confidence)
            },
            'visual_evidence': generate_visual_evidence_data(details_serializable, file_path)
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Image analysis error: {e}")
        raise

async def analyze_video(file_path: str) -> Dict:
    """Analyze video using OpenAI detector"""
    try:
        # Use lazy initialization
        detector = get_video_detector()
        if detector is None:
            raise HTTPException(status_code=503, detail="Video detector not available")
        
        # Use OpenAI detection method
        results = detector.detect_video_deepfake(file_path)
        
        # Convert results to ensure JSON serializable
        results_serializable = convert_numpy_types(results)
        
        # Extract model information
        model_info = results_serializable.get('model_info', {})
        if not model_info:
            model_info = {
                'models_used': ['openai_gpt4_vision'],
                'ensemble_confidence': float(results.get('confidence', 0.0))
            }

        # Extract video info with fallback
        video_info = results_serializable.get('video_info', {})
        frame_analysis = results_serializable.get('frame_analysis', {})
        if not video_info:
            # Fallback video info if not provided by detector
            video_info = {
                'duration': 10.0,  # Default duration
                'fps': 30.0,       # Default FPS
                'frame_count': frame_analysis.get('total_frames_analyzed', 50)
            }

        # Format result for web interface
        result = {
            'type': 'video',
            'prediction': str(results.get('prediction', 'UNKNOWN')),
            'confidence': float(results.get('confidence', 0.0)),
            'details': results_serializable,
            'analysis_time': datetime.now().isoformat(),
            'model_info': model_info,
            'video_info': video_info,
            'frame_analysis': frame_analysis,
            'video_score': results_serializable.get('video_score', {}),
            'visual_evidence': generate_video_visual_evidence_data(results_serializable, file_path)
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Video analysis error: {e}")
        raise

async def analyze_audio(file_path: str) -> Dict:
    """Analyze audio using hybrid approach combining AASIST, RawNet2, and comprehensive feature analysis"""
    try:
        # Use lazy initialization
        detector = get_audio_detector()
        if detector is None:
            raise HTTPException(status_code=503, detail="Audio detector not available")
        
        logger.info(f"Starting audio analysis for: {file_path}")
        
        # Use audio detection method with timeout handling
        confidence, prediction, details = detector.detect_deepfake(file_path)
        
        logger.info(f"Audio analysis completed: {prediction} ({confidence:.1f}%)")
        
        # Convert details to ensure JSON serializable
        details_serializable = convert_numpy_types(details)
        
        # Format result for web interface
        result = {
            'type': 'audio',
            'prediction': str(prediction),  # Ensure string
            'confidence': float(confidence),
            'details': details_serializable,
            'analysis_time': datetime.now().isoformat(),
            'model_info': {
                'models_used': list(details.get('model_predictions', {}).keys()),
                'ensemble_confidence': float(confidence),
                'analysis_methods': details.get('analysis_methods', [])
            }
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Audio analysis error: {e}")
        # Return a fallback result instead of raising
        return {
            'type': 'audio',
            'prediction': 'REAL',
            'confidence': 50.0,
            'details': {'error': str(e), 'fallback': True},
            'analysis_time': datetime.now().isoformat(),
            'model_info': {
                'models_used': ['fallback'],
                'ensemble_confidence': 0.5,
                'analysis_methods': ['Fallback Analysis']
            }
        }

# Handle CORS preflight requests for file serving
@app.options("/uploads/{file_path:path}")
async def serve_file_options(file_path: str):
    """Handle CORS preflight requests for file serving"""
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Custom file serving endpoint to handle missing files gracefully
@app.get("/uploads/{file_path:path}")
async def serve_file(
    file_path: str,
    token: Optional[str] = None,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security)
):
    """Serve uploaded file with proper error handling (requires authentication)"""
    try:
        jwt_token = token or (credentials.credentials if credentials else None)
        if not jwt_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authorization token is required to access files"
            )
        current_user = _decode_user_from_token(jwt_token)
        
        # Extract file_id from path (handle both with and without extension)
        # Path format: {file_id} or {file_id}.{ext}
        file_id = Path(file_path).stem  # Get filename without extension
        
        # Check if file exists in database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT user_id, filename, file_type, file_path 
            FROM file_metadata 
            WHERE file_id = ?
        ''', (file_id,))
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            logger.warning(f"File {file_id} not found in database")
            raise HTTPException(status_code=404, detail="File not found in database")
        
        db_user_id, filename, file_type, stored_file_path = result
        
        # Check if file belongs to current user
        if db_user_id != current_user['user_id']:
            raise HTTPException(status_code=403, detail="Access denied: File does not belong to you")
        
        # Check if file exists on disk
        if not os.path.exists(stored_file_path):
            logger.warning(f"File {file_id} ({filename}) not found on disk at {stored_file_path}")
            # Update database to mark file as deleted
            try:
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute('''
                    UPDATE file_metadata 
                    SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
                    WHERE file_id = ?
                ''', (file_id,))
                conn.commit()
                conn.close()
            except Exception as db_error:
                logger.error(f"Failed to update file status in database: {db_error}")
            
            raise HTTPException(status_code=404, detail="File not found on disk")
        
        # Determine media type based on file extension
        file_ext = Path(stored_file_path).suffix.lower()
        media_type_map = {
            '.wav': 'audio/wave',  # Use audio/wave for better browser compatibility
            '.mp3': 'audio/mpeg',
            '.flac': 'audio/flac',
            '.aac': 'audio/aac',
            '.ogg': 'audio/ogg',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.mp4': 'video/mp4',
            '.avi': 'video/x-msvideo',
            '.mov': 'video/quicktime',
            '.webm': 'video/webm'
        }
        media_type = media_type_map.get(file_ext, 'application/octet-stream')
        
        # Return file response with proper headers
        response = FileResponse(
            stored_file_path, 
            filename=filename,
            media_type=media_type
        )
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Accept-Ranges"] = "bytes"
        
        # Add enhanced headers for audio files to help with playback
        if file_type == 'audio':
            response.headers["Cache-Control"] = "public, max-age=3600"
            # Add Content-Type explicitly for better browser compatibility
            if file_ext == '.wav':
                response.headers["Content-Type"] = "audio/wave"
            # Enable range requests for audio streaming
            response.headers["Accept-Ranges"] = "bytes"
            # Add CORS headers specifically for audio
            response.headers["Access-Control-Expose-Headers"] = "Content-Length, Content-Range, Accept-Ranges"
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving file {file_path}: {e}")
        raise HTTPException(status_code=500, detail="Error serving file")

# Initialize PDF report generator
pdf_generator = PDFReportGenerator()

@app.get("/report/{file_id}")
async def generate_pdf_report(
    file_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Generate and download PDF report for analysis results (requires authentication)"""
    try:
        logger.info(f"Generating PDF report for file_id: {file_id} for user {current_user['username']}")
        
        # Check in memory first, then database
        file_info = None
        analysis_result = None
        status = None
        
        if file_id in analysis_results:
            file_data = analysis_results[file_id]
            
            # Check if file belongs to current user
            if file_data.get('user_id') != current_user['user_id']:
                raise HTTPException(status_code=403, detail="Access denied: File does not belong to you")
            
            file_info = file_data.get('file_info', {})
            analysis_result = file_data.get('result')
            status = file_data.get('status')
        else:
            # Query database if not in memory
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT user_id, filename, file_type, file_size, upload_time, 
                       status, analysis_result
                FROM file_metadata
                WHERE file_id = ?
            ''', (file_id,))
            
            row = cursor.fetchone()
            conn.close()
            
            if not row:
                raise HTTPException(status_code=404, detail="File not found")
            
            db_user_id, filename, file_type, file_size, upload_time, db_status, analysis_result_json = row
            
            # Check if file belongs to current user
            if db_user_id != current_user['user_id']:
                raise HTTPException(status_code=403, detail="Access denied: File does not belong to you")
            
            file_info = {
                'file_id': file_id,
                'filename': filename,
                'file_type': file_type,
                'file_size': file_size,
                'upload_time': upload_time
            }
            
            status = db_status
            
            # Parse analysis result
            if analysis_result_json:
                try:
                    analysis_result = json.loads(analysis_result_json)
                except json.JSONDecodeError:
                    logger.warning(f"Failed to parse analysis result for {file_id}")
        
        # Check if analysis is completed
        if status != 'completed':
            raise HTTPException(
                status_code=400, 
                detail=f"Analysis not completed. Current status: {status}"
            )
        
        if not analysis_result:
            raise HTTPException(status_code=404, detail="Analysis results not found")
        
        # Create reports directory if it doesn't exist
        reports_dir = Path("uploads/reports")
        reports_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate PDF report
        pdf_filename = f"{file_id}_report.pdf"
        pdf_path = reports_dir / pdf_filename
        
        # Generate the PDF report
        pdf_generator.generate_report(
            file_id=file_id,
            file_info=file_info,
            analysis_result=analysis_result,
            output_path=str(pdf_path)
        )
        
        # Ensure file exists and is readable
        if not pdf_path.exists():
            raise HTTPException(status_code=500, detail="PDF report file was not created")
        
        # Read the file into memory to avoid Content-Length issues
        try:
            with open(str(pdf_path), 'rb') as f:
                pdf_content = f.read()
            
            if not pdf_content:
                raise HTTPException(status_code=500, detail="PDF report file is empty")
            
            # Return PDF file as Response with proper headers
            response = Response(
                content=pdf_content,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'attachment; filename="deepfake_analysis_report_{file_id}.pdf"',
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "*"
                }
            )
            
            logger.info(f"PDF report generated successfully: {pdf_path} (size: {len(pdf_content)} bytes)")
            return response
            
        except IOError as e:
            logger.error(f"Error reading PDF file {pdf_path}: {e}")
            raise HTTPException(status_code=500, detail=f"Error reading PDF report: {str(e)}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating PDF report for {file_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating PDF report: {str(e)}")

# Mount static files for direct access (fallback)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
