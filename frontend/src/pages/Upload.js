import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Upload as UploadIcon, 
  File, 
  Image, 
  Video, 
  Music, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Eye,
  Trash2
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import toast from 'react-hot-toast';

const Upload = () => {
  const navigate = useNavigate();
  const { api, loading } = useAnalysis();
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Upload files
    for (const fileData of newFiles) {
      try {
        const result = await api.uploadFile(fileData.file);
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { ...f, ...result, status: 'uploaded', progress: 100 }
              : f
          )
        );
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'error', error: error.message }
              : f
          )
        );
      }
    }
  }, [api]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv', '.m4v', '.3gp', '.ogv'],
      'audio/*': ['.wav', '.mp3', '.flac', '.aac', '.ogg']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true
  });

  const handleAnalyze = async (fileId) => {
    try {
      await api.startAnalysis(fileId);
      // Navigate to results page - it will handle polling
      navigate(`/results/${fileId}`);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to start analysis');
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await api.deleteFile(fileId);
      setUploadedFiles(prev => prev.filter(f => f.file_id !== fileId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
        return <Image className="w-8 h-8 text-blue-500" />;
      case 'video':
        return <Video className="w-8 h-8 text-red-500" />;
      case 'audio':
        return <Music className="w-8 h-8 text-green-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'uploaded':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Upload Media for Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload images, videos, or audio files to detect deepfakes using our advanced AI system
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors duration-200 ${
              isDragActive
                ? 'border-primary-400 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <UploadIcon className="w-8 h-8 text-primary-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </h3>
                <p className="text-gray-600 mb-4">
                  or click to browse files
                </p>
                <div className="text-sm text-gray-500">
                  <p>Supported formats: JPG, PNG, MP4, AVI, WAV, MP3</p>
                  <p>Maximum file size: 100MB</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Uploaded Files
            </h2>
            
            {uploadedFiles.map((fileData) => (
              <motion.div
                key={fileData.id || fileData.file_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getFileIcon(fileData.file_type)}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {fileData.filename || fileData.file?.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatFileSize(fileData.file_size || fileData.file?.size)}</span>
                        <span className="capitalize">{fileData.file_type}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fileData.status)}`}>
                          {fileData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {fileData.status === 'uploaded' && (
                      <button
                        onClick={() => handleAnalyze(fileData.file_id)}
                        className="btn-primary flex items-center space-x-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        <span>Analyze</span>
                      </button>
                    )}
                    
                    {fileData.status === 'completed' && (
                      <button
                        onClick={() => navigate(`/results/${fileData.file_id}`)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>View Results</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(fileData.file_id)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
                
                {fileData.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{fileData.error}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}


        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <AlertCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Privacy & Security
              </h3>
              <p className="text-blue-800 text-sm">
                Your uploaded files are processed locally and automatically deleted after analysis. 
                No data is stored permanently or shared with third parties. All analysis happens on our secure servers.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Upload;
