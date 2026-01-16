/** @format */

import React, { useState } from 'react';
import {
	Eye,
	ZoomIn,
	ZoomOut,
	RotateCcw,
	Download,
	AlertTriangle,
	CheckCircle,
	XCircle,
	Info,
	Target,
	Layers,
	Activity,
	Play,
	Pause,
	SkipBack,
	SkipForward,
	Clock,
	Filter,
	ChevronLeft,
	ChevronRight,
	EyeOff,
	Zap,
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
			<div className='w-80 bg-white rounded-lg shadow-lg p-4 flex-shrink-0'>
				{selectedOverlay === 'heatmaps' && displayHeatmap ? (
					<>
						<h4 className='text-lg font-semibold text-gray-900 mb-4'>
							Heatmap Analysis
						</h4>
						<div className='space-y-4'>
							<div className='bg-gray-50 p-3 rounded-lg'>
								<div className='font-bold text-yellow-600 text-sm mb-2'>
									{displayHeatmap.model.replace('_', ' ').toUpperCase()}
								</div>
								<div className='text-xs text-gray-700'>
									<div className='mb-1'>
										<strong>Prediction:</strong>{' '}
										<span
											className={
												displayHeatmap.prediction === 'FAKE'
													? 'text-red-600'
													: 'text-green-600'
											}>
											{displayHeatmap.prediction}
										</span>
									</div>
									<div className='text-gray-600 mt-2'>
										{displayHeatmap.description}
									</div>
								</div>
							</div>

							<div className='bg-blue-50 p-3 rounded-lg'>
								<div className='text-xs font-semibold text-blue-900 mb-2'>
									Heatmap Legend
								</div>
								<div className='text-xs text-blue-800 space-y-1'>
									<div className='flex items-center'>
										<span className='text-red-500 mr-2'>🔥</span>
										<span>Red regions = High deepfake probability</span>
									</div>
									<div className='flex items-center'>
										<span className='text-blue-500 mr-2'>🟦</span>
										<span>Blue regions = Low deepfake probability</span>
									</div>
								</div>
							</div>

							{gradcamHeatmaps.length > 1 && (
								<div className='bg-gray-50 p-3 rounded-lg'>
									<div className='text-xs font-semibold text-gray-900 mb-2'>
										Select Model Heatmap:
									</div>
									<div className='flex flex-wrap gap-2'>
										{gradcamHeatmaps.map((heatmap, idx) => (
											<button
												key={idx}
												onClick={() => setSelectedHeatmapIndex(idx)}
												className={`px-3 py-2 text-xs rounded font-medium transition-colors ${
													selectedHeatmapIndex === idx
														? 'bg-blue-600 text-white'
														: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
												}`}>
												{heatmap.model.replace('_', ' ').split(' ')[0]}
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					</>
				) : selectedOverlay === 'heatmaps' ? (
					<div className='space-y-4'>
						<h4 className='text-lg font-semibold text-gray-900 mb-2'>
							Heatmap Insights
						</h4>
						{safeVisualEvidence.heatmaps.length > 0 ? (
							safeVisualEvidence.heatmaps.map((heatmap, idx) => (
								<div
									key={idx}
									className='bg-gray-50 p-3 rounded-lg border border-gray-100'>
									<div className='text-sm font-semibold text-gray-900'>
										{heatmap.description ||
											heatmap.type?.replace(/-/g, ' ') ||
											'Heatmap'}
									</div>
									<div className='text-xs text-gray-600 mt-1'>
										Intensity:{' '}
										{heatmap.intensity !== undefined
											? `${formatPercentage(heatmap.intensity)}%`
											: 'N/A'}
									</div>
								</div>
							))
						) : (
							<div className='bg-gray-50 p-4 rounded-lg text-sm text-gray-600'>
								No heatmap data available for this video.
							</div>
						)}
					</div>
				) : selectedOverlay === 'temporal' ? (
					<div className='space-y-4'>
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
					<div className='space-y-4'>
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
					<div className='space-y-4'>
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
					<div className='space-y-4'>
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
						<h4 className='text-lg font-semibold text-gray-900 mb-4'>
							Face Detection
						</h4>
						<div className='space-y-4'>
							{safeVisualEvidence.faceDetection.detected ? (
								<div className='bg-blue-50 p-3 rounded-lg'>
									<div className='flex items-center mb-2'>
										<CheckCircle className='w-5 h-5 text-blue-600 mr-2' />
										<span className='font-semibold text-blue-900'>
											Face Detected
										</span>
									</div>
									<div className='text-sm text-blue-800'>
										<div>
											<strong>Confidence:</strong>{' '}
											{formatPercentage(
												safeVisualEvidence.faceDetection.confidence
											)}
											%
										</div>
										{safeVisualEvidence.faceDetection.boundingBox && (
											<div className='mt-2 text-xs text-gray-600'>
												<div>
													Position: (
													{safeVisualEvidence.faceDetection.boundingBox.x},{' '}
													{safeVisualEvidence.faceDetection.boundingBox.y})
												</div>
												<div>
													Size:{' '}
													{safeVisualEvidence.faceDetection.boundingBox.width} ×{' '}
													{safeVisualEvidence.faceDetection.boundingBox.height}{' '}
													px
												</div>
											</div>
										)}
									</div>
								</div>
							) : (
								<div className='bg-gray-50 p-3 rounded-lg'>
									<div className='flex items-center'>
										<XCircle className='w-5 h-5 text-gray-400 mr-2' />
										<span className='text-gray-600'>No face detected</span>
									</div>
								</div>
							)}
						</div>
					</>
				) : selectedOverlay === 'artifacts' ? (
					<>
						<h4 className='text-lg font-semibold text-gray-900 mb-4'>
							Artifacts Analysis
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
										Understanding Artifact Scores
									</h5>
									<div className='text-xs text-blue-800 space-y-1'>
										<p>
											<strong>0-100% Scale:</strong> Higher percentages indicate
											more natural, authentic characteristics. Lower percentages
											suggest potential manipulation or AI generation.
										</p>
										<p>
											<strong>Edge Consistency:</strong> Measures how natural
											and uniform edges are. 70-100% = smooth natural edges,
											&lt;50% = sharp/artificial edges or grid patterns
											(AI-generated indicator).
										</p>
										<p>
											<strong>Border Quality:</strong> Measures face border
											smoothness. Higher values indicate natural blending with
											background.
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className='space-y-4'>
							{(() => {
								const allArtifacts = [
									...safeVisualEvidence.regions.filter(
										(r) =>
											r.type &&
											(r.type.includes('artifact') ||
												r.type.includes('border') ||
												r.type.includes('edge'))
									),
									...(safeVisualEvidence.artifacts.borderRegions || []),
									...(safeVisualEvidence.artifacts.edgeRegions || []),
									...(safeVisualEvidence.artifacts.textureRegions || []),
								];

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

								if (allArtifacts.length > 0) {
									return (
										<div className='space-y-2'>
											{allArtifacts.map((region, idx) => {
												const score = region.score;
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

												return (
													<div
														key={idx}
														className={`p-3 rounded-lg border ${bgColor}`}>
														<div
															className={`font-semibold text-sm ${textColor}`}>
															{region.description ||
																region.type ||
																'Artifact Detected'}
														</div>
														{score !== undefined && (
															<div className='mt-2'>
																<div
																	className={`text-lg font-bold ${scoreColor}`}>
																	{formatPercentage(score)}%
																</div>
																<div
																	className={`text-xs mt-1 ${textColor} opacity-80`}>
																	{getArtifactExplanation(
																		region.description,
																		region.type,
																		score
																	)}
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
										<div className='bg-gray-50 p-3 rounded-lg'>
											<div className='text-gray-600 text-sm'>
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
						<h4 className='text-lg font-semibold text-gray-900 mb-4'>
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

						<div className='space-y-4'>
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
														className={`p-3 rounded-lg border ${bgColor}`}>
														<div
															className={`font-semibold text-sm capitalize ${textColor}`}>
															{metric.key.replace('_', ' ')}
														</div>
														{score !== undefined && !isNaN(score) && (
															<div className='mt-2'>
																<div
																	className={`text-lg font-bold ${scoreColor}`}>
																	{formatPercentage(score)}%
																</div>
																<div
																	className={`text-xs mt-1 ${textColor} opacity-80`}>
																	{getMetricExplanation(metric.key, score)}
																</div>
															</div>
														)}
														{metric.rawValue !== undefined && (
															<div className='text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200'>
																Technical value:{' '}
																{typeof metric.rawValue === 'number'
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
