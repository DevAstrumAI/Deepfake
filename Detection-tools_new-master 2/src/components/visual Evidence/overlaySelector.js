/** @format */

import React from 'react';
import { motion } from 'framer-motion';
import {
	CheckCircle,
	XCircle,
	AlertTriangle,
	BarChart3,
	Zap,
	Square,
	Palette,
	Flame
} from 'lucide-react';

function OverlaySelector({
	selectedOverlay,
	safeVisualEvidence,
	analysisResult,
	selectedFrame,
	setSelectedHeatmapIndex,
	selectedHeatmapIndex,
}) {
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
	const formatPercentage = (value, decimals = 1) =>
		normalizePercentageValue(value).toFixed(decimals);
	// Get frame analysis data
	const frameAnalysis =
		analysisResult?.visual_evidence?.frame_analysis ||
		analysisResult?.frame_analysis ||
		{};
	const frameResults = frameAnalysis.frame_results || [];
	const suspiciousFrames = frameResults.filter(
		(frame) => frame.prediction === 'FAKE' || frame.confidence < 0.5
	);
	const gradcamHeatmaps =
		safeVisualEvidence.heatmaps?.filter(
			(h) => h.type === 'gradcam' && h.image_data
		) || [];
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
			<div className='w-full bg-white rounded-2xl shadow-xl border border-gray-200/50 p-5 flex-shrink-0 max-h-[calc(100vh-8rem)] overflow-y-auto sticky top-4'>
				{selectedOverlay === 'heatmaps' && displayHeatmap ? (
					<div className='space-y-3'>
						{/* Header */}
						<div className='bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 rounded-lg p-3 shadow-md'>
							<div className='flex items-center gap-2'>
								<div className='bg-white/20 backdrop-blur-sm rounded-lg p-1.5'>
									<Flame className='w-5 h-5 text-white' />
								</div>
								<div>
									<h4 className='text-base font-bold text-white'>
										Heatmap Analysis
									</h4>
									<p className='text-xs text-purple-100'>
										Visual detection areas
									</p>
								</div>
							</div>
						</div>

						{/* Model Info Card */}
						<div className='bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-3 shadow-sm'>
							<div className='flex items-center justify-between mb-2'>
								<div className='font-bold text-yellow-700 text-sm'>
									{displayHeatmap.model.replace('_', ' ').toUpperCase()}
								</div>
								<div
									className={`px-2 py-1 rounded-full text-xs font-bold ${
										displayHeatmap.prediction === 'FAKE'
											? 'bg-red-100 text-red-700'
											: 'bg-green-100 text-green-700'
									}`}>
									{displayHeatmap.prediction}
								</div>
							</div>
							{displayHeatmap.description && (
								<div className='text-xs text-gray-700 mt-2 bg-white/60 rounded p-2'>
									{displayHeatmap.description}
								</div>
							)}
						</div>

						{/* Legend */}
						<div className='bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-lg p-3 shadow-sm'>
							<div className='text-xs font-bold text-blue-900 mb-2 flex items-center gap-1'>
								<BarChart3 className='w-4 h-4' />
								Heatmap Legend
							</div>
							<div className='text-xs text-blue-800 space-y-1.5'>
								<div className='flex items-center gap-2 bg-white/40 rounded p-1.5'>
									<Flame className='w-4 h-4 text-red-500' />
									<span className='font-medium'>Red = High deepfake probability</span>
								</div>
								<div className='flex items-center gap-2 bg-white/40 rounded p-1.5'>
									<span className='text-blue-500 text-base'>🟦</span>
									<span className='font-medium'>Blue = Low deepfake probability</span>
								</div>
							</div>
						</div>

						{/* Model Selector */}
						{gradcamHeatmaps.length > 1 && (
							<div className='bg-gray-50 border border-gray-200 rounded-lg p-3'>
								<div className='text-xs font-bold text-gray-900 mb-2'>
									Select Model:
								</div>
								<div className='flex flex-wrap gap-2'>
									{gradcamHeatmaps.map((heatmap, idx) => (
										<button
											key={idx}
											onClick={() => setSelectedHeatmapIndex(idx)}
											className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-all duration-200 ${
												selectedHeatmapIndex === idx
													? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md scale-105'
													: 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
											}`}>
											{heatmap.model.replace('_', ' ').split(' ')[0]}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				) : selectedOverlay === 'heatmaps' ? (
					<div className='space-y-3'>
						{/* Header */}
						<div className='bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 rounded-lg p-3 shadow-md'>
							<div className='flex items-center gap-2'>
								<div className='bg-white/20 backdrop-blur-sm rounded-lg p-1.5'>
									<Flame className='w-5 h-5 text-white' />
								</div>
								<div>
									<h4 className='text-base font-bold text-white'>
										Heatmap Insights
									</h4>
									<p className='text-xs text-purple-100'>
										Detection visualization
									</p>
								</div>
							</div>
						</div>

						{/* Heatmap List */}
						{safeVisualEvidence.heatmaps.length > 0 ? (
							<div className='space-y-2'>
								{safeVisualEvidence.heatmaps.map((heatmap, idx) => (
									<div
										key={idx}
										className='bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow'>
										<div className='text-sm font-bold text-gray-900 mb-1'>
											{heatmap.description ||
												heatmap.type?.replace(/-/g, ' ') ||
												'Heatmap'}
										</div>
										{heatmap.intensity !== undefined && (
											<div className='flex items-center gap-2 mt-2'>
												<span className='text-xs text-gray-600 font-medium'>
													Intensity:
												</span>
												<span className='text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded'>
													{formatPercentage(heatmap.intensity)}%
												</span>
											</div>
										)}
									</div>
								))}
							</div>
						) : (
							<div className='bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-4 text-center shadow-sm'>
								<div className='mb-2'><BarChart3 className='w-8 h-8 text-purple-600' /></div>
								<div className='text-sm text-gray-600 font-medium'>
									No heatmap data available
								</div>
							</div>
						)}
					</div>
				) : selectedOverlay === 'temporal' ? (
					<div className='space-y-2'>
						<h4 className='text-lg font-semibold text-gray-900'>
							Temporal Analysis
						</h4>
						{safeVisualEvidence.temporalAnalysis ? (
							<>
								<div className='bg-yellow-50 p-3 rounded-lg'>
									<div className='text-sm text-yellow-900 font-semibold mb-1'>
										Consistency Score:{' '}
										{formatPercentage(
											safeVisualEvidence.temporalAnalysis.consistency_score || 0
										)}
										%
									</div>
									<div className='text-xs text-yellow-800'>
										Higher consistency suggests natural transitions between
										frames.
									</div>
								</div>
								<div className='bg-gray-50 p-3 rounded-lg text-sm text-gray-700 space-y-1'>
									<div>
										Avg Confidence:{' '}
										{`${formatPercentage(
											safeVisualEvidence.temporalAnalysis.motion_analysis
												?.average_confidence || 0
										)}%`}
									</div>
									<div>
										Confidence Variance:{' '}
										{safeVisualEvidence.temporalAnalysis.motion_analysis?.confidence_variance?.toFixed(
											3
										) || 'N/A'}
									</div>
									<div>
										Sudden Changes:{' '}
										{safeVisualEvidence.temporalAnalysis.motion_analysis
											?.sudden_changes || 0}
									</div>
									<div>
										Prediction Swaps:{' '}
										{safeVisualEvidence.temporalAnalysis.motion_analysis
											?.prediction_swaps || 0}
									</div>
								</div>
							</>
						) : (
							<div className='bg-gray-50 p-4 rounded-lg text-sm text-gray-600'>
								Temporal metrics are not available for this analysis.
							</div>
						)}
					</div>
				) : selectedOverlay === 'frame-analysis' ? (
					<div className='space-y-2'>
						<h4 className='text-lg font-semibold text-gray-900'>
							Frame Analysis
						</h4>
						<div className='bg-blue-50 p-3 rounded-lg text-sm text-blue-900 space-y-1'>
							<div>
								Total Frames:{' '}
								{safeVisualEvidence.frameAnalysis?.total_frames ||
									frameResults.length}
							</div>
							<div>
								Suspicious Frames:{' '}
								{safeVisualEvidence.frameAnalysis?.fake_frames ||
									suspiciousFrames.length}
							</div>
							<div>
								Real Frames:{' '}
								{safeVisualEvidence.frameAnalysis?.real_frames ||
									frameResults.length - suspiciousFrames.length}
							</div>
						</div>
						{frameResults.length > 0 && (
							<div className='text-xs text-gray-600'>
								Showing aggregated statistics from per-frame predictions.
							</div>
						)}
					</div>
				) : selectedOverlay === 'frame-by-frame' ? (
					<div className='space-y-2'>
						<h4 className='text-lg font-semibold text-gray-900'>
							Frame Details
						</h4>
						{selectedFrame ? (
							<div className='bg-gray-50 p-3 rounded-lg text-sm text-gray-800 space-y-1'>
								<div>Frame #: {selectedFrame.frame_number}</div>
								<div>Timestamp: {selectedFrame.timestamp?.toFixed(2)}s</div>
								<div>Prediction: {selectedFrame.prediction}</div>
								<div>
									Confidence: {formatPercentage(selectedFrame.confidence)}%
								</div>
							</div>
						) : (
							<div className='bg-gray-50 p-4 rounded-lg text-sm text-gray-600'>
								Select a frame from the list to view detailed metrics.
							</div>
						)}
					</div>
				) : selectedOverlay === 'suspicious-frames' ? (
					<div className='space-y-2'>
						<h4 className='text-lg font-semibold text-gray-900'>
							Suspicious Frames
						</h4>
						{suspiciousFrames.length > 0 ? (
							<div className='space-y-2 max-h-64 overflow-y-auto pr-2'>
								{suspiciousFrames.slice(0, 8).map((frame) => (
									<div
										key={frame.frame_number}
										className='bg-red-50 border border-red-100 p-3 rounded-lg text-sm'>
										<div className='flex justify-between text-red-900 font-semibold'>
											<span>Frame #{frame.frame_number}</span>
											<span>{formatPercentage(frame.confidence)}%</span>
										</div>
										<div className='text-xs text-red-700 mt-1'>
											{getSuspiciousReasons(frame).slice(0, 2).join(', ') ||
												'Low confidence'}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className='bg-green-50 p-4 rounded-lg text-sm text-green-700'>
								No suspicious frames detected.
							</div>
						)}
					</div>
				) : selectedOverlay === 'face-detection' ? (
					<>
						<h4 className='text-base font-bold text-gray-900 mb-2'>
							Face Detection
						</h4>
						<div className='space-y-2'>
							{safeVisualEvidence.faceDetection.detected ? (
								<div className='bg-blue-50/50 rounded-lg p-3 border border-blue-100'>
									<div className='flex items-center mb-3 bg-white/60 p-2 rounded-lg w-fit backdrop-blur-sm shadow-sm'>
										<CheckCircle className='w-5 h-5 text-blue-600 mr-2' />
										<span className='font-semibold text-blue-900'>
											Face Detected
										</span>
									</div>
									<div className='text-sm text-blue-800 space-y-3'>
										<div>
											<div className='text-xs text-blue-600 uppercase tracking-wide font-semibold mb-1'>Confidence</div>
											<div className='text-2xl font-bold text-blue-700 tracking-tight'>
												{formatPercentage(
													safeVisualEvidence.faceDetection.confidence
												)}
												<span className='text-base font-medium ml-1'>%</span>
											</div>
										</div>
										{safeVisualEvidence.faceDetection.boundingBox && (
											<div className='mt-2 pt-3 border-t border-blue-200/50 grid grid-cols-2 gap-2 text-xs'>
												<div className='bg-white/50 p-2 rounded'>
													<span className='block text-blue-500 font-medium mb-0.5 leading-none'>X</span>
													<span className='font-mono font-semibold'>{safeVisualEvidence.faceDetection.boundingBox.x}</span>
												</div>
												<div className='bg-white/50 p-2 rounded'>
													<span className='block text-blue-500 font-medium mb-0.5 leading-none'>Y</span>
													<span className='font-mono font-semibold'>{safeVisualEvidence.faceDetection.boundingBox.y}</span>
												</div>
												<div className='bg-white/50 p-2 rounded col-span-2 flex justify-between items-center'>
													<span className='text-blue-500 font-medium'>Size</span>
													<span className='font-mono font-semibold'>
														{safeVisualEvidence.faceDetection.boundingBox.width} ×{' '}
														{safeVisualEvidence.faceDetection.boundingBox.height} px
													</span>
												</div>
											</div>
										)}
									</div>
								</div>
							) : (
								<div className='bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col items-center text-center py-4'>
									<div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
										<XCircle className='w-6 h-6 text-gray-400' />
									</div>
									<span className='text-gray-900 font-medium'>No face detected</span>
									<span className='text-xs text-gray-500 mt-1 max-w-[150px]'>Try uploading a clearer image with a visible face.</span>
								</div>
							)}
						</div>
					</>
				) : selectedOverlay === 'artifacts' ? (
					<> 
						{/* Modern Header with Gradient */}
						<div className='mb-4'>
							<div className='bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 rounded-lg p-4 shadow-lg'>
								<div className='flex items-center gap-3'>
									<div className='bg-white/20 backdrop-blur-sm rounded-lg p-2'>
										<AlertTriangle className='w-5 h-5 text-white' />
									</div>
									<div>
										<h4 className='text-lg font-bold text-white'>
											Artifacts Analysis
										</h4>
										<p className='text-sm text-purple-100'>
											Detecting manipulation indicators
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Modern Info Card */}
						<div className='bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 mb-4 shadow-sm'>
							<div className='flex items-start gap-3'>
								<div className='flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-2'>
									<svg
										className='w-5 h-5 text-white'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
										/>
									</svg>
								</div>
								<div className='flex-1'>
									<h5 className='text-base font-bold text-gray-900 mb-3'>
										Understanding Artifact Scores
									</h5>
									<div className='text-sm text-gray-700 space-y-2.5'>
										<div className='flex items-start gap-2'>
											<span className='font-semibold text-indigo-600'>•</span>
											<span><strong>0-100% Scale:</strong> Higher = more natural, Lower = potential AI generation</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='font-semibold text-indigo-600'>•</span>
											<span><strong>Edge Consistency:</strong> 70-100% = natural, &lt;50% = AI-generated patterns</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='font-semibold text-indigo-600'>•</span>
											<span><strong>Border Quality:</strong> Measures face border smoothness and blending</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className='space-y-2'>
							{(() => {
								// Collect all artifacts from different sources
								const regionsArtifacts = safeVisualEvidence.regions.filter(
									(r) =>
										r.type &&
										(r.type.includes('artifact') ||
											r.type.includes('border') ||
											r.type.includes('edge'))
								);
								const borderRegions = safeVisualEvidence.artifacts.borderRegions || [];
								const edgeRegions = safeVisualEvidence.artifacts.edgeRegions || [];
								const textureRegions = safeVisualEvidence.artifacts.textureRegions || [];
								
								// Combine all artifacts
								const allArtifactsRaw = [
									...regionsArtifacts,
									...borderRegions,
									...edgeRegions,
									...textureRegions,
								];
								
								// Normalize artifact type for comparison
								const normalizeType = (type) => {
									if (!type) return '';
									const lower = type.toLowerCase();
									if (lower.includes('border')) return 'border';
									if (lower.includes('edge')) return 'edge';
									if (lower.includes('texture')) return 'texture';
									return lower;
								};
								
								// Deduplicate artifacts - keep only one per normalized type
								const seen = new Map();
								const allArtifacts = [];
								
								for (const artifact of allArtifactsRaw) {
									const normalizedType = normalizeType(artifact.type);
									
									// If we've seen this type before, skip it
									if (seen.has(normalizedType)) {
										continue;
									}
									
									// Mark this type as seen and add the artifact
									seen.set(normalizedType, true);
									allArtifacts.push(artifact);
								}

								// Helper function to get explanation for artifact types
								const getArtifactExplanation = (description, type, score) => {
									const descLower = (description || '').toLowerCase();
									const typeLower = (type || '').toLowerCase();

									if (
										descLower.includes('edge') ||
										typeLower.includes('edge')
									) {
										if (score >= 0.7) {
											return 'Natural edge patterns with smooth transitions (authentic)';
										} else if (score >= 0.5) {
											return 'Some edge inconsistencies detected (moderate risk)';
										} else {
											return 'Unnatural edge patterns detected (AI-generated indicator). Sharp edges, grid patterns, or inconsistent edge distributions suggest artificial generation.';
										}
									} else if (
										descLower.includes('border') ||
										typeLower.includes('border')
									) {
										if (score >= 0.7) {
											return 'Natural face border with smooth blending (authentic)';
										} else if (score >= 0.5) {
											return 'Some border irregularities detected (moderate risk)';
										} else {
											return 'Poor border quality detected. Uneven or artificial borders suggest manipulation or AI generation.';
										}
									} else if (
										descLower.includes('texture') ||
										typeLower.includes('texture')
									) {
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

								const getArtifactIcon = (type) => {
									const typeLower = (type || '').toLowerCase();
									if (typeLower.includes('edge')) return Zap;
									if (typeLower.includes('border')) return Square;
									if (typeLower.includes('texture')) return Palette;
									return AlertTriangle;
								};

								if (allArtifacts.length > 0) {
									return (
										<div className='grid grid-cols-1 gap-3'>
											{allArtifacts.map((region, idx) => {
												const score = region.score || 0;
												const scorePercent = formatPercentage(score);
												const isGood = score >= 0.7;
												const isModerate = score >= 0.5 && score < 0.7;
												
												// Gradient colors based on score
												const gradientBg = isGood
													? 'from-green-50 via-emerald-50 to-green-100'
													: isModerate
													? 'from-yellow-50 via-amber-50 to-yellow-100'
													: 'from-red-50 via-rose-50 to-red-100';
												
												const gradientBorder = isGood
													? 'border-green-300'
													: isModerate
													? 'border-yellow-300'
													: 'border-red-300';
												
												const gradientProgress = isGood
													? 'from-green-500 to-emerald-600'
													: isModerate
													? 'from-yellow-500 to-amber-600'
													: 'from-red-500 to-rose-600';
												
												const badgeColor = isGood
													? 'bg-green-500 text-white'
													: isModerate
													? 'bg-yellow-500 text-white'
													: 'bg-red-500 text-white';
												
												const textColor = isGood
													? 'text-green-900'
													: isModerate
													? 'text-yellow-900'
													: 'text-red-900';
												
												const iconBg = isGood
													? 'bg-green-500'
													: isModerate
													? 'bg-yellow-500'
													: 'bg-red-500';

												return (
													<motion.div
														key={idx}
														initial={{ opacity: 0, y: 10 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ delay: idx * 0.1 }}
														className={`bg-gradient-to-br ${gradientBg} border-2 ${gradientBorder} rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5`}>
														{/* Header with Icon and Badge */}
														<div className='flex flex-col mb-2'>
															<div className='flex items-start justify-between mb-2 gap-2'>
																<div className='flex items-start gap-2 flex-1 min-w-0'>
																	<div className={`${iconBg} rounded-md p-1.5 shadow-sm flex-shrink-0`}>
																		{React.createElement(getArtifactIcon(region.type), { className: 'w-4 h-4' })}
																	</div>
																	<h5 className={`font-bold text-sm ${textColor} break-words flex-1`}>
																		{region.description ||
																			region.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) ||
																			'Artifact Detected'}
																	</h5>
																</div>
																{score !== undefined && (
																	<div className={`${badgeColor} px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex-shrink-0`}>
																		{scorePercent}%
																	</div>
																)}
															</div>

															{/* Progress Bar */}
															{score !== undefined && (
																<div className='mb-1.5'>
																	<div className='h-2 bg-white/50 rounded-full overflow-hidden shadow-inner'>
																		<motion.div
																			initial={{ width: 0 }}
																			animate={{ width: `${scorePercent}%` }}
																			transition={{ duration: 1, delay: idx * 0.1 + 0.2 }}
																			className={`h-full bg-gradient-to-r ${gradientProgress} rounded-full shadow-sm`}
																		/>
																	</div>
																</div>
															)}
														</div>

														{/* Explanation - Compact */}
														{score !== undefined && (
															<div className={`text-[10px] ${textColor} opacity-90 leading-tight bg-white/40 rounded-md p-2 line-clamp-3`}>
																{getArtifactExplanation(
																	region.description,
																	region.type,
																	score
																)}
															</div>
														)}
													</motion.div>
												);
											})}
										</div>
									);
								} else {
									return (
										<div className='bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6 text-center shadow-sm'>
											<div className='text-4xl mb-3'>✨</div>
											<div className='text-gray-700 font-medium text-sm'>
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
						<h4 className='text-base font-bold text-gray-900 mb-2'>
							Forensic Analysis
						</h4>

						{/* Info box explaining percentages */}
						<div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4'>
							<div className='flex items-start'>
								<div className='flex-shrink-0'>
									<svg
										className='w-5 h-5 text-blue-600 mt-0.5'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
										/>
									</svg>
								</div>
								<div className='ml-3 flex-1'>
									<h5 className='text-sm font-semibold text-blue-900 mb-1'>
										Understanding the Scores
									</h5>
									<div className='text-xs text-blue-800 space-y-1'>
										<p>
											<strong>0-100% Scale:</strong> Higher percentages indicate
											more natural, authentic characteristics. Lower percentages
											suggest potential manipulation or AI generation.
										</p>
										<p>
											<strong>Lighting:</strong> Measures lighting consistency
											across the face. 70-100% = natural, &lt;50% = inconsistent
											(deepfake indicator).
										</p>
										<p>
											<strong>Skin:</strong> Measures skin texture naturalness.
											70-100% = natural texture, &lt;50% = unnaturally smooth
											(common in deepfakes).
										</p>
										<p>
											<strong>Edge Consistency:</strong> Measures how natural
											and uniform edges are. 70-100% = smooth natural edges,
											&lt;50% = sharp/artificial edges or grid patterns
											(AI-generated indicator).
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className='space-y-2'>
							{(() => {
								// Get forensic scores from anomalyScores
								const anomalyScores =
									safeVisualEvidence.forensic.anomalyScores || {};

								// Also check raw forensic analysis data from analysisResult
								const rawForensic =
									analysisResult?.details?.face_features?.forensic_analysis ||
									{};
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
										description:
											anomalyScores.lighting.description ||
											'Lighting consistency analysis',
										rawValue: lightingAnalysis.brightness_std,
									});
								} else if (lightingAnalysis.brightness_std !== undefined) {
									// Fallback: calculate from raw brightness_std
									const brightness_std = lightingAnalysis.brightness_std;
									let calculated_score = 0.0;
									if (brightness_std <= 40) {
										calculated_score = 1.0 - (brightness_std / 40.0) * 0.5;
									} else {
										calculated_score = Math.max(
											0.0,
											0.5 - ((brightness_std - 40) / 60.0) * 0.5
										);
									}
									forensicMetrics.push({
										key: 'lighting',
										score: calculated_score,
										description: 'Lighting consistency analysis',
										rawValue: brightness_std,
									});
								}

								// Add skin if available
								if (anomalyScores.skin) {
									const score = anomalyScores.skin.score;
									forensicMetrics.push({
										key: 'skin',
										score: score,
										description:
											anomalyScores.skin.description || 'Skin texture analysis',
										rawValue: skinAnalysis.smoothness,
									});
								} else if (skinAnalysis.smoothness !== undefined) {
									// Fallback: calculate from raw smoothness
									const smoothness = skinAnalysis.smoothness;
									const calculated_score = Math.max(
										0.0,
										Math.min(1.0, smoothness / 10.0)
									);
									forensicMetrics.push({
										key: 'skin',
										score: calculated_score,
										description: 'Skin texture analysis',
										rawValue: smoothness,
									});
								}

								// Add any other anomaly scores
								Object.entries(anomalyScores).forEach(([key, analysis]) => {
									if (
										key !== 'lighting' &&
										key !== 'skin' &&
										analysis &&
										analysis.score !== undefined
									) {
										forensicMetrics.push({
											key: key,
											score: analysis.score,
											description:
												analysis.description ||
												`${key.replace('_', ' ')} analysis`,
										});
									}
								});

								if (forensicMetrics.length > 0) {
									return (
										<div className='space-y-2'>
											{forensicMetrics.map((metric) => {
												const score = metric.score;
												const isGood = score >= 0.7;
												const isModerate = score >= 0.5 && score < 0.7;
												const bgColor = isGood
													? 'bg-green-50 border-green-200'
													: isModerate
													? 'bg-yellow-50 border-yellow-200'
													: 'bg-red-50 border-red-200';
												const textColor = isGood
													? 'text-green-900'
													: isModerate
													? 'text-yellow-900'
													: 'text-red-900';
												const scoreColor = isGood
													? 'text-green-700'
													: isModerate
													? 'text-yellow-700'
													: 'text-red-700';

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
														<div
															key={metric.key}
															className={`p-2 rounded-lg border ${bgColor}`}>
															<div
																className={`font-semibold text-xs capitalize ${textColor} mb-1`}>
																{metric.key.replace('_', ' ')}
															</div>
															{score !== undefined && !isNaN(score) && (
																<div className='mt-1'>
																	<div
																		className={`text-base font-bold ${scoreColor}`}>
																		{formatPercentage(score)}%
																	</div>
																	<div
																		className={`text-[10px] mt-0.5 ${textColor} opacity-80 line-clamp-2`}>
																		{getMetricExplanation(metric.key, score)}
																	</div>
																</div>
															)}
															{metric.rawValue !== undefined && (
																<div className='text-[10px] text-gray-500 mt-1 pt-1 border-t border-gray-200'>
																	Tech: {typeof metric.rawValue === 'number'
																		? metric.rawValue.toFixed(2)
																		: metric.rawValue}
																</div>
															)}
														</div>
													);
												})}
											</div>
									);
								} else {
									return (
										<div className='bg-gray-50 p-3 rounded-lg'>
											<div className='text-gray-600 text-sm'>
												No forensic analysis data available
											</div>
										</div>
									);
								}
							})()}
						</div>
					</>
				) : (
					<div className='text-gray-500 text-sm'>
						Select an overlay to view details
					</div>
				)}
			</div>
		</>
	);
}

export default OverlaySelector;
