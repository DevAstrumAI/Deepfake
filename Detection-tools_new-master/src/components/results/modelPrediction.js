/** @format */

import React from 'react';

function ModelPredictions({ details }) {
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
	return (
		<>
			{details.model_predictions && (
				<div className='card'>
					<h3 className='text-xl font-semibold text-gray-900 mb-4'>
						AI Model Predictions
					</h3>
					<div className='space-y-3'>
						{Object.entries(details.model_predictions).map(
							([model, prediction]) => {
								const confidence = details.model_confidences?.[model] || 0;
								return (
									<div
										key={model}
										className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
										<div>
											<div className='font-medium text-gray-900'>{model}</div>
											<div className='text-sm text-gray-600'>
												Prediction: {prediction === 1 ? 'FAKE' : 'REAL'}
											</div>
										</div>
										<div className='text-right'>
											<div className='font-semibold text-gray-900'>
												{formatConfidence(confidence)}%
											</div>
											<div className='text-sm text-gray-600'>Confidence</div>
										</div>
									</div>
								);
							}
						)}
					</div>
				</div>
			)}
		</>
	);
}

export default ModelPredictions;
