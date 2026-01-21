/** @format */

import React from 'react';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const SuspiciousFramesOverlay = ({
	actualFileType,
	suspiciousFrames = [],
	extractedFrames = [],
	currentFrameIndex = 0,
	handleFrameNavigation,
}) => {
	if (actualFileType !== 'video' || !suspiciousFrames || suspiciousFrames.length === 0) {
		return (
			<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white'>
				<div className='text-center'>
					<CheckCircle className='w-8 h-8 mx-auto mb-2 text-green-400' />
					<p>No suspicious frames detected</p>
				</div>
			</div>
		);
	}

	if (!extractedFrames || extractedFrames.length === 0) {
		return null;
	}

	return (
		<div className='absolute inset-0'>
			<div className='absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded'>
				<div className='flex items-center space-x-2'>
					<button
						onClick={() => handleFrameNavigation('prev')}
						disabled={currentFrameIndex === 0}
						className='p-1 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50'>
						<ChevronLeft className='w-4 h-4' />
					</button>
					<span className='text-sm'>
						{currentFrameIndex + 1} / {extractedFrames.length}
					</span>
					<button
						onClick={() => handleFrameNavigation('next')}
						disabled={currentFrameIndex === extractedFrames.length - 1}
						className='p-1 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50'>
						<ChevronRight className='w-4 h-4' />
					</button>
				</div>
			</div>
		</div>
	);
};

export default SuspiciousFramesOverlay;

