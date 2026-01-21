/** @format */

import React from 'react';
import { formatPercentage } from '../utils/visualEvidenceUtils';

const ForensicOverlay = ({ safeVisualEvidence, analysisResult }) => {
	console.log(
		'renderForensicOverlay - safeVisualEvidence.forensic:',
		safeVisualEvidence.forensic
	);

	return (
		<div className='absolute inset-0 pointer-events-none flex items-center justify-center'>
			<div className='relative'>
				{/* Enhanced Forensic analysis indicators */}
				{Object.entries(safeVisualEvidence.forensic.anomalyScores || {}).map(
					([key, analysis]) => {
						if (analysis && analysis.score !== undefined) {
							const hasIssues = analysis.score < 0.7;
							const severity =
								analysis.score < 0.3
									? 'high'
									: analysis.score < 0.5
									? 'medium'
									: 'low';
							const color =
								severity === 'high'
									? '#ef4444'
									: severity === 'medium'
									? '#f59e0b'
									: '#22c55e';

							if (hasIssues && safeVisualEvidence.faceDetection.boundingBox) {
								const bbox = safeVisualEvidence.faceDetection.boundingBox;
								return (
									<div
										key={key}
										className='absolute group'
										style={{
											left: bbox.x - 200,
											top: bbox.y - 150,
											width: bbox.width,
											height: bbox.height,
											zIndex: 15,
											pointerEvents: 'none',
										}}>
										<div
											className='absolute -top-8 left-0 text-sm font-bold cursor-help'
											style={{ color: color }}
											title={`${key.replace('_', ' ').toUpperCase()}: ${
												analysis.score < 0.3
													? 'High risk of artificial manipulation'
													: analysis.score < 0.5
													? 'Medium risk detected'
													: 'Low risk - appears authentic'
											}`}>
											{key.replace('_', ' ').toUpperCase()}:{' '}
											{formatPercentage(analysis.score)}%
										</div>

										<div
											className='absolute -top-40 left-0 bg-black bg-opacity-95 text-white px-4 py-3 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-xl'
											style={{ minWidth: '280px', maxWidth: '320px' }}>
											<div className='font-bold mb-2 text-sm'>
												{key.replace('_', ' ').toUpperCase()} ANALYSIS
											</div>
											<div className='text-gray-200 mb-2'>
												<div className='font-semibold mb-1'>
													Score: {formatPercentage(analysis.score)}%
												</div>
												<div className='text-gray-300 text-xs leading-relaxed'>
													{analysis.score < 0.3
														? 'High risk detected'
														: analysis.score < 0.5
														? 'Medium risk detected'
														: 'Low risk - appears authentic'}
												</div>
											</div>
										</div>
									</div>
								);
							}
						}
						return null;
					}
				)}

				{/* Forensic analysis summary overlay */}
				<div
					className='absolute bg-black bg-opacity-90 text-white px-4 py-3 rounded-lg'
					style={{
						top: -300,
						left: -250,
						zIndex: 20,
						minWidth: '300px',
						maxWidth: '350px',
					}}>
					<div className='text-sm font-bold mb-3 text-center'>
						FORENSIC ANALYSIS
					</div>
					<div className='text-xs space-y-2'>
						{Object.entries(
							safeVisualEvidence.forensic.anomalyScores || {}
						).map(([key, analysis]) => {
							if (analysis && analysis.score !== undefined) {
								const severity =
									analysis.score < 0.3
										? 'HIGH RISK'
										: analysis.score < 0.5
										? 'MEDIUM RISK'
										: 'LOW RISK';
								const color =
									analysis.score < 0.3
										? '#ef4444'
										: analysis.score < 0.5
										? '#f59e0b'
										: '#22c55e';

								return (
									<div
										key={key}
										className='border-b border-gray-600 pb-2 last:border-b-0'>
										<div className='flex justify-between items-center mb-1'>
											<span className='font-semibold'>
												{key.replace('_', ' ').toUpperCase()}:
											</span>
											<span style={{ color }} className='font-bold'>
												{severity} ({formatPercentage(analysis.score)}%)
											</span>
										</div>
									</div>
								);
							}
							return null;
						})}

						<div className='mt-3 pt-2 border-t border-gray-600'>
							<div className='text-center'>
								<div className='text-xs text-gray-400 mb-1'>
									OVERALL FORENSIC CONCLUSION
								</div>
								<div className='text-sm font-bold'>
									{analysisResult.prediction === 'FAKE'
										? 'Multiple forensic anomalies detected'
										: 'Forensic analysis consistent with authentic image'}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ForensicOverlay;

