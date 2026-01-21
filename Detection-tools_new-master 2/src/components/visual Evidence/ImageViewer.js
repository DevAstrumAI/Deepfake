/** @format */

import React, { useState } from 'react';
import {
	AlertTriangle,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';

function ImageViewer({
	analysisResult,
	secureFileUrl,
	baseFileUrl,
	renderOverlay,
	extractedFrames,
	selectedFrame,
	handleFrameNavigation,
	currentFrameIndex,
	isExtractingFrames,
	selectedOverlay,
	fileType,
	safeVisualEvidence,
	selectedHeatmapIndex,
	visualEvidence,
	onImageLoad,
	fileId,
	pan,
	zoom,
	setPan,
	imageRef,
	videoRef,
	frameCanvasRef,
}) {
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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

	const actualFileType = analysisResult?.type || fileType;
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

	const formatPercentage = (value, decimals = 1) =>
		normalizePercentageValue(value).toFixed(decimals);

	// Calculate display heatmap for image replacement
	const gradcamHeatmaps =
		safeVisualEvidence.heatmaps?.filter(
			(h) => h.type === 'gradcam' && h.image_data
		) || [];

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

	const displayHeatmap =
		gradcamHeatmaps.length > 0
			? gradcamHeatmaps[
					selectedHeatmapIndex >= 0 &&
					selectedHeatmapIndex < gradcamHeatmaps.length
						? selectedHeatmapIndex
						: 0
			  ]
			: null;

	return (
		<>
			<div className='flex-1 relative overflow-visible flex items-start justify-start p-0 m-0 min-h-0'>
				{actualFileType === 'video' ? (
					<>
						<div className='relative w-full'>
							<video
								ref={videoRef}
								src={secureFileUrl || baseFileUrl || undefined}
								className='w-full h-auto max-h-96 object-contain rounded-lg shadow-lg'
								controls
								muted
								crossOrigin='anonymous'
								preload='metadata'
								playsInline
								draggable={false}
								onError={(e) => {
									console.error(
										'Video failed to load for visual evidence viewer',
										e
									);
								}}>
								Your browser does not support the video tag.
							</video>
							<div className='absolute inset-0 pointer-events-none'>
								{renderOverlay()}
							</div>
						</div>
						{/* Hidden canvas for frame extraction */}
						<canvas ref={frameCanvasRef} style={{ display: 'none' }} />
						{/* Frame display area */}
						{extractedFrames.length > 0 && selectedFrame && (
							<div className='mt-4 bg-gray-100 rounded-lg p-4'>
								<div className='flex items-center justify-between mb-4'>
									<h4 className='text-lg font-semibold text-gray-900'>
										Current Frame
									</h4>
									<div className='flex items-center space-x-2'>
										<button
											onClick={() => handleFrameNavigation('prev')}
											disabled={currentFrameIndex === 0}
											className='p-2 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white'>
											<ChevronLeft className='w-4 h-4' />
										</button>
										<span className='text-sm text-gray-600'>
											Frame {currentFrameIndex + 1} of {extractedFrames.length}
										</span>
										<button
											onClick={() => handleFrameNavigation('next')}
											disabled={
												currentFrameIndex === extractedFrames.length - 1
											}
											className='p-2 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white'>
											<ChevronRight className='w-4 h-4' />
										</button>
									</div>
								</div>
								<div className='relative'>
									<img
										key={`frame-${selectedFrame.frame_number}-${currentFrameIndex}`}
										src={selectedFrame.imageData}
										alt={`Frame ${selectedFrame.frame_number}`}
										className='w-full h-auto max-h-64 object-contain rounded border'
										loading='eager'
									/>
									{/* Frame analysis overlay */}
									<div className='absolute top-2 left-2 bg-black bg-opacity-75 text-white p-2 rounded text-sm'>
										<div>Frame #{selectedFrame.frame_number}</div>
										<div>Time: {selectedFrame.timestamp?.toFixed(2)}s</div>
										<div
											className={`px-2 py-1 rounded text-xs mt-1 ${
												selectedFrame.prediction === 'FAKE'
													? 'bg-red-500'
													: 'bg-green-500'
											}`}>
											{selectedFrame.prediction} (
											{formatPercentage(selectedFrame.confidence)}%)
										</div>
									</div>
									{/* Face detection overlay */}
									{selectedFrame.face_detection?.detected &&
										selectedFrame.face_detection.bounding_box && (
											<div
												className='absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20'
												style={{
													left: selectedFrame.face_detection.bounding_box.x,
													top: selectedFrame.face_detection.bounding_box.y,
													width:
														selectedFrame.face_detection.bounding_box.width,
													height:
														selectedFrame.face_detection.bounding_box.height,
												}}>
												<div className='absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 text-xs rounded'>
													Face (
													{formatPercentage(
														selectedFrame.face_detection.confidence
													)}
													%)
												</div>
											</div>
										)}
								</div>

								{/* Suspicious Reasons */}
								{selectedFrame.prediction === 'FAKE' && (
									<div className='mt-4 bg-red-50 border border-red-200 rounded-lg p-3'>
										<div className='flex items-center space-x-2 mb-2'>
											<AlertTriangle className='w-4 h-4 text-red-600' />
											<span className='text-sm font-medium text-red-900'>
												Suspicious Reasons:
											</span>
										</div>
										<ul className='text-xs text-red-700 space-y-1'>
											{getSuspiciousReasons(selectedFrame).map(
												(reason, index) => (
													<li key={index} className='flex items-start'>
														<span className='text-red-500 mr-1'>•</span>
														<span>{reason}</span>
													</li>
												)
											)}
										</ul>
									</div>
								)}
							</div>
						)}
						{isExtractingFrames && (
							<div className='mt-4 bg-blue-50 p-4 rounded-lg'>
								<div className='flex items-center space-x-2'>
									<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
									<span className='text-blue-600'>Extracting frames...</span>
								</div>
							</div>
						)}
					</>
				) : (
					<div
						className='relative flex items-center justify-center p-4 m-0 w-full'
						style={{ position: 'relative', marginBottom: 0 }}>
						{/* Stylish Image Container with Glow Effect */}
						<div className='relative group w-full max-w-full'>
							{/* Glow effect behind image */}
							<div className='absolute inset-0 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-purple-400/30 rounded-3xl blur-3xl group-hover:blur-[40px] transition-all duration-500 -z-10 scale-110'></div>
							
							{/* Image with stylish border and shadow */}
							<div className='relative bg-white rounded-3xl p-4 shadow-2xl border-4 border-white/80 backdrop-blur-sm'>
								{/* Image Container - Relative positioning for overlays */}
								<div className='relative w-full h-auto'>
									<img
										ref={imageRef}
										src={
											// Use base64 image from visual_evidence if available, otherwise try to fetch
											visualEvidence?.image_data ||
											analysisResult?.visual_evidence?.image_data ||
											secureFileUrl ||
											baseFileUrl
										}
										alt='Analysis target'
										className='w-full h-auto max-h-[600px] object-contain cursor-move block rounded-2xl shadow-xl relative z-0'
										draggable={false}
										style={{
											transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${
												pan.y / zoom
											}px)`,
											transformOrigin: 'center center',
											display: 'block',
										}}
										onMouseDown={handleMouseDown}
										onMouseMove={handleMouseMove}
										onMouseUp={handleMouseUp}
										onMouseLeave={handleMouseUp}
										onLoad={() => {
											console.log('Image loaded successfully');
											if (!imageRef.current) return;

											const img = imageRef.current;
											const container = img.parentElement?.parentElement?.parentElement;
											if (!container) return;

											const containerRect = container.getBoundingClientRect();

											onImageLoad({
												naturalWidth: img.naturalWidth,
												naturalHeight: img.naturalHeight,
												containerWidth: containerRect.width,
												containerHeight: containerRect.height,
											});
										}}
										onError={(e) => {
											console.error('Image load error:', e);
											// Try to load using fetch with auth headers as fallback
											const token = localStorage.getItem('auth_token');
											if (token && fileId) {
												const fetchUrl = secureFileUrl || baseFileUrl;
												if (fetchUrl) {
													fetch(fetchUrl, {
														headers: {
															Authorization: `Bearer ${token}`,
														},
													})
														.then((response) => {
															if (response.ok) {
																return response.blob();
															}
															throw new Error('Failed to load image');
														})
														.then((blob) => {
															const url = URL.createObjectURL(blob);
															if (imageRef.current) {
																imageRef.current.src = url;
															}
														})
														.catch((err) => {
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
									
									{/* Heatmap overlay - positioned exactly over the image */}
									{selectedOverlay === 'heatmaps' &&
										displayHeatmap &&
										displayHeatmap.image_data && (
											<img
												src={displayHeatmap.image_data}
												alt='Grad-CAM Heatmap Overlay'
												className='absolute top-0 left-0 w-full h-full object-contain pointer-events-none rounded-2xl'
												style={{
													mixBlendMode: 'multiply',
													opacity: 0.7,
													zIndex: 2,
													transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${
														pan.y / zoom
													}px)`,
													transformOrigin: 'center center',
												}}
											/>
										)}
									
									{/* Overlay container for face detection, artifacts, etc. - Above heatmap */}
									<div
										className='absolute top-0 left-0 w-full h-full pointer-events-none'
										style={{ 
											zIndex: 20,
											transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${
												pan.y / zoom
											}px)`,
											transformOrigin: 'center center',
										}}>
										{renderOverlay()}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}

export default ImageViewer;
