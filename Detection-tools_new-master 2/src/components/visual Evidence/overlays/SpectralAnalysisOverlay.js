/** @format */

import React from 'react';

const SpectralAnalysisOverlay = ({ analysisResult }) => {
	return (
		<div className='absolute inset-0'>
			<div className='absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded'>
				<div className='text-sm'>
					<div>
						<strong>Spectral Analysis</strong>
					</div>
					<div>
						F0 Mean:{' '}
						{analysisResult.details?.comprehensive_features?.f0_mean?.toFixed(1) ||
							'N/A'}{' '}
						Hz
					</div>
					<div>
						Spectral Centroid:{' '}
						{analysisResult.details?.comprehensive_features?.spectral_centroid_mean?.toFixed(
							0
						) || 'N/A'}{' '}
						Hz
					</div>
					<div>
						Energy:{' '}
						{analysisResult.details?.comprehensive_features?.energy_mean?.toFixed(
							3
						) || 'N/A'}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SpectralAnalysisOverlay;

