/** @format */

import React from 'react';
import { Info, Shield, Activity, Search, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

function ForensicAnalysis({ details }) {
	if (!details?.face_features?.forensic_analysis) return null;

	return (
		<div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full'>
			{/* Header */}
			<div className='flex items-center gap-3 mb-8'>
				<div className='bg-indigo-500 p-2 rounded-lg'>
					<Shield className='w-6 h-6 text-white' />
				</div>
				<h3 className='text-xl font-bold text-gray-800'>
					Forensic Analysis
				</h3>
			</div>

			<div className='space-y-6'>
				{Object.entries(details.face_features.forensic_analysis).map(
					([key, value]) => {
						if (typeof value === 'object' && value !== null) {
							return (
								<div key={key} className='bg-slate-50 rounded-xl p-5 border border-slate-100'>
									<div className='flex items-center gap-2 mb-4'>
										<Activity className='w-4 h-4 text-indigo-500' />
										<h4 className='font-bold text-gray-700 capitalize'>
											{key.replace(/_/g, ' ')}
										</h4>
									</div>
									
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										{Object.entries(value).map(([subKey, subValue]) => {
											// Determine display value and status
											let displayValue = '';
											let statusClass = '';
											let statusText = '';
											let description = '';

											// Face region coordinates are just info, not issues
											const isFaceRegion =
												key === 'face_region' || key === 'face region';
											const isCoordinate = [
												'top',
												'right',
												'bottom',
												'left',
												'width',
												'height',
											].includes(subKey);

											if (isFaceRegion && isCoordinate) {
												// Face coordinates: just show value, no status
												displayValue = `${subValue.toFixed(0)} px`;
												statusText = '📍 Location';
												statusClass = 'text-blue-600';
												description =
													subKey === 'top'
														? 'Distance from top of image'
														: subKey === 'bottom'
														? 'Distance from top of image'
														: subKey === 'left'
														? 'Distance from left of image'
														: subKey === 'right'
														? 'Distance from left of image'
														: subKey === 'width'
														? 'Face width in pixels'
														: 'Face height in pixels';
											} else if (typeof subValue === 'boolean') {
												// Boolean values: show clear status
												statusText = subValue ? '⚠️ Issue Found' : '✅ OK';
												statusClass = subValue
													? 'text-red-600 font-semibold'
													: 'text-green-600';
												description = subKey.includes('inconsistent')
													? 'Lighting is uneven across the face'
													: subKey.includes('overly_smooth')
													? 'Skin appears unnaturally smooth (possible deepfake)'
													: subKey.includes('asymmetric')
													? 'Face shows significant asymmetry'
													: subKey.includes('unnatural')
													? 'Edges appear artificial'
													: subKey.includes('suspicious')
													? 'Frequency patterns suggest manipulation'
													: '';
											} else if (typeof subValue === 'number') {
												// Numeric values: show percentage or value with context
												// Check if value is in 0-1 range (should be percentage) or raw value
												const isPercentageValue =
													subValue >= 0 &&
													subValue <= 1 &&
													(subKey.includes('symmetry') ||
														subKey.includes('uniformity') ||
														subKey.includes('score') ||
														subKey.includes('ratio'));

												if (
													subKey.includes('spectral_entropy') ||
													(subKey.includes('entropy') && subValue > 1.0)
												) {
													// Spectral entropy is a raw entropy value (typically >4.0), NOT a percentage
													displayValue = subValue.toFixed(2);
													statusText =
														subValue < 4.0 ? '⚠️ Suspicious' : '✅ Good';
													statusClass =
														subValue < 4.0
															? 'text-red-600'
															: 'text-green-600';
													description =
														'Frequency pattern complexity (higher = more natural)';
												} else if (isPercentageValue) {
													// These are 0-1 scores, show as percentage
													displayValue = `${(subValue * 100).toFixed(1)}%`;
													statusText =
														subValue < 0.5
															? '⚠️ Low'
															: subValue < 0.7
															? '⚠️ Moderate'
															: '✅ Good';
													statusClass =
														subValue < 0.5
															? 'text-red-600'
															: subValue < 0.7
															? 'text-yellow-600'
															: 'text-green-600';

													// Enhanced descriptions with explanations
													if (
														subKey.includes('edge_uniformity') ||
														subKey.includes('edge_consistency')
													) {
														description = `Edge Consistency (0-100%): Measures how natural and uniform edges are across facial features. Higher values (70-100%) indicate smooth, natural edge transitions. Lower values (<50%) suggest sharp artificial edges, grid-like patterns, or inconsistent edge distributions - common signs of AI-generated content. Real faces have organic edge patterns that flow naturally.`;
													} else if (subKey.includes('symmetry')) {
														description = `Facial Symmetry (0-100%): Measures how similar the left and right sides of the face are. Higher values (70-100%) indicate natural symmetry. Lower values (<50%) suggest potential manipulation.`;
													} else if (
														subKey.includes('brightness_uniformity')
													) {
														description = `Brightness Uniformity (0-100%): Measures how evenly brightness is distributed across the face. Higher values indicate natural lighting. Lower values suggest artificial or manipulated lighting.`;
													} else if (
														subKey.includes('gradient_uniformity')
													) {
														description = `Gradient Uniformity (0-100%): Measures how smooth lighting transitions are. Higher values indicate natural gradients. Lower values suggest artificial lighting patterns.`;
													} else if (subKey.includes('uniformity')) {
														description = `Lighting Consistency (0-100%): Measures how uniform lighting is across the face. Higher values (70-100%) mean consistent, natural lighting. Lower values (<50%) indicate inconsistent lighting patterns, a common deepfake indicator.`;
													} else {
														description = `Analysis Score (0-100%): Higher values indicate more natural characteristics. Lower values may suggest artificial generation or manipulation.`;
													}
												} else if (subKey.includes('smoothness')) {
													// Smoothness is a standard deviation value, NOT a percentage
													displayValue = subValue.toFixed(2);
													// Normal range: 3.0-10.0
													// < 3.0 = too smooth (deepfake indicator)
													// 3.0-10.0 = natural
													// > 10.0 = poor image quality
													if (subValue < 3.0) {
														statusText = '⚠️ Too Smooth';
														statusClass = 'text-red-600';
													} else if (subValue <= 10.0) {
														statusText = '✅ Natural';
														statusClass = 'text-green-600';
													} else {
														statusText = '⚠️ Poor Quality';
														statusClass = 'text-yellow-600';
													}
													description =
														'Skin texture variation (lower = smoother, may indicate deepfake)';
												} else if (subKey.includes('brightness_std')) {
													displayValue = subValue.toFixed(2);
													statusText =
														subValue > 40
															? '⚠️ Inconsistent'
															: '✅ Consistent';
													statusClass =
														subValue > 40
															? 'text-red-600'
															: 'text-green-600';
													description =
														'Brightness variation across face (higher = more inconsistent lighting)';
												} else if (subKey.includes('brightness_range')) {
													displayValue = `${subValue.toFixed(0)} (0-255)`;
													statusText =
														subValue > 100 ? '⚠️ High Range' : '✅ Normal';
													statusClass =
														subValue > 100
															? 'text-red-600'
															: 'text-green-600';
													description =
														'Difference between brightest and darkest areas';
												} else if (subKey.includes('edge_density')) {
													displayValue = `${(subValue * 100).toFixed(1)}%`;
													statusText =
														subValue < 0.05 || subValue > 0.6
															? '⚠️ Unnatural'
															: '✅ Natural';
													statusClass =
														subValue < 0.05 || subValue > 0.6
															? 'text-red-600'
															: 'text-green-600';
													description =
														'Percentage of pixels with detected edges';
												} else {
													// Other numeric values
													displayValue = subValue.toFixed(2);
													statusText =
														subValue > 0 ? '📊 Measured' : '✅ Normal';
													statusClass = 'text-gray-600';
												}
											} else {
												// Other types: show as-is
												displayValue = String(subValue);
												statusText = subValue ? '⚠️ Detected' : '✅ Normal';
												statusClass = subValue
													? 'text-red-600'
													: 'text-green-600';
											}

											// Get tooltip explanation with normal ranges
											const getTooltipText = () => {
												if (isFaceRegion && isCoordinate) {
													return `Face location in the image.\nNormal: Any valid pixel coordinates within image bounds.`;
												} else if (subKey.includes('brightness_std')) {
													return `Standard deviation of brightness across the face.\nNormal: 0-40 (lower is better)\nHigh values (>40) indicate inconsistent lighting, which may suggest deepfake manipulation.`;
												} else if (subKey.includes('brightness_range')) {
													return `Difference between brightest and darkest areas in the face.\nNormal: 0-100 (on 0-255 scale)\nHigh values (>100) suggest extreme lighting variations.`;
												} else if (
													subKey.includes('inconsistent_lighting')
												) {
													return `Indicates whether lighting is uneven across the face.\nNormal: False (consistent lighting)\nTrue indicates potential deepfake manipulation.`;
												} else if (subKey.includes('smoothness')) {
													return `Skin texture variation (standard deviation).\nNormal: 3.0-10.0\nToo low (<3.0) suggests unnaturally smooth skin, a common deepfake artifact.\nToo high (>10.0) may indicate poor image quality.`;
												} else if (subKey.includes('overly_smooth')) {
													return `Flag indicating unnaturally smooth skin texture.\nNormal: False\nTrue suggests the skin may have been artificially smoothed, a sign of deepfake.`;
												} else if (subKey.includes('symmetry')) {
													return `Facial symmetry score (how similar left and right sides are).\nNormal: 0.7-1.0 (70-100%)\nLower values (<0.5) indicate significant asymmetry, which may suggest manipulation.\nReal faces typically have 70-90% symmetry.`;
												} else if (subKey.includes('asymmetric')) {
													return `Flag indicating significant facial asymmetry.\nNormal: False\nTrue suggests the face may have been manipulated or is a deepfake.`;
												} else if (subKey.includes('uniformity')) {
													return `Lighting consistency score.\nNormal: 0.7-1.0 (70-100%)\nLower values (<0.5) indicate inconsistent lighting, a potential deepfake indicator.`;
												} else if (subKey.includes('edge_density')) {
													return `Percentage of pixels with detected edges.\nNormal: 0.05-0.6 (5-60%)\nToo low (<5%) or too high (>60%) suggests unnatural edge patterns, common in deepfakes.`;
												} else if (subKey.includes('unnatural')) {
													return `Flag indicating artificial or unnatural edge patterns.\nNormal: False\nTrue suggests edges may have been artificially created or modified.`;
												} else if (
													subKey.includes('spectral_entropy') ||
													(subKey.includes('entropy') &&
														typeof subValue === 'number' &&
														subValue > 1.0)
												) {
													return `Spectral entropy (frequency pattern complexity).\nNormal: >4.0\nLower values (<4.0) indicate regular, repeating patterns which may suggest digital manipulation.\nThis is NOT a percentage - it's a raw entropy measurement.`;
												} else if (subKey.includes('suspicious')) {
													return `Flag indicating suspicious frequency patterns.\nNormal: False\nTrue suggests the image may have been digitally manipulated.`;
												}
												return description || 'Analysis metric value';
											};

											const tooltipText = getTooltipText();

											return (
												<div
													key={subKey}
													className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group relative'>
													<div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10'>
														<div className='relative'>
															<Info className='w-4 h-4 text-gray-400 hover:text-indigo-500 cursor-help' />
															<div className='absolute right-0 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none'>
																<div className='whitespace-pre-line'>
																	{tooltipText}
																</div>
																<div className='absolute top-full right-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'></div>
															</div>
														</div>
													</div>
													
													<div className='flex flex-col h-full justify-between'>
														<div>
															<div className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-1'>
																{subKey.replace(/_/g, ' ')}
															</div>
															{displayValue && (
																<div className='text-xl font-bold text-gray-800 mb-1'>
																	{displayValue}
																</div>
															)}
															{description && (
																<div className='text-sm text-gray-500 mb-3 font-medium'>
																	{description}
																</div>
															)}
														</div>
														
														<div className={`flex items-center gap-2 text-sm font-medium ${statusClass}`}>
															{statusText.startsWith('⚠️') ? (
																<AlertTriangle className='w-4 h-4' />
															) : statusText.startsWith('✅') ? (
																<CheckCircle className='w-4 h-4' />
															) : (
																<Info className='w-4 h-4' /> /* Fallback for HelpCircle if not present */
															)}
															<span>{statusText.replace(/^[⚠️✅📊]\s*/, '')}</span>
														</div>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							);
						}
						return null;
					}
				)}
				
				{/* Global Footer */}
				<div className='bg-indigo-50 rounded-xl p-4 flex items-center gap-3 border border-indigo-100'>
					<div className='bg-indigo-500 rounded-full p-1'>
						<Search className='w-5 h-5 text-white' />
					</div>
					<div>
						<div className='font-bold text-gray-800 text-sm'>
							Detailed Forensic Scan
						</div>
						<div className='text-xs text-gray-500'>
							AI-powered pattern and anomaly detection
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ForensicAnalysis;
