/** @format */
import React from 'react';
import { Lightbulb } from 'lucide-react';

function ModelPredictions({ details }) {
	if (!details?.model_predictions) return null;

	const formatConfidence = (confidence) => {
		if (confidence <= 1) {
			return Math.round(confidence * 100);
		}
		return Math.round(confidence);
	};

	return (
		<div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full'>
			{/* Header */}
			<div className='flex items-center gap-3 mb-8'>
				<div className='bg-blue-600 p-2 rounded-lg'>
					<Lightbulb className='w-6 h-6 text-white' />
				</div>
				<h3 className='text-xl font-bold text-gray-800'>AI Model Predictions</h3>
			</div>

			<div className='space-y-6'>
				{Object.entries(details.model_predictions).map(([model, prediction]) => {
					const confidence = details.model_confidences?.[model] || 0;
					const confPercent = formatConfidence(confidence);
					const isFake = prediction === 1;

					return (
						<div
							key={model}
							className='bg-gray-50 rounded-xl p-5 border border-gray-100 relative overflow-hidden'>
							{/* Status Indicator Dot */}
							<div
								className={`absolute top-6 left-4 w-2 h-2 rounded-full ${
									isFake ? 'bg-red-400' : 'bg-green-400'
								}`}
							/>

							<div className='pl-6'>
								{/* Model Name */}
								<h4 className='font-bold text-gray-800 text-lg mb-1'>{model}</h4>

								{/* Prediction Badge */}
								<div className='flex items-center gap-2 mb-4'>
									<span className='text-sm text-gray-500'>Prediction:</span>
									<span
										className={`text-xs font-bold px-2 py-0.5 rounded ${
											isFake
												? 'bg-red-100 text-red-600'
												: 'bg-green-100 text-green-600'
										}`}>
										{isFake ? 'FAKE' : 'REAL'}
									</span>
								</div>

								{/* Progress Section */}
								<div>
									<div className='flex justify-between items-end mb-2'>
										<span className='text-xs font-bold text-gray-400 uppercase tracking-wider'>
											Confidence Level
										</span>
										<span className='text-xl font-bold text-blue-600'>
											{confPercent}%
										</span>
									</div>
									<div className='h-2 bg-gray-200 rounded-full overflow-hidden'>
										<div
											className='h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full'
											style={{ width: `${confPercent}%` }}
										/>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default ModelPredictions;