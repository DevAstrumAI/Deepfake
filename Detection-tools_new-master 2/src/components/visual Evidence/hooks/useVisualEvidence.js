/** @format */

import { useState, useRef, useEffect } from "react";
import {
  getDefaultOverlay,
  getOverlayOptionsByType,
} from "../utils/visualEvidenceUtils";

/**
 * Custom hook for managing visual evidence state and operations
 */
export const useVisualEvidence = (analysisResult, fileType) => {
  const actualFileType = analysisResult?.type || fileType;

  const [selectedOverlay, setSelectedOverlay] = useState(
    getDefaultOverlay(actualFileType),
  );
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
  const [overlayPositions, setOverlayPositions] = useState(null);

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const frameCanvasRef = useRef(null);

  // Get frame analysis data
  const frameAnalysis =
    analysisResult?.visual_evidence?.frame_analysis ||
    analysisResult?.frame_analysis ||
    {};
  const frameResults = frameAnalysis.frame_results || [];
  const suspiciousFrames = frameResults.filter(
    (frame) => frame.prediction === "FAKE" || frame.confidence < 0.5,
  );
  const filteredFrames = filterSuspicious ? suspiciousFrames : frameResults;

  // Ensure overlay selection stays valid across file type changes
  useEffect(() => {
    const validOverlayIds = getOverlayOptionsByType(actualFileType).map(
      (option) => option.id,
    );
    if (!selectedOverlay || !validOverlayIds.includes(selectedOverlay)) {
      const defaultOverlay = getDefaultOverlay(actualFileType);
      const fallbackOverlay = defaultOverlay || validOverlayIds[0] || "";
      if (fallbackOverlay && fallbackOverlay !== selectedOverlay) {
        setSelectedOverlay(fallbackOverlay);
      }
    }
  }, [actualFileType, selectedOverlay]);

  // Effect to update current frame when index changes
  useEffect(() => {
    if (
      extractedFrames.length > 0 &&
      currentFrameIndex < extractedFrames.length
    ) {
      setSelectedFrame(extractedFrames[currentFrameIndex]);
    }
  }, [currentFrameIndex, extractedFrames]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5));
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
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFrameNavigation = (direction) => {
    if (direction === "prev" && currentFrameIndex > 0) {
      setCurrentFrameIndex(currentFrameIndex - 1);
    } else if (
      direction === "next" &&
      currentFrameIndex < extractedFrames.length - 1
    ) {
      setCurrentFrameIndex(currentFrameIndex + 1);
    }
  };

  const handleFrameSelect = (frameIndex) => {
    setCurrentFrameIndex(frameIndex);
    if (extractedFrames[frameIndex]) {
      setSelectedFrame(extractedFrames[frameIndex]);
    }
  };

  const handleImageLoad = ({
    naturalWidth,
    naturalHeight,
    containerWidth,
    containerHeight,
  }) => {
    setImageLoaded(true);

    const scaleX = containerWidth / naturalWidth;
    const scaleY = containerHeight / naturalHeight;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (containerWidth - naturalWidth * scale) / 2;
    const offsetY = (containerHeight - naturalHeight * scale) / 2;

    setOverlayPositions({
      scale,
      offsetX,
      offsetY,
      imageWidth: naturalWidth,
      imageHeight: naturalHeight,
    });
  };

  const seekToFrame = (frameNumber) => {
    if (videoRef.current && frameResults.length > 0) {
      const frame = frameResults.find((f) => f.frame_number === frameNumber);
      if (frame) {
        videoRef.current.currentTime = frame.timestamp || 0;
      }
    }
  };

  return {
    // State
    actualFileType,
    selectedOverlay,
    setSelectedOverlay,
    zoom,
    setZoom,
    pan,
    setPan,
    isDragging,
    setIsDragging,
    dragStart,
    setDragStart,
    currentFrameIndex,
    setCurrentFrameIndex,
    showFrameAnalysis,
    setShowFrameAnalysis,
    filterSuspicious,
    setFilterSuspicious,
    selectedFrame,
    setSelectedFrame,
    extractedFrames,
    setExtractedFrames,
    isExtractingFrames,
    setIsExtractingFrames,
    selectedHeatmapIndex,
    setSelectedHeatmapIndex,
    imageLoaded,
    setImageLoaded,
    overlayPositions,
    setOverlayPositions,
    frameResults,
    suspiciousFrames,
    filteredFrames,

    // Refs
    canvasRef,
    imageRef,
    videoRef,
    frameCanvasRef,

    // Handlers
    handleZoomIn,
    handleZoomOut,
    handleReset,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleFrameNavigation,
    handleFrameSelect,
    handleImageLoad,
    seekToFrame,
  };
};
