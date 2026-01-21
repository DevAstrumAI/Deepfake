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
		<div className='max-w-7xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen'>
			<div className='space-y-8'>
				{/* Header Section */}
				<div className='text-center mb-12'>
					<h2 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4'>
						🔊 Audio Analysis Details
					</h2>
					<p className='text-lg text-gray-600 max-w-2xl mx-auto'>
						Comprehensive analysis of audio characteristics and deepfake detection results
					</p>
				</div>

				{/* Audio Overview */}
				<div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300'>
					<div className='bg-gradient-to-r from-blue-500 to-blue-600 p-6'>
						<h3 className='text-xl font-bold text-white flex items-center'>
							<span className='text-2xl mr-3'>📊</span>
							Audio Overview
						</h3>
					</div>
					<div className='p-6'>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
							<div className='bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200'>
								<div className='flex items-center mb-2'>
									<span className='text-blue-500 text-xl mr-2'>⏱️</span>
									<div className='text-sm font-medium text-blue-700'>Duration</div>
								</div>
								<div className='text-2xl font-bold text-blue-900'>
									{preprocessingInfo.duration?.toFixed(1) || 'N/A'}s
								</div>
							</div>
							<div className='bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200'>
								<div className='flex items-center mb-2'>
									<span className='text-purple-500 text-xl mr-2'>🎵</span>
									<div className='text-sm font-medium text-purple-700'>Sample Rate</div>
								</div>
								<div className='text-2xl font-bold text-purple-900'>
									{preprocessingInfo.sample_rate || 'N/A'} Hz
								</div>
							</div>
							<div className='bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200'>
								<div className='flex items-center mb-2'>
									<span className='text-green-500 text-xl mr-2'>⚡</span>
									<div className='text-sm font-medium text-green-700'>Energy</div>
								</div>
								<div className='text-2xl font-bold text-green-900'>
									{comprehensiveFeatures.energy_mean?.toFixed(3) || 'N/A'}
								</div>
							</div>
							<div className='bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-200'>
								<div className='flex items-center mb-2'>
									<span className='text-orange-500 text-xl mr-2'>📈</span>
									<div className='text-sm font-medium text-orange-700'>Zero Crossing Rate</div>
								</div>
								<div className='text-2xl font-bold text-orange-900'>
									{comprehensiveFeatures.zcr_mean?.toFixed(3) || 'N/A'}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* AI Explanation */}
				{details?.openai_analysis?.reasoning && (
					<div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300'>
						<div className='bg-gradient-to-r from-purple-500 to-purple-600 p-6'>
							<h3 className='text-xl font-bold text-white flex items-center'>
								<span className='text-2xl mr-3'>💡</span>
								AI Explanation
							</h3>
						</div>
						<div className='p-6'>
							<div className='bg-purple-50 rounded-xl p-5 border border-purple-200 mb-4'>
								<p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
									{details.openai_analysis.reasoning}
								</p>
							</div>
							{details.openai_analysis?.indicators &&
								details.openai_analysis.indicators.length > 0 && (
									<div>
										<h4 className='font-semibold text-gray-800 mb-3'>
											Deepfake Indicators Detected
										</h4>
										<div className='space-y-2'>
											{details.openai_analysis.indicators.map(
												(indicator, index) => (
													<div
														key={index}
														className='bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2'>
														<span className='text-red-500 text-sm'>⚠️</span>
														<span className='text-sm text-red-700'>{indicator}</span>
													</div>
												)
											)}
										</div>
									</div>
								)}
						</div>
					</div>
				)}

				{/* Deepfake Indicators */}
				{Object.keys(deepfakeIndicators).length > 0 && (
					<div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300'>
						<div className='bg-gradient-to-r from-red-500 to-orange-600 p-6'>
							<h3 className='text-xl font-bold text-white flex items-center'>
								<span className='text-2xl mr-3'>⚠️</span>
								Deepfake Indicators
							</h3>
							<p className='text-red-100 text-sm mt-2'>
								Analysis of potential synthetic audio characteristics
							</p>
						</div>
						<div className='p-6'>
							<div className='space-y-4'>
								{Object.entries(deepfakeIndicators).map(([indicator, value]) => {
									const severity =
										value > 0.7 ? 'high' : value > 0.4 ? 'medium' : 'low';
									const severityColor =
										severity === 'high'
											? 'text-red-600 border-red-300 bg-red-50'
											: severity === 'medium'
											? 'text-yellow-600 border-yellow-300 bg-yellow-50'
											: 'text-green-600 border-green-300 bg-green-50';
									const progressColor =
										severity === 'high'
											? 'bg-red-500'
											: severity === 'medium'
											? 'bg-yellow-500'
											: 'bg-green-500';
									const severityIcon =
										severity === 'high'
											? '🔴'
											: severity === 'medium'
											? '🟡'
											: '🟢';
									const severityLabel =
										severity === 'high'
											? 'High Risk'
											: severity === 'medium'
											? 'Medium Risk'
											: 'Low Risk';

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
										<div key={indicator} className={`p-5 rounded-xl border-2 ${severityColor} hover:shadow-lg transition-all duration-300`}>
											<div className='flex items-start justify-between mb-3'>
												<div className='flex-1'>
													<div className='flex items-center mb-2'>
														<span className='text-2xl mr-3'>{severityIcon}</span>
														<div>
															<div className='font-bold text-gray-900 text-lg capitalize'>
																{indicator.replace(/_/g, ' ')}
															</div>
															<div className={`text-sm font-semibold px-2 py-1 rounded-full inline-block ${
																severity === 'high'
																	? 'bg-red-100 text-red-700'
																	: severity === 'medium'
																	? 'bg-yellow-100 text-yellow-700'
																	: 'bg-green-100 text-green-700'
															}`}>
																{severityLabel}
															</div>
														</div>
													</div>
													<div className='text-sm text-gray-700 leading-relaxed'>
														{indicatorDescriptions[indicator] ||
															'Indicator of potential audio fabrication'}
													</div>
												</div>
												<div className='text-right ml-6'>
													<div className='text-3xl font-black text-gray-900 mb-2'>
														{(value * 100).toFixed(1)}%
													</div>
													<div className='w-24 bg-gray-200 rounded-full h-3'>
														<div
															className={`h-3 rounded-full transition-all duration-1000 ${progressColor}`}
															style={{ width: `${value * 100}%` }}></div>
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				)}

				{/* Comprehensive Audio Features */}
				{Object.keys(comprehensiveFeatures).length > 0 && (
					<div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300'>
						<div className='bg-gradient-to-r from-emerald-500 to-teal-600 p-6'>
							<h3 className='text-xl font-bold text-white flex items-center'>
								<span className='text-2xl mr-3'>🎛️</span>
								Audio Characteristics
							</h3>
							<p className='text-emerald-100 text-sm mt-2'>
								Detailed acoustic and spectral analysis
							</p>
						</div>
						<div className='p-6'>
							<div className='space-y-8'>
								{/* Pitch Features */}
								{comprehensiveFeatures.f0_mean !== undefined && (
									<div className='bg-gradient-to-r from-violet-50 to-purple-50 p-6 rounded-xl border border-violet-200'>
										<h4 className='text-lg font-bold text-violet-900 mb-4 flex items-center'>
											<span className='text-xl mr-2'>🎵</span>
											Pitch Analysis
										</h4>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
											<div className='bg-white p-4 rounded-lg border border-violet-300 hover:shadow-md transition-all duration-200'>
												<div className='text-sm font-medium text-violet-700 mb-1'>
													Fundamental Frequency (F0)
												</div>
												<div className='text-2xl font-bold text-violet-900'>
													{comprehensiveFeatures.f0_mean?.toFixed(1) || 'N/A'} Hz
												</div>
											</div>
											<div className='bg-white p-4 rounded-lg border border-violet-300 hover:shadow-md transition-all duration-200'>
												<div className='text-sm font-medium text-violet-700 mb-1'>F0 Variation</div>
												<div className='text-2xl font-bold text-violet-900'>
													{comprehensiveFeatures.f0_std?.toFixed(1) || 'N/A'} Hz
												</div>
											</div>
										</div>
									</div>
								)}

								{/* Spectral Features */}
								{comprehensiveFeatures.spectral_centroid_mean !== undefined && (
									<div className='bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-200'>
										<h4 className='text-lg font-bold text-cyan-900 mb-4 flex items-center'>
											<span className='text-xl mr-2'>🌊</span>
											Spectral Analysis
										</h4>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
											<div className='bg-white p-4 rounded-lg border border-cyan-300 hover:shadow-md transition-all duration-200'>
												<div className='text-sm font-medium text-cyan-700 mb-1'>Spectral Centroid</div>
												<div className='text-2xl font-bold text-cyan-900'>
													{comprehensiveFeatures.spectral_centroid_mean?.toFixed(0) || 'N/A'} Hz
												</div>
											</div>
											<div className='bg-white p-4 rounded-lg border border-cyan-300 hover:shadow-md transition-all duration-200'>
												<div className='text-sm font-medium text-cyan-700 mb-1'>Spectral Variation</div>
												<div className='text-2xl font-bold text-cyan-900'>
													{comprehensiveFeatures.spectral_centroid_std?.toFixed(0) || 'N/A'} Hz
												</div>
											</div>
										</div>
									</div>
								)}

								{/* Energy Features */}
								{comprehensiveFeatures.energy_mean !== undefined && (
									<div className='bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200'>
										<h4 className='text-lg font-bold text-amber-900 mb-4 flex items-center'>
											<span className='text-xl mr-2'>⚡</span>
											Energy Analysis
										</h4>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
											<div className='bg-white p-4 rounded-lg border border-amber-300 hover:shadow-md transition-all duration-200'>
												<div className='text-sm font-medium text-amber-700 mb-1'>RMS Energy</div>
												<div className='text-2xl font-bold text-amber-900'>
													{comprehensiveFeatures.energy_mean?.toFixed(3) || 'N/A'}
												</div>
											</div>
											<div className='bg-white p-4 rounded-lg border border-amber-300 hover:shadow-md transition-all duration-200'>
												<div className='text-sm font-medium text-amber-700 mb-1'>Energy Variation</div>
												<div className='text-2xl font-bold text-amber-900'>
													{comprehensiveFeatures.energy_std?.toFixed(3) || 'N/A'}
												</div>
											</div>
										</div>
									</div>
								)}

								{/* MFCC Features */}
								{comprehensiveFeatures.mfcc_mean && (
									<div className='bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-xl border border-rose-200'>
										<h4 className='text-lg font-bold text-rose-900 mb-4 flex items-center'>
											<span className='text-xl mr-2'>🎭</span>
											MFCC Features (Speech Characteristics)
										</h4>
										<div className='text-sm text-rose-700 mb-4'>
											{comprehensiveFeatures.mfcc_mean.length} features analyzed for speech pattern recognition
										</div>
										<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3'>
											{comprehensiveFeatures.mfcc_mean
												.slice(0, 8)
												.map((value, index) => (
													<div
														key={index}
														className='bg-white p-3 rounded-lg border border-rose-300 text-center hover:shadow-md transition-all duration-200 hover:scale-105'>
														<div className='text-xs font-medium text-rose-600 mb-1'>
															MFCC {index + 1}
														</div>
														<div className='text-lg font-bold text-rose-900'>
															{value?.toFixed(2) || 'N/A'}
														</div>
													</div>
												))}
										</div>
									</div>
								)}

								{/* Voiced Ratio */}
								{comprehensiveFeatures.voiced_ratio !== undefined && (
									<div className='bg-gradient-to-r from-lime-50 to-green-50 p-6 rounded-xl border border-lime-200'>
										<h4 className='text-lg font-bold text-lime-900 mb-4 flex items-center'>
											<span className='text-xl mr-2'>🗣️</span>
											Voice Analysis
										</h4>
										<div className='bg-white p-4 rounded-lg border border-lime-300 hover:shadow-md transition-all duration-200'>
											<div className='text-sm font-medium text-lime-700 mb-1'>Voiced Ratio</div>
											<div className='text-2xl font-bold text-lime-900'>
												{(comprehensiveFeatures.voiced_ratio * 100)?.toFixed(1) || 'N/A'}%
											</div>
											<div className='text-sm text-lime-600 mt-1'>
												Percentage of voiced segments in the audio
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Analysis Methods */}
				{details.analysis_methods && (
					<div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300'>
						<div className='bg-gradient-to-r from-slate-500 to-gray-600 p-6'>
							<h3 className='text-xl font-bold text-white flex items-center'>
								<span className='text-2xl mr-3'>🔬</span>
								Analysis Methods Used
							</h3>
						</div>
						<div className='p-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{details.analysis_methods.map((method, index) => (
									<div key={index} className='flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:shadow-md transition-all duration-200'>
										<div className='w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse'></div>
										<span className='text-slate-800 font-medium'>{method}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Preprocessing Information */}
				{details.preprocessing_info && (
					<div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300'>
						<div className='bg-gradient-to-r from-gray-500 to-slate-600 p-6'>
							<h3 className='text-xl font-bold text-white flex items-center'>
								<span className='text-2xl mr-3'>⚙️</span>
								Processing Details
							</h3>
							<p className='text-gray-200 text-sm mt-2'>
								Technical parameters used in audio processing
							</p>
						</div>
						<div className='p-6'>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
								<div className='bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1'>
									<div className='flex items-center mb-3'>
										<span className='text-gray-500 text-xl mr-3'>🎚️</span>
										<div className='text-sm font-medium text-gray-700'>Sample Rate</div>
									</div>
									<div className='text-2xl font-bold text-gray-900'>
										{details.preprocessing_info.sample_rate || 'N/A'} Hz
									</div>
								</div>
								<div className='bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1'>
									<div className='flex items-center mb-3'>
										<span className='text-gray-500 text-xl mr-3'>📊</span>
										<div className='text-sm font-medium text-gray-700'>Mel Bins</div>
									</div>
									<div className='text-2xl font-bold text-gray-900'>
										{details.preprocessing_info.n_mels || 'N/A'}
									</div>
								</div>
								<div className='bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1'>
									<div className='flex items-center mb-3'>
										<span className='text-gray-500 text-xl mr-3'>🔄</span>
										<div className='text-sm font-medium text-gray-700'>FFT Size</div>
									</div>
									<div className='text-2xl font-bold text-gray-900'>
										{details.preprocessing_info.n_fft || 'N/A'}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default AudioDetailedAnalysis;
