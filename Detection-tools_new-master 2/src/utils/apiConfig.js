/**
 * API Configuration
 * Determines the API base URL based on environment
 * - Development: http://localhost:8000
 * - Production: https://deepfake-qbl3.onrender.com
 * - Can be overridden with REACT_APP_API_URL environment variable
 */
export const API_BASE_URL = 
  process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000' 
    : 'https://deepfake-qbl3.onrender.com');

