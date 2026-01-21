/** @format */

import React from 'react';
import { XCircle, AlertTriangle, Target } from 'lucide-react';
import { formatPercentage } from '../utils/visualEvidenceUtils';

const FaceDetectionOverlay = ({
	safeVisualEvidence,
	imageRef,
	imageLoaded,
}) => {
	console.log(
		'renderFaceDetectionOverlay - safeVisualEvidence.faceDetection:',
		safeVisualEvidence.faceDetection
	);
	console.log('renderFaceDetectionOverlay - imageLoaded:', imageLoaded);
	console.log(
		'renderFaceDetectionOverlay - imageRef.current:',
		imageRef.current
	);

	if (
		!safeVisualEvidence.faceDetection ||
		!safeVisualEvidence.faceDetection.detected
	) {
		console.log('No face detected, showing no face message');
		return (
			<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white'>
				<div className='text-center'>
					<XCircle className='w-8 h-8 mx-auto mb-2' />
					<p>No face detected</p>
				</div>
			</div>
		);
	}

	const bbox = safeVisualEvidence.faceDetection.boundingBox;
	console.log('Face detection bounding box:', bbox);

	if (!bbox) {
		console.log('No bounding box available');
		return (
			<div className='absolute inset-0 flex items-center justify-center bg-yellow-500 bg-opacity-50 text-white'>
				<div className='text-center'>
					<AlertTriangle className='w-8 h-8 mx-auto mb-2' />
					<p>Face detected but no bounding box data</p>
				</div>
			</div>
		);
	}

	console.log('Rendering face detection overlay with bbox:', bbox);

	// Get image element to calculate proper positioning
	const img = imageRef.current;
	if (
		!img ||
		!imageLoaded ||
		!img.complete ||
		!img.naturalWidth ||
		!img.naturalHeight
	) {
		console.log(
			'Image not loaded yet - img:',
			img,
			'complete:',
			img?.complete,
			'naturalWidth:',
			img?.naturalWidth,
			'imageLoaded:',
			imageLoaded
		);
		return (
			<div className='absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 text-white'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2'></div>
					<p>Loading image...</p>
				</div>
			</div>
		);
	}

	const naturalWidth = img.naturalWidth;
	const naturalHeight = img.naturalHeight;

	// Get the actual displayed image dimensions (accounting for object-contain)
	const imgRect = img.getBoundingClientRect();
	const container = img.parentElement;
	if (!container) return null;
	const containerRect = container.getBoundingClientRect();

	// Calculate the scale factor for object-contain
	const containerWidth = containerRect.width;
	const containerHeight = containerRect.height;
	const scaleX = containerWidth / naturalWidth;
	const scaleY = containerHeight / naturalHeight;
	const scale = Math.min(scaleX, scaleY);

	// Calculate the actual displayed image size
	const displayedImageWidth = naturalWidth * scale;
	const displayedImageHeight = naturalHeight * scale;

	// Calculate the offset (centering) for object-contain
	const offsetX = (containerWidth - displayedImageWidth) / 2;
	const offsetY = (containerHeight - displayedImageHeight) / 2;

	// Convert bounding box coordinates to displayed coordinates
	const left = offsetX + bbox.x * scale;
	const top = offsetY + bbox.y * scale;
	const width = bbox.width * scale;
	const height = bbox.height * scale;

	console.log('Face overlay positioning:', {
		natural: { width: naturalWidth, height: naturalHeight },
		container: { width: containerWidth, height: containerHeight },
		displayedImage: {
			width: displayedImageWidth,
			height: displayedImageHeight,
		},
		scale,
		offset: { x: offsetX, y: offsetY },
		bbox,
		final: { left, top, width, height },
	});

	return (
		<div
			className='absolute pointer-events-none'
			style={{
				left: 0,
				top: 0,
				width: '100%',
				height: '100%',
				zIndex: 15,
			}}>
			{/* Face bounding box */}
			<div
				className='absolute rounded-xl transition-all duration-300'
				style={{
					left: `${left}px`,
					top: `${top}px`,
					width: `${width}px`,
					height: `${height}px`,
					zIndex: 20,
					pointerEvents: 'none',
					border: '2px solid rgba(59, 130, 246, 0.8)',
					backgroundColor: 'rgba(59, 130, 246, 0.1)',
					boxShadow:
						'0 0 20px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(59, 130, 246, 0.2)',
				}}>
				{/* Corner markers */}
				<div className='absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 border-blue-500 rounded-tl-lg'></div>
				<div className='absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 border-blue-500 rounded-tr-lg'></div>
				<div className='absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 border-blue-500 rounded-bl-lg'></div>
				<div className='absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 border-blue-500 rounded-br-lg'></div>

				{/* Label */}
				<div className='absolute -top-12 left-1/2 transform -translate-x-1/2 bg-blue-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg whitespace-nowrap z-30 border border-blue-400/50 flex items-center gap-2 transition-all duration-300 hover:scale-105'>
					<Target className='w-3.5 h-3.5' />
					<span>
						Face Detected{' '}
						<span className='opacity-80 font-normal ml-1'>
							({formatPercentage(safeVisualEvidence.faceDetection.confidence)}%)
						</span>
					</span>
				</div>
			</div>
		</div>
	);
};

export default FaceDetectionOverlay;

