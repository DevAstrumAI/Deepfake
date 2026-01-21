/** @format */

import React from 'react';
import { Layers, Activity, AlertCircle } from 'lucide-react';

function HeatmapDetails({ safeVisualEvidence }) {
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

	// Helper function to get quality status
	const getQualityStatus = (value) => {
		const percentage = normalizePercentageValue(value);
		if (percentage >= 70) return { label: 'Good', color: 'green' };
		if (percentage >= 40) return { label: 'Moderate', color: 'yellow' };
		return { label: 'Poor', color: 'red' };
	};

	return (
		<div className='space-y-4'>
			{/* Artifact Quality Metrics */}
			{safeVisualEvidence.artifacts.borderAnalysis?.border_quality !==
				undefined && (
				<div className='bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200'>
					<div className='flex items-center gap-3 mb-5'>
						<div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-2.5 rounded-xl'>
							<Activity className='w-5 h-5 text-blue-600' />
						</div>
						<div>
							<h4 className='text-base font-bold text-gray-900'>
								Quality Metrics
							</h4>
							<p className='text-xs text-gray-500 mt-0.5'>
								Border and edge analysis results
							</p>
						</div>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{/* Border Quality */}
						<div className='bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200/50'>
							<div className='flex items-center justify-between mb-2'>
								<span className='text-xs font-semibold text-gray-600 uppercase tracking-wider'>
									Border Quality
								</span>
								{(() => {
									const status = getQualityStatus(
										safeVisualEvidence.artifacts.borderAnalysis.border_quality
									);
									return (
										<span
											className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
												status.color === 'green'
													? 'bg-green-100 text-green-700'
													: status.color === 'yellow'
													? 'bg-yellow-100 text-yellow-700'
													: 'bg-red-100 text-red-700'
											}`}>
											{status.label}
										</span>
									);
								})()}
							</div>
							<div className='text-2xl font-bold text-gray-900'>
								{formatPercentage(
									safeVisualEvidence.artifacts.borderAnalysis.border_quality
								)}
								%
							</div>
							<div className='mt-2 bg-gray-200 rounded-full h-1.5 overflow-hidden'>
								<div
									className={`h-full rounded-full transition-all duration-500 ${
										normalizePercentageValue(
											safeVisualEvidence.artifacts.borderAnalysis.border_quality
										) >= 70
											? 'bg-green-500'
											: normalizePercentageValue(
													safeVisualEvidence.artifacts.borderAnalysis
														.border_quality
											  ) >= 40
											? 'bg-yellow-500'
											: 'bg-red-500'
									}`}
									style={{
										width: `${formatPercentage(
											safeVisualEvidence.artifacts.borderAnalysis.border_quality
										)}%`,
									}}></div>
							</div>
						</div>

						{/* Edge Uniformity */}
						<div className='bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200/50'>
							<div className='flex items-center justify-between mb-2'>
								<span className='text-xs font-semibold text-gray-600 uppercase tracking-wider'>
									Edge Uniformity
								</span>
								{(() => {
									const status = getQualityStatus(
										safeVisualEvidence.artifacts.edgeAnalysis?.edge_uniformity || 0
									);
									return (
										<span
											className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
												status.color === 'green'
													? 'bg-green-100 text-green-700'
													: status.color === 'yellow'
													? 'bg-yellow-100 text-yellow-700'
													: 'bg-red-100 text-red-700'
											}`}>
											{status.label}
										</span>
									);
								})()}
							</div>
							<div className='text-2xl font-bold text-gray-900'>
								{formatPercentage(
									safeVisualEvidence.artifacts.edgeAnalysis?.edge_uniformity || 0
								)}
								%
							</div>
							<div className='mt-2 bg-gray-200 rounded-full h-1.5 overflow-hidden'>
								<div
									className={`h-full rounded-full transition-all duration-500 ${
										normalizePercentageValue(
											safeVisualEvidence.artifacts.edgeAnalysis?.edge_uniformity || 0
										) >= 70
											? 'bg-green-500'
											: normalizePercentageValue(
													safeVisualEvidence.artifacts.edgeAnalysis
														?.edge_uniformity || 0
											  ) >= 40
											? 'bg-yellow-500'
											: 'bg-red-500'
									}`}
									style={{
										width: `${formatPercentage(
											safeVisualEvidence.artifacts.edgeAnalysis?.edge_uniformity || 0
										)}%`,
									}}></div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Heatmap Details */}
			{safeVisualEvidence.heatmaps.length > 0 && (
				<div className='bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-200'>
					<div className='flex items-center gap-3 mb-5'>
						<div className='bg-gradient-to-br from-purple-50 to-pink-50 p-2.5 rounded-xl'>
							<Layers className='w-5 h-5 text-purple-600' />
						</div>
						<div className='flex-1'>
							<h4 className='text-base font-bold text-gray-900'>
								Heatmap Analysis
							</h4>
							<p className='text-xs text-gray-500 mt-0.5'>
								{safeVisualEvidence.heatmaps.length} heatmap
								{safeVisualEvidence.heatmaps.length !== 1 ? 's' : ''} generated
							</p>
						</div>
						<div className='px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full'>
							{safeVisualEvidence.heatmaps.length}
						</div>
					</div>

					<div className='space-y-3'>
						{safeVisualEvidence.heatmaps.map((heatmap, index) => {
							// For Grad-CAM heatmaps, show prediction; for others, show intensity
							let displayValue = '';
							let isPrediction = false;
							
							if (heatmap.type === 'gradcam') {
								displayValue = heatmap.prediction || 'N/A';
								isPrediction = true;
							} else if (
								heatmap.intensity !== undefined &&
								!isNaN(heatmap.intensity)
							) {
								displayValue = `${formatPercentage(heatmap.intensity)}%`;
							} else {
								displayValue = 'N/A';
							}

							return (
								<div
									key={index}
									className='bg-gradient-to-r from-gray-50 to-gray-100/30 rounded-xl p-4 border border-gray-200/50 hover:shadow-sm transition-all duration-200'>
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-3 flex-1'>
											{heatmap.color && (
												<div
													className='w-4 h-4 rounded-md shadow-sm ring-2 ring-white'
													style={{ backgroundColor: heatmap.color }}></div>
											)}
											<div className='flex-1'>
												<div className='text-sm font-semibold text-gray-900'>
													{heatmap.description || `Heatmap ${index + 1}`}
												</div>
												{heatmap.type && (
													<div className='text-xs text-gray-500 mt-0.5'>
														Type: {heatmap.type}
													</div>
												)}
											</div>
										</div>
										<div className='flex items-center gap-2'>
											{isPrediction ? (
												<span
													className={`px-3 py-1 rounded-full text-xs font-bold ${
														displayValue === 'FAKE'
															? 'bg-red-100 text-red-700'
															: displayValue === 'REAL'
															? 'bg-green-100 text-green-700'
															: 'bg-gray-100 text-gray-700'
													}`}>
													{displayValue}
												</span>
											) : (
												<span className='text-sm font-bold text-gray-900'>
													{displayValue}
												</span>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Empty State */}
			{safeVisualEvidence.heatmaps.length === 0 &&
				safeVisualEvidence.artifacts.borderAnalysis?.border_quality ===
					undefined && (
					<div className='bg-gray-50 rounded-2xl border border-gray-200 p-8 text-center'>
						<div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 mb-3'>
							<AlertCircle className='w-6 h-6 text-gray-400' />
						</div>
						<p className='text-sm font-medium text-gray-600'>
							No heatmap or quality data available
						</p>
						<p className='text-xs text-gray-400 mt-1'>
							Analysis results will appear here when available
						</p>
					</div>
				)}
		</div>
	);
}

export default HeatmapDetails;
