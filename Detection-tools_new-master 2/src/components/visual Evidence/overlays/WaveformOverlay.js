/** @format */

import React from 'react';
import { formatPercentage } from '../utils/visualEvidenceUtils';

const WaveformOverlay = ({ analysisResult }) => {
	return (
		<div className='absolute inset-0'>
			<div className='absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded'>
				<div className='text-sm'>
					<div>
						<strong>Waveform Analysis</strong>
					</div>
					<div>
						Voiced Ratio:{' '}
						{formatPercentage(
							analysisResult.details?.comprehensive_features?.voiced_ratio || 0
						)}
						%
					</div>
					<div>
						F0 Variation:{' '}
						{analysisResult.details?.comprehensive_features?.f0_std?.toFixed(1) ||
							'N/A'}{' '}
						Hz
					</div>
				</div>
			</div>
		</div>
	);
};

export default WaveformOverlay;

