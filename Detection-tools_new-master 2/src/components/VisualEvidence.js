/** @format */

import React from 'react';
import { motion } from 'framer-motion';
import {
	Eye,
	ZoomIn,
	ZoomOut,
	RotateCcw,
	AlertTriangle,
} from 'lucide-react';

import HeatmapDetails from './visual Evidence/heatmapDetails';
import FaceDetectionDetails from './visual Evidence/faceDetectionDetails';
import EvidenceSummary from './visual Evidence/evidenceSummary';
import ImageAnalysisPanel from './visual Evidence/imageAnalysisPanel';
import OverlaySelector from './visual Evidence/overlaySelector';
import OverlaySelection from './visual Evidence/overlaySelection';
import VideoFrameAnaylsis from './visual Evidence/videoFrameAnalysis';
import ImageViewer from './visual Evidence/ImageViewer';
import OverlayRenderer from './visual Evidence/overlays/OverlayRenderer';

import { useVisualEvidence } from './visual Evidence/hooks/useVisualEvidence';
import { useFrameExtraction } from './visual Evidence/hooks/useFrameExtraction';
import { generateVisualEvidence } from './visual Evidence/utils/generateVisualEvidence';
import { API_BASE_URL } from '../utils/apiConfig';

const VisualEvidence = ({
	analysisResult,
	fileId,
	fileType,
	className = '',
}) => {
	// Use custom hook for state management
	const {
		actualFileType,
		selectedOverlay,
		setSelectedOverlay,
		zoom,
		pan,
		setPan,
		handleZoomIn,
		handleZoomOut,
		handleReset,
		handleFrameNavigation,
		handleFrameSelect,
		handleImageLoad,
		selectedFrame,
		extractedFrames,
		setExtractedFrames,
		isExtractingFrames,
		setIsExtractingFrames,
		selectedHeatmapIndex,
		setSelectedHeatmapIndex,
		imageLoaded,
		frameResults,
		suspiciousFrames,
		filteredFrames,
		imageRef,
		videoRef,
		frameCanvasRef,
		filterSuspicious,
		setFilterSuspicious,
		showFrameAnalysis,
		setShowFrameAnalysis,
		currentFrameIndex,
	} = useVisualEvidence(analysisResult, fileType);

	// Use frame extraction hook
	useFrameExtraction(
		actualFileType,
		filteredFrames,
		videoRef,
		frameCanvasRef,
		setExtractedFrames,
		setIsExtractingFrames
	);

	if (!analysisResult || !analysisResult.details) {
		return (
			<div className={`bg-gray-100 rounded-lg p-6 text-center ${className}`}>
				<AlertTriangle className='w-8 h-8 text-gray-400 mx-auto mb-2' />
				<p className='text-gray-500'>No visual evidence data available</p>
			</div>
		);
	}

	const details = analysisResult.details;
	const faceFeatures = details.face_features || {};
	const artifactAnalysis = faceFeatures.artifact_analysis || {};
	const forensicAnalysis = faceFeatures.forensic_analysis || {};

	// Generate visual evidence data
	const visualEvidence = generateVisualEvidence(
		analysisResult,
		actualFileType,
		faceFeatures,
		artifactAnalysis,
		forensicAnalysis,
		frameResults,
		suspiciousFrames
	);

	// Ensure visualEvidence has proper structure with defaults
	const safeVisualEvidence = {
		faceDetection: visualEvidence.faceDetection || {
			detected: false,
			confidence: 0,
			boundingBox: null,
		},
		artifacts: visualEvidence.artifacts || {
			borderRegions: [],
			edgeRegions: [],
			lightingRegions: [],
			textureRegions: [],
		},
		forensic: visualEvidence.forensic || {
			anomalyScores: {},
			problematicRegions: [],
		},
		frameAnalysis: visualEvidence.frameAnalysis || {
			total_frames: 0,
			fake_frames: 0,
			real_frames: 0,
			frame_results: [],
		},
		temporalAnalysis: visualEvidence.temporalAnalysis || {
			consistency_score: 0,
			motion_analysis: {},
		},
		spatialAnalysis: visualEvidence.spatialAnalysis || {
			face_regions: [],
			artifact_regions: [],
			problematic_frames: [],
		},
		heatmaps: visualEvidence.heatmaps || [],
		regions: visualEvidence.regions || [],
	};
 
	// API paths for secure asset loading
	const apiBaseUrl = API_BASE_URL;
	const baseFileUrl = fileId ? `${apiBaseUrl}/uploads/${fileId}` : null;
	const secureFileUrl = baseFileUrl || null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className={`space-y-6 ${className}`}>
			{/* Header */}
			<div className='bg-white rounded-lg shadow-lg p-6'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center space-x-2'>
						<Eye className='w-5 h-5 text-primary-600' />
						<h3 className='text-lg font-semibold text-gray-900'>
							Visual Evidence
						</h3>
					</div>
					<div className='flex items-center space-x-2'>
						<button
							onClick={handleZoomOut}
							className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded'
							title='Zoom Out'>
							<ZoomOut className='w-4 h-4' />
						</button>
						<span className='text-sm text-gray-600'>
							{Math.round(zoom * 100)}%
						</span>
						<button
							onClick={handleZoomIn}
							className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded'
							title='Zoom In'>
							<ZoomIn className='w-4 h-4' />
						</button>
						<button
							onClick={handleReset}
							className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded'
							title='Reset View'>
							<RotateCcw className='w-4 h-4' />
						</button>
					</div>
				</div>

				{/* Overlay Selection */}
				<OverlaySelection
					setSelectedOverlay={setSelectedOverlay}
					selectedOverlay={selectedOverlay}
					analysisResult={analysisResult}
					fileType={fileType}
				/>

				{/* Image Viewer */}
				<div className='relative bg-gray-100 rounded-lg overflow-hidden'>
					<div className='flex gap-4'>
						{/* Image Container */}
						<ImageViewer
							analysisResult={analysisResult}
							secureFileUrl={secureFileUrl}
							baseFileUrl={baseFileUrl}
							renderOverlay={() => (
								<OverlayRenderer
									selectedOverlay={selectedOverlay}
									actualFileType={actualFileType}
									safeVisualEvidence={safeVisualEvidence}
									analysisResult={analysisResult}
									imageRef={imageRef}
									videoRef={videoRef}
									imageLoaded={imageLoaded}
									selectedFrame={selectedFrame}
									extractedFrames={extractedFrames}
									currentFrameIndex={currentFrameIndex}
									filteredFrames={filteredFrames}
									frameResults={frameResults}
									handleFrameNavigation={handleFrameNavigation}
								/>
							)}
							extractedFrames={extractedFrames}
							selectedFrame={selectedFrame}
							handleFrameNavigation={handleFrameNavigation}
							currentFrameIndex={currentFrameIndex}
							isExtractingFrames={isExtractingFrames}
							selectedOverlay={selectedOverlay}
							safeVisualEvidence={safeVisualEvidence}
							selectedHeatmapIndex={selectedHeatmapIndex}
							onImageLoad={handleImageLoad}
							fileId={fileId}
							pan={pan}
							zoom={zoom}
							setPan={setPan}
							imageRef={imageRef}
							videoRef={videoRef}
							frameCanvasRef={frameCanvasRef}
						/>

						{/* Side Panel for Information */}
						<OverlaySelector
							selectedOverlay={selectedOverlay}
							safeVisualEvidence={safeVisualEvidence}
							analysisResult={analysisResult}
							fileType={fileType}
							selectedFrame={selectedFrame}
							setSelectedHeatmapIndex={setSelectedHeatmapIndex}
							selectedHeatmapIndex={selectedHeatmapIndex}
							handleFrameSelect={handleFrameSelect}
							isExtractingFrames={isExtractingFrames}
							visualEvidence={visualEvidence}
						/>
					</div>
				</div>

				{/* Image Analysis Panel */}
				{actualFileType === 'image' && (
					<ImageAnalysisPanel
						analysisResult={analysisResult}
						safeVisualEvidence={safeVisualEvidence}
						details={details}
					/>
				)}

				{/* Frame Analysis Panel */}
				{actualFileType === 'video' && frameResults.length > 0 && (
					<VideoFrameAnaylsis
						setFilterSuspicious={setFilterSuspicious}
						filterSuspicious={filterSuspicious}
						setShowFrameAnalysis={setShowFrameAnalysis}
						showFrameAnalysis={showFrameAnalysis}
						analysisResult={analysisResult}
						extractedFrames={extractedFrames}
						currentFrameIndex={currentFrameIndex}
					/>
				)}

				{/* Evidence Summary */}
				<div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
					<EvidenceSummary
						analysisResult={analysisResult}
						actualFileType={actualFileType}
						safeVisualEvidence={safeVisualEvidence}
					/>
				</div>

				{/* Detailed Analysis */}
				<div className='mt-4 space-y-3'>
					<h4 className='font-medium text-gray-900'>Analysis Details</h4>
					<FaceDetectionDetails safeVisualEvidence={safeVisualEvidence} />
					<HeatmapDetails safeVisualEvidence={safeVisualEvidence} />
				</div>
			</div>
		</motion.div>
	);
};

export default VisualEvidence;

