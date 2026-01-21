/** @format */

import React from 'react';

const HeatmapsOverlay = ({ 
	safeVisualEvidence, 
	actualFileType,
	selectedHeatmapIndex = 0 
}) => {
	if (
		!safeVisualEvidence.heatmaps ||
		safeVisualEvidence.heatmaps.length === 0
	) {
		return null;
	}

	// Get gradcam heatmaps with image data
	const gradcamHeatmaps = safeVisualEvidence.heatmaps.filter(
		(h) => h.type === 'gradcam' && h.image_data
	) || [];

	if (gradcamHeatmaps.length === 0) {
		return null;
	}

	// Get the selected heatmap
	const displayHeatmap = gradcamHeatmaps[
		selectedHeatmapIndex >= 0 && selectedHeatmapIndex < gradcamHeatmaps.length
			? selectedHeatmapIndex
			: 0
	];

	if (!displayHeatmap || !displayHeatmap.image_data) {
		return null;
	}

	// Render heatmap overlay for both images and videos
	return (
		<div className='absolute inset-0 pointer-events-none' style={{ zIndex: 2 }}>
			<img
				src={displayHeatmap.image_data}
				alt='Heatmap Overlay'
				className='w-full h-full object-contain rounded-lg'
				style={{
					mixBlendMode: 'multiply',
					opacity: 0.7,
				}}
			/>
		</div>
	);
};

export default HeatmapsOverlay;

