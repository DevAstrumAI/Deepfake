import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://deepfake-qbl3.onrender.com';

// Initial state
const initialState = {
  files: [],
  currentAnalysis: null,
  loading: false,
  error: null,
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_FILES: 'SET_FILES',
  ADD_FILE: 'ADD_FILE',
  UPDATE_FILE: 'UPDATE_FILE',
  REMOVE_FILE: 'REMOVE_FILE',
  SET_CURRENT_ANALYSIS: 'SET_CURRENT_ANALYSIS',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
function analysisReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ActionTypes.SET_FILES:
      return { ...state, files: action.payload };
    
    case ActionTypes.ADD_FILE:
      return { ...state, files: [...state.files, action.payload] };
    
    case ActionTypes.UPDATE_FILE:
      return {
        ...state,
        files: state.files.map(file =>
          file.file_id === action.payload.file_id
            ? { ...file, ...action.payload }
            : file
        ),
      };
    
    case ActionTypes.REMOVE_FILE:
      return {
        ...state,
        files: state.files.filter(file => file.file_id !== action.payload),
      };
    
    case ActionTypes.SET_CURRENT_ANALYSIS:
      return { ...state, currentAnalysis: action.payload };
    
    default:
      return state;
  }
}

// Context
const AnalysisContext = createContext();

// Provider component
export function AnalysisProvider({ children }) {
  const [state, dispatch] = useReducer(analysisReducer, initialState);

  // API functions
  const api = {
    // Upload file
    uploadFile: async (file) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        dispatch({ type: ActionTypes.CLEAR_ERROR });

        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        dispatch({ type: ActionTypes.ADD_FILE, payload: response.data });
        toast.success('File uploaded successfully!');
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Upload failed';
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
        toast.error(errorMessage);
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },

    // Start analysis
    startAnalysis: async (fileId) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        dispatch({ type: ActionTypes.CLEAR_ERROR });

        const response = await axios.post(`${API_BASE_URL}/analyze/${fileId}`, {}, {});
        
        dispatch({ type: ActionTypes.UPDATE_FILE, payload: { file_id: fileId, status: 'processing' } });
        toast.success('Analysis started!');
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Analysis failed to start';
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
        toast.error(errorMessage);
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },

    // Get results
    getResults: async (fileId) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/results/${fileId}`, {});
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Failed to get results';
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
        throw error;
      }
    },

    // List files
    listFiles: async () => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const response = await axios.get(`${API_BASE_URL}/files`, {});
        const files = response.data.files || [];
        console.log('listFiles response:', files);
        dispatch({ type: ActionTypes.SET_FILES, payload: files });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        return files;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        const errorMessage = error.response?.data?.detail || 'Failed to list files';
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
        // Don't throw if it's just a 401 (unauthorized) - user might not be logged in yet
        if (error.response?.status !== 401) {
          console.error('Error listing files:', error);
        }
        throw error;
      }
    },

    // Delete file
    deleteFile: async (fileId) => {
      try {
        await axios.delete(`${API_BASE_URL}/files/${fileId}`, {});
        dispatch({ type: ActionTypes.REMOVE_FILE, payload: fileId });
        toast.success('File deleted successfully!');
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Failed to delete file';
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
        toast.error(errorMessage);
        throw error;
      }
    },

    // Get educational content
    getEducationalContent: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/educational-content`);
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Failed to get educational content';
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorMessage });
        throw error;
      }
    },

    // Health check
    healthCheck: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  };

  // Poll for results
  const pollResults = async (fileId, maxAttempts = 60) => {
    let attempts = 0;
    
    const poll = async () => {
      try {
        const result = await api.getResults(fileId);
        
        if (result.status === 'completed') {
          dispatch({ type: ActionTypes.UPDATE_FILE, payload: { file_id: fileId, status: 'completed', result: result.result } });
          dispatch({ type: ActionTypes.SET_CURRENT_ANALYSIS, payload: result.result });
          toast.success('Analysis completed!');
          return;
        } else if (result.status === 'error') {
          dispatch({ type: ActionTypes.UPDATE_FILE, payload: { file_id: fileId, status: 'error', error: result.error } });
          toast.error(`Analysis failed: ${result.error}`);
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // Poll every 2 seconds
        } else {
          dispatch({ type: ActionTypes.UPDATE_FILE, payload: { file_id: fileId, status: 'timeout' } });
          toast.error('Analysis timed out');
        }
      } catch (error) {
        console.error('Polling error:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          dispatch({ type: ActionTypes.UPDATE_FILE, payload: { file_id: fileId, status: 'error', error: 'Polling failed' } });
          toast.error('Analysis polling failed');
        }
      }
    };
    
    poll();
  };

  // Load files on mount
  const hasLoadedRef = useRef(false);
  
  useEffect(() => {
    // Load files on mount
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      api.listFiles()
        .then(files => {
          console.log('Files loaded successfully:', files?.length || 0, 'files');
          if (files && files.length > 0) {
            console.log('Files data:', files);
          }
        })
        .catch(error => {
          console.error('Error loading files:', error);
          toast.error('Failed to load files');
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Load once on mount

  const value = {
    ...state,
    api,
    pollResults,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

// Hook to use the context
export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}
