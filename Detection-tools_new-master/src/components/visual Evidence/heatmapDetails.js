/** @format */

import React from 'react';

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
	return (
		<>
			{/* Artifact Details */}
			{safeVisualEvidence.artifacts.borderAnalysis?.border_quality !==
				undefined && (
				<div className='bg-gray-50 p-3 rounded'>
					<div className='text-sm text-gray-700'>
						<strong>Border Quality:</strong>{' '}
						{formatPercentage(
							safeVisualEvidence.artifacts.borderAnalysis.border_quality
						)}
						%
						<br />
						<strong>Edge Uniformity:</strong>{' '}
						{formatPercentage(
							safeVisualEvidence.artifacts.edgeAnalysis?.edge_uniformity || 0
						)}
						%
					</div>
				</div>
			)}

			{/* Heatmap Details */}
			{safeVisualEvidence.heatmaps.length > 0 && (
				<div className='bg-gray-50 p-3 rounded'>
					<div className='text-sm text-gray-700'>
						<strong>Heatmaps Generated:</strong>{' '}
						{safeVisualEvidence.heatmaps.length}
						<br />
						{safeVisualEvidence.heatmaps.map((heatmap, index) => {
							// For Grad-CAM heatmaps, show prediction; for others, show intensity
							let displayValue = '';
							if (heatmap.type === 'gradcam') {
								// Show prediction for Grad-CAM heatmaps
								displayValue = heatmap.prediction || 'N/A';
							} else if (
								heatmap.intensity !== undefined &&
								!isNaN(heatmap.intensity)
							) {
								// Show intensity as percentage for other heatmaps
								displayValue = `${formatPercentage(heatmap.intensity)}%`;
							} else {
								displayValue = 'N/A';
							}

							return (
								<div key={index} className='mt-2'>
									{heatmap.color && (
										<span
											className='inline-block w-3 h-3 rounded mr-1'
											style={{ backgroundColor: heatmap.color }}></span>
									)}
									<span className='text-xs'>
										{heatmap.description}: {displayValue}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</>
	);
}

export default HeatmapDetails;
