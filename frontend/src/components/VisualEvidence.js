import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Target,
  Layers,
  Activity,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const getDefaultOverlay = (type) => {
  if (type === 'image') return 'face-detection';
  if (type === 'video') return 'frame-analysis';
  if (type === 'audio') return 'audio-analysis';
  return '';
};

const getOverlayOptionsByType = (type) => {
  if (type === 'video') {
    return [
      { id: 'frame-analysis', label: 'Frame Analysis', icon: Target },
      { id: 'frame-by-frame', label: 'Frame by Frame', icon: Eye },
      { id: 'suspicious-frames', label: 'Suspicious Frames', icon: AlertTriangle },
      { id: 'temporal', label: 'Temporal Analysis', icon: Activity },
      { id: 'artifacts', label: 'Artifacts', icon: AlertTriangle },
      { id: 'heatmaps', label: 'Heatmaps', icon: Layers }
    ];
  }
  
  if (type === 'image') {
    return [
      { id: 'face-detection', label: 'Face Detection', icon: Target },
      { id: 'artifacts', label: 'Artifacts', icon: AlertTriangle },
      { id: 'forensic', label: 'Forensic Analysis', icon: Activity },
      { id: 'heatmaps', label: 'Heatmaps', icon: Layers }
    ];
  }
  
  return [
    { id: 'audio-analysis', label: 'Audio Analysis', icon: Activity },
    { id: 'spectral', label: 'Spectral Analysis', icon: Layers },
    { id: 'waveform', label: 'Waveform', icon: Target },
    { id: 'indicators', label: 'Deepfake Indicators', icon: AlertTriangle }
  ];
};

