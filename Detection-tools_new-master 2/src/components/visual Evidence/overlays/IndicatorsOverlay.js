/** @format */

import React from 'react';
import { formatPercentage } from '../utils/visualEvidenceUtils';

const IndicatorsOverlay = ({ analysisResult }) => {
	const indicators = analysisResult.details?.deepfake_indicators || {};
	return (
		<div className='absolute inset-0'>
			<div className='absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded max-w-sm'>
				<div className='text-sm'>
					<div>
						<strong>Deepfake Indicators</strong>
					</div>
					{Object.entries(indicators).map(([key, value]) => (
						<div key={key} className='mt-1'>
							<div className='flex justify-between'>
								<span className='capitalize'>{key.replace(/_/g, ' ')}:</span>
								<span
									className={`font-bold ${
										value > 0.7
											? 'text-red-400'
											: value > 0.4
											? 'text-yellow-400'
											: 'text-green-400'
									}`}>
									{formatPercentage(value)}%
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default IndicatorsOverlay;

