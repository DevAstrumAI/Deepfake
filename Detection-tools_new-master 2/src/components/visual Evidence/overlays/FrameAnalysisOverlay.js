/** @format */

import React from 'react';
import { Info } from 'lucide-react';
import { formatPercentage } from '../utils/visualEvidenceUtils';

const FrameAnalysisOverlay = ({
	actualFileType,
	safeVisualEvidence,
	frameResults,
}) => {
	if (actualFileType !== 'video' || !safeVisualEvidence.frameAnalysis) {
		return (
			<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white'>
				<div className='text-center'>
					<Info className='w-8 h-8 mx-auto mb-2' />
					<p>Frame analysis not available</p>
				</div>
			</div>
		);
	}

	const currentFrame = frameResults[0];

	if (!currentFrame) {
		return (
			<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white'>
				<div className='text-center'>
					<Info className='w-8 h-8 mx-auto mb-2' />
					<p>No frame data available</p>
				</div>
			</div>
		);
	}

	return (
		<div className='absolute inset-0'>
			<div className='absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded'>
				<div className='text-sm'>
					<div>
						<strong>Frame:</strong> {currentFrame.frame_number}
					</div>
					<div>
						<strong>Timestamp:</strong> {currentFrame.timestamp?.toFixed(2)}s
					</div>
					<div>
						<strong>Prediction:</strong> {currentFrame.prediction}
					</div>
					<div>
						<strong>Confidence:</strong>{' '}
						{formatPercentage(currentFrame.confidence)}%
					</div>
				</div>
			</div>

			{currentFrame.face_detection?.detected &&
				currentFrame.face_detection.bounding_box && (
					<div
						className='absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20'
						style={{
							left: currentFrame.face_detection.bounding_box.x,
							top: currentFrame.face_detection.bounding_box.y,
							width: currentFrame.face_detection.bounding_box.width,
							height: currentFrame.face_detection.bounding_box.height,
						}}>
						<div className='absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 text-xs rounded'>
							Face ({formatPercentage(currentFrame.face_detection.confidence)}%)
						</div>
					</div>
				)}
		</div>
	);
};

export default FrameAnalysisOverlay;

