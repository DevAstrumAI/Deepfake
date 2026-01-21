/** @format */

import React from 'react';
import FaceDetectionOverlay from './FaceDetectionOverlay';
import ArtifactsOverlay from './ArtifactsOverlay';
import ForensicOverlay from './ForensicOverlay';
import FrameAnalysisOverlay from './FrameAnalysisOverlay';
import TemporalAnalysisOverlay from './TemporalAnalysisOverlay';
import HeatmapsOverlay from './HeatmapsOverlay';
import AudioAnalysisOverlay from './AudioAnalysisOverlay';
import SpectralAnalysisOverlay from './SpectralAnalysisOverlay';
import WaveformOverlay from './WaveformOverlay';
import IndicatorsOverlay from './IndicatorsOverlay';
import FrameByFrameOverlay from './FrameByFrameOverlay';
import SuspiciousFramesOverlay from './SuspiciousFramesOverlay';

/**
 * Central overlay renderer that routes to the appropriate overlay component
 */
const OverlayRenderer = ({
	selectedOverlay,
	actualFileType,
	safeVisualEvidence,
	analysisResult,
	imageRef,
	videoRef,
	imageLoaded,
	selectedFrame,
	extractedFrames,
	currentFrameIndex,
	filteredFrames,
	frameResults,
	handleFrameNavigation,
}) => {
	if (!selectedOverlay) {
		return null;
	}

	const commonProps = {
		safeVisualEvidence,
		analysisResult,
		actualFileType,
		imageRef,
		videoRef,
		imageLoaded,
		selectedFrame,
		extractedFrames,
		currentFrameIndex,
		filteredFrames,
		frameResults,
		handleFrameNavigation,
	};

	switch (selectedOverlay) {
		case 'face-detection':
			return <FaceDetectionOverlay {...commonProps} />;
		case 'artifacts':
			return <ArtifactsOverlay {...commonProps} />;
		case 'forensic':
			return <ForensicOverlay {...commonProps} />;
		case 'frame-analysis':
			return <FrameAnalysisOverlay {...commonProps} />;
		case 'frame-by-frame':
			return <FrameByFrameOverlay {...commonProps} />;
		case 'suspicious-frames':
			return <SuspiciousFramesOverlay {...commonProps} />;
		case 'temporal':
			return <TemporalAnalysisOverlay {...commonProps} />;
		case 'heatmaps':
			return <HeatmapsOverlay {...commonProps} />;
		case 'audio-analysis':
			return <AudioAnalysisOverlay {...commonProps} />;
		case 'spectral':
			return <SpectralAnalysisOverlay {...commonProps} />;
		case 'waveform':
			return <WaveformOverlay {...commonProps} />;
		case 'indicators':
			return <IndicatorsOverlay {...commonProps} />;
		default:
			return null;
	}
};

export default OverlayRenderer;

