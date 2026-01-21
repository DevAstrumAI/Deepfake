/** @format */

import React from 'react';

const HeatmapsOverlay = ({ safeVisualEvidence }) => {
	if (
		!safeVisualEvidence.heatmaps ||
		safeVisualEvidence.heatmaps.length === 0
	) {
		return (
			<div className='absolute inset-0 flex items-center justify-center'>
				<div className='bg-black bg-opacity-75 text-white px-4 py-2 rounded'>
					<p className='text-sm'>No heatmaps available</p>
				</div>
			</div>
		);
	}

	// Heatmap overlay is rendered on the image itself
	// This function doesn't need to render anything as controls are in side panel
	return null;
};

export default HeatmapsOverlay;

