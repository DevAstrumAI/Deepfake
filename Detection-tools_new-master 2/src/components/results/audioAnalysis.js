/** @format */

import React from 'react';
import {
	Volume2,
	BarChart3,
	Clock,
	Music,
	Zap,
	TrendingUp,
	Lightbulb,
	AlertTriangle,
	AlertCircle,
	Sliders,
	Waves,
	Activity,
	Mic,
	Microscope,
	Settings,
	RefreshCw,
	XCircle,
} from 'lucide-react';

function AudioDetailedAnalysis({ result }) {
	if (!result || !result.details) return null;

	const details = result.details;
	const comprehensiveFeatures = details.comprehensive_features || {};
	const deepfakeIndicators = details.deepfake_indicators || {};
	const preprocessingInfo = details.preprocessing_info || {};

	return (
		<div className='w-full p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-purple-50 min-h-screen'>
			<div className='space-y-8'>
				{/* Header Section */}
				<div className='text-center mb-12'>
					<div className='flex items-center justify-center gap-3 mb-4'>
						<Volume2 className='w-10 h-10 text-purple-600' />
						<h2 className='text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent'>
							Audio Analysis Details
						</h2>
					</div>
					<p className='text-lg text-gray-600 max-w-2xl mx-auto'>
						Comprehensive analysis of audio characteristics and deepfake detection results
					</p>
				</div>

				{/* Audio Overview */}
				<div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300'>
					<div className='bg-gradient-to-r from-purple-600 to-purple-700 p-6'>
						<h3 className='text-xl font-bold text-white flex items-center'>
							<BarChart3 className='w-6 h-6 mr-3' />
							Audio Overview
						</h3>
					</div>
					<div className='p-6'>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
							<div className='bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200'>
								<div className='flex items-center mb-2'>
									<Clock className='w-5 h-5 text-purple-600 mr-2' />
									<div className='text-sm font-medium text-purple-700'>Duration</div>
								</div>
								<div className='text-2xl font-bold text-purple-900'>
									{preprocessingInfo.duration?.toFixed(1) || 'N/A'}s
								</div>
							</div>
							<div className='bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200'>
								<div className='flex items-center mb-2'>
									<Music className='w-5 h-5 text-purple-600 mr-2' />
									<div className='text-sm font-medium text-purple-700'>Sample Rate</div>
								</div>
								<div className='text-2xl font-bold text-purple-900'>
									{preprocessingInfo.sample_rate || 'N/A'} Hz
								</div>
							</div>
							<div className='bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200'>
								<div className='flex items-center mb-2'>
									<Zap className='w-5 h-5 text-purple-600 mr-2' />
									<div className='text-sm font-medium text-purple-700'>Energy</div>
								</div>
								<div className='text-2xl font-bold text-purple-900'>
									{comprehensiveFeatures.energy_mean?.toFixed(3) || 'N/A'}
								</div>
							</div>
							<div className='bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200'>
								<div className='flex items-center mb-2'>
									<TrendingUp className='w-5 h-5 text-purple-600 mr-2' />
									<div className='text-sm font-medium text-purple-700'>Zero Crossing Rate</div>
								</div>
								<div className='text-2xl font-bold text-purple-900'>
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
								<Lightbulb className='w-6 h-6 mr-3' />
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
														<AlertTriangle className='w-4 h-4 text-red-500 mt-0.5 flex-shrink-0' />
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
						<div className='bg-gradient-to-r from-purple-600 to-purple-700 p-6'>
							<h3 className='text-xl font-bold text-white flex items-center'>
								<AlertTriangle className='w-6 h-6 mr-3' />
								Deepfake Indicators
							</h3>
							<p className='text-purple-100 text-sm mt-2'>
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
									const SeverityIcon =
										severity === 'high'
											? XCircle
											: severity === 'medium'
											? AlertCircle
											: AlertCircle;
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
														<SeverityIcon className={`w-5 h-5 mr-3 ${
															severity === 'high'
																? 'text-purple-600'
																: severity === 'medium'
																? 'text-purple-500'
																: 'text-gray-400'
														}`} />
														<div>
															<div className='font-bold text-gray-900 text-lg capitalize'>
																{indicator.replace(/_/g, ' ')}
															</div>
															<div className={`text-sm font-semibold px-2 py-1 rounded-full inline-block ${
																severity === 'high'
																	? 'bg-purple-100 text-purple-700'
																	: severity === 'medium'
																	? 'bg-purple-50 text-purple-600'
																	: 'bg-gray-100 text-gray-600'
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
						<div className='bg-gradient-to-r from-purple-600 to-purple-700 p-6'>
							<h3 className='text-xl font-bold text-white flex items-center'>
								<Sliders className='w-6 h-6 mr-3' />
								Audio Characteristics
							</h3>
							<p className='text-purple-100 text-sm mt-2'>
								Detailed acoustic and spectral analysis
							</p>
						</div>
						<div className='p-6'>
							<div className='space-y-8'>
								{/* Pitch Features */}
								{comprehensiveFeatures.f0_mean !== undefined && (
									<div className='bg-gradient-to-r from-purple-50 to-white p-6 rounded-xl border border-purple-200'>
										<h4 className='text-lg font-bold text-purple-900 mb-4 flex items-center'>
											<Music className='w-5 h-5 mr-2 text-purple-600' />
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
									<div className='bg-gradient-to-r from-purple-50 to-white p-6 rounded-xl border border-purple-200'>
										<h4 className='text-lg font-bold text-purple-900 mb-4 flex items-center'>
											<Waves className='w-5 h-5 mr-2 text-purple-600' />
											Spectral Analysis
										</h4>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
											<div className='bg-white p-4 rounded-lg border border-purple-200 hover:shadow-md transition-all duration-200'>
												<div className='text-sm font-medium text-purple-700 mb-1'>Spectral Centroid</div>
												<div className='text-2xl font-bold text-purple-900'>
													{comprehensiveFeatures.spectral_centroid_mean?.toFixed(0) || 'N/A'} Hz
												</div>
											</div>
											<div className='bg-white p-4 rounded-lg border border-purple-200 hover:shadow-md transition-all duration-200'>
												<div className='text-sm font-medium text-purple-700 mb-1'>Spectral Variation</div>
												<div className='text-2xl font-bold text-purple-900'>
													{comprehensiveFeatures.spectral_centroid_std?.toFixed(0) || 'N/A'} Hz
												</div>
											</div>
										</div>
									</div>
								)}

								{/* Energy Features */}
								{comprehensiveFeatures.energy_mean !== undefined && (
									<div className='bg-gradient-to-r from-purple-50 to-white p-6 rounded-xl border border-purple-200'>
										<h4 className='text-lg font-bold text-purple-900 mb-4 flex items-center'>
											<Zap className='w-5 h-5 mr-2 text-purple-600' />
											Energy Analysis
										</h4>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
											<div className='bg-white p-4 rounded-lg border border-purple-200 hover:shadow-md transition-all duration-200'>
												<div className='text-sm font-medium text-purple-700 mb-1'>RMS Energy</div>
												<div className='text-2xl font-bold text-purple-900'>
													{comprehensiveFeatures.energy_mean?.toFixed(3) || 'N/A'}
												</div>
											</div>
											<div className='bg-white p-4 rounded-lg border border-purple-200 hover:shadow-md transition-all duration-200'>
												<div className='text-sm font-medium text-purple-700 mb-1'>Energy Variation</div>
												<div className='text-2xl font-bold text-purple-900'>
													{comprehensiveFeatures.energy_std?.toFixed(3) || 'N/A'}
												</div>
											</div>
										</div>
									</div>
								)}

								{/* MFCC Features */}
								{comprehensiveFeatures.mfcc_mean && (
									<div className='bg-gradient-to-r from-purple-50 to-white p-6 rounded-xl border border-purple-200'>
										<h4 className='text-lg font-bold text-purple-900 mb-4 flex items-center'>
											<Activity className='w-5 h-5 mr-2 text-purple-600' />
											MFCC Features (Speech Characteristics)
										</h4>
										<div className='text-sm text-purple-700 mb-4'>
											{comprehensiveFeatures.mfcc_mean.length} features analyzed for speech pattern recognition
										</div>
										<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3'>
											{comprehensiveFeatures.mfcc_mean
												.slice(0, 8)
												.map((value, index) => (
													<div
														key={index}
														className='bg-white p-3 rounded-lg border border-purple-200 text-center hover:shadow-md transition-all duration-200 hover:scale-105'>
														<div className='text-xs font-medium text-purple-600 mb-1'>
															MFCC {index + 1}
														</div>
														<div className='text-lg font-bold text-purple-900'>
															{value?.toFixed(2) || 'N/A'}
														</div>
													</div>
												))}
										</div>
									</div>
								)}

								{/* Voiced Ratio */}
								{comprehensiveFeatures.voiced_ratio !== undefined && (
									<div className='bg-gradient-to-r from-purple-50 to-white p-6 rounded-xl border border-purple-200'>
										<h4 className='text-lg font-bold text-purple-900 mb-4 flex items-center'>
											<Mic className='w-5 h-5 mr-2 text-purple-600' />
											Voice Analysis
										</h4>
										<div className='bg-white p-4 rounded-lg border border-purple-200 hover:shadow-md transition-all duration-200'>
											<div className='text-sm font-medium text-purple-700 mb-1'>Voiced Ratio</div>
											<div className='text-2xl font-bold text-purple-900'>
												{(comprehensiveFeatures.voiced_ratio * 100)?.toFixed(1) || 'N/A'}%
											</div>
											<div className='text-sm text-purple-600 mt-1'>
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
						<div className='bg-gradient-to-r from-purple-600 to-purple-700 p-6'>
							<h3 className='text-xl font-bold text-white flex items-center'>
								<Microscope className='w-6 h-6 mr-3' />
								Analysis Methods Used
							</h3>
						</div>
						<div className='p-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{details.analysis_methods.map((method, index) => (
									<div key={index} className='flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-200 hover:shadow-md transition-all duration-200'>
										<div className='w-3 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-pulse'></div>
										<span className='text-purple-900 font-medium'>{method}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Preprocessing Information */}
				{details.preprocessing_info && (
					<div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300'>
						<div className='bg-gradient-to-r from-purple-600 to-purple-700 p-6'>
							<h3 className='text-xl font-bold text-white flex items-center'>
								<Settings className='w-6 h-6 mr-3' />
								Processing Details
							</h3>
							<p className='text-purple-100 text-sm mt-2'>
								Technical parameters used in audio processing
							</p>
						</div>
						<div className='p-6'>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
								<div className='bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1'>
									<div className='flex items-center mb-3'>
										<Sliders className='w-5 h-5 text-purple-600 mr-3' />
										<div className='text-sm font-medium text-purple-700'>Sample Rate</div>
									</div>
									<div className='text-2xl font-bold text-purple-900'>
										{details.preprocessing_info.sample_rate || 'N/A'} Hz
									</div>
								</div>
								<div className='bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1'>
									<div className='flex items-center mb-3'>
										<BarChart3 className='w-5 h-5 text-purple-600 mr-3' />
										<div className='text-sm font-medium text-purple-700'>Mel Bins</div>
									</div>
									<div className='text-2xl font-bold text-purple-900'>
										{details.preprocessing_info.n_mels || 'N/A'}
									</div>
								</div>
								<div className='bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1'>
									<div className='flex items-center mb-3'>
										<RefreshCw className='w-5 h-5 text-purple-600 mr-3' />
										<div className='text-sm font-medium text-purple-700'>FFT Size</div>
									</div>
									<div className='text-2xl font-bold text-purple-900'>
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
