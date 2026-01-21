/** @format */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPercentage } from '../utils/visualEvidenceUtils';

const FrameByFrameOverlay = ({
	actualFileType,
	frameResults,
	filteredFrames,
	currentFrameIndex,
	extractedFrames,
	handleFrameNavigation,
}) => {
	if (actualFileType !== 'video' || !frameResults.length) {
		return (
			<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white'>
				<div className='text-center'>
					<p>Frame-by-frame analysis not available</p>
				</div>
			</div>
		);
	}

	const currentFrame = filteredFrames[currentFrameIndex];
	if (!currentFrame) return null;

	return (
		<div className='absolute inset-0'>
			<div className='absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded'>
				<div className='flex items-center space-x-2 mb-2'>
					<button
						onClick={() => handleFrameNavigation('prev')}
						disabled={currentFrameIndex === 0}
						className='p-1 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50'>
						<ChevronLeft className='w-4 h-4' />
					</button>
					<span className='text-sm'>
						Frame {currentFrameIndex + 1} of {extractedFrames.length}
					</span>
					<button
						onClick={() => handleFrameNavigation('next')}
						disabled={currentFrameIndex === extractedFrames.length - 1}
						className='p-1 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50'>
						<ChevronRight className='w-4 h-4' />
					</button>
				</div>
				<div className='text-xs'>
					<div>Frame #{currentFrame.frame_number}</div>
					<div>Time: {currentFrame.timestamp?.toFixed(2)}s</div>
				</div>
			</div>

			<div className='absolute top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded max-w-sm'>
				<div className='text-sm'>
					<div className='flex items-center space-x-2 mb-2'>
						<span>
							<strong>Frame Analysis</strong>
						</span>
						<span
							className={`px-2 py-1 rounded text-xs ${
								currentFrame.prediction === 'FAKE'
									? 'bg-red-500'
									: 'bg-green-500'
							}`}>
							{currentFrame.prediction}
						</span>
					</div>
					<div>Confidence: {formatPercentage(currentFrame.confidence)}%</div>
				</div>
			</div>
		</div>
	);
};

export default FrameByFrameOverlay;

