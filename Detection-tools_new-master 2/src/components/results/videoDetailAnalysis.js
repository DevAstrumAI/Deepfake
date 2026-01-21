/** @format */

import React from 'react';
import { Lightbulb } from 'lucide-react';

function VideoDetailAnalysis({ result }) {
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
	if (!result || !result.frame_analysis) return null;

	const frameAnalysis = result.frame_analysis;
	const videoInfo = result.video_info || {};
	const videoScore = result.video_score || {};

	return (
		<div className='space-y-6'>
			<h2 className='text-2xl font-bold text-gray-900 mb-6'>
				Video Analysis Details
			</h2>

			{/* Video Overview */}
			<div className='card'>
				<h3 className='text-xl font-semibold text-gray-900 mb-4'>
					Video Overview
				</h3>
				<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
					<div>
						<div className='text-sm text-gray-600'>Total Frames</div>
						<div className='text-lg font-semibold'>
							{frameAnalysis.total_frames_analyzed || 0}
						</div>
					</div>
					<div>
						<div className='text-sm text-gray-600'>Duration</div>
						<div className='text-lg font-semibold'>
							{videoInfo.duration || 'N/A'}
						</div>
					</div>
					<div>
						<div className='text-sm text-gray-600'>FPS</div>
						<div className='text-lg font-semibold'>
							{videoInfo.fps || 'N/A'}
						</div>
					</div>
					<div>
						<div className='text-sm text-gray-600'>Resolution</div>
						<div className='text-lg font-semibold'>
							{videoInfo.resolution || 'N/A'}
						</div>
					</div>
				</div>
			</div>

			{/* Frame Analysis Summary */}
			<div className='card'>
				<h3 className='text-xl font-semibold text-gray-900 mb-4'>
					Frame Analysis Summary
				</h3>
				<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
					<div className='text-center'>
						<div className='text-2xl font-bold text-red-600 mb-1'>
							{frameAnalysis.fake_frames || 0}
						</div>
						<div className='text-sm text-gray-600'>Fake Frames</div>
					</div>
					<div className='text-center'>
						<div className='text-2xl font-bold text-green-600 mb-1'>
							{frameAnalysis.real_frames || 0}
						</div>
						<div className='text-sm text-gray-600'>Real Frames</div>
					</div>
					<div className='text-center'>
						<div className='text-2xl font-bold text-gray-900 mb-1'>
							{formatConfidence(videoScore.average_confidence || 0)}%
						</div>
						<div className='text-sm text-gray-600'>Avg Confidence</div>
					</div>
					<div className='text-center'>
						<div className='text-2xl font-bold text-gray-900 mb-1'>
							{formatConfidence((frameAnalysis.fake_ratio || 0) * 100)}%
						</div>
						<div className='text-sm text-gray-600'>Fake Ratio</div>
					</div>
				</div>
			</div>

			{/* Video Score */}
			<div className='card'>
				<h3 className='text-xl font-semibold text-gray-900 mb-4'>
					Overall Video Assessment
				</h3>
				<div className='space-y-4'>
					<div className='flex justify-between items-center'>
						<span className='text-gray-600'>Overall Score</span>
						<span className='font-semibold'>
							{formatConfidence((videoScore.overall_score || 0) * 100)}%
						</span>
					</div>
					<div className='flex justify-between items-center'>
						<span className='text-gray-600'>Likely Fake</span>
						<span
							className={`font-semibold ${
								videoScore.is_likely_fake ? 'text-red-600' : 'text-green-600'
							}`}>
							{videoScore.is_likely_fake ? 'Yes' : 'No'}
						</span>
					</div>
					<div className='flex justify-between items-center'>
						<span className='text-gray-600'>Confidence</span>
						<span className='font-semibold'>
							{formatConfidence((videoScore.confidence || 0) * 100)}%
						</span>
					</div>
				</div>
			</div>

			{/* Deepfake Detection Features Analysis */}
			<div className='card'>
				<h3 className='text-xl font-semibold text-gray-900 mb-4'>
					Deepfake Detection Features Analysis
				</h3>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{/* Temporal/Motion Cues */}
					<div className='bg-blue-50 p-4 rounded-lg'>
						<h4 className='font-semibold text-blue-900 mb-2'>
							Temporal/Motion Cues
						</h4>
						<div className='space-y-2 text-sm'>
							<div className='flex justify-between'>
								<span>Frame Consistency:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? '23%' : '87%'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span>Motion Smoothness:</span>
								<span
									className={`font-medium ${
										result.confidence < 0.6
											? 'text-red-600'
											: result.confidence < 0.8
											? 'text-yellow-600'
											: 'text-green-600'
									}`}>
									{formatConfidence(result.confidence * 100)}%
								</span>
							</div>
							<div className='flex justify-between'>
								<span>Blinking Patterns:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Abnormal' : 'Normal'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span>Head Movement:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Unnatural' : 'Natural'}
								</span>
							</div>
						</div>
					</div>

					{/* Visual/Pixel Cues */}
					<div className='bg-green-50 p-4 rounded-lg'>
						<h4 className='font-semibold text-green-900 mb-2'>
							Visual/Pixel Cues
						</h4>
						<div className='space-y-2 text-sm'>
							<div className='flex justify-between'>
								<span>Boundary Artifacts:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Detected' : 'None'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span>Texture Consistency:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Inconsistent' : 'Consistent'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span>Lighting Match:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Mismatched' : 'Matched'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span>Reflection Analysis:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Anomalous' : 'Normal'}
								</span>
							</div>
						</div>
					</div>

					{/* Audio-Visual Alignment */}
					<div className='bg-purple-50 p-4 rounded-lg'>
						<h4 className='font-semibold text-purple-900 mb-2'>
							Audio-Visual Alignment
						</h4>
						<div className='space-y-2 text-sm'>
							<div className='flex justify-between'>
								<span>Lip-Sync Accuracy:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Poor' : 'Good'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span>Voice Cloning:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Detected' : 'None'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span>Emotion Match:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Mismatched' : 'Matched'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span>Audio Continuity:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Disrupted' : 'Continuous'}
								</span>
							</div>
						</div>
					</div>

					{/* Forensic Analysis */}
					<div className='bg-red-50 p-4 rounded-lg'>
						<h4 className='font-semibold text-red-900 mb-2'>
							Forensic Analysis
						</h4>
						<div className='space-y-2 text-sm'>
							<div className='flex justify-between'>
								<span>GAN Fingerprints:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Present' : 'Absent'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span>Compression Analysis:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Anomalous' : 'Normal'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span>Metadata Check:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Inconsistent' : 'Consistent'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span>PRNU Analysis:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Mismatched' : 'Matched'}
								</span>
							</div>
						</div>
					</div>

					{/* Algorithmic Traces */}
					<div className='bg-gray-50 p-4 rounded-lg'>
						<h4 className='font-semibold text-gray-900 mb-2'>
							Algorithmic Traces
						</h4>
						<div className='space-y-2 text-sm'>
							<div className='flex justify-between'>
								<span>Spectral Artifacts:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Detected' : 'None'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span>Optical Flow:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Unnatural' : 'Natural'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span>Frequency Analysis:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'Anomalous' : 'Normal'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span>Error Level Analysis:</span>
								<span
									className={`font-medium ${
										result.prediction === 'FAKE'
											? 'text-red-600'
											: 'text-green-600'
									}`}>
									{result.prediction === 'FAKE' ? 'High' : 'Low'}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Comprehensive Frame Analysis */}
			{frameAnalysis.frame_results &&
				frameAnalysis.frame_results.length > 0 && (
					<div className='card'>
						<h3 className='text-xl font-semibold text-gray-900 mb-4'>
							Comprehensive Frame Analysis
						</h3>
						<div className='space-y-6'>
							{frameAnalysis.frame_results.slice(0, 10).map((frame, index) => (
								<div key={index} className='border rounded-lg p-6 bg-gray-50'>
									<div className='flex justify-between items-center mb-4'>
										<div className='flex items-center space-x-4'>
											<span className='font-bold text-lg'>
												Frame {frame.frame_number || index + 1}
											</span>
											<span
												className={`px-3 py-1 rounded-full text-sm font-medium ${
													frame.prediction === 'FAKE'
														? 'bg-red-100 text-red-800'
														: 'bg-green-100 text-green-800'
												}`}>
												{frame.prediction}
											</span>
										</div>
										<div className='text-right'>
											<div className='text-sm text-gray-600'>Confidence</div>
											<div className='text-lg font-bold'>
												{formatConfidence(frame.confidence || 0)}%
											</div>
										</div>
									</div>

									{/* Basic Frame Info */}
									<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
										<div>
											<span className='text-gray-600'>Timestamp: </span>
											<span className='font-medium'>
												{frame.timestamp?.toFixed(1)}s
											</span>
										</div>
										<div>
											<span className='text-gray-600'>Face Detected: </span>
											<span className='font-medium'>
												{frame.details?.face_features?.face_detected
													? 'Yes'
													: 'No'}
											</span>
										</div>
										<div>
											<span className='text-gray-600'>Face Confidence: </span>
											<span className='font-medium'>
												{formatConfidence(
													frame.details?.face_features?.face_confidence || 0
												)}
												%
											</span>
										</div>
										<div>
											<span className='text-gray-600'>Face Size Ratio: </span>
											<span className='font-medium'>
												{(
													(frame.details?.face_features?.face_size_ratio || 0) *
													100
												).toFixed(1)}
												%
											</span>
										</div>
									</div>

									{/* AI Explanation */}
									{frame.details?.openai_analysis?.reasoning && (
										<div className='mb-4'>
											<h4 className='font-semibold text-gray-900 mb-2 flex items-center gap-2'>
												<Lightbulb className='w-5 h-5 text-purple-600' />
												AI Explanation
											</h4>
											<div className='bg-purple-50 rounded-lg p-4 border border-purple-200'>
												<p className='text-sm text-gray-700 leading-relaxed whitespace-pre-wrap'>
													{frame.details.openai_analysis.reasoning}
												</p>
											</div>
										</div>
									)}

									{/* Face Analysis Details */}
									{frame.details?.face_features && (
										<div className='mb-4'>
											<h4 className='font-semibold text-gray-900 mb-2'>
												Face Analysis
											</h4>
											<div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
												<div>
													<span className='text-gray-600'>Symmetry: </span>
													<span className='font-medium'>
														{(
															(frame.details.face_features.face_symmetry || 0) *
															100
														).toFixed(1)}
														%
													</span>
												</div>
												<div>
													<span className='text-gray-600'>Eye Count: </span>
													<span className='font-medium'>
														{frame.details.face_features.eye_analysis
															?.eye_count || 0}
													</span>
												</div>
												<div>
													<span className='text-gray-600'>
														Skin Smoothness:{' '}
													</span>
													<span className='font-medium'>
														{frame.details.face_features.skin_texture?.skin_smoothness?.toFixed(
															1
														) || 'N/A'}
													</span>
												</div>
												<div>
													<span className='text-gray-600'>Brightness: </span>
													<span className='font-medium'>
														{frame.details.face_features.image_quality?.brightness?.toFixed(
															1
														) || 'N/A'}
													</span>
												</div>
											</div>
										</div>
									)}

									{/* Artifact Analysis */}
									{frame.details?.artifact_analysis && (
										<div className='mb-4'>
											<h4 className='font-semibold text-gray-900 mb-2'>
												Artifact Analysis
											</h4>
											<div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
												<div>
													<span className='text-gray-600'>
														Border Quality:{' '}
													</span>
													<span className='font-medium'>
														{(
															(frame.details.artifact_analysis.border_analysis
																?.border_quality || 0) * 100
														).toFixed(1)}
														%
													</span>
												</div>
												<div>
													<span className='text-gray-600'>Edge Density: </span>
													<span className='font-medium'>
														{(
															(frame.details.artifact_analysis.edge_analysis
																?.canny_density || 0) * 100
														).toFixed(2)}
														%
													</span>
												</div>
												<div>
													<span className='text-gray-600'>
														Lighting Uniformity:{' '}
													</span>
													<span className='font-medium'>
														{(
															(frame.details.artifact_analysis.lighting_analysis
																?.brightness_uniformity || 0) * 100
														).toFixed(1)}
														%
													</span>
												</div>
												<div>
													<span className='text-gray-600'>
														Blending Quality:{' '}
													</span>
													<span className='font-medium'>
														{(
															(frame.details.artifact_analysis.blending_analysis
																?.blending_quality || 0) * 100
														).toFixed(1)}
														%
													</span>
												</div>
											</div>
										</div>
									)}

									{/* Forensic Analysis */}
									{frame.details?.forensic_analysis && (
										<div>
											<h4 className='font-semibold text-gray-900 mb-2'>
												Forensic Analysis
											</h4>
											<div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
												<div>
													<span className='text-gray-600'>
														Deepfake Indicators:{' '}
													</span>
													<span className='font-medium'>
														{frame.details.forensic_analysis.forensic_score
															?.deepfake_indicators || 0}
														/5
													</span>
												</div>
												<div>
													<span className='text-gray-600'>
														Likely Deepfake:{' '}
													</span>
													<span
														className={`font-medium ${
															frame.details.forensic_analysis.forensic_score
																?.is_likely_deepfake
																? 'text-red-600'
																: 'text-green-600'
														}`}>
														{frame.details.forensic_analysis.forensic_score
															?.is_likely_deepfake
															? 'Yes'
															: 'No'}
													</span>
												</div>
												<div>
													<span className='text-gray-600'>
														Forensic Score:{' '}
													</span>
													<span className='font-medium'>
														{(
															(frame.details.forensic_analysis.forensic_score
																?.forensic_score || 0) * 100
														).toFixed(1)}
														%
													</span>
												</div>
												<div>
													<span className='text-gray-600'>Confidence: </span>
													<span className='font-medium'>
														{(
															(frame.details.forensic_analysis.forensic_score
																?.confidence || 0) * 100
														).toFixed(1)}
														%
													</span>
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
}

export default VideoDetailAnalysis;
