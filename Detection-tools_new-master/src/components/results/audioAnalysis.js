/** @format */

import React from 'react';

function AudioDetailedAnalysis({ result }) {
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
	if (!result || !result.details) return null;

	const details = result.details;
	const comprehensiveFeatures = details.comprehensive_features || {};
	const modelPredictions = details.model_predictions || {};
	const modelConfidences = details.model_confidences || {};
	const deepfakeIndicators = details.deepfake_indicators || {};
	const preprocessingInfo = details.preprocessing_info || {};

	return (
		<div className='space-y-6'>
			<h2 className='text-2xl font-bold text-gray-900 mb-6'>
				Audio Analysis Details
			</h2>

			{/* Audio Overview */}
			<div className='card'>
				<h3 className='text-xl font-semibold text-gray-900 mb-4'>
					Audio Overview
				</h3>
				<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
					<div>
						<div className='text-sm text-gray-600'>Duration</div>
						<div className='text-lg font-semibold'>
							{preprocessingInfo.duration?.toFixed(1) || 'N/A'}s
						</div>
					</div>
					<div>
						<div className='text-sm text-gray-600'>Sample Rate</div>
						<div className='text-lg font-semibold'>
							{preprocessingInfo.sample_rate || 'N/A'} Hz
						</div>
					</div>
					<div>
						<div className='text-sm text-gray-600'>Energy</div>
						<div className='text-lg font-semibold'>
							{comprehensiveFeatures.energy_mean?.toFixed(3) || 'N/A'}
						</div>
					</div>
					<div>
						<div className='text-sm text-gray-600'>Zero Crossing Rate</div>
						<div className='text-lg font-semibold'>
							{comprehensiveFeatures.zcr_mean?.toFixed(3) || 'N/A'}
						</div>
					</div>
				</div>
			</div>

			{/* Model Predictions */}
			{Object.keys(modelPredictions).length > 0 && (
				<div className='card'>
					<h3 className='text-xl font-semibold text-gray-900 mb-4'>
						AI Model Predictions
					</h3>
					<div className='space-y-3'>
						{Object.entries(modelPredictions).map(([model, prediction]) => {
							const confidence = modelConfidences[model] || 0;
							const modelDisplayName =
								model === 'aasist'
									? 'AASIST (Graph Attention)'
									: model === 'rawnet2'
									? 'RawNet2 (Raw Waveform)'
									: model === 'hybrid'
									? 'Hybrid Fusion'
									: model;
							return (
								<div
									key={model}
									className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
									<div>
										<div className='font-medium text-gray-900'>
											{modelDisplayName}
										</div>
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
						})}
					</div>
				</div>
			)}

			{/* Deepfake Indicators */}
			{Object.keys(deepfakeIndicators).length > 0 && (
				<div className='card'>
					<h3 className='text-xl font-semibold text-gray-900 mb-4'>
						Deepfake Indicators
					</h3>
					<div className='space-y-3'>
						{Object.entries(deepfakeIndicators).map(([indicator, value]) => {
							const severity =
								value > 0.7 ? 'high' : value > 0.4 ? 'medium' : 'low';
							const severityColor =
								severity === 'high'
									? 'text-red-600'
									: severity === 'medium'
									? 'text-yellow-600'
									: 'text-green-600';
							const severityBg =
								severity === 'high'
									? 'bg-red-50'
									: severity === 'medium'
									? 'bg-yellow-50'
									: 'bg-green-50';

							const indicatorDescriptions = {
								unnatural_f0_smoothness:
									'Unnatural pitch smoothness - AI models often produce overly smooth pitch contours',
								limited_freq_variation:
									'Limited frequency variation - Synthetic audio lacks natural frequency diversity',
								unnatural_energy_patterns:
									'Unnatural energy patterns - Regular energy variations typical of AI generation',
								phase_inconsistencies:
									'Phase inconsistencies - Unnatural phase relationships in the audio signal',
								unnatural_complexity:
									'Unnatural complexity - Audio complexity that deviates from natural speech patterns',
								unnatural_spectral_patterns:
									'Unnatural spectral patterns - Artificial spectral characteristics',
							};

							return (
								<div key={indicator} className={`p-3 rounded-lg ${severityBg}`}>
									<div className='flex items-center justify-between mb-2'>
										<div className='font-medium text-gray-900 capitalize'>
											{indicator.replace(/_/g, ' ')}
										</div>
										<div className={`font-semibold ${severityColor}`}>
											{(value * 100).toFixed(1)}%
										</div>
									</div>
									<div className='text-sm text-gray-600'>
										{indicatorDescriptions[indicator] ||
											'Indicator of potential audio fabrication'}
									</div>
									<div className='w-full bg-gray-200 rounded-full h-2 mt-2'>
										<div
											className={`h-2 rounded-full ${
												severity === 'high'
													? 'bg-red-500'
													: severity === 'medium'
													? 'bg-yellow-500'
													: 'bg-green-500'
											}`}
											style={{ width: `${value * 100}%` }}></div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Comprehensive Audio Features */}
			{Object.keys(comprehensiveFeatures).length > 0 && (
				<div className='card'>
					<h3 className='text-xl font-semibold text-gray-900 mb-4'>
						Audio Characteristics
					</h3>
					<div className='space-y-4'>
						{/* Pitch Features */}
						{comprehensiveFeatures.f0_mean !== undefined && (
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<div className='text-sm text-gray-600'>
										Fundamental Frequency (F0)
									</div>
									<div className='text-lg font-semibold'>
										{comprehensiveFeatures.f0_mean?.toFixed(1) || 'N/A'} Hz
									</div>
								</div>
								<div>
									<div className='text-sm text-gray-600'>F0 Variation</div>
									<div className='text-lg font-semibold'>
										{comprehensiveFeatures.f0_std?.toFixed(1) || 'N/A'} Hz
									</div>
								</div>
							</div>
						)}

						{/* Spectral Features */}
						{comprehensiveFeatures.spectral_centroid_mean !== undefined && (
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<div className='text-sm text-gray-600'>Spectral Centroid</div>
									<div className='text-lg font-semibold'>
										{comprehensiveFeatures.spectral_centroid_mean?.toFixed(0) ||
											'N/A'}{' '}
										Hz
									</div>
								</div>
								<div>
									<div className='text-sm text-gray-600'>
										Spectral Variation
									</div>
									<div className='text-lg font-semibold'>
										{comprehensiveFeatures.spectral_centroid_std?.toFixed(0) ||
											'N/A'}{' '}
										Hz
									</div>
								</div>
							</div>
						)}

						{/* Energy Features */}
						{comprehensiveFeatures.energy_mean !== undefined && (
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<div className='text-sm text-gray-600'>RMS Energy</div>
									<div className='text-lg font-semibold'>
										{comprehensiveFeatures.energy_mean?.toFixed(3) || 'N/A'}
									</div>
								</div>
								<div>
									<div className='text-sm text-gray-600'>Energy Variation</div>
									<div className='text-lg font-semibold'>
										{comprehensiveFeatures.energy_std?.toFixed(3) || 'N/A'}
									</div>
								</div>
							</div>
						)}

						{/* MFCC Features */}
						{comprehensiveFeatures.mfcc_mean && (
							<div>
								<div className='text-sm text-gray-600 mb-2'>
									MFCC Features (Speech Characteristics)
								</div>
								<div className='text-sm text-gray-500'>
									{comprehensiveFeatures.mfcc_mean.length} features analyzed
								</div>
								<div className='grid grid-cols-4 md:grid-cols-8 gap-2 mt-2'>
									{comprehensiveFeatures.mfcc_mean
										.slice(0, 8)
										.map((value, index) => (
											<div
												key={index}
												className='text-center p-2 bg-gray-50 rounded'>
												<div className='text-xs text-gray-500 mb-1'>
													MFCC {index + 1}
												</div>
												<div className='text-sm font-semibold'>
													{value?.toFixed(2) || 'N/A'}
												</div>
											</div>
										))}
								</div>
							</div>
						)}

						{/* Voiced Ratio */}
						{comprehensiveFeatures.voiced_ratio !== undefined && (
							<div>
								<div className='text-sm text-gray-600'>Voiced Ratio</div>
								<div className='text-lg font-semibold'>
									{(comprehensiveFeatures.voiced_ratio * 100)?.toFixed(1) ||
										'N/A'}
									%
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Analysis Methods */}
			{details.analysis_methods && (
				<div className='card'>
					<h3 className='text-xl font-semibold text-gray-900 mb-4'>
						Analysis Methods Used
					</h3>
					<div className='space-y-2'>
						{details.analysis_methods.map((method, index) => (
							<div key={index} className='flex items-center space-x-2'>
								<div className='w-2 h-2 bg-green-500 rounded-full'></div>
								<span className='text-gray-700'>{method}</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Preprocessing Information */}
			{details.preprocessing_info && (
				<div className='card'>
					<h3 className='text-xl font-semibold text-gray-900 mb-4'>
						Processing Details
					</h3>
					<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
						<div>
							<div className='text-sm text-gray-600'>Sample Rate</div>
							<div className='text-lg font-semibold'>
								{details.preprocessing_info.sample_rate || 'N/A'} Hz
							</div>
						</div>
						<div>
							<div className='text-sm text-gray-600'>Mel Bins</div>
							<div className='text-lg font-semibold'>
								{details.preprocessing_info.n_mels || 'N/A'}
							</div>
						</div>
						<div>
							<div className='text-sm text-gray-600'>FFT Size</div>
							<div className='text-lg font-semibold'>
								{details.preprocessing_info.n_fft || 'N/A'}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default AudioDetailedAnalysis;