const VisualEvidence = ({ 
  analysisResult, 
  fileId, 
  fileType, 
  className = "" 
}) => {
  // Determine actual file type from analysis result
  const actualFileType = analysisResult?.type || fileType;
  
  const [selectedOverlay, setSelectedOverlay] = useState(getDefaultOverlay(actualFileType));
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [showFrameAnalysis, setShowFrameAnalysis] = useState(false);
  const [filterSuspicious, setFilterSuspicious] = useState(true);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [extractedFrames, setExtractedFrames] = useState([]);
  const [isExtractingFrames, setIsExtractingFrames] = useState(false);
  const [selectedHeatmapIndex, setSelectedHeatmapIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const frameCanvasRef = useRef(null);
  
  // API paths for asset loading
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://deepfake-qbl3.onrender.com';
  const baseFileUrl = fileId ? `${apiBaseUrl}/uploads/${fileId}` : null;
  const secureFileUrl = baseFileUrl;
  const overlayOptions = getOverlayOptionsByType(actualFileType);
  
  // Get frame analysis data
  const frameAnalysis = analysisResult?.visual_evidence?.frame_analysis || analysisResult?.frame_analysis || {};
  const frameResults = frameAnalysis.frame_results || [];
  const suspiciousFrames = frameResults.filter(frame => 
    frame.prediction === 'FAKE' || frame.confidence < 0.5
  );
  const filteredFrames = filterSuspicious ? suspiciousFrames : frameResults;

  // Extract frames from video - defined before early return to satisfy React Hooks rules
  const extractFrames = useCallback(async () => {
    if (!videoRef.current || actualFileType !== 'video') {
      console.log('extractFrames: No video ref or not video type');
      return;
    }
    
    console.log('extractFrames: Starting extraction, filteredFrames.length:', filteredFrames.length);
    setIsExtractingFrames(true);
    const frames = [];
    const video = videoRef.current;
    const canvas = frameCanvasRef.current;
    
    if (!canvas) {
      console.log('extractFrames: No canvas ref');
      setIsExtractingFrames(false);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    // Extract frames based on filteredFrames (suspicious frames when filter is on)
    const framesToExtract = filteredFrames.slice(0, 20); // Limit to 20 frames for performance
    console.log('extractFrames: Extracting', framesToExtract.length, 'frames');
    
    try {
      for (let i = 0; i < framesToExtract.length; i++) {
        const frame = framesToExtract[i];
        if (frame && frame.timestamp !== undefined) {
          console.log(`extractFrames: Processing frame ${i}, timestamp: ${frame.timestamp}`);
          video.currentTime = frame.timestamp;
          
          await new Promise(resolve => {
            video.addEventListener('seeked', resolve, { once: true });
          });
          
          // Draw frame to canvas
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert to data URL
          const frameDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          frames.push({
            ...frame,
            imageData: frameDataUrl,
            index: i
          });
        }
      }
      
      console.log('extractFrames: Extracted', frames.length, 'frames');
      setExtractedFrames(frames);
    } catch (error) {
      console.error('Error extracting frames:', error);
    } finally {
      setIsExtractingFrames(false);
    }
  }, [actualFileType, filteredFrames]);

  // Effect to extract frames when video loads or filter changes
  useEffect(() => {
    if (actualFileType === 'video' && filteredFrames.length > 0) {
      const timer = setTimeout(() => {
        extractFrames();
      }, 1000); // Wait for video to load
      
      return () => clearTimeout(timer);
    }
  }, [actualFileType, filteredFrames.length, extractFrames]);

  // Effect to update current frame when index changes
  useEffect(() => {
    if (extractedFrames.length > 0 && currentFrameIndex < extractedFrames.length) {
      setSelectedFrame(extractedFrames[currentFrameIndex]);
    }
  }, [currentFrameIndex, extractedFrames]);

  // Ensure overlay selection stays valid across file type changes
  useEffect(() => {
    const validOverlayIds = getOverlayOptionsByType(actualFileType).map(option => option.id);
    if (!selectedOverlay || !validOverlayIds.includes(selectedOverlay)) {
      const defaultOverlay = getDefaultOverlay(actualFileType);
      const fallbackOverlay = defaultOverlay || validOverlayIds[0] || '';
      if (fallbackOverlay && fallbackOverlay !== selectedOverlay) {
        setSelectedOverlay(fallbackOverlay);
      }
    }
  }, [actualFileType, selectedOverlay]);

  if (!analysisResult || !analysisResult.details) {
    return (
      <div className={`bg-gray-100 rounded-lg p-6 text-center ${className}`}>
        <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No visual evidence data available</p>
      </div>
    );
  }

  const details = analysisResult.details;
  const faceFeatures = details.face_features || {};
  const artifactAnalysis = faceFeatures.artifact_analysis || {};
  const forensicAnalysis = faceFeatures.forensic_analysis || {};

  // Use visual evidence data from backend if available, otherwise generate from analysis results
  const generateVisualEvidence = () => {
    console.log('generateVisualEvidence - analysisResult:', analysisResult);
    console.log('generateVisualEvidence - visual_evidence:', analysisResult.visual_evidence);
    
    // Check if backend provided visual evidence data
    if (analysisResult.visual_evidence) {
      const backendEvidence = analysisResult.visual_evidence;
      console.log('Using backend visual evidence:', backendEvidence);
      
      if (actualFileType === 'video') {
        return {
          frameAnalysis: backendEvidence.frame_analysis || {},
          temporalAnalysis: backendEvidence.temporal_analysis || {},
          spatialAnalysis: backendEvidence.spatial_analysis || {},
          heatmaps: backendEvidence.heatmaps || [],
          regions: []
        };
      } else {
        return {
          faceDetection: {
            detected: backendEvidence.face_detection?.detected || false,
            confidence: backendEvidence.face_detection?.confidence || 0,
            boundingBox: backendEvidence.face_detection?.bounding_box || null
          },
          artifacts: {
            borderRegions: backendEvidence.artifacts?.border_regions || [],
            edgeRegions: backendEvidence.artifacts?.edge_regions || [],
            lightingRegions: backendEvidence.artifacts?.lighting_regions || [],
            textureRegions: backendEvidence.artifacts?.texture_regions || []
          },
          forensic: {
            anomalyScores: backendEvidence.forensic_analysis?.anomaly_scores || {},
            problematicRegions: backendEvidence.forensic_analysis?.problematic_regions || []
          },
          heatmaps: backendEvidence.heatmaps || [],
          regions: generateRegionsFromBackend(backendEvidence),
          image_data: backendEvidence.image_data || null  // Include base64 image data
        };
      }
    }
    
    console.log('No backend visual evidence, generating fallback data');

    // Fallback to generating from analysis results
    if (actualFileType === 'video') {
      const derivedTemporal = calculateTemporalAnalysisFromFrames();
      const derivedHeatmaps = generateVideoHeatmapsFromFrames();
      const derivedRegions = deriveVideoArtifactRegions();
      const firstDetectedFace = frameResults.find(
        (frame) => frame.face_detection?.detected && frame.face_detection.bounding_box
      );

      return {
        frameAnalysis: {
          total_frames: frameResults.length,
          fake_frames: suspiciousFrames.length,
          real_frames: Math.max(frameResults.length - suspiciousFrames.length, 0),
          frame_results: frameResults
        },
        temporalAnalysis: derivedTemporal,
        spatialAnalysis: {
          artifact_regions: derivedRegions,
          problematic_frames: suspiciousFrames.slice(0, 20)
        },
        heatmaps: derivedHeatmaps,
        regions: derivedRegions,
        artifacts: {
          borderRegions: derivedRegions,
          edgeRegions: [],
          lightingRegions: [],
          textureRegions: []
        },
        faceDetection: firstDetectedFace
          ? {
              detected: true,
              confidence: firstDetectedFace.face_detection.confidence || 0,
              boundingBox: firstDetectedFace.face_detection.bounding_box
            }
          : { detected: false, confidence: 0, boundingBox: null }
      };
    }

    const evidence = {
      faceDetection: {
        detected: faceFeatures.face_detected || true, // Default to true for testing
        confidence: faceFeatures.face_confidence || 0.85, // Default confidence for testing
        region: faceFeatures.face_region || null,
        boundingBox: faceFeatures.face_region
          ? {
              x: faceFeatures.face_region.left,
              y: faceFeatures.face_region.top,
              width: faceFeatures.face_region.width,
              height: faceFeatures.face_region.height
            }
          : { x: 100, y: 100, width: 200, height: 250 } // Default bounding box for testing
      },
      artifacts: {
        borderAnalysis: artifactAnalysis.border_analysis || {},
        edgeAnalysis: artifactAnalysis.edge_analysis || {},
        lightingAnalysis: artifactAnalysis.lighting_analysis || {},
        textureAnalysis: artifactAnalysis.texture_analysis || {},
        blendingAnalysis: artifactAnalysis.blending_analysis || {}
      },
      forensic: {
        lightingAnalysis: forensicAnalysis.lighting_analysis || {},
        skinAnalysis: forensicAnalysis.skin_analysis || {},
        symmetryAnalysis: forensicAnalysis.symmetry_analysis || {},
        edgeAnalysis: forensicAnalysis.edge_analysis || {},
        frequencyAnalysis: forensicAnalysis.frequency_analysis || {}
      },
      heatmaps: generateHeatmaps(),
      regions: generateRegions()
    };

    return evidence;
  };

  const generateHeatmaps = () => {
    const heatmaps = [];
    
    // Generate heatmap for border quality
    if (artifactAnalysis.border_analysis?.border_quality !== undefined) {
      heatmaps.push({
        type: 'border-quality',
        intensity: artifactAnalysis.border_analysis.border_quality,
        color: artifactAnalysis.border_analysis.border_quality > 0.7 ? '#22c55e' : 
               artifactAnalysis.border_analysis.border_quality > 0.4 ? '#f59e0b' : '#ef4444',
        description: 'Border Quality Analysis'
      });
    }

    // Generate heatmap for edge consistency
    if (artifactAnalysis.edge_analysis?.edge_uniformity !== undefined) {
      heatmaps.push({
        type: 'edge-uniformity',
        intensity: artifactAnalysis.edge_analysis.edge_uniformity,
        color: artifactAnalysis.edge_analysis.edge_uniformity > 0.7 ? '#22c55e' : 
               artifactAnalysis.edge_analysis.edge_uniformity > 0.4 ? '#f59e0b' : '#ef4444',
        description: 'Edge Uniformity Analysis'
      });
    }

    // Generate heatmap for lighting consistency
    if (forensicAnalysis.lighting_analysis?.brightness_uniformity !== undefined) {
      heatmaps.push({
        type: 'lighting-uniformity',
        intensity: forensicAnalysis.lighting_analysis.brightness_uniformity,
        color: forensicAnalysis.lighting_analysis.brightness_uniformity > 0.7 ? '#22c55e' : 
               forensicAnalysis.lighting_analysis.brightness_uniformity > 0.4 ? '#f59e0b' : '#ef4444',
        description: 'Lighting Uniformity Analysis'
      });
    }

    return heatmaps;
  };

  const calculateTemporalAnalysisFromFrames = () => {
    if (!frameResults.length) {
      return { consistency_score: 0, motion_analysis: {} };
    }

    const confidences = frameResults.map((frame) => frame.confidence || 0);
    const averageConfidence = confidences.reduce((sum, value) => sum + value, 0) / confidences.length;
    const variance =
      confidences.reduce((sum, value) => sum + Math.pow(value - averageConfidence, 2), 0) / confidences.length;
    const suddenChanges = frameResults.reduce((count, frame, index) => {
      if (index === 0) return count;
      const prev = frameResults[index - 1];
      const diff = Math.abs((frame.confidence || 0) - (prev.confidence || 0));
      return diff > 0.2 ? count + 1 : count;
    }, 0);
    const predictionSwaps = frameResults.reduce((count, frame, index) => {
      if (index === 0) return 0;
      return frame.prediction !== frameResults[index - 1].prediction ? count + 1 : count;
    }, 0);

    const variancePenalty = Math.min(1, variance * 4);
    const changePenalty = suddenChanges / Math.max(1, frameResults.length);
    const swapPenalty = predictionSwaps / Math.max(1, frameResults.length);
    const consistencyScore = Math.max(0, 1 - (variancePenalty + changePenalty + swapPenalty));

    return {
      consistency_score: Number(consistencyScore.toFixed(3)),
      motion_analysis: {
        average_confidence: Number(averageConfidence.toFixed(3)),
        confidence_variance: Number(variance.toFixed(3)),
        sudden_changes: suddenChanges,
        prediction_swaps: predictionSwaps,
        fake_ratio: frameResults.length ? Number((suspiciousFrames.length / frameResults.length).toFixed(3)) : 0
      }
    };
  };

  const generateVideoHeatmapsFromFrames = () => {
    if (!frameResults.length) return [];
    const temporalMetrics = calculateTemporalAnalysisFromFrames();
    const averageConfidence = temporalMetrics.motion_analysis.average_confidence || 0;
    const fakeDensity = frameResults.length ? suspiciousFrames.length / frameResults.length : 0;

    return [
      {
        type: 'frame-confidence',
        intensity: averageConfidence,
        color: averageConfidence > 0.7 ? '#22c55e' : averageConfidence > 0.4 ? '#f59e0b' : '#ef4444',
        description: 'Average frame confidence across the video'
      },
      {
        type: 'fake-density',
        intensity: fakeDensity,
        color: fakeDensity < 0.2 ? '#22c55e' : fakeDensity < 0.5 ? '#f59e0b' : '#ef4444',
        description: 'Density of suspicious frames in the timeline'
      },
      {
        type: 'consistency-trend',
        intensity: temporalMetrics.consistency_score || 0,
        color: temporalMetrics.consistency_score > 0.7 ? '#22c55e' : temporalMetrics.consistency_score > 0.4 ? '#f59e0b' : '#ef4444',
        description: 'Temporal consistency derived from frame-to-frame variance'
      }
    ];
  };

  const deriveVideoArtifactRegions = () => {
    if (!frameResults.length) return [];
    const regions = [];

    suspiciousFrames.slice(0, 10).forEach((frame) => {
      const bbox = frame.face_detection?.bounding_box;
      if (bbox) {
        regions.push({
          type: 'border-artifacts',
          coordinates: {
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height
          },
          description: `Frame #${frame.frame_number} flagged as ${frame.prediction}`,
          score: 1 - (frame.confidence || 0),
          color: '#ef4444'
        });
      }
    });

    return regions;
  };

  const generateRegionsFromBackend = (backendEvidence) => {
    const regions = [];
    
    // Add face detection region
    if (backendEvidence.face_detection?.bounding_box) {
      regions.push({
        type: 'face-region',
        coordinates: backendEvidence.face_detection.bounding_box,
        color: '#3b82f6',
        description: 'Detected Face Region',
        confidence: backendEvidence.face_detection.confidence || 0
      });
    }

    // Add artifact regions
    backendEvidence.artifacts?.border_regions?.forEach(region => {
      if (region.coordinates && region.coordinates.x !== undefined) {
      regions.push({
        type: 'border-artifacts',
        coordinates: region.coordinates,
        color: '#ef4444',
        description: region.description,
        score: region.score,
        severity: region.score > 0.7 ? 'low' : region.score > 0.4 ? 'medium' : 'high'
      });
      }
    });

    backendEvidence.artifacts?.edge_regions?.forEach(region => {
      if (region.coordinates && region.coordinates.x !== undefined) {
      regions.push({
        type: 'edge-artifacts',
        coordinates: region.coordinates,
        color: '#f59e0b',
        description: region.description,
        score: region.score,
        severity: region.score > 0.7 ? 'low' : region.score > 0.4 ? 'medium' : 'high'
      });
      }
    });

    return regions;
  };

  const generateRegions = () => {
    const regions = [];
    
    if (faceFeatures.face_region) {
      regions.push({
        type: 'face-region',
        coordinates: {
          x: faceFeatures.face_region.left,
          y: faceFeatures.face_region.top,
          width: faceFeatures.face_region.width,
          height: faceFeatures.face_region.height
        },
        color: '#3b82f6',
        description: 'Detected Face Region',
        confidence: faceFeatures.face_confidence || 0
      });
    }

    // Add artifact regions based on analysis
    if (artifactAnalysis.border_analysis?.border_region && artifactAnalysis.border_analysis.border_region.x !== undefined) {
      regions.push({
        type: 'border-artifacts',
        coordinates: artifactAnalysis.border_analysis.border_region,
        color: '#ef4444',
        description: 'Border Artifacts Detected',
        severity: 'high'
      });
    }

    if (artifactAnalysis.edge_analysis?.problematic_regions && artifactAnalysis.edge_analysis.problematic_regions.x !== undefined) {
      regions.push({
        type: 'edge-artifacts',
        coordinates: artifactAnalysis.edge_analysis.problematic_regions,
        color: '#f59e0b',
        description: 'Edge Inconsistencies',
        severity: 'medium'
      });
    }

    return regions;
  };

  const visualEvidence = generateVisualEvidence();

  // Ensure visualEvidence has proper structure with defaults
  const safeVisualEvidence = {
    faceDetection: visualEvidence.faceDetection || { detected: false, confidence: 0, boundingBox: null },
    artifacts: visualEvidence.artifacts || { borderRegions: [], edgeRegions: [], lightingRegions: [], textureRegions: [] },
    forensic: visualEvidence.forensic || { anomalyScores: {}, problematicRegions: [] },
    frameAnalysis: visualEvidence.frameAnalysis || { total_frames: 0, fake_frames: 0, real_frames: 0, frame_results: [] },
    temporalAnalysis: visualEvidence.temporalAnalysis || { consistency_score: 0, motion_analysis: {} },
    spatialAnalysis: visualEvidence.spatialAnalysis || { face_regions: [], artifact_regions: [], problematic_frames: [] },
    heatmaps: visualEvidence.heatmaps || [],
    regions: visualEvidence.regions || []
  };
  
  // Calculate display heatmap for image replacement
  const gradcamHeatmaps = safeVisualEvidence.heatmaps?.filter(h => h.type === 'gradcam' && h.image_data) || [];
  const displayHeatmap = gradcamHeatmaps.length > 0 
    ? gradcamHeatmaps[selectedHeatmapIndex >= 0 && selectedHeatmapIndex < gradcamHeatmaps.length 
        ? selectedHeatmapIndex 
        : 0]
    : null;
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFrameNavigation = (direction) => {
    if (direction === 'prev' && currentFrameIndex > 0) {
      setCurrentFrameIndex(currentFrameIndex - 1);
    } else if (direction === 'next' && currentFrameIndex < extractedFrames.length - 1) {
      setCurrentFrameIndex(currentFrameIndex + 1);
    }
  };

  const handleFrameSelect = (frameIndex) => {
    setCurrentFrameIndex(frameIndex);
    if (extractedFrames[frameIndex]) {
      setSelectedFrame(extractedFrames[frameIndex]);
    }
  };

  const getSuspiciousReasons = (frame) => {
    const reasons = [];
    
    if (frame.prediction === 'FAKE') {
      reasons.push('Predicted as fake');
    }
    
    if (frame.confidence < 0.5) {
      reasons.push(`Low confidence (${formatPercentage(frame.confidence)}%)`);
    }
    
    if (frame.artifacts) {
      if (frame.artifacts.border_quality < 0.7) {
        reasons.push('Poor border quality');
      }
      if (frame.artifacts.edge_uniformity < 0.7) {
        reasons.push('Inconsistent edges');
      }
      if (frame.artifacts.lighting_consistency < 0.7) {
        reasons.push('Inconsistent lighting');
      }
    }
    
    if (frame.forensic_analysis) {
      Object.entries(frame.forensic_analysis).forEach(([key, value]) => {
        if (typeof value === 'number' && value < 0.7) {
          reasons.push(`${key.replace('_', ' ')} anomaly`);
        }
      });
    }
    
    return reasons.length > 0 ? reasons : ['No specific issues detected'];
  };

  const normalizePercentageValue = (value) => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      return 0;
    }
    let numeric = typeof value === 'string' ? parseFloat(value) : value;
    if (!Number.isFinite(numeric)) {
      return 0;
    }
    if (Math.abs(numeric) <= 1) {
      numeric = numeric * 100;
    }
    return Math.max(0, Math.min(100, numeric));
  };

  const formatPercentage = (value, decimals = 1) => normalizePercentageValue(value).toFixed(decimals);

  const formatConfidence = (confidence, decimals = 0) =>
    Number(normalizePercentageValue(confidence).toFixed(decimals));

  const renderOverlay = () => {
    console.log('renderOverlay - selectedOverlay:', selectedOverlay);
    console.log('renderOverlay - safeVisualEvidence:', safeVisualEvidence);
    
    if (!selectedOverlay) {
      console.log('No overlay selected');
      return null;
    }
    
    switch (selectedOverlay) {
      case 'face-detection':
        return renderFaceDetectionOverlay();
      case 'frame-analysis':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {renderFrameAnalysisOverlay()}
          </div>
        );
      case 'frame-by-frame':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {renderFrameByFrameOverlay()}
          </div>
        );
      case 'suspicious-frames':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {renderSuspiciousFramesOverlay()}
          </div>
        );
      case 'temporal':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {renderTemporalAnalysisOverlay()}
          </div>
        );
      case 'artifacts':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {renderArtifactsOverlay()}
          </div>
        );
      case 'forensic':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {renderForensicOverlay()}
          </div>
        );
      case 'heatmaps':
        return (
          <div className="absolute inset-0 pointer-events-none">
            {renderHeatmapsOverlay()}
          </div>
        );
      case 'audio-analysis':
        return renderAudioAnalysisOverlay();
      case 'spectral':
        return renderSpectralAnalysisOverlay();
      case 'waveform':
        return renderWaveformOverlay();
      case 'indicators':
        return renderIndicatorsOverlay();
      default:
        return null;
    }
  };

  const renderFaceDetectionOverlay = () => {
    console.log('renderFaceDetectionOverlay - safeVisualEvidence.faceDetection:', safeVisualEvidence.faceDetection);
    console.log('renderFaceDetectionOverlay - imageLoaded:', imageLoaded);
    console.log('renderFaceDetectionOverlay - imageRef.current:', imageRef.current);
    
    if (!safeVisualEvidence.faceDetection || !safeVisualEvidence.faceDetection.detected) {
      console.log('No face detected, showing no face message');
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          <div className="text-center">
            <XCircle className="w-8 h-8 mx-auto mb-2" />
            <p>No face detected</p>
          </div>
        </div>
      );
    }

    const bbox = safeVisualEvidence.faceDetection.boundingBox;
    console.log('Face detection bounding box:', bbox);
    
    if (!bbox) {
      console.log('No bounding box available');
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-500 bg-opacity-50 text-white">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>Face detected but no bounding box data</p>
          </div>
        </div>
      );
    }

    console.log('Rendering face detection overlay with bbox:', bbox);
    
    // Get image element to calculate proper positioning
    const img = imageRef.current;
    if (!img || !imageLoaded || !img.complete || !img.naturalWidth || !img.naturalHeight) {
      console.log('Image not loaded yet - img:', img, 'complete:', img?.complete, 'naturalWidth:', img?.naturalWidth, 'imageLoaded:', imageLoaded);
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Loading image...</p>
          </div>
        </div>
      );
    }
    
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    
    // Get the actual displayed image dimensions (accounting for object-contain)
    const container = img.parentElement;
    if (!container) return null;
    const containerRect = container.getBoundingClientRect();
    
    // Calculate the scale factor for object-contain
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    const scaleX = containerWidth / naturalWidth;
    const scaleY = containerHeight / naturalHeight;
    const scale = Math.min(scaleX, scaleY); // object-contain uses the smaller scale
    
    // Calculate the actual displayed image size
    const displayedImageWidth = naturalWidth * scale;
    const displayedImageHeight = naturalHeight * scale;
    
    // Calculate the offset (centering) for object-contain
    const offsetX = (containerWidth - displayedImageWidth) / 2;
    const offsetY = (containerHeight - displayedImageHeight) / 2;
    
    // Convert bounding box coordinates to displayed coordinates
    const left = offsetX + (bbox.x * scale);
    const top = offsetY + (bbox.y * scale);
    const width = bbox.width * scale;
    const height = bbox.height * scale;
    
    console.log('Face overlay positioning:', {
      natural: { width: naturalWidth, height: naturalHeight },
      container: { width: containerWidth, height: containerHeight },
      displayedImage: { width: displayedImageWidth, height: displayedImageHeight },
      scale,
      offset: { x: offsetX, y: offsetY },
      bbox,
      final: { left, top, width, height }
    });
    
    return (
      <div
        className="absolute pointer-events-none"
        style={{
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          zIndex: 15
        }}
      >
        {/* Face bounding box - positioned using pixel coordinates */}
        <div
          className="absolute rounded-lg"
          style={{
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`,
            zIndex: 20,
            pointerEvents: 'none',
            border: '5px solid #3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            boxShadow: '0 0 40px rgba(59, 130, 246, 1), 0 0 20px rgba(59, 130, 246, 0.8), inset 0 0 30px rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            minWidth: '20px',
            minHeight: '20px'
          }}
        >
          {/* Corner markers for better visibility */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
          
          {/* Label */}
          <div className="absolute -top-14 left-0 bg-blue-600 text-white px-4 py-2 text-sm rounded-lg font-bold shadow-2xl whitespace-nowrap z-30 border-2 border-blue-400 flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span>Face Detected ({formatPercentage(safeVisualEvidence.faceDetection.confidence)}% confidence)</span>
          </div>
        </div>
      </div>
    );
  };

  const renderArtifactsOverlay = () => {
    console.log('renderArtifactsOverlay - safeVisualEvidence.regions:', safeVisualEvidence.regions);
    console.log('renderArtifactsOverlay - safeVisualEvidence.artifacts:', safeVisualEvidence.artifacts);

    if (actualFileType === 'video') {
      const videoElement = videoRef.current;
      const overlayFrame =
        selectedFrame ||
        extractedFrames[currentFrameIndex] ||
        filteredFrames[currentFrameIndex] ||
        frameResults[currentFrameIndex];

      if (!videoElement) {
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-60 text-white px-4 py-2 rounded">
              Preparing video overlay...
            </div>
          </div>
        );
      }

      if (!overlayFrame || !overlayFrame.face_detection?.bounding_box) {
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-60 text-white px-4 py-2 rounded">
              No artifact regions detected for current frame
            </div>
          </div>
        );
      }

      const rect = videoElement.getBoundingClientRect();
      const displayWidth = rect.width || videoElement.clientWidth || 1;
      const displayHeight = rect.height || videoElement.clientHeight || 1;
      const naturalWidth = videoElement.videoWidth || displayWidth;
      const naturalHeight = videoElement.videoHeight || displayHeight;
      const scaleX = displayWidth / naturalWidth;
      const scaleY = displayHeight / naturalHeight;

      const bbox = overlayFrame.face_detection.bounding_box;
      const left = (bbox.x || 0) * scaleX;
      const top = (bbox.y || 0) * scaleY;
      const width = (bbox.width || 0) * scaleX;
      const height = (bbox.height || 0) * scaleY;
      const artifactScores = overlayFrame.artifacts || {};
      const artifactEntries = Object.entries(artifactScores).filter(
        ([, score]) => typeof score === 'number'
      );

      return (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute border-4 border-yellow-500 bg-yellow-500 bg-opacity-25 rounded-lg shadow-lg"
            style={{
              left,
              top,
              width,
              height
            }}
          >
            <div className="absolute -top-10 left-0 bg-yellow-500 text-white px-3 py-1 rounded text-sm font-semibold shadow">
              Artifact focus area
            </div>
          </div>
          {artifactEntries.length > 0 && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded text-xs space-y-1">
              {artifactEntries.map(([key, score]) => (
                <div key={key} className="flex justify-between gap-4">
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  <span>{formatPercentage(score)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    // Get image element for positioning
    const img = imageRef.current;
    if (!img || !img.complete || !img.naturalWidth) {
      console.log('Image not loaded yet for artifacts overlay');
      return null;
    }
    
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    
    // Collect all artifact regions from different sources
    const artifactRegions = [
      ...safeVisualEvidence.regions.filter(r => 
        r.type && (r.type.includes('artifact') || r.type.includes('border') || r.type.includes('edge'))
      ),
      ...(safeVisualEvidence.artifacts.borderRegions || []),
      ...(safeVisualEvidence.artifacts.edgeRegions || []),
      ...(safeVisualEvidence.artifacts.lightingRegions || []),
      ...(safeVisualEvidence.artifacts.textureRegions || [])
    ];
    
    console.log('Artifact regions found:', artifactRegions.length, artifactRegions);
    
    // If no specific artifact regions, show face area with artifact indicators
    if (artifactRegions.length === 0) {
      if (safeVisualEvidence.faceDetection.boundingBox) {
        const bbox = safeVisualEvidence.faceDetection.boundingBox;
        const leftPercent = (bbox.x / naturalWidth) * 100;
        const topPercent = (bbox.y / naturalHeight) * 100;
        const widthPercent = (bbox.width / naturalWidth) * 100;
        const heightPercent = (bbox.height / naturalHeight) * 100;
    
    return (
          <div className="absolute pointer-events-none" style={{ left: 0, top: 0, width: '100%', height: '100%', zIndex: 15 }}>
            <div
              className="absolute border-4 border-yellow-500 bg-yellow-500 bg-opacity-25 rounded-lg"
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
                zIndex: 20,
                boxShadow: '0 0 25px rgba(234, 179, 8, 0.8), inset 0 0 20px rgba(234, 179, 8, 0.3)',
                pointerEvents: 'none',
                borderWidth: '4px',
                borderStyle: 'solid',
                borderColor: '#eab308'
              }}
            >
              <div className="absolute -top-12 left-0 bg-yellow-500 text-white px-4 py-2 text-sm rounded-lg font-bold shadow-2xl whitespace-nowrap z-30 border-2 border-yellow-300">
                ⚠️ Artifact Analysis Area
              </div>
            </div>
          </div>
        );
      }
              return null;
            }
    
    // Render artifact regions
    return (
      <div className="absolute pointer-events-none" style={{ left: 0, top: 0, width: '100%', height: '100%', zIndex: 15 }}>
        {artifactRegions.map((region, index) => {
          const coords = region.coordinates || region;
          if (!coords || (!coords.x && !coords.left)) {
            console.warn('Artifact region missing coordinates:', region);
            return null;
          }
          
          const x = coords.x || coords.left || 0;
          const y = coords.y || coords.top || 0;
          const width = coords.width || 100;
          const height = coords.height || 100;
          // Use color from region, or determine based on type/score
          let color = region.color;
          if (!color) {
            if (region.type?.includes('border')) {
              color = '#ef4444';
            } else if (region.type?.includes('edge')) {
              color = '#f59e0b';
            } else if (region.type?.includes('texture')) {
              color = '#f59e0b';
            } else {
              color = '#f59e0b';
            }
          }
          
          // Calculate percentage positions
          const leftPercent = (x / naturalWidth) * 100;
          const topPercent = (y / naturalHeight) * 100;
          const widthPercent = (width / naturalWidth) * 100;
          const heightPercent = (height / naturalHeight) * 100;
            
            return (
              <div
                key={index}
              className="absolute border-4 bg-opacity-30 rounded-lg"
                style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
                borderColor: color,
                backgroundColor: color,
                zIndex: 20,
                boxShadow: `0 0 20px ${color}80, inset 0 0 15px ${color}40`,
                pointerEvents: 'none',
                borderWidth: '4px',
                borderStyle: 'solid'
              }}
            >
              <div 
                className="absolute -top-10 left-0 px-3 py-2 text-sm rounded-lg text-white font-bold shadow-xl whitespace-nowrap z-30 border-2"
                style={{ backgroundColor: color, borderColor: color }}
              >
                {region.description || region.type || 'Artifact'}
                  {region.score !== undefined && ` (${formatPercentage(region.score)}%)`}
                </div>
              </div>
            );
        })}
      </div>
    );
  };

  const renderForensicOverlay = () => {
    console.log('renderForensicOverlay - safeVisualEvidence.forensic:', safeVisualEvidence.forensic);
    
    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative">
          {/* Enhanced Forensic analysis indicators */}
        {Object.entries(safeVisualEvidence.forensic.anomalyScores || {}).map(([key, analysis]) => {
          if (analysis && analysis.score !== undefined) {
            const hasIssues = analysis.score < 0.7; // Low scores indicate issues
              const severity = analysis.score < 0.3 ? 'high' : analysis.score < 0.5 ? 'medium' : 'low';
              const color = severity === 'high' ? '#ef4444' : severity === 'medium' ? '#f59e0b' : '#22c55e';
            
            if (hasIssues && safeVisualEvidence.faceDetection.boundingBox) {
              const bbox = safeVisualEvidence.faceDetection.boundingBox;
              return (
                <div
                  key={key}
                  className="absolute group"
                  style={{
                    left: bbox.x - 200, // Adjust for image center
                    top: bbox.y - 150,  // Adjust for image center
                    width: bbox.width,
                    height: bbox.height,
                    zIndex: 15,
                    pointerEvents: 'none'
                  }}
                >
                      <div className="absolute -top-8 left-0 text-sm font-bold cursor-help"
                           style={{ color: color }}
                           title={`${key.replace('_', ' ').toUpperCase()}: ${analysis.score < 0.3 ? 'High risk of artificial manipulation' : analysis.score < 0.5 ? 'Medium risk detected' : 'Low risk - appears authentic'}`}>
                        {key.replace('_', ' ').toUpperCase()}: {formatPercentage(analysis.score)}%
                      </div>
                      
                      {/* Detailed tooltip on hover */}
                      <div className="absolute -top-40 left-0 bg-black bg-opacity-95 text-white px-4 py-3 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-xl"
                           style={{ minWidth: '280px', maxWidth: '320px' }}>
                        <div className="font-bold mb-2 text-sm">{key.replace('_', ' ').toUpperCase()} ANALYSIS</div>
                        <div className="text-gray-200 mb-2">
                          <div className="font-semibold mb-1">Score: {formatPercentage(analysis.score)}%</div>
                          {key === 'lighting' ? (
                            <div className="text-gray-300 text-xs leading-relaxed">
                              {analysis.score >= 0.7 ? 
                                '✅ Uniform lighting across the face indicates natural photography. Real images typically have consistent lighting patterns.' :
                                analysis.score >= 0.5 ?
                                '⚠️ Moderate lighting variation detected. Some inconsistencies may suggest manipulation or AI generation.' :
                                '❌ Inconsistent lighting patterns detected. Low scores (<50%) indicate artificial lighting, a common deepfake indicator. Real photos have more uniform lighting.'
                              }
                            </div>
                          ) : key === 'skin' ? (
                            <div className="text-gray-300 text-xs leading-relaxed">
                              {analysis.score >= 0.7 ? 
                                '✅ Natural skin texture with realistic variation. Authentic images show natural skin imperfections.' :
                                analysis.score >= 0.5 ?
                                '⚠️ Some skin texture anomalies detected. May indicate smoothing or manipulation.' :
                                '❌ Unnaturally smooth skin detected. Very low scores suggest AI-generated skin texture, a common deepfake artifact.'
                              }
                            </div>
                          ) : key === 'edge' || key.includes('edge') ? (
                            <div className="text-gray-300 text-xs leading-relaxed">
                              {analysis.score >= 0.7 ? 
                                '✅ Natural edge patterns with smooth transitions. Real photos have organic edge distributions that flow naturally across facial features.' :
                                analysis.score >= 0.5 ?
                                '⚠️ Some edge inconsistencies detected. Unusual edge patterns or sharp transitions may suggest manipulation or AI generation.' :
                                '❌ Unnatural edge patterns detected. Low scores (<50%) indicate sharp artificial edges, grid-like patterns, or inconsistent edge distributions - common signs of AI-generated content. Real faces have smooth, natural edge transitions.'
                              }
                            </div>
                          ) : analysis.score < 0.3 ? 
                            `High risk: ${key === 'compression' ? 'Compression artifacts inconsistent with natural photography' :
                              'Digital patterns suggest artificial generation'}` :
                            analysis.score < 0.5 ?
                            `Medium risk: Minor ${key} inconsistencies detected` :
                            `Low risk: Natural ${key} patterns consistent with authentic image`
                          }
                        </div>
                        {analysis.confidence && (
                          <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">
                            Confidence: {formatPercentage(analysis.confidence)}%
                          </div>
                        )}
                  </div>
                </div>
              );
            }
          }
          return null;
        })}
        
          {/* Additional forensic indicators for different regions */}
          {safeVisualEvidence.forensic.regions && safeVisualEvidence.forensic.regions.map((region, index) => {
            if (region.type === 'forensic-anomaly' && region.coordinates) {
              const severity = region.score < 0.3 ? 'high' : region.score < 0.5 ? 'medium' : 'low';
              const color = severity === 'high' ? '#ef4444' : severity === 'medium' ? '#f59e0b' : '#22c55e';
              
              return (
                <div
                  key={`forensic-${index}`}
                  className="absolute border-4 bg-opacity-30"
                  style={{
                    left: region.coordinates.x - 200, // Adjust for image center
                    top: region.coordinates.y - 150,  // Adjust for image center
                    width: region.coordinates.width,
                    height: region.coordinates.height,
                    borderColor: color,
                    backgroundColor: color,
                    zIndex: 15
                  }}
                >
                  <div className="absolute -top-8 left-0 px-3 py-1 text-sm rounded text-white font-bold"
                       style={{ backgroundColor: color }}>
                    {region.description} ({formatPercentage(region.score)}%)
                  </div>
                </div>
              );
            }
            return null;
          })}
          
          {/* Enhanced Forensic analysis summary overlay with explainability */}
          <div 
            className="absolute bg-black bg-opacity-90 text-white px-4 py-3 rounded-lg"
            style={{ 
              top: -300, // Higher to avoid overlap with prediction
              left: -250, // Further left to avoid overlap
              zIndex: 20,
              minWidth: '300px',
              maxWidth: '350px'
            }}
          >
            <div className="text-sm font-bold mb-3 text-center">FORENSIC ANALYSIS</div>
            <div className="text-xs space-y-2">
              {Object.entries(safeVisualEvidence.forensic.anomalyScores || {}).map(([key, analysis]) => {
                if (analysis && analysis.score !== undefined) {
                  const severity = analysis.score < 0.3 ? 'HIGH RISK' : analysis.score < 0.5 ? 'MEDIUM RISK' : 'LOW RISK';
                  const color = analysis.score < 0.3 ? '#ef4444' : analysis.score < 0.5 ? '#f59e0b' : '#22c55e';
                  
                  // Get explainability text based on the metric
                  const getExplainability = (metricKey, score) => {
                    const explanations = {
                      'lighting': {
                        high: 'Inconsistent lighting patterns suggest artificial manipulation',
                        medium: 'Minor lighting inconsistencies detected',
                        low: 'Natural lighting patterns consistent with authentic image'
                      },
                      'skin': {
                        high: 'Skin texture anomalies indicate potential deepfake generation',
                        medium: 'Minor skin texture irregularities detected',
                        low: 'Natural skin texture consistent with authentic image'
                      },
                      'edge': {
                        high: 'Sharp edge artifacts suggest AI-generated content',
                        medium: 'Minor edge inconsistencies detected',
                        low: 'Natural edge transitions consistent with authentic image'
                      },
                      'compression': {
                        high: 'Compression artifacts inconsistent with natural photography',
                        medium: 'Minor compression inconsistencies detected',
                        low: 'Natural compression patterns consistent with authentic image'
                      },
                      'noise': {
                        high: 'Digital noise patterns suggest artificial generation',
                        medium: 'Minor noise inconsistencies detected',
                        low: 'Natural noise patterns consistent with authentic image'
                      }
                    };
                    
                    const riskLevel = score < 0.3 ? 'high' : score < 0.5 ? 'medium' : 'low';
                    return explanations[metricKey]?.[riskLevel] || `${metricKey} analysis: ${riskLevel} risk detected`;
                  };
                  
                  return (
                    <div key={key} className="border-b border-gray-600 pb-2 last:border-b-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{key.replace('_', ' ').toUpperCase()}:</span>
                        <span style={{ color }} className="font-bold">
                          {severity} ({formatPercentage(analysis.score)}%)
                        </span>
                      </div>
                      <div className="text-gray-300 text-xs leading-relaxed">
                        {getExplainability(key, analysis.score)}
                      </div>
                    </div>
                  );
          }
          return null;
        })}
              
              {/* Overall forensic conclusion */}
              <div className="mt-3 pt-2 border-t border-gray-600">
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">OVERALL FORENSIC CONCLUSION</div>
                  <div className="text-sm font-bold">
                    {analysisResult.prediction === 'FAKE' ? 
                      'Multiple forensic anomalies detected suggesting artificial generation' : 
                      'Forensic analysis consistent with authentic image'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFrameAnalysisOverlay = () => {
    if (actualFileType !== 'video' || !safeVisualEvidence.frameAnalysis) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          <div className="text-center">
            <Info className="w-8 h-8 mx-auto mb-2" />
            <p>Frame analysis not available</p>
          </div>
        </div>
      );
    }

    const frameResults = safeVisualEvidence.frameAnalysis.frame_results || [];
    const currentFrame = frameResults[0]; // Show first frame as example

    if (!currentFrame) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          <div className="text-center">
            <Info className="w-8 h-8 mx-auto mb-2" />
            <p>No frame data available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="absolute inset-0">
        {/* Frame information overlay */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded">
          <div className="text-sm">
            <div><strong>Frame:</strong> {currentFrame.frame_number}</div>
            <div><strong>Timestamp:</strong> {currentFrame.timestamp?.toFixed(2)}s</div>
            <div><strong>Prediction:</strong> {currentFrame.prediction}</div>
            <div><strong>Confidence:</strong> {formatPercentage(currentFrame.confidence)}%</div>
          </div>
        </div>

        {/* Face detection overlay */}
        {currentFrame.face_detection?.detected && currentFrame.face_detection.bounding_box && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
            style={{
              left: currentFrame.face_detection.bounding_box.x,
              top: currentFrame.face_detection.bounding_box.y,
              width: currentFrame.face_detection.bounding_box.width,
              height: currentFrame.face_detection.bounding_box.height
            }}
          >
            <div className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 text-xs rounded">
              Face ({formatPercentage(currentFrame.face_detection.confidence)}%)
            </div>
          </div>
        )}

        {/* Artifact regions */}
        {currentFrame.artifacts && Object.entries(currentFrame.artifacts).map(([key, score]) => {
          if (score < 0.7 && currentFrame.face_detection?.bounding_box) {
            const bbox = currentFrame.face_detection.bounding_box;
            return (
              <div
                key={key}
                className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20"
                style={{
                  left: bbox.x,
                  top: bbox.y,
                  width: bbox.width,
                  height: bbox.height
                }}
              >
                <div className="absolute -top-6 left-0 bg-red-500 text-white px-2 py-1 text-xs rounded">
                  {key.replace('_', ' ')} ({formatPercentage(score)}%)
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  const renderTemporalAnalysisOverlay = () => {
    if (actualFileType !== 'video' || !safeVisualEvidence.temporalAnalysis) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          <div className="text-center">
            <Info className="w-8 h-8 mx-auto mb-2" />
            <p>Temporal analysis not available</p>
          </div>
        </div>
      );
    }

    const temporalAnalysis = safeVisualEvidence.temporalAnalysis;
    const consistencyScore = temporalAnalysis.consistency_score || 0;
    const motionAnalysis = temporalAnalysis.motion_analysis || {};

    return (
      <div className="absolute inset-0">
        {/* Temporal analysis overlay */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded">
          <div className="text-sm">
            <div><strong>Consistency Score:</strong> {formatPercentage(consistencyScore)}%</div>
            <div><strong>Confidence Variance:</strong> {motionAnalysis.confidence_variance !== undefined ? motionAnalysis.confidence_variance.toFixed(3) : 'N/A'}</div>
            <div><strong>Avg Confidence:</strong> {motionAnalysis.average_confidence !== undefined ? `${formatPercentage(motionAnalysis.average_confidence)}%` : 'N/A'}</div>
          </div>
        </div>

        {/* Consistency indicator */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded">
          <div className="text-sm">
            <div className={`font-bold ${consistencyScore > 0.7 ? 'text-green-400' : consistencyScore > 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
              {consistencyScore > 0.7 ? 'Consistent' : consistencyScore > 0.4 ? 'Moderate' : 'Inconsistent'}
            </div>
            <div className="text-xs text-gray-300">Frame Consistency</div>
          </div>
        </div>

        {/* Overall video quality indicator */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded">
          <div className="text-sm">
            <div><strong>Total Frames:</strong> {safeVisualEvidence.frameAnalysis?.total_frames || 0}</div>
            <div><strong>Fake Frames:</strong> {safeVisualEvidence.frameAnalysis?.fake_frames || 0}</div>
            <div><strong>Real Frames:</strong> {safeVisualEvidence.frameAnalysis?.real_frames || 0}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderHeatmapsOverlay = () => {
    console.log('renderHeatmapsOverlay - safeVisualEvidence.heatmaps:', safeVisualEvidence.heatmaps);
    
    if (!safeVisualEvidence.heatmaps || safeVisualEvidence.heatmaps.length === 0) {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded">
            <p className="text-sm">No heatmaps available</p>
                  </div>
                </div>
              );
            }
    
    // Heatmap overlay is now rendered on the image itself
    // This function doesn't need to render anything as controls are in side panel
          return null;
  };

  const renderAudioAnalysisOverlay = () => {
    return (
      <div className="absolute inset-0">
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded">
          <div className="text-sm">
            <div><strong>Audio Analysis</strong></div>
            <div>Duration: {analysisResult.details?.preprocessing_info?.duration?.toFixed(1) || 'N/A'}s</div>
            <div>Sample Rate: {analysisResult.details?.preprocessing_info?.sample_rate || 'N/A'} Hz</div>
            <div>Prediction: {analysisResult.prediction}</div>
            <div>Confidence: {(analysisResult.confidence || 0).toFixed(1)}%</div>
          </div>
        </div>
      </div>
    );
  };

  const renderSpectralAnalysisOverlay = () => {
    return (
      <div className="absolute inset-0">
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded">
          <div className="text-sm">
            <div><strong>Spectral Analysis</strong></div>
            <div>F0 Mean: {analysisResult.details?.comprehensive_features?.f0_mean?.toFixed(1) || 'N/A'} Hz</div>
            <div>Spectral Centroid: {analysisResult.details?.comprehensive_features?.spectral_centroid_mean?.toFixed(0) || 'N/A'} Hz</div>
            <div>Energy: {analysisResult.details?.comprehensive_features?.energy_mean?.toFixed(3) || 'N/A'}</div>
            <div>ZCR: {analysisResult.details?.comprehensive_features?.zcr_mean?.toFixed(3) || 'N/A'}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderWaveformOverlay = () => {
    return (
      <div className="absolute inset-0">
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded">
          <div className="text-sm">
            <div><strong>Waveform Analysis</strong></div>
            <div>Voiced Ratio: {formatPercentage(analysisResult.details?.comprehensive_features?.voiced_ratio || 0)}%</div>
            <div>F0 Variation: {analysisResult.details?.comprehensive_features?.f0_std?.toFixed(1) || 'N/A'} Hz</div>
            <div>Energy Variation: {analysisResult.details?.comprehensive_features?.energy_std?.toFixed(3) || 'N/A'}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderIndicatorsOverlay = () => {
    const indicators = analysisResult.details?.deepfake_indicators || {};
    return (
      <div className="absolute inset-0">
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded max-w-sm">
          <div className="text-sm">
            <div><strong>Deepfake Indicators</strong></div>
            {Object.entries(indicators).map(([key, value]) => (
              <div key={key} className="mt-1">
                <div className="flex justify-between">
                  <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className={`font-bold ${value > 0.7 ? 'text-red-400' : value > 0.4 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {formatPercentage(value)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderFrameByFrameOverlay = () => {
    if (actualFileType !== 'video' || !frameResults.length) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          <div className="text-center">
            <Info className="w-8 h-8 mx-auto mb-2" />
            <p>Frame-by-frame analysis not available</p>
          </div>
        </div>
      );
    }

    const currentFrame = filteredFrames[currentFrameIndex];
    if (!currentFrame) return null;

    return (
      <div className="absolute inset-0">
        {/* Frame Navigation Controls */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded">
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={() => handleFrameNavigation('prev')}
              disabled={currentFrameIndex === 0}
              className="p-1 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm">
              Frame {currentFrameIndex + 1} of {extractedFrames.length}
            </span>
            <button
              onClick={() => handleFrameNavigation('next')}
              disabled={currentFrameIndex === extractedFrames.length - 1}
              className="p-1 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs">
            <div>Frame #{currentFrame.frame_number}</div>
            <div>Time: {currentFrame.timestamp?.toFixed(2)}s</div>
          </div>
        </div>

        {/* Frame Analysis Details */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded max-w-sm">
          <div className="text-sm">
            <div className="flex items-center space-x-2 mb-2">
              <span><strong>Frame Analysis</strong></span>
              <span className={`px-2 py-1 rounded text-xs ${
                currentFrame.prediction === 'FAKE' ? 'bg-red-500' : 'bg-green-500'
              }`}>
                {currentFrame.prediction}
              </span>
            </div>
            <div>Confidence: {formatPercentage(currentFrame.confidence)}%</div>
            
            {currentFrame.artifacts && (
              <div className="mt-2">
                <div className="text-xs font-medium">Artifacts:</div>
                <div>Border: {formatPercentage(currentFrame.artifacts.border_quality)}%</div>
                <div>Edges: {formatPercentage(currentFrame.artifacts.edge_uniformity)}%</div>
                <div>Lighting: {formatPercentage(currentFrame.artifacts.lighting_consistency)}%</div>
              </div>
            )}
          </div>
        </div>

        {/* Face Detection Overlay */}
        {currentFrame.face_detection?.detected && currentFrame.face_detection.bounding_box && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
            style={{
              left: currentFrame.face_detection.bounding_box.x,
              top: currentFrame.face_detection.bounding_box.y,
              width: currentFrame.face_detection.bounding_box.width,
              height: currentFrame.face_detection.bounding_box.height
            }}
          >
            <div className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 text-xs rounded">
              Face ({formatPercentage(currentFrame.face_detection.confidence)}%)
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSuspiciousFramesOverlay = () => {
    if (actualFileType !== 'video' || !suspiciousFrames.length) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          <div className="text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p>No suspicious frames detected</p>
          </div>
        </div>
      );
    }

    return (
      <div className="absolute inset-0">


        {/* Navigation Controls */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleFrameNavigation('prev')}
              disabled={currentFrameIndex === 0}
              className="p-1 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm">
              {currentFrameIndex + 1} / {extractedFrames.length}
            </span>
            <button
              onClick={() => handleFrameNavigation('next')}
              disabled={currentFrameIndex === extractedFrames.length - 1}
              className="p-1 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Visual Evidence</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Overlay Selection */}
        <div className="flex flex-wrap gap-2 mb-4">
          {overlayOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => setSelectedOverlay(option.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedOverlay === option.id
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>

        {/* Image Viewer */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          <div className="flex gap-4">
            {/* Image Container */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center min-h-96">
            {actualFileType === 'video' ? (
              <>
                <div className="relative w-full">
                  <video
                    ref={videoRef}
                    src={secureFileUrl || baseFileUrl || undefined}
                    className="w-full h-auto max-h-96 object-contain rounded-lg shadow-lg"
                    controls
                    muted
                    crossOrigin="anonymous"
                    preload="metadata"
                    playsInline
                    draggable={false}
                    onError={(e) => {
                      console.error('Video failed to load for visual evidence viewer', e);
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 pointer-events-none">
                    {renderOverlay()}
                  </div>
                </div>
                {/* Hidden canvas for frame extraction */}
                <canvas
                  ref={frameCanvasRef}
                  style={{ display: 'none' }}
                />
                {/* Frame display area */}
                {extractedFrames.length > 0 && selectedFrame && (
                  <div className="mt-4 bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Current Frame</h4>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleFrameNavigation('prev')}
                          disabled={currentFrameIndex === 0}
                          className="p-2 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600">
                          Frame {currentFrameIndex + 1} of {extractedFrames.length}
                        </span>
                        <button
                          onClick={() => handleFrameNavigation('next')}
                          disabled={currentFrameIndex === extractedFrames.length - 1}
                          className="p-2 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <img
                        src={selectedFrame.imageData}
                        alt={`Frame ${selectedFrame.frame_number}`}
                        className="w-full h-auto max-h-64 object-contain rounded border"
                      />
                      {/* Frame analysis overlay */}
                      <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white p-2 rounded text-sm">
                        <div>Frame #{selectedFrame.frame_number}</div>
                        <div>Time: {selectedFrame.timestamp?.toFixed(2)}s</div>
                        <div className={`px-2 py-1 rounded text-xs mt-1 ${
                          selectedFrame.prediction === 'FAKE' ? 'bg-red-500' : 'bg-green-500'
                        }`}>
                          {selectedFrame.prediction} ({formatPercentage(selectedFrame.confidence)}%)
                        </div>
                      </div>
                      {/* Face detection overlay */}
                      {selectedFrame.face_detection?.detected && selectedFrame.face_detection.bounding_box && (
                        <div
                          className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
                          style={{
                            left: selectedFrame.face_detection.bounding_box.x,
                            top: selectedFrame.face_detection.bounding_box.y,
                            width: selectedFrame.face_detection.bounding_box.width,
                            height: selectedFrame.face_detection.bounding_box.height
                          }}
                        >
                          <div className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 text-xs rounded">
                            Face ({formatPercentage(selectedFrame.face_detection.confidence)}%)
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Suspicious Reasons */}
                    {selectedFrame.prediction === 'FAKE' && (
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-900">Suspicious Reasons:</span>
                        </div>
                        <ul className="text-xs text-red-700 space-y-1">
                          {getSuspiciousReasons(selectedFrame).map((reason, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-red-500 mr-1">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {isExtractingFrames && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-blue-600">Extracting frames...</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="relative inline-block max-w-full" style={{ position: 'relative' }}>
                {/* Always show the original image */}
              <img
                ref={imageRef}
                src={
                  // Use base64 image from visual_evidence if available, otherwise try to fetch
                  visualEvidence?.image_data || 
                  analysisResult?.visual_evidence?.image_data ||
                  secureFileUrl ||
                  baseFileUrl
                }
                alt="Analysis target"
                  className="w-full h-auto max-h-96 object-contain cursor-move block"
                draggable={false}
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transformOrigin: 'center center',
              display: 'block'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
              onLoad={() => {
                console.log('Image loaded successfully');
                if (imageRef.current) {
                  setImageLoaded(true);
                  // Calculate overlay positions when image loads
                  // Overlay positioning removed - not used
                  const img = imageRef.current;
                  if (img && img.naturalWidth && img.naturalHeight) {
                    // Image loaded, but overlay positions not needed
                  }
                }
              }}
              onError={(e) => {
                console.error('Image load error:', e);
                // Try to load using fetch with auth headers as fallback
                if (fileId) {
                  const fetchUrl = secureFileUrl || baseFileUrl;
                  if (fetchUrl) {
                    fetch(fetchUrl)
                  .then(response => {
                    if (response.ok) {
                      return response.blob();
                    }
                    throw new Error('Failed to load image');
                  })
                  .then(blob => {
                    const url = URL.createObjectURL(blob);
                    if (imageRef.current) {
                      imageRef.current.src = url;
                    }
                  })
                  .catch(err => {
                    console.error('Failed to load image with auth:', err);
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  });
                  } else {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }
                } else {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }
                  }}
                />
                {/* Heatmap overlay - only when heatmaps tab is selected */}
                {selectedOverlay === 'heatmaps' && displayHeatmap && displayHeatmap.image_data && (
                  <img
                    src={displayHeatmap.image_data}
                    alt="Grad-CAM Heatmap Overlay"
                    className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
                    style={{
                      mixBlendMode: 'multiply',
                      opacity: 0.65,
                      zIndex: 5
              }}
            />
            )}
                {/* Overlay container for face detection, artifacts, etc. */}
                {/* Position overlay absolutely relative to the image container */}
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
                  {renderOverlay()}
                </div>
              </div>
            )}
            </div>
            
            {/* Side Panel for Information */}
            <div className="w-80 bg-white rounded-lg shadow-lg p-4 flex-shrink-0">
              {selectedOverlay === 'heatmaps' && displayHeatmap ? (
                <>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Heatmap Analysis</h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-bold text-yellow-600 text-sm mb-2">{displayHeatmap.model.replace('_', ' ').toUpperCase()}</div>
                      <div className="text-xs text-gray-700">
                        <div className="mb-1"><strong>Prediction:</strong> <span className={displayHeatmap.prediction === 'FAKE' ? 'text-red-600' : 'text-green-600'}>{displayHeatmap.prediction}</span></div>
                        <div className="text-gray-600 mt-2">{displayHeatmap.description}</div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs font-semibold text-blue-900 mb-2">Heatmap Legend</div>
                      <div className="text-xs text-blue-800 space-y-1">
                        <div className="flex items-center">
                          <span className="text-red-500 mr-2">🔥</span>
                          <span>Red regions = High deepfake probability</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-blue-500 mr-2">🟦</span>
                          <span>Blue regions = Low deepfake probability</span>
                        </div>
                      </div>
                    </div>
                    
                    {gradcamHeatmaps.length > 1 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs font-semibold text-gray-900 mb-2">Select Model Heatmap:</div>
                        <div className="flex flex-wrap gap-2">
                          {gradcamHeatmaps.map((heatmap, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedHeatmapIndex(idx)}
                              className={`px-3 py-2 text-xs rounded font-medium transition-colors ${
                                selectedHeatmapIndex === idx 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {heatmap.model.replace('_', ' ').split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : selectedOverlay === 'heatmaps' ? (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Heatmap Insights</h4>
                  {safeVisualEvidence.heatmaps.length > 0 ? (
                    safeVisualEvidence.heatmaps.map((heatmap, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="text-sm font-semibold text-gray-900">
                          {heatmap.description || heatmap.type?.replace(/-/g, ' ') || 'Heatmap'}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Intensity: {heatmap.intensity !== undefined ? `${formatPercentage(heatmap.intensity)}%` : 'N/A'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                      No heatmap data available for this video.
                    </div>
                  )}
                </div>
              ) : selectedOverlay === 'temporal' ? (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Temporal Analysis</h4>
                  {safeVisualEvidence.temporalAnalysis ? (
                    <>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="text-sm text-yellow-900 font-semibold mb-1">
                          Consistency Score: {formatPercentage(safeVisualEvidence.temporalAnalysis.consistency_score || 0)}%
                        </div>
                        <div className="text-xs text-yellow-800">
                          Higher consistency suggests natural transitions between frames.
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 space-y-1">
                        <div>Avg Confidence: {`${formatPercentage(safeVisualEvidence.temporalAnalysis.motion_analysis?.average_confidence || 0)}%`}</div>
                        <div>Confidence Variance: {safeVisualEvidence.temporalAnalysis.motion_analysis?.confidence_variance?.toFixed(3) || 'N/A'}</div>
                        <div>Sudden Changes: {safeVisualEvidence.temporalAnalysis.motion_analysis?.sudden_changes || 0}</div>
                        <div>Prediction Swaps: {safeVisualEvidence.temporalAnalysis.motion_analysis?.prediction_swaps || 0}</div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                      Temporal metrics are not available for this analysis.
                    </div>
                  )}
                </div>
              ) : selectedOverlay === 'frame-analysis' ? (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Frame Analysis</h4>
                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-900 space-y-1">
                    <div>Total Frames: {safeVisualEvidence.frameAnalysis?.total_frames || frameResults.length}</div>
                    <div>Suspicious Frames: {safeVisualEvidence.frameAnalysis?.fake_frames || suspiciousFrames.length}</div>
                    <div>Real Frames: {safeVisualEvidence.frameAnalysis?.real_frames || frameResults.length - suspiciousFrames.length}</div>
                  </div>
                  {frameResults.length > 0 && (
                    <div className="text-xs text-gray-600">
                      Showing aggregated statistics from per-frame predictions.
                    </div>
                  )}
                </div>
              ) : selectedOverlay === 'frame-by-frame' ? (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Frame Details</h4>
                  {selectedFrame ? (
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-800 space-y-1">
                      <div>Frame #: {selectedFrame.frame_number}</div>
                      <div>Timestamp: {selectedFrame.timestamp?.toFixed(2)}s</div>
                      <div>Prediction: {selectedFrame.prediction}</div>
                      <div>Confidence: {formatPercentage(selectedFrame.confidence)}%</div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                      Select a frame from the list to view detailed metrics.
                    </div>
                  )}
                </div>
              ) : selectedOverlay === 'suspicious-frames' ? (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Suspicious Frames</h4>
                  {suspiciousFrames.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {suspiciousFrames.slice(0, 8).map((frame) => (
                        <div key={frame.frame_number} className="bg-red-50 border border-red-100 p-3 rounded-lg text-sm">
                          <div className="flex justify-between text-red-900 font-semibold">
                            <span>Frame #{frame.frame_number}</span>
                            <span>{formatPercentage(frame.confidence)}%</span>
                          </div>
                          <div className="text-xs text-red-700 mt-1">
                            {getSuspiciousReasons(frame).slice(0, 2).join(', ') || 'Low confidence'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-green-50 p-4 rounded-lg text-sm text-green-700">
                      No suspicious frames detected.
                    </div>
                  )}
                </div>
              ) : selectedOverlay === 'face-detection' ? (
                <>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Face Detection</h4>
                  <div className="space-y-4">
                    {safeVisualEvidence.faceDetection.detected ? (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="font-semibold text-blue-900">Face Detected</span>
                        </div>
                        <div className="text-sm text-blue-800">
                          <div><strong>Confidence:</strong> {formatPercentage(safeVisualEvidence.faceDetection.confidence)}%</div>
                          {safeVisualEvidence.faceDetection.boundingBox && (
                            <div className="mt-2 text-xs text-gray-600">
                              <div>Position: ({safeVisualEvidence.faceDetection.boundingBox.x}, {safeVisualEvidence.faceDetection.boundingBox.y})</div>
                              <div>Size: {safeVisualEvidence.faceDetection.boundingBox.width} × {safeVisualEvidence.faceDetection.boundingBox.height} px</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center">
                          <XCircle className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-gray-600">No face detected</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : selectedOverlay === 'artifacts' ? (
                <>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Artifacts Analysis</h4>
                  
                  {/* Info box explaining percentages */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h5 className="text-sm font-semibold text-blue-900 mb-1">Understanding Artifact Scores</h5>
                        <div className="text-xs text-blue-800 space-y-1">
                          <p><strong>0-100% Scale:</strong> Higher percentages indicate more natural, authentic characteristics. Lower percentages suggest potential manipulation or AI generation.</p>
                          <p><strong>Edge Consistency:</strong> Measures how natural and uniform edges are. 70-100% = smooth natural edges, &lt;50% = sharp/artificial edges or grid patterns (AI-generated indicator).</p>
                          <p><strong>Border Quality:</strong> Measures face border smoothness. Higher values indicate natural blending with background.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {(() => {
                      const allArtifacts = [
                        ...safeVisualEvidence.regions.filter(r => r.type && (r.type.includes('artifact') || r.type.includes('border') || r.type.includes('edge'))),
                        ...(safeVisualEvidence.artifacts.borderRegions || []),
                        ...(safeVisualEvidence.artifacts.edgeRegions || []),
                        ...(safeVisualEvidence.artifacts.textureRegions || [])
                      ];
                      
                      // Helper function to get explanation for artifact types
                      const getArtifactExplanation = (description, type, score) => {
                        const descLower = (description || '').toLowerCase();
                        const typeLower = (type || '').toLowerCase();
                        
                        if (descLower.includes('edge') || typeLower.includes('edge')) {
                          if (score >= 0.7) {
                            return 'Natural edge patterns with smooth transitions (authentic)';
                          } else if (score >= 0.5) {
                            return 'Some edge inconsistencies detected (moderate risk)';
                          } else {
                            return 'Unnatural edge patterns detected (AI-generated indicator). Sharp edges, grid patterns, or inconsistent edge distributions suggest artificial generation.';
                          }
                        } else if (descLower.includes('border') || typeLower.includes('border')) {
                          if (score >= 0.7) {
                            return 'Natural face border with smooth blending (authentic)';
                          } else if (score >= 0.5) {
                            return 'Some border irregularities detected (moderate risk)';
                          } else {
                            return 'Poor border quality detected. Uneven or artificial borders suggest manipulation or AI generation.';
                          }
                        } else if (descLower.includes('texture') || typeLower.includes('texture')) {
                          if (score >= 0.7) {
                            return 'Natural texture patterns (authentic)';
                          } else if (score >= 0.5) {
                            return 'Some texture anomalies detected (moderate risk)';
                          } else {
                            return 'Unnatural texture patterns detected (potential deepfake indicator)';
                          }
                        }
                        return 'Analysis score (higher = more natural)';
                      };
                      
                      if (allArtifacts.length > 0) {
                        return (
                          <div className="space-y-2">
                            {allArtifacts.map((region, idx) => {
                              const score = region.score;
                              const isGood = score >= 0.7;
                              const isModerate = score >= 0.5 && score < 0.7;
                              const bgColor = isGood ? 'bg-green-50 border-green-200' : isModerate ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
                              const textColor = isGood ? 'text-green-900' : isModerate ? 'text-yellow-900' : 'text-red-900';
                              const scoreColor = isGood ? 'text-green-700' : isModerate ? 'text-yellow-700' : 'text-red-700';
                              
                              return (
                                <div key={idx} className={`p-3 rounded-lg border ${bgColor}`}>
                                  <div className={`font-semibold text-sm ${textColor}`}>
                                    {region.description || region.type || 'Artifact Detected'}
                                  </div>
                                  {score !== undefined && (
                                    <div className="mt-2">
                                      <div className={`text-lg font-bold ${scoreColor}`}>
                                        {formatPercentage(score)}%
                                      </div>
                                      <div className={`text-xs mt-1 ${textColor} opacity-80`}>
                                        {getArtifactExplanation(region.description, region.type, score)}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      } else {
                        return (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-gray-600 text-sm">
                              {safeVisualEvidence.faceDetection.detected 
                                ? 'No specific artifacts detected. Face area is being analyzed for artifacts.'
                                : 'No artifacts detected'}
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </>
              ) : selectedOverlay === 'forensic' ? (
                <>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Forensic Analysis</h4>
                  
                  {/* Info box explaining percentages */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h5 className="text-sm font-semibold text-blue-900 mb-1">Understanding the Scores</h5>
                        <div className="text-xs text-blue-800 space-y-1">
                          <p><strong>0-100% Scale:</strong> Higher percentages indicate more natural, authentic characteristics. Lower percentages suggest potential manipulation or AI generation.</p>
                          <p><strong>Lighting:</strong> Measures lighting consistency across the face. 70-100% = natural, &lt;50% = inconsistent (deepfake indicator).</p>
                          <p><strong>Skin:</strong> Measures skin texture naturalness. 70-100% = natural texture, &lt;50% = unnaturally smooth (common in deepfakes).</p>
                          <p><strong>Edge Consistency:</strong> Measures how natural and uniform edges are. 70-100% = smooth natural edges, &lt;50% = sharp/artificial edges or grid patterns (AI-generated indicator).</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {(() => {
                      // Get forensic scores from anomalyScores
                      const anomalyScores = safeVisualEvidence.forensic.anomalyScores || {};
                      
                      // Also check raw forensic analysis data from analysisResult
                      const rawForensic = analysisResult?.details?.face_features?.forensic_analysis || {};
                      const lightingAnalysis = rawForensic.lighting_analysis || {};
                      const skinAnalysis = rawForensic.skin_analysis || {};
                      
                      // Build combined list of forensic metrics
                      const forensicMetrics = [];
                      
                      // Add lighting if available
                      if (anomalyScores.lighting) {
                        const score = anomalyScores.lighting.score;
                        forensicMetrics.push({
                          key: 'lighting',
                          score: score,
                          description: anomalyScores.lighting.description || 'Lighting consistency analysis',
                          rawValue: lightingAnalysis.brightness_std
                        });
                      } else if (lightingAnalysis.brightness_std !== undefined) {
                        // Fallback: calculate from raw brightness_std
                        const brightness_std = lightingAnalysis.brightness_std;
                        let calculated_score = 0.0;
                        if (brightness_std <= 40) {
                          calculated_score = 1.0 - (brightness_std / 40.0) * 0.5;
                        } else {
                          calculated_score = Math.max(0.0, 0.5 - ((brightness_std - 40) / 60.0) * 0.5);
                        }
                        forensicMetrics.push({
                          key: 'lighting',
                          score: calculated_score,
                          description: 'Lighting consistency analysis',
                          rawValue: brightness_std
                        });
                      }
                      
                      // Add skin if available
                      if (anomalyScores.skin) {
                        const score = anomalyScores.skin.score;
                        forensicMetrics.push({
                          key: 'skin',
                          score: score,
                          description: anomalyScores.skin.description || 'Skin texture analysis',
                          rawValue: skinAnalysis.smoothness
                        });
                      } else if (skinAnalysis.smoothness !== undefined) {
                        // Fallback: calculate from raw smoothness
                        const smoothness = skinAnalysis.smoothness;
                        const calculated_score = Math.max(0.0, Math.min(1.0, smoothness / 10.0));
                        forensicMetrics.push({
                          key: 'skin',
                          score: calculated_score,
                          description: 'Skin texture analysis',
                          rawValue: smoothness
                        });
                      }
                      
                      // Add any other anomaly scores
                      Object.entries(anomalyScores).forEach(([key, analysis]) => {
                        if (key !== 'lighting' && key !== 'skin' && analysis && analysis.score !== undefined) {
                          forensicMetrics.push({
                            key: key,
                            score: analysis.score,
                            description: analysis.description || `${key.replace('_', ' ')} analysis`
                          });
                        }
                      });
                      
                      if (forensicMetrics.length > 0) {
                        return (
                          <div className="space-y-2">
                            {forensicMetrics.map((metric) => {
                              const score = metric.score;
                              const isGood = score >= 0.7;
                              const isModerate = score >= 0.5 && score < 0.7;
                              const bgColor = isGood ? 'bg-green-50 border-green-200' : isModerate ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
                              const textColor = isGood ? 'text-green-900' : isModerate ? 'text-yellow-900' : 'text-red-900';
                              const scoreColor = isGood ? 'text-green-700' : isModerate ? 'text-yellow-700' : 'text-red-700';
                              
                              // Get explanation for each metric type
                              const getMetricExplanation = (key, scoreValue) => {
                                if (key === 'lighting') {
                                  if (scoreValue >= 0.7) {
                                    return 'Uniform lighting across the face (natural)';
                                  } else if (scoreValue >= 0.5) {
                                    return 'Moderate lighting variation (slightly suspicious)';
                                  } else {
                                    return 'Inconsistent lighting detected (potential deepfake indicator)';
                                  }
                                } else if (key === 'skin') {
                                  if (scoreValue >= 0.7) {
                                    return 'Natural skin texture (authentic)';
                                  } else if (scoreValue >= 0.5) {
                                    return 'Some skin texture anomalies (moderate risk)';
                                  } else {
                                    return 'Unnaturally smooth skin (common in deepfakes)';
                                  }
                                } else if (key === 'symmetry') {
                                  if (scoreValue >= 0.7) {
                                    return 'Balanced facial symmetry (natural)';
                                  } else if (scoreValue >= 0.5) {
                                    return 'Moderate asymmetry (slightly suspicious)';
                                  } else {
                                    return 'Significant asymmetry (potential manipulation)';
                                  }
                                } else if (key === 'edge' || key.includes('edge')) {
                                  if (scoreValue >= 0.7) {
                                    return 'Natural edge patterns with smooth transitions (authentic)';
                                  } else if (scoreValue >= 0.5) {
                                    return 'Some edge inconsistencies detected (moderate risk)';
                                  } else {
                                    return 'Unnatural edge patterns detected (AI-generated indicator). Sharp edges, grid patterns, or inconsistent edge distributions suggest artificial generation.';
                                  }
                                }
                                return 'Analysis score (higher = more natural)';
                              };

                              return (
                                <div key={metric.key} className={`p-3 rounded-lg border ${bgColor}`}>
                                  <div className={`font-semibold text-sm capitalize ${textColor}`}>
                                    {metric.key.replace('_', ' ')}
                                  </div>
                                  {score !== undefined && !isNaN(score) && (
                                    <div className="mt-2">
                                      <div className={`text-lg font-bold ${scoreColor}`}>
                                        {formatPercentage(score)}%
                                      </div>
                                      <div className={`text-xs mt-1 ${textColor} opacity-80`}>
                                        {getMetricExplanation(metric.key, score)}
                                      </div>
                                    </div>
                                  )}
                                  {metric.rawValue !== undefined && (
                                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                                      Technical value: {typeof metric.rawValue === 'number' ? metric.rawValue.toFixed(2) : metric.rawValue}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      } else {
                        return (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-gray-600 text-sm">No forensic analysis data available</div>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-sm">Select an overlay to view details</div>
              )}
            </div>
          </div>
          
            <div className="hidden w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">File not found or not accessible</p>
                <p className="text-sm text-gray-400 mb-4">File ID: {fileId}</p>
                <div className="bg-yellow-50 p-3 rounded-lg text-left max-w-md">
                  <p className="text-sm text-yellow-800 font-medium mb-2">Possible causes:</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Backend server was restarted</li>
                    <li>• File was not properly uploaded</li>
                    <li>• File was deleted or moved</li>
                    <li>• Session expired</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
          </div>
        </div>

        {/* Image Analysis Panel */}
        {actualFileType === 'image' && (
          <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Image Analysis</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {analysisResult.prediction} ({formatConfidence(analysisResult.confidence)}% confidence)
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  analysisResult.prediction === 'FAKE' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {analysisResult.prediction}
                </span>
              </div>
            </div>

            {/* Image Analysis Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Face Detection */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Face Detection</span>
                </div>
                <div className="text-sm text-blue-700">
                  {safeVisualEvidence.faceDetection.detected ? (
                    <>
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Face detected with {formatPercentage(safeVisualEvidence.faceDetection.confidence)}% confidence
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 inline mr-1" />
                      No face detected
                    </>
                  )}
                </div>
              </div>

              {/* Artifacts */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Artifacts</span>
                </div>
                <div className="text-sm text-yellow-700">
                  {safeVisualEvidence.regions.filter(r => r.type.includes('artifact')).length} artifact regions detected
                </div>
              </div>

              {/* Forensic Analysis */}
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-900">Forensic Analysis</span>
                </div>
                <div className="text-sm text-red-700">
                  {Object.values(safeVisualEvidence.forensic).filter(analysis => 
                    analysis && typeof analysis === 'object' && 
                    Object.values(analysis).some(value => typeof value === 'boolean' ? value : false)
                  ).length} forensic issues detected
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            {analysisResult.details && (
              <div className="space-y-4">
                {/* Model Predictions */}
                {analysisResult.details.model_predictions && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">AI Model Predictions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(analysisResult.details.model_predictions).map(([model, prediction]) => {
                        const confidence = analysisResult.details.model_confidences?.[model] || 0;
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
                {analysisResult.details.face_features && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Face Analysis</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Detected: </span>
                        <span className={`font-medium ${analysisResult.details.face_features.face_detected ? 'text-green-600' : 'text-red-600'}`}>
                          {analysisResult.details.face_features.face_detected ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Symmetry: </span>
                        <span className="font-medium">{formatPercentage(analysisResult.details.face_features.face_symmetry || 0)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Size Ratio: </span>
                        <span className="font-medium">{formatPercentage(analysisResult.details.face_features.face_size_ratio || 0)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Confidence: </span>
                        <span className="font-medium">{formatPercentage(analysisResult.details.face_features.face_confidence || 0)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Forensic Analysis Details */}
                {analysisResult.details.face_features?.forensic_analysis && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Forensic Analysis Details</h4>
                    <div className="space-y-3">
                      {Object.entries(analysisResult.details.face_features.forensic_analysis).map(([key, value]) => {
                        if (typeof value === 'object' && value !== null) {
                          return (
                            <div key={key} className="bg-white p-3 rounded border">
                              <h5 className="font-medium text-gray-900 mb-2 capitalize">
                                {key.replace('_', ' ')}
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
                                      displayValue = `${formatPercentage(subValue)}%`;
                                      statusText = subValue < 0.5 ? '⚠️ Low' : subValue < 0.7 ? '⚠️ Moderate' : '✅ Good';
                                      statusClass = subValue < 0.5 ? 'text-red-600' : subValue < 0.7 ? 'text-yellow-600' : 'text-green-600';
                                      description = subKey.includes('symmetry') ? 'How similar left and right sides are (higher = more symmetric)' :
                                                   subKey.includes('uniformity') ? 'How consistent the lighting is (higher = more uniform)' :
                                                   'Score value (higher = better)';
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
                                      displayValue = `${formatPercentage(subValue)}%`;
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
                                      return `Lighting Consistency Score (0-100%)\n\nWhat it means:\n• 70-100%: Uniform lighting across the face (natural)\n• 50-70%: Moderate lighting variation (slightly suspicious)\n• Below 50%: Inconsistent lighting patterns (potential deepfake)\n\nWhy it matters: Real photos have consistent lighting. AI-generated images often show lighting inconsistencies that are hard to perfect.`;
                                    } else if (subKey.includes('edge_uniformity') || subKey.includes('edge_consistency')) {
                                      return `Edge Consistency Score (0-100%)\n\nWhat it means:\n• 70-100%: Natural edge patterns with smooth transitions (authentic)\n• 50-70%: Some edge inconsistencies detected (moderate risk)\n• Below 50%: Unnatural edge patterns (potential deepfake)\n\nWhy it matters: Real photos have smooth, organic edge transitions across facial features. AI-generated images often show sharp artificial edges, grid-like patterns, or inconsistent edge distributions that are telltale signs of digital manipulation.`;
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
                                    <div key={subKey} className="bg-gray-50 p-2 rounded group relative">
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-700 capitalize font-medium">
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
                                            <span className="text-gray-800 font-mono text-xs bg-white px-2 py-1 rounded">
                                              {displayValue}
                                            </span>
                                          )}
                                          <span className={`font-semibold ${statusClass}`}>
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
            )}
          </div>
        )}

        {/* Frame Analysis Panel */}
        {actualFileType === 'video' && frameResults.length > 0 && (
          <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-primary-600" />
                <h4 className="text-lg font-semibold text-gray-900">Frame Analysis</h4>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilterSuspicious(!filterSuspicious)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterSuspicious
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Show Suspicious Only</span>
                </button>
                <button
                  onClick={() => setShowFrameAnalysis(!showFrameAnalysis)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showFrameAnalysis
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>{showFrameAnalysis ? 'Hide' : 'Show'} Frame List</span>
                </button>
              </div>
            </div>

            {/* Frame Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Total Frames</div>
                <div className="text-lg font-bold text-blue-900">{frameResults.length}</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-sm text-red-600 font-medium">Suspicious</div>
                <div className="text-lg font-bold text-red-900">{suspiciousFrames.length}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Real</div>
                <div className="text-lg font-bold text-green-900">{frameResults.length - suspiciousFrames.length}</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium">Suspicious Rate</div>
                <div className="text-lg font-bold text-yellow-900">
                  {frameResults.length > 0 ? `${formatPercentage(suspiciousFrames.length / frameResults.length)}%` : '0.0%'}
                </div>
              </div>
            </div>

            {/* Frame List */}
            {showFrameAnalysis && (
              <div className="max-h-96 overflow-y-auto">
                <div className="mb-2 text-sm text-gray-600">
                  Showing {extractedFrames.length} extracted frames
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {extractedFrames.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      No frames extracted yet. {isExtractingFrames ? 'Extracting...' : 'Click "Show Frame List" to extract frames.'}
                    </div>
                  ) : (
                    extractedFrames.map((frame, index) => (
                    <div
                      key={frame.frame_number}
                      onClick={() => handleFrameSelect(index)}
                      className={`rounded-lg border cursor-pointer transition-colors overflow-hidden ${
                        currentFrameIndex === index
                          ? 'border-blue-500 bg-blue-50'
                          : frame.prediction === 'FAKE'
                          ? 'border-red-200 bg-red-50 hover:bg-red-100'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      }`}
                      >
                        {/* Frame Image */}
                        <div className="relative">
                          <img
                            src={frame.imageData}
                            alt={`Frame ${frame.frame_number}`}
                            className="w-full h-24 object-cover"
                          />
                          {/* Prediction Badge */}
                          <div className="absolute top-1 right-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              frame.prediction === 'FAKE' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                            }`}>
                              {frame.prediction}
                            </span>
                          </div>
                          {/* Frame Number */}
                          <div className="absolute top-1 left-1 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                            #{frame.frame_number}
                          </div>
                        </div>
                        
                        {/* Frame Details */}
                        <div className="p-2">
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>Time: {frame.timestamp?.toFixed(2)}s</div>
                            <div>Confidence: {formatPercentage(frame.confidence)}%</div>
                            {frame.prediction === 'FAKE' && (
                              <div className="text-red-600 text-xs">
                                {getSuspiciousReasons(frame).slice(0, 1).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Evidence Summary */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {actualFileType === 'video' ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Frame Analysis</span>
                </div>
                <div className="text-sm text-blue-700">
                  {safeVisualEvidence.frameAnalysis?.total_frames || 0} frames analyzed
                  <br />
                  {safeVisualEvidence.frameAnalysis?.fake_frames || 0} fake frames detected
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Temporal Analysis</span>
                </div>
                <div className="text-sm text-yellow-700">
                  Consistency: {formatPercentage(safeVisualEvidence.temporalAnalysis?.consistency_score || 0)}%
                  <br />
                  Avg Confidence: {formatPercentage(safeVisualEvidence.temporalAnalysis?.motion_analysis?.average_confidence || 0)}%
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-900">Video Quality</span>
                </div>
                <div className="text-sm text-red-700">
                  {safeVisualEvidence.heatmaps.length} analysis heatmaps
                  <br />
                  {safeVisualEvidence.frameAnalysis?.frame_results?.length || 0} detailed frames
                </div>
              </div>
            </>
          ) : actualFileType === 'image' ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Face Detection</span>
                </div>
                <div className="text-sm text-blue-700">
                  {safeVisualEvidence.faceDetection.detected ? (
                    <>
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Face detected with {formatPercentage(safeVisualEvidence.faceDetection.confidence)}% confidence
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 inline mr-1" />
                      No face detected
                    </>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Artifacts</span>
                </div>
                <div className="text-sm text-yellow-700">
                  {safeVisualEvidence.regions.filter(r => r.type.includes('artifact')).length} artifact regions detected
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-900">Forensic Analysis</span>
                </div>
                <div className="text-sm text-red-700">
                  {Object.values(safeVisualEvidence.forensic).filter(analysis => 
                    analysis && typeof analysis === 'object' && 
                    Object.values(analysis).some(value => typeof value === 'boolean' ? value : false)
                  ).length} forensic issues detected
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Audio Analysis</span>
                </div>
                <div className="text-sm text-blue-700">
                  Duration: {analysisResult.details?.preprocessing_info?.duration?.toFixed(1) || 'N/A'}s
                  <br />
                  Sample Rate: {analysisResult.details?.preprocessing_info?.sample_rate || 'N/A'} Hz
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Layers className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Spectral Features</span>
                </div>
                <div className="text-sm text-yellow-700">
                  F0: {analysisResult.details?.comprehensive_features?.f0_mean?.toFixed(1) || 'N/A'} Hz
                  <br />
                  Energy: {analysisResult.details?.comprehensive_features?.energy_mean?.toFixed(3) || 'N/A'}
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-900">Deepfake Indicators</span>
                </div>
                <div className="text-sm text-red-700">
                  {Object.keys(analysisResult.details?.deepfake_indicators || {}).length} indicators analyzed
                  <br />
                  Prediction: {analysisResult.prediction} ({formatPercentage(analysisResult.confidence || 0)}%)
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detailed Analysis */}
        <div className="mt-4 space-y-3">
          <h4 className="font-medium text-gray-900">Analysis Details</h4>
          
          {/* Face Detection Details */}
          {safeVisualEvidence.faceDetection.detected && (
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-700">
                <strong>Face Region:</strong> {safeVisualEvidence.faceDetection.boundingBox?.width || 0}×{safeVisualEvidence.faceDetection.boundingBox?.height || 0} pixels
                <br />
                <strong>Confidence:</strong> {formatPercentage(safeVisualEvidence.faceDetection.confidence)}%
              </div>
            </div>
          )}

          {/* Artifact Details */}
          {safeVisualEvidence.artifacts.borderAnalysis?.border_quality !== undefined && (
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-700">
                <strong>Border Quality:</strong> {formatPercentage(safeVisualEvidence.artifacts.borderAnalysis.border_quality)}%
                <br />
                <strong>Edge Uniformity:</strong> {formatPercentage(safeVisualEvidence.artifacts.edgeAnalysis?.edge_uniformity || 0)}%
              </div>
            </div>
          )}

          {/* Heatmap Details */}
          {safeVisualEvidence.heatmaps.length > 0 && (
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-700">
                <strong>Heatmaps Generated:</strong> {safeVisualEvidence.heatmaps.length}
                <br />
                {safeVisualEvidence.heatmaps.map((heatmap, index) => {
                  // For Grad-CAM heatmaps, show prediction; for others, show intensity
                  let displayValue = '';
                  if (heatmap.type === 'gradcam') {
                    // Show prediction for Grad-CAM heatmaps
                    displayValue = heatmap.prediction || 'N/A';
                  } else if (heatmap.intensity !== undefined && !isNaN(heatmap.intensity)) {
                    // Show intensity as percentage for other heatmaps
                    displayValue = `${formatPercentage(heatmap.intensity)}%`;
                  } else {
                    displayValue = 'N/A';
                  }
                  
                  return (
                    <div key={index} className="mt-2">
                      {heatmap.color && (
                    <span className="inline-block w-3 h-3 rounded mr-1" style={{ backgroundColor: heatmap.color }}></span>
                      )}
                      <span className="text-xs">
                        {heatmap.description}: {displayValue}
                  </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VisualEvidence;
