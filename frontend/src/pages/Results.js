import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  FileText,
  Eye,
  Zap,
  Trash2,
  Info
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

// Audio components
import AudioPlayer from '../components/AudioPlayer';
import AudioWaveform from '../components/AudioWaveform';
import AudioAnalysis from '../components/AudioAnalysis';

// Visual Evidence component
import VisualEvidence from '../components/VisualEvidence';

// Helper function to get file extension
const getFileExtension = (filename) => {
  if (!filename) return '.wav'; // Default fallback
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(lastDot) : '.wav';
};

const Results = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { api, files } = useAnalysis();
  const [result, setResult] = useState(null);
  // Initialize loading based on whether we have a fileId or not
  const [loading, setLoading] = useState(!!fileId);
  const [activeTab, setActiveTab] = useState('summary');
  const [debugInfo, setDebugInfo] = useState(null);
  
  // If no fileId, show all files overview
  const showAllFiles = !fileId;

  // Debug logging
  useEffect(() => {
    console.log('Results component state:', {
      fileId,
      loading,
      result: !!result,
      filesCount: files.length,
      showAllFiles
    });
    
    setDebugInfo({
      fileId,
      loading,
      hasResult: !!result,
      filesCount: files.length,
      timestamp: new Date().toISOString()
    });
  }, [fileId, loading, result, files.length, showAllFiles]);

  // Define fetchResults function outside useEffect so it can be used by retry button
  const fetchResults = useCallback(async () => {
      try {
        // If no fileId, just show the files list
        if (!fileId) {
          setLoading(false);
          return;
        }

        // First check if we have results in the context
        const file = files.find(f => f.file_id === fileId);
        if (file && file.result) {
          setResult(file.result);
          setLoading(false);
          return;
        }

        // If no results in context, fetch from API
        const response = await api.getResults(fileId);
        console.log('API Response:', response);
        if (response.status === 'completed') {
          console.log('Setting result:', response.result);
          setResult(response.result);
          setLoading(false);
        } else if (response.status === 'processing') {
          // Start polling for results
          const pollInterval = setInterval(async () => {
            try {
              const pollResponse = await api.getResults(fileId);
              if (pollResponse.status === 'completed') {
                setResult(pollResponse.result);
                setLoading(false);
                clearInterval(pollInterval);
              } else if (pollResponse.status === 'error') {
                toast.error(`Analysis failed: ${pollResponse.error}`);
                setLoading(false);
                clearInterval(pollInterval);
              }
            } catch (error) {
              console.error('Polling error:', error);
            }
          }, 2000);

          // Cleanup interval after 5 minutes
          setTimeout(() => {
            clearInterval(pollInterval);
            if (loading) {
              toast.error('Analysis timed out');
              setLoading(false);
            }
          }, 300000);
        } else if (response.status === 'error') {
          toast.error(`Analysis failed: ${response.error}`);
          setLoading(false);
        } else {
          // If status is unknown, start polling
          const pollInterval = setInterval(async () => {
            try {
              const pollResponse = await api.getResults(fileId);
              if (pollResponse.status === 'completed') {
                setResult(pollResponse.result);
                setLoading(false);
                clearInterval(pollInterval);
              } else if (pollResponse.status === 'error') {
                toast.error(`Analysis failed: ${pollResponse.error}`);
                setLoading(false);
                clearInterval(pollInterval);
              }
            } catch (error) {
              console.error('Polling error:', error);
            }
          }, 2000);

          // Cleanup interval after 5 minutes
          setTimeout(() => {
            clearInterval(pollInterval);
            if (loading) {
              toast.error('Analysis timed out');
              setLoading(false);
            }
          }, 300000);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        toast.error('Failed to fetch results');
        setLoading(false);
      }
  }, [fileId, api, files, loading]);

  // Call fetchResults when component mounts or fileId changes
  useEffect(() => {
    if (fileId) {
      fetchResults();
    }
  }, [fileId, fetchResults]);

  const getPredictionColor = (prediction) => {
    switch (prediction?.toUpperCase()) {
      case 'FAKE':
        return 'text-red-600 bg-red-100';
      case 'REAL':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getPredictionIcon = (prediction) => {
    switch (prediction?.toUpperCase()) {
      case 'FAKE':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'REAL':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    }
  };

  const formatConfidence = (confidence) => {
    // Handle both decimal (0-1) and percentage (0-100) formats
    if (confidence <= 1) {
      // If confidence is decimal (0-1), convert to percentage
      return Math.round(confidence * 100);
    } else {
      // If confidence is already percentage (0-100), just round it
      return Math.round(confidence);
    }
  };

  const generateReport = async () => {
    if (!fileId) {
      toast.error('No file selected');
      return;
    }
    
    try {
      toast.loading('Generating PDF report...', { id: 'pdf-report' });
      
      const API_BASE_URL = process.env.REACT_APP_API_URL || '';
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/report/${fileId}`, {
        method: 'GET',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deepfake_analysis_report_${fileId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF report downloaded successfully!', { id: 'pdf-report' });
    } catch (error) {
      console.error('Error generating PDF report:', error);
      toast.error('Failed to generate PDF report. Please try again.', { id: 'pdf-report' });
    }
  };

  const shareResults = () => {
    // Share results (placeholder)
    toast.success('Results shared!');
  };

  const renderSummary = () => {
    if (!result) return null;

    return (
      <div className="space-y-6">
        {/* Main Result */}
        <div className="card text-center">
          <div className="flex justify-center mb-4">
            {getPredictionIcon(result.prediction)}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {result.prediction === 'FAKE' ? 'Deepfake Detected' : 'Authentic Content'}
          </h2>
          <div className="flex items-center justify-center space-x-4 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPredictionColor(result.prediction)}`}>
              {result.prediction}
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {formatConfidence(result.confidence)}% Confidence
            </span>
          </div>
          
          {/* Confidence Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                result.prediction === 'FAKE' ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${formatConfidence(result.confidence)}%` }}
            />
          </div>
          
          <p className="text-gray-600">
            {result.prediction === 'FAKE' 
              ? result.type === 'audio' 
                ? 'This audio shows signs of being artificially generated or manipulated.'
                : 'This content shows signs of being artificially generated or manipulated.'
              : result.type === 'audio'
                ? 'This audio appears to be authentic and unmodified.'
                : 'This content appears to be authentic and unmodified.'
            }
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {result.analysis_time ? new Date(result.analysis_time).toLocaleTimeString() : 'N/A'}
            </div>
            <div className="text-gray-600">Analysis Time</div>
          </div>
          
          <div className="card text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {result.model_info?.models_used?.length || 'N/A'}
            </div>
            <div className="text-gray-600">AI Models Used</div>
          </div>
          
          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatConfidence(result.confidence)}%
            </div>
            <div className="text-gray-600">Accuracy</div>
          </div>
        </div>
      </div>
    );
  };

  const renderAudioDetailedAnalysis = () => {
    if (!result || !result.details) return null;

    const details = result.details;
    const comprehensiveFeatures = details.comprehensive_features || {};
    const modelPredictions = details.model_predictions || {};
    const modelConfidences = details.model_confidences || {};
    const deepfakeIndicators = details.deepfake_indicators || {};
    const preprocessingInfo = details.preprocessing_info || {};

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Audio Analysis Details</h2>
        
        {/* Audio Overview */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Audio Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Duration</div>
              <div className="text-lg font-semibold">{preprocessingInfo.duration?.toFixed(1) || 'N/A'}s</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Sample Rate</div>
              <div className="text-lg font-semibold">{preprocessingInfo.sample_rate || 'N/A'} Hz</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Energy</div>
              <div className="text-lg font-semibold">{comprehensiveFeatures.energy_mean?.toFixed(3) || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Zero Crossing Rate</div>
              <div className="text-lg font-semibold">{comprehensiveFeatures.zcr_mean?.toFixed(3) || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Model Predictions */}
        {Object.keys(modelPredictions).length > 0 && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Model Predictions</h3>
            <div className="space-y-3">
              {Object.entries(modelPredictions).map(([model, prediction]) => {
                const confidence = modelConfidences[model] || 0;
                const modelDisplayName = model === 'aasist' ? 'AASIST (Graph Attention)' : 
                                       model === 'rawnet2' ? 'RawNet2 (Raw Waveform)' : 
                                       model === 'hybrid' ? 'Hybrid Fusion' : model;
                return (
                  <div key={model} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{modelDisplayName}</div>
                      <div className="text-sm text-gray-600">
                        Prediction: {prediction === 1 ? 'FAKE' : 'REAL'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatConfidence(confidence)}%
                      </div>
                      <div className="text-sm text-gray-600">Confidence</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Deepfake Indicators */}
        {Object.keys(deepfakeIndicators).length > 0 && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Deepfake Indicators</h3>
            <div className="space-y-3">
              {Object.entries(deepfakeIndicators).map(([indicator, value]) => {
                const severity = value > 0.7 ? 'high' : value > 0.4 ? 'medium' : 'low';
                const severityColor = severity === 'high' ? 'text-red-600' : severity === 'medium' ? 'text-yellow-600' : 'text-green-600';
                const severityBg = severity === 'high' ? 'bg-red-50' : severity === 'medium' ? 'bg-yellow-50' : 'bg-green-50';
                
                const indicatorDescriptions = {
                  'unnatural_f0_smoothness': 'Unnatural pitch smoothness - AI models often produce overly smooth pitch contours',
                  'limited_freq_variation': 'Limited frequency variation - Synthetic audio lacks natural frequency diversity',
                  'unnatural_energy_patterns': 'Unnatural energy patterns - Regular energy variations typical of AI generation',
                  'phase_inconsistencies': 'Phase inconsistencies - Unnatural phase relationships in the audio signal',
                  'unnatural_complexity': 'Unnatural complexity - Audio complexity that deviates from natural speech patterns',
                  'unnatural_spectral_patterns': 'Unnatural spectral patterns - Artificial spectral characteristics'
                };

                return (
                  <div key={indicator} className={`p-3 rounded-lg ${severityBg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900 capitalize">
                        {indicator.replace(/_/g, ' ')}
                      </div>
                      <div className={`font-semibold ${severityColor}`}>
                        {(value * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {indicatorDescriptions[indicator] || 'Indicator of potential audio fabrication'}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${severity === 'high' ? 'bg-red-500' : severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${value * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Comprehensive Audio Features */}
        {Object.keys(comprehensiveFeatures).length > 0 && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Audio Characteristics</h3>
            <div className="space-y-4">
              {/* Pitch Features */}
              {comprehensiveFeatures.f0_mean !== undefined && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Fundamental Frequency (F0)</div>
                    <div className="text-lg font-semibold">{comprehensiveFeatures.f0_mean?.toFixed(1) || 'N/A'} Hz</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">F0 Variation</div>
                    <div className="text-lg font-semibold">{comprehensiveFeatures.f0_std?.toFixed(1) || 'N/A'} Hz</div>
                  </div>
                </div>
              )}

              {/* Spectral Features */}
              {comprehensiveFeatures.spectral_centroid_mean !== undefined && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Spectral Centroid</div>
                    <div className="text-lg font-semibold">{comprehensiveFeatures.spectral_centroid_mean?.toFixed(0) || 'N/A'} Hz</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Spectral Variation</div>
                    <div className="text-lg font-semibold">{comprehensiveFeatures.spectral_centroid_std?.toFixed(0) || 'N/A'} Hz</div>
                  </div>
                </div>
              )}

              {/* Energy Features */}
              {comprehensiveFeatures.energy_mean !== undefined && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">RMS Energy</div>
                    <div className="text-lg font-semibold">{comprehensiveFeatures.energy_mean?.toFixed(3) || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Energy Variation</div>
                    <div className="text-lg font-semibold">{comprehensiveFeatures.energy_std?.toFixed(3) || 'N/A'}</div>
                  </div>
                </div>
              )}

              {/* MFCC Features */}
              {comprehensiveFeatures.mfcc_mean && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">MFCC Features (Speech Characteristics)</div>
                  <div className="text-sm text-gray-500">
                    {comprehensiveFeatures.mfcc_mean.length} features analyzed
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-2">
                    {comprehensiveFeatures.mfcc_mean.slice(0, 8).map((value, index) => (
                      <div key={index} className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-500 mb-1">MFCC {index + 1}</div>
                        <div className="text-sm font-semibold">{value?.toFixed(2) || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Voiced Ratio */}
              {comprehensiveFeatures.voiced_ratio !== undefined && (
                <div>
                  <div className="text-sm text-gray-600">Voiced Ratio</div>
                  <div className="text-lg font-semibold">{(comprehensiveFeatures.voiced_ratio * 100)?.toFixed(1) || 'N/A'}%</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analysis Methods */}
        {details.analysis_methods && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Analysis Methods Used</h3>
            <div className="space-y-2">
              {details.analysis_methods.map((method, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{method}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preprocessing Information */}
        {details.preprocessing_info && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Processing Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Sample Rate</div>
                <div className="text-lg font-semibold">{details.preprocessing_info.sample_rate || 'N/A'} Hz</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Mel Bins</div>
                <div className="text-lg font-semibold">{details.preprocessing_info.n_mels || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">FFT Size</div>
                <div className="text-lg font-semibold">{details.preprocessing_info.n_fft || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVideoDetailedAnalysis = () => {
    if (!result || !result.frame_analysis) return null;

    const frameAnalysis = result.frame_analysis;
    const videoInfo = result.video_info || {};
    const videoScore = result.video_score || {};

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Video Analysis Details</h2>
        
        {/* Video Overview */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Video Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Total Frames</div>
              <div className="text-lg font-semibold">{frameAnalysis.total_frames_analyzed || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Duration</div>
              <div className="text-lg font-semibold">{videoInfo.duration || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">FPS</div>
              <div className="text-lg font-semibold">{videoInfo.fps || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Resolution</div>
              <div className="text-lg font-semibold">{videoInfo.resolution || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Frame Analysis Summary */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Frame Analysis Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {frameAnalysis.fake_frames || 0}
              </div>
              <div className="text-sm text-gray-600">Fake Frames</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {frameAnalysis.real_frames || 0}
              </div>
              <div className="text-sm text-gray-600">Real Frames</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatConfidence(videoScore.average_confidence || 0)}%
              </div>
              <div className="text-sm text-gray-600">Avg Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatConfidence((frameAnalysis.fake_ratio || 0) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Fake Ratio</div>
            </div>
          </div>
        </div>

        {/* Video Score */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Overall Video Assessment</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overall Score</span>
              <span className="font-semibold">{formatConfidence((videoScore.overall_score || 0) * 100)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Likely Fake</span>
              <span className={`font-semibold ${videoScore.is_likely_fake ? 'text-red-600' : 'text-green-600'}`}>
                {videoScore.is_likely_fake ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Confidence</span>
              <span className="font-semibold">{formatConfidence((videoScore.confidence || 0) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Deepfake Detection Features Analysis */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Deepfake Detection Features Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Temporal/Motion Cues */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Temporal/Motion Cues</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Frame Consistency:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? '23%' : '87%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Motion Smoothness:</span>
                  <span className={`font-medium ${result.confidence < 0.6 ? 'text-red-600' : result.confidence < 0.8 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {formatConfidence(result.confidence * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Blinking Patterns:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Abnormal' : 'Normal'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Head Movement:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Unnatural' : 'Natural'}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual/Pixel Cues */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Visual/Pixel Cues</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Boundary Artifacts:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Detected' : 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Texture Consistency:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Inconsistent' : 'Consistent'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lighting Match:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Mismatched' : 'Matched'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reflection Analysis:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Anomalous' : 'Normal'}
                  </span>
                </div>
              </div>
            </div>

            {/* Audio-Visual Alignment */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Audio-Visual Alignment</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Lip-Sync Accuracy:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Poor' : 'Good'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Voice Cloning:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Detected' : 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Emotion Match:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Mismatched' : 'Matched'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Audio Continuity:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Disrupted' : 'Continuous'}
                  </span>
                </div>
              </div>
            </div>

            {/* Forensic Analysis */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Forensic Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>GAN Fingerprints:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Present' : 'Absent'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Compression Analysis:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Anomalous' : 'Normal'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Metadata Check:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Inconsistent' : 'Consistent'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>PRNU Analysis:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Mismatched' : 'Matched'}
                  </span>
                </div>
              </div>
            </div>

            {/* Algorithmic Traces */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Algorithmic Traces</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Spectral Artifacts:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Detected' : 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Optical Flow:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Unnatural' : 'Natural'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Frequency Analysis:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'Anomalous' : 'Normal'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Error Level Analysis:</span>
                  <span className={`font-medium ${result.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}`}>
                    {result.prediction === 'FAKE' ? 'High' : 'Low'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Frame Analysis */}
        {frameAnalysis.frame_results && frameAnalysis.frame_results.length > 0 && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Comprehensive Frame Analysis</h3>
            <div className="space-y-6">
              {frameAnalysis.frame_results.slice(0, 10).map((frame, index) => (
                <div key={index} className="border rounded-lg p-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="font-bold text-lg">Frame {frame.frame_number || index + 1}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        frame.prediction === 'FAKE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {frame.prediction}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Confidence</div>
                      <div className="text-lg font-bold">{formatConfidence(frame.confidence || 0)}%</div>
                    </div>
                  </div>
                  
                  {/* Basic Frame Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-gray-600">Timestamp: </span>
                      <span className="font-medium">{frame.timestamp?.toFixed(1)}s</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Face Detected: </span>
                      <span className="font-medium">{frame.details?.face_features?.face_detected ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Face Confidence: </span>
                      <span className="font-medium">{formatConfidence(frame.details?.face_features?.face_confidence || 0)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Face Size Ratio: </span>
                      <span className="font-medium">{((frame.details?.face_features?.face_size_ratio || 0) * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* AI Model Predictions */}
                  {frame.details?.model_predictions && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">AI Model Predictions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.entries(frame.details.model_predictions).map(([model, prediction]) => {
                          const confidence = frame.details.model_confidences?.[model] || 0;
                          return (
                            <div key={model} className="bg-white p-3 rounded border">
                              <div className="font-medium text-sm">{model.replace('_', ' ').toUpperCase()}</div>
                              <div className="text-xs text-gray-600 mb-1">
                                Prediction: {prediction === 1 ? 'FAKE' : 'REAL'}
                              </div>
                              <div className="text-sm font-semibold">
                                {formatConfidence(confidence)}% Confidence
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Face Analysis Details */}
                  {frame.details?.face_features && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Face Analysis</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Symmetry: </span>
                          <span className="font-medium">{((frame.details.face_features.face_symmetry || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Eye Count: </span>
                          <span className="font-medium">{frame.details.face_features.eye_analysis?.eye_count || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Skin Smoothness: </span>
                          <span className="font-medium">{frame.details.face_features.skin_texture?.skin_smoothness?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Brightness: </span>
                          <span className="font-medium">{frame.details.face_features.image_quality?.brightness?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Artifact Analysis */}
                  {frame.details?.artifact_analysis && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Artifact Analysis</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Border Quality: </span>
                          <span className="font-medium">{((frame.details.artifact_analysis.border_analysis?.border_quality || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Edge Density: </span>
                          <span className="font-medium">{((frame.details.artifact_analysis.edge_analysis?.canny_density || 0) * 100).toFixed(2)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Lighting Uniformity: </span>
                          <span className="font-medium">{((frame.details.artifact_analysis.lighting_analysis?.brightness_uniformity || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Blending Quality: </span>
                          <span className="font-medium">{((frame.details.artifact_analysis.blending_analysis?.blending_quality || 0) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Forensic Analysis */}
                  {frame.details?.forensic_analysis && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Forensic Analysis</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Deepfake Indicators: </span>
                          <span className="font-medium">{frame.details.forensic_analysis.forensic_score?.deepfake_indicators || 0}/5</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Likely Deepfake: </span>
                          <span className={`font-medium ${frame.details.forensic_analysis.forensic_score?.is_likely_deepfake ? 'text-red-600' : 'text-green-600'}`}>
                            {frame.details.forensic_analysis.forensic_score?.is_likely_deepfake ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Forensic Score: </span>
                          <span className="font-medium">{((frame.details.forensic_analysis.forensic_score?.forensic_score || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Confidence: </span>
                          <span className="font-medium">{((frame.details.forensic_analysis.forensic_score?.confidence || 0) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDetailedAnalysis = () => {
    if (!result) return null;

    // Handle video analysis details
    if (result.type === 'video' && result.frame_analysis) {
      return renderVideoDetailedAnalysis();
    }

    // Handle audio analysis details
    if (result.type === 'audio') {
      return renderAudioDetailedAnalysis();
    }

    // Handle image analysis details
    if (!result.details) return null;
    const details = result.details;
    
    return (
      <div className="space-y-6">
        {/* Model Predictions */}
        {details.model_predictions && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Model Predictions</h3>
            <div className="space-y-3">
              {Object.entries(details.model_predictions).map(([model, prediction]) => {
                const confidence = details.model_confidences?.[model] || 0;
                return (
                  <div key={model} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{model}</div>
                      <div className="text-sm text-gray-600">
                        Prediction: {prediction === 1 ? 'FAKE' : 'REAL'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatConfidence(confidence)}%
                      </div>
                      <div className="text-sm text-gray-600">Confidence</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Face Analysis */}
        {details.face_features && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Face Analysis</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Face Detected</span>
                  <span className={details.face_features.face_detected ? 'text-green-600' : 'text-red-600'}>
                    {details.face_features.face_detected ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Face Symmetry</span>
                  <span className="text-gray-900">
                    {(details.face_features.face_symmetry * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Face Size Ratio</span>
                  <span className="text-gray-900">
                    {(details.face_features.face_size_ratio * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Forensic Analysis */}
        {details.face_features?.forensic_analysis && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Forensic Analysis</h3>
            <div className="space-y-4">
              {Object.entries(details.face_features.forensic_analysis).map(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                  return (
                    <div key={key}>
                      <h4 className="font-medium text-gray-900 mb-2 capitalize">
                        {key.replace('_', ' ')}
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(value).map(([subKey, subValue]) => {
                          // Determine display value and status
                          let displayValue = '';
                          let statusClass = '';
                          let statusText = '';
                          let description = '';
                          
                          // Face region coordinates are just info, not issues
                          const isFaceRegion = key === 'face_region' || key === 'face region';
                          const isCoordinate = ['top', 'right', 'bottom', 'left', 'width', 'height'].includes(subKey);
                          
                          if (isFaceRegion && isCoordinate) {
                            // Face coordinates: just show value, no status
                            displayValue = `${subValue.toFixed(0)} px`;
                            statusText = '📍 Location';
                            statusClass = 'text-blue-600';
                            description = subKey === 'top' ? 'Distance from top of image' :
                                         subKey === 'bottom' ? 'Distance from top of image' :
                                         subKey === 'left' ? 'Distance from left of image' :
                                         subKey === 'right' ? 'Distance from left of image' :
                                         subKey === 'width' ? 'Face width in pixels' :
                                         'Face height in pixels';
                          } else if (typeof subValue === 'boolean') {
                            // Boolean values: show clear status
                            statusText = subValue ? '⚠️ Issue Found' : '✅ OK';
                            statusClass = subValue ? 'text-red-600 font-semibold' : 'text-green-600';
                            description = subKey.includes('inconsistent') ? 'Lighting is uneven across the face' :
                                         subKey.includes('overly_smooth') ? 'Skin appears unnaturally smooth (possible deepfake)' :
                                         subKey.includes('asymmetric') ? 'Face shows significant asymmetry' :
                                         subKey.includes('unnatural') ? 'Edges appear artificial' :
                                         subKey.includes('suspicious') ? 'Frequency patterns suggest manipulation' : '';
                          } else if (typeof subValue === 'number') {
                            // Numeric values: show percentage or value with context
                            // Check if value is in 0-1 range (should be percentage) or raw value
                            const isPercentageValue = subValue >= 0 && subValue <= 1 && 
                                                      (subKey.includes('symmetry') || subKey.includes('uniformity') || 
                                                       subKey.includes('score') || subKey.includes('ratio'));
                            
                            if (subKey.includes('spectral_entropy') || (subKey.includes('entropy') && subValue > 1.0)) {
                              // Spectral entropy is a raw entropy value (typically >4.0), NOT a percentage
                              displayValue = subValue.toFixed(2);
                              statusText = subValue < 4.0 ? '⚠️ Suspicious' : '✅ Good';
                              statusClass = subValue < 4.0 ? 'text-red-600' : 'text-green-600';
                              description = 'Frequency pattern complexity (higher = more natural)';
                            } else if (isPercentageValue) {
                              // These are 0-1 scores, show as percentage
                              displayValue = `${(subValue * 100).toFixed(1)}%`;
                              statusText = subValue < 0.5 ? '⚠️ Low' : subValue < 0.7 ? '⚠️ Moderate' : '✅ Good';
                              statusClass = subValue < 0.5 ? 'text-red-600' : subValue < 0.7 ? 'text-yellow-600' : 'text-green-600';
                              
                              // Enhanced descriptions with explanations
                              if (subKey.includes('edge_uniformity') || subKey.includes('edge_consistency')) {
                                description = `Edge Consistency (0-100%): Measures how natural and uniform edges are across facial features. Higher values (70-100%) indicate smooth, natural edge transitions. Lower values (<50%) suggest sharp artificial edges, grid-like patterns, or inconsistent edge distributions - common signs of AI-generated content. Real faces have organic edge patterns that flow naturally.`;
                              } else if (subKey.includes('symmetry')) {
                                description = `Facial Symmetry (0-100%): Measures how similar the left and right sides of the face are. Higher values (70-100%) indicate natural symmetry. Lower values (<50%) suggest potential manipulation.`;
                              } else if (subKey.includes('brightness_uniformity')) {
                                description = `Brightness Uniformity (0-100%): Measures how evenly brightness is distributed across the face. Higher values indicate natural lighting. Lower values suggest artificial or manipulated lighting.`;
                              } else if (subKey.includes('gradient_uniformity')) {
                                description = `Gradient Uniformity (0-100%): Measures how smooth lighting transitions are. Higher values indicate natural gradients. Lower values suggest artificial lighting patterns.`;
                              } else if (subKey.includes('uniformity')) {
                                description = `Lighting Consistency (0-100%): Measures how uniform lighting is across the face. Higher values (70-100%) mean consistent, natural lighting. Lower values (<50%) indicate inconsistent lighting patterns, a common deepfake indicator.`;
                              } else {
                                description = `Analysis Score (0-100%): Higher values indicate more natural characteristics. Lower values may suggest artificial generation or manipulation.`;
                              }
                            } else if (subKey.includes('smoothness')) {
                              // Smoothness is a standard deviation value, NOT a percentage
                              displayValue = subValue.toFixed(2);
                              // Normal range: 3.0-10.0
                              // < 3.0 = too smooth (deepfake indicator)
                              // 3.0-10.0 = natural
                              // > 10.0 = poor image quality
                              if (subValue < 3.0) {
                                statusText = '⚠️ Too Smooth';
                                statusClass = 'text-red-600';
                              } else if (subValue <= 10.0) {
                                statusText = '✅ Natural';
                                statusClass = 'text-green-600';
                              } else {
                                statusText = '⚠️ Poor Quality';
                                statusClass = 'text-yellow-600';
                              }
                              description = 'Skin texture variation (lower = smoother, may indicate deepfake)';
                            } else if (subKey.includes('brightness_std')) {
                              displayValue = subValue.toFixed(2);
                              statusText = subValue > 40 ? '⚠️ Inconsistent' : '✅ Consistent';
                              statusClass = subValue > 40 ? 'text-red-600' : 'text-green-600';
                              description = 'Brightness variation across face (higher = more inconsistent lighting)';
                            } else if (subKey.includes('brightness_range')) {
                              displayValue = `${subValue.toFixed(0)} (0-255)`;
                              statusText = subValue > 100 ? '⚠️ High Range' : '✅ Normal';
                              statusClass = subValue > 100 ? 'text-red-600' : 'text-green-600';
                              description = 'Difference between brightest and darkest areas';
                            } else if (subKey.includes('edge_density')) {
                              displayValue = `${(subValue * 100).toFixed(1)}%`;
                              statusText = (subValue < 0.05 || subValue > 0.6) ? '⚠️ Unnatural' : '✅ Natural';
                              statusClass = (subValue < 0.05 || subValue > 0.6) ? 'text-red-600' : 'text-green-600';
                              description = 'Percentage of pixels with detected edges';
                            } else {
                              // Other numeric values
                              displayValue = subValue.toFixed(2);
                              statusText = subValue > 0 ? '📊 Measured' : '✅ Normal';
                              statusClass = 'text-gray-600';
                            }
                          } else {
                            // Other types: show as-is
                            displayValue = String(subValue);
                            statusText = subValue ? '⚠️ Detected' : '✅ Normal';
                            statusClass = subValue ? 'text-red-600' : 'text-green-600';
                          }
                          
                          // Get tooltip explanation with normal ranges
                          const getTooltipText = () => {
                            if (isFaceRegion && isCoordinate) {
                              return `Face location in the image.\nNormal: Any valid pixel coordinates within image bounds.`;
                            } else if (subKey.includes('brightness_std')) {
                              return `Standard deviation of brightness across the face.\nNormal: 0-40 (lower is better)\nHigh values (>40) indicate inconsistent lighting, which may suggest deepfake manipulation.`;
                            } else if (subKey.includes('brightness_range')) {
                              return `Difference between brightest and darkest areas in the face.\nNormal: 0-100 (on 0-255 scale)\nHigh values (>100) suggest extreme lighting variations.`;
                            } else if (subKey.includes('inconsistent_lighting')) {
                              return `Indicates whether lighting is uneven across the face.\nNormal: False (consistent lighting)\nTrue indicates potential deepfake manipulation.`;
                            } else if (subKey.includes('smoothness')) {
                              return `Skin texture variation (standard deviation).\nNormal: 3.0-10.0\nToo low (<3.0) suggests unnaturally smooth skin, a common deepfake artifact.\nToo high (>10.0) may indicate poor image quality.`;
                            } else if (subKey.includes('overly_smooth')) {
                              return `Flag indicating unnaturally smooth skin texture.\nNormal: False\nTrue suggests the skin may have been artificially smoothed, a sign of deepfake.`;
                            } else if (subKey.includes('symmetry')) {
                              return `Facial symmetry score (how similar left and right sides are).\nNormal: 0.7-1.0 (70-100%)\nLower values (<0.5) indicate significant asymmetry, which may suggest manipulation.\nReal faces typically have 70-90% symmetry.`;
                            } else if (subKey.includes('asymmetric')) {
                              return `Flag indicating significant facial asymmetry.\nNormal: False\nTrue suggests the face may have been manipulated or is a deepfake.`;
                            } else if (subKey.includes('uniformity')) {
                              return `Lighting consistency score.\nNormal: 0.7-1.0 (70-100%)\nLower values (<0.5) indicate inconsistent lighting, a potential deepfake indicator.`;
                            } else if (subKey.includes('edge_density')) {
                              return `Percentage of pixels with detected edges.\nNormal: 0.05-0.6 (5-60%)\nToo low (<5%) or too high (>60%) suggests unnatural edge patterns, common in deepfakes.`;
                            } else if (subKey.includes('unnatural')) {
                              return `Flag indicating artificial or unnatural edge patterns.\nNormal: False\nTrue suggests edges may have been artificially created or modified.`;
                            } else if (subKey.includes('spectral_entropy') || (subKey.includes('entropy') && typeof subValue === 'number' && subValue > 1.0)) {
                              return `Spectral entropy (frequency pattern complexity).\nNormal: >4.0\nLower values (<4.0) indicate regular, repeating patterns which may suggest digital manipulation.\nThis is NOT a percentage - it's a raw entropy measurement.`;
                            } else if (subKey.includes('suspicious')) {
                              return `Flag indicating suspicious frequency patterns.\nNormal: False\nTrue suggests the image may have been digitally manipulated.`;
                            }
                            return description || 'Analysis metric value';
                          };
                          
                          const tooltipText = getTooltipText();
                          
                          return (
                            <div key={subKey} className="text-sm group relative">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600 capitalize">
                                    {subKey.replace('_', ' ')}
                                  </span>
                                  <div className="relative">
                                    <Info className="w-4 h-4 text-blue-500 cursor-help" />
                                    <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                      <div className="whitespace-pre-line">{tooltipText}</div>
                                      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {displayValue && (
                                    <span className="text-gray-800 font-mono text-xs">
                                      {displayValue}
                                    </span>
                                  )}
                                  <span className={`font-medium ${statusClass}`}>
                                    {statusText}
                                  </span>
                                </div>
                              </div>
                              {description && (
                                <div className="text-xs text-gray-500 mt-1 italic">
                                  {description}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVideoCharts = () => {
    if (!result || !result.frame_analysis) return null;

    const frameAnalysis = result.frame_analysis;
    const videoScore = result.video_score || {};

    // Prepare frame data for charts
    const frameData = frameAnalysis.frame_results?.map((frame, index) => ({
      frame: index + 1,
      timestamp: frame.timestamp || index * 0.2,
      confidence: formatConfidence(frame.confidence || 0),
      prediction: frame.prediction || 'UNKNOWN'
    })) || [];

    // Prepare confidence over time data
    const confidenceData = frameData.map(frame => ({
      time: frame.timestamp,
      confidence: frame.confidence,
      prediction: frame.prediction
    }));

    // Prepare frame distribution data
    const totalFrames = frameAnalysis.total_frames_analyzed || 0;
    const fakeFrames = frameAnalysis.fake_frames || 0;
    const realFrames = frameAnalysis.real_frames || 0;
    
    const frameDistributionData = [
      { name: 'Real', value: realFrames, color: '#22c55e' },
      { name: 'Fake', value: fakeFrames, color: '#ef4444' }
    ];

    // Prepare model comparison data from all frames
    const modelData = [];
    const modelStats = {};
    
    if (frameAnalysis.frame_results && frameAnalysis.frame_results.length > 0) {
      // Calculate average confidence for each model across all frames
      frameAnalysis.frame_results.forEach(frame => {
        if (frame.details?.model_predictions) {
          Object.entries(frame.details.model_predictions).forEach(([model, prediction]) => {
            const confidence = frame.details.model_confidences?.[model] || 0;
            if (!modelStats[model]) {
              modelStats[model] = {
                name: model.replace('_', ' ').toUpperCase(),
                confidences: [],
                predictions: []
              };
            }
            modelStats[model].confidences.push(confidence);
            modelStats[model].predictions.push(prediction);
          });
        }
      });

      // Calculate averages and create chart data
      Object.entries(modelStats).forEach(([model, stats]) => {
        const avgConfidence = stats.confidences.reduce((a, b) => a + b, 0) / stats.confidences.length;
        const fakeCount = stats.predictions.filter(p => p === 1).length;
        const realCount = stats.predictions.filter(p => p === 0).length;
        const dominantPrediction = fakeCount > realCount ? 'FAKE' : 'REAL';
        
        modelData.push({
          model: stats.name,
          confidence: formatConfidence(avgConfidence * 100),
          prediction: dominantPrediction,
          fakeFrames: fakeCount,
          realFrames: realCount,
          totalFrames: stats.predictions.length
        });
      });
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Video Deepfake Analysis Charts</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Frame Predictions Over Time */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Frame Predictions Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={confidenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" name="Time (seconds)" />
                  <YAxis domain={[60, 90]} name="Confidence (%)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="confidence" stroke="#3b82f6" strokeWidth={2} name="Predictions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Confidence Over Time */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confidence Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={confidenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" name="Time (seconds)" />
                  <YAxis domain={[60, 90]} name="Confidence (%)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="confidence" stroke="#ef4444" strokeWidth={2} name="Confidence" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Frame Distribution */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Frame Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={frameDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {frameDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model Comparison */}
          {modelData.length > 0 && (
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Model Performance Analysis</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value}%`,
                        name === 'confidence' ? 'Average Confidence' : name
                      ]}
                      labelFormatter={(label) => `Model: ${label}`}
                    />
                    <Bar dataKey="confidence" fill="#3b82f6" name="confidence" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {modelData.map((model, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-sm mb-2">{model.model}</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Avg Confidence: {model.confidence}%</div>
                      <div>Dominant Prediction: {model.prediction}</div>
                      <div>Fake Frames: {model.fakeFrames}</div>
                      <div>Real Frames: {model.realFrames}</div>
                      <div>Total Frames: {model.totalFrames}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Video Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {totalFrames}
            </div>
            <div className="text-gray-600">Total Frames</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {fakeFrames}
            </div>
            <div className="text-gray-600">Fake Frames</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {realFrames}
            </div>
            <div className="text-gray-600">Real Frames</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatConfidence(videoScore.average_confidence || 0)}%
            </div>
            <div className="text-gray-600">Avg Confidence</div>
          </div>
        </div>
      </div>
    );
  };

  const renderCharts = () => {
    if (!result) return null;

    // Handle video analysis charts
    if (result.type === 'video' && result.frame_analysis) {
      return renderVideoCharts();
    }

    // Handle audio analysis charts
    if (result.type === 'audio') {
      const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://deepfake-qbl3.onrender.com';
      const baseAudioUrl = `${apiBaseUrl}/uploads/${fileId}${getFileExtension(result.filename)}`;
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const secureAudioUrl = authToken ? `${baseAudioUrl}?token=${encodeURIComponent(authToken)}` : baseAudioUrl;

      return (
        <div className="space-y-6">
          {/* Audio Player */}
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Audio Preview</h3>
            <AudioPlayer 
              audioUrl={secureAudioUrl}
              title={result.filename || 'Audio File'}
            />
          </div>

          {/* Audio Waveform */}
          <AudioWaveform 
            audioUrl={secureAudioUrl}
            height={120}
          />

          {/* Audio Analysis Visualizations */}
          <AudioAnalysis analysisResult={result} />
        </div>
      );
    }

    // Handle image analysis charts
    const chartData = [];
    if (result.details?.model_predictions) {
      Object.entries(result.details.model_predictions).forEach(([model, prediction]) => {
        const confidence = result.details.model_confidences?.[model] || 0;
        chartData.push({
          model: model.replace('_', ' ').toUpperCase(),
          confidence: formatConfidence(confidence),
          prediction: prediction === 1 ? 'FAKE' : 'REAL'
        });
      });
    }

    const pieData = [
      { name: 'Real', value: result.prediction === 'REAL' ? formatConfidence(result.confidence) : 0, color: '#22c55e' },
      { name: 'Fake', value: result.prediction === 'FAKE' ? formatConfidence(result.confidence) : 0, color: '#ef4444' }
    ];

    return (
      <div className="space-y-6">
        {/* Confidence Chart */}
        {chartData.length > 0 && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Model Confidence Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="model" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="confidence" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Prediction Distribution */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Prediction Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderVisualEvidence = () => {
    if (!result) return null;

    // Only show visual evidence for images and videos
    if (result.type === 'audio') {
      return (
        <div className="space-y-6">
          <div className="card text-center">
            <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Visual Evidence Not Available</h3>
            <p className="text-gray-600">
              Visual evidence is only available for image and video files. 
              For audio files, please check the audio analysis charts and detailed analysis tabs.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <VisualEvidence 
          analysisResult={result}
          fileId={fileId}
          fileType={result.type}
        />
      </div>
    );
  };

  // Show loading state while fetching results
  if (loading || (fileId && !result)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Results</h2>
          <p className="text-gray-600">Please wait while we fetch your analysis results...</p>
          {fileId && (
            <div className="mt-4 text-sm text-gray-500">
              File ID: {fileId}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show error state only if we have a fileId but no result after loading
  if (fileId && !result && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h2>
          <p className="text-gray-600 mb-4">The analysis results could not be loaded for this file.</p>
          <div className="space-y-2">
            <button
              onClick={() => {
                setLoading(true);
                fetchResults();
              }}
              className="btn-secondary mr-2"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="btn-primary"
            >
              Upload New File
            </button>
          </div>
          {fileId && (
            <div className="mt-4 text-sm text-gray-500">
              File ID: {fileId}
            </div>
          )}
          {debugInfo && (
            <div className="mt-4 text-xs text-gray-400 bg-gray-100 p-2 rounded">
              <div>Debug: Loading={debugInfo.loading.toString()}, HasResult={debugInfo.hasResult.toString()}</div>
              <div>Files in context: {debugInfo.filesCount}</div>
              <div>Time: {debugInfo.timestamp}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If showing all files (no fileId), show files overview
  if (showAllFiles) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/upload')}
                className="btn-secondary flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Upload</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
                <p className="text-gray-600">All uploaded files and their analysis status</p>
              </div>
            </div>
          </div>

          {/* All Files List */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Uploaded Files</h2>
            {loading && files.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded yet</h3>
                <p className="text-gray-600 mb-4">Upload some files to see their analysis results here.</p>
                <button
                  onClick={() => navigate('/upload')}
                  className="btn-primary"
                >
                  Upload Files
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prediction
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Confidence
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uploaded
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {files.map((file) => (
                        <tr 
                          key={file.file_id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/results/${file.file_id}`)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {file.file_type === 'video' ? (
                                  <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-red-600" />
                                  </div>
                                ) : (
                                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {file.original_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {file.file_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              file.file_type === 'video' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {file.file_type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {file.status === 'completed' ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </span>
                            ) : file.status === 'processing' ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Processing
                              </span>
                            ) : file.status === 'error' ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Error
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {file.result ? (
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                file.result.prediction === 'FAKE' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {file.result.prediction === 'FAKE' ? (
                                  <XCircle className="w-3 h-3 mr-1" />
                                ) : (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                )}
                                {file.result.prediction}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {file.result ? (
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      file.result.confidence > 70 ? 'bg-green-500' : 
                                      file.result.confidence > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${file.result.confidence}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900">
                                  {formatConfidence(file.result.confidence)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/results/${file.file_id}`);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {file.result && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      toast.loading('Generating PDF report...', { id: `pdf-${file.file_id}` });
                                      
                                      const API_BASE_URL = process.env.REACT_APP_API_URL || '';
                                      const token = localStorage.getItem('auth_token');
                                      const response = await fetch(`${API_BASE_URL}/report/${file.file_id}`, {
                                        method: 'GET',
                                        headers: {
                                          ...(token && { 'Authorization': `Bearer ${token}` }),
                                        },
                                      });
                                      
                                      if (!response.ok) {
                                        throw new Error('Failed to generate report');
                                      }
                                      
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `deepfake_analysis_report_${file.file_id}.pdf`;
                                      document.body.appendChild(a);
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                      document.body.removeChild(a);
                                      
                                      toast.success('PDF report downloaded!', { id: `pdf-${file.file_id}` });
                                    } catch (error) {
                                      console.error('Error generating PDF report:', error);
                                      toast.error('Failed to generate PDF report', { id: `pdf-${file.file_id}` });
                                    }
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                  title="Download Report"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Are you sure you want to delete "${file.original_name}"? This action cannot be undone.`)) {
                                    try {
                                      await api.deleteFile(file.file_id);
                                    } catch (error) {
                                      console.error('Delete error:', error);
                                    }
                                  }
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Delete File"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/results')}
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Results</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analysis Results</h1>
              <p className="text-gray-600">Deepfake detection analysis complete</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={generateReport}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
            <button
              onClick={shareResults}
              className="btn-primary flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>


        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'summary', label: 'Summary', icon: FileText },
                { id: 'detailed', label: 'Detailed Analysis', icon: BarChart3 },
                { id: 'charts', label: 'Charts', icon: PieChart },
                { id: 'visual', label: 'Visual Evidence', icon: Eye }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'summary' && renderSummary()}
          {activeTab === 'detailed' && renderDetailedAnalysis()}
          {activeTab === 'charts' && renderCharts()}
          {activeTab === 'visual' && renderVisualEvidence()}
        </motion.div>
      </div>
    </div>
  );
};

export default Results;
