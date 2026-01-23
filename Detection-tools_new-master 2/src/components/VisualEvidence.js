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
			className={`${className}`}>
			{/* Compact Modern Header */}
			<div className='bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl shadow-lg p-3 mb-0'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<div className='bg-white/20 backdrop-blur-sm rounded-lg p-1.5'>
							<Eye className='w-4 h-4 text-white' />
						</div>
						<h3 className='text-base font-bold text-white'>
							Visual Evidence
						</h3>
					</div>
					<div className='flex items-center gap-1'>
						<button
							onClick={handleZoomOut}
							className='p-1.5 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all'
							title='Zoom Out'>
							<ZoomOut className='w-3.5 h-3.5' />
						</button>
						<span className='text-xs font-semibold text-white/90 px-1.5'>
							{Math.round(zoom * 100)}%
						</span>
						<button
							onClick={handleZoomIn}
							className='p-1.5 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all'
							title='Zoom In'>
							<ZoomIn className='w-3.5 h-3.5' />
						</button>
						<button
							onClick={handleReset}
							className='p-1.5 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all ml-1'
							title='Reset View'>
							<RotateCcw className='w-3.5 h-3.5' />
						</button>
					</div>
					</div>
				</div>

			{/* Main Content Container */}
			<div className='bg-white rounded-b-xl shadow-lg border border-gray-100'>
				{/* Overlay Selection - Compact */}
				<div className='px-3 pt-3 pb-2 border-b border-gray-100'>
				<OverlaySelection
					setSelectedOverlay={setSelectedOverlay}
					selectedOverlay={selectedOverlay}
					analysisResult={analysisResult}
					fileType={fileType}
				/>
				</div>

				{/* Image Viewer - Side-by-Side Stylish Layout */}
				<div className='relative bg-gradient-to-br from-gray-50 via-purple-50/20 to-gray-50 overflow-visible'>
					<div className='flex flex-col lg:flex-row gap-6 p-6 items-start'>
						{/* Image Container - Left Side */}
						<div className='flex-1 flex justify-center items-center min-w-0'>
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
									selectedHeatmapIndex={selectedHeatmapIndex}
									suspiciousFrames={suspiciousFrames}
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
						</div>

						{/* Side Panel for Information - Right Side */}
						<div className='w-full lg:w-[500px] flex-shrink-0'>
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
				</div>

				{/* Compact Analysis Panels */}
				{actualFileType === 'image' && (
					<div className='px-3 pb-3 pt-2 border-t border-gray-100'>
					<ImageAnalysisPanel
						analysisResult={analysisResult}
						safeVisualEvidence={safeVisualEvidence}
						details={details}
					/>
					</div>
				)}

				{actualFileType === 'video' && frameResults.length > 0 && (
					<div className='px-3 pb-3 pt-2 border-t border-gray-100'>
					<VideoFrameAnaylsis
						setFilterSuspicious={setFilterSuspicious}
						filterSuspicious={filterSuspicious}
						setShowFrameAnalysis={setShowFrameAnalysis}
						showFrameAnalysis={showFrameAnalysis}
						analysisResult={analysisResult}
						extractedFrames={extractedFrames}
						currentFrameIndex={currentFrameIndex}
					/>
					</div>
				)}

				{/* Compact Evidence Summary */}
				<div className='px-6 pb-6 pt-4 border-t border-gray-100'>
					<EvidenceSummary
						analysisResult={analysisResult}
						actualFileType={actualFileType}
						safeVisualEvidence={safeVisualEvidence}
					/>
				</div>

				{/* Compact Detailed Analysis */}
				<div className='px-3 pb-3 pt-2 border-t border-gray-100'>
					<h4 className='text-sm font-semibold text-gray-900 mb-2'>Analysis Details</h4>
					<div className='space-y-2'>
					<FaceDetectionDetails safeVisualEvidence={safeVisualEvidence} />
					<HeatmapDetails safeVisualEvidence={safeVisualEvidence} />
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default VisualEvidence;

