/** @format */

import React from 'react';
import {
	Eye,
	ZoomIn,
	ZoomOut,
	RotateCcw,
	Download,
	AlertTriangle,
	CheckCircle,
	XCircle,
	Info,
	Target,
	Layers,
	Activity,
	Play,
	Pause,
	SkipBack,
	SkipForward,
	Clock,
	Filter,
	ChevronLeft,
	ChevronRight,
	EyeOff,
	Zap,
} from 'lucide-react';

function VideoFrameAnaylsis({
	setFilterSuspicious,
	filterSuspicious,
	setShowFrameAnalysis,
	showFrameAnalysis,
	analysisResult,
	extractedFrames,
	currentFrameIndex,
	handleFrameSelect,
	isExtractingFrames,
}) {
	const normalizePercentageValue = (value) => {
		if (value === undefined || value === null || Number.isNaN(value)) {
			return 0;
		}
		let numeric = typeof value === 'string' ? parseFloat(value) : value;
		if (!Number.isFinite(numeric)) {
			return 0;
		}
		if (Math.abs(numeric) <= 1) {
			numeric = numeric * 100;
		}
		return Math.max(0, Math.min(100, numeric));
	};

	const formatPercentage = (value, decimals = 1) =>
		normalizePercentageValue(value).toFixed(decimals);
	const getSuspiciousReasons = (frame) => {
		const reasons = [];

		if (frame.prediction === 'FAKE') {
			reasons.push('Predicted as fake');
		}

		if (frame.confidence < 0.5) {
			reasons.push(`Low confidence (${formatPercentage(frame.confidence)}%)`);
		}

		if (frame.artifacts) {
			if (frame.artifacts.border_quality < 0.7) {
				reasons.push('Poor border quality');
			}
			if (frame.artifacts.edge_uniformity < 0.7) {
				reasons.push('Inconsistent edges');
			}
			if (frame.artifacts.lighting_consistency < 0.7) {
				reasons.push('Inconsistent lighting');
			}
		}

		if (frame.forensic_analysis) {
			Object.entries(frame.forensic_analysis).forEach(([key, value]) => {
				if (typeof value === 'number' && value < 0.7) {
					reasons.push(`${key.replace('_', ' ')} anomaly`);
				}
			});
		}

		return reasons.length > 0 ? reasons : ['No specific issues detected'];
	};
	// Get frame analysis data
	const frameAnalysis =
		analysisResult?.visual_evidence?.frame_analysis ||
		analysisResult?.frame_analysis ||
		{};
	const frameResults = frameAnalysis.frame_results || [];
	const suspiciousFrames = frameResults.filter(
		(frame) => frame.prediction === 'FAKE' || frame.confidence < 0.5
	);
	const filteredFrames = filterSuspicious ? suspiciousFrames : frameResults;
	return (
		<>
			<div className='mt-4 bg-white rounded-lg shadow-lg p-4'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center space-x-2'>
						<Eye className='w-5 h-5 text-primary-600' />
						<h4 className='text-lg font-semibold text-gray-900'>
							Frame Analysis
						</h4>
					</div>
					<div className='flex items-center space-x-2'>
						<button
							onClick={() => setFilterSuspicious(!filterSuspicious)}
							className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
								filterSuspicious
									? 'bg-red-100 text-red-700 border border-red-200'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}>
							<Filter className='w-4 h-4' />
							<span>Show Suspicious Only</span>
						</button>
						<button
							onClick={() => setShowFrameAnalysis(!showFrameAnalysis)}
							className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
								showFrameAnalysis
									? 'bg-blue-100 text-blue-700 border border-blue-200'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}>
							<Eye className='w-4 h-4' />
							<span>{showFrameAnalysis ? 'Hide' : 'Show'} Frame List</span>
						</button>
					</div>
				</div>

				{/* Frame Statistics */}
				<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
					<div className='bg-blue-50 p-3 rounded-lg'>
						<div className='text-sm text-blue-600 font-medium'>
							Total Frames
						</div>
						<div className='text-lg font-bold text-blue-900'>
							{frameResults.length}
						</div>
					</div>
					<div className='bg-red-50 p-3 rounded-lg'>
						<div className='text-sm text-red-600 font-medium'>Suspicious</div>
						<div className='text-lg font-bold text-red-900'>
							{suspiciousFrames.length}
						</div>
					</div>
					<div className='bg-green-50 p-3 rounded-lg'>
						<div className='text-sm text-green-600 font-medium'>Real</div>
						<div className='text-lg font-bold text-green-900'>
							{frameResults.length - suspiciousFrames.length}
						</div>
					</div>
					<div className='bg-yellow-50 p-3 rounded-lg'>
						<div className='text-sm text-yellow-600 font-medium'>
							Suspicious Rate
						</div>
						<div className='text-lg font-bold text-yellow-900'>
							{frameResults.length > 0
								? `${formatPercentage(
										suspiciousFrames.length / frameResults.length
								  )}%`
								: '0.0%'}
						</div>
					</div>
				</div>

				{/* Frame List */}
				{showFrameAnalysis && (
					<div className='max-h-96 overflow-y-auto'>
						<div className='mb-2 text-sm text-gray-600'>
							Showing {extractedFrames.length} extracted frames
						</div>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
							{extractedFrames.length === 0 ? (
								<div className='col-span-full text-center text-gray-500 py-8'>
									No frames extracted yet.{' '}
									{isExtractingFrames
										? 'Extracting...'
										: 'Click "Show Frame List" to extract frames.'}
								</div>
							) : (
								extractedFrames.map((frame, index) => (
									<div
										key={frame.frame_number}
										onClick={() => handleFrameSelect(index)}
										className={`rounded-lg border cursor-pointer transition-colors overflow-hidden ${
											currentFrameIndex === index
												? 'border-blue-500 bg-blue-50'
												: frame.prediction === 'FAKE'
												? 'border-red-200 bg-red-50 hover:bg-red-100'
												: 'border-gray-200 bg-gray-50 hover:bg-gray-100'
										}`}>
										{/* Frame Image */}
										<div className='relative'>
											<img
												src={frame.imageData}
												alt={`Frame ${frame.frame_number}`}
												className='w-full h-24 object-cover'
											/>
											{/* Prediction Badge */}
											<div className='absolute top-1 right-1'>
												<span
													className={`px-2 py-1 rounded text-xs font-medium ${
														frame.prediction === 'FAKE'
															? 'bg-red-500 text-white'
															: 'bg-green-500 text-white'
													}`}>
													{frame.prediction}
												</span>
											</div>
											{/* Frame Number */}
											<div className='absolute top-1 left-1 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs'>
												#{frame.frame_number}
											</div>
										</div>

										{/* Frame Details */}
										<div className='p-2'>
											<div className='text-xs text-gray-600 space-y-1'>
												<div>Time: {frame.timestamp?.toFixed(2)}s</div>
												<div>
													Confidence: {formatPercentage(frame.confidence)}%
												</div>
												{frame.prediction === 'FAKE' && (
													<div className='text-red-600 text-xs'>
														{getSuspiciousReasons(frame).slice(0, 1).join(', ')}
													</div>
												)}
											</div>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				)}
			</div>
		</>
	);
}

export default VideoFrameAnaylsis;
