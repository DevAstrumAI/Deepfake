/** @format */

import React from 'react';

const AudioAnalysisOverlay = ({ analysisResult }) => {
	return (
		<div className='absolute inset-0'>
			<div className='absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded'>
				<div className='text-sm'>
					<div>
						<strong>Audio Analysis</strong>
					</div>
					<div>
						Duration:{' '}
						{analysisResult.details?.preprocessing_info?.duration?.toFixed(1) ||
							'N/A'}
						s
					</div>
					<div>
						Sample Rate:{' '}
						{analysisResult.details?.preprocessing_info?.sample_rate || 'N/A'} Hz
					</div>
					<div>Prediction: {analysisResult.prediction}</div>
					<div>
						Confidence: {(analysisResult.confidence || 0).toFixed(1)}%
					</div>
				</div>
			</div>
		</div>
	);
};

export default AudioAnalysisOverlay;

