/** @format */

import React from 'react';
import { formatPercentage } from '../utils/visualEvidenceUtils';

const ArtifactsOverlay = ({
	actualFileType,
	safeVisualEvidence,
	imageRef,
	videoRef,
	selectedFrame,
	extractedFrames,
	currentFrameIndex,
	filteredFrames,
	frameResults,
}) => {
	console.log(
		'renderArtifactsOverlay - safeVisualEvidence.regions:',
		safeVisualEvidence.regions
	);
	console.log(
		'renderArtifactsOverlay - safeVisualEvidence.artifacts:',
		safeVisualEvidence.artifacts
	);

	if (actualFileType === 'video') {
		const videoElement = videoRef.current;
		const overlayFrame =
			selectedFrame ||
			extractedFrames[currentFrameIndex] ||
			filteredFrames[currentFrameIndex] ||
			frameResults[currentFrameIndex];

		if (!videoElement) {
			return (
				<div className='absolute inset-0 flex items-center justify-center'>
					<div className='bg-black bg-opacity-60 text-white px-4 py-2 rounded'>
						Preparing video overlay...
					</div>
				</div>
			);
		}

		if (!overlayFrame || !overlayFrame.face_detection?.bounding_box) {
			return (
				<div className='absolute inset-0 flex items-center justify-center'>
					<div className='bg-black bg-opacity-60 text-white px-4 py-2 rounded'>
						No artifact regions detected for current frame
					</div>
				</div>
			);
		}

		const rect = videoElement.getBoundingClientRect();
		const displayWidth = rect.width || videoElement.clientWidth || 1;
		const displayHeight = rect.height || videoElement.clientHeight || 1;
		const naturalWidth = videoElement.videoWidth || displayWidth;
		const naturalHeight = videoElement.videoHeight || displayHeight;
		const scaleX = displayWidth / naturalWidth;
		const scaleY = displayHeight / naturalHeight;

		const bbox = overlayFrame.face_detection.bounding_box;
		const left = (bbox.x || 0) * scaleX;
		const top = (bbox.y || 0) * scaleY;
		const width = (bbox.width || 0) * scaleX;
		const height = (bbox.height || 0) * scaleY;
		const artifactScores = overlayFrame.artifacts || {};
		const artifactEntries = Object.entries(artifactScores).filter(
			([, score]) => typeof score === 'number'
		);

		return (
			<div className='absolute inset-0 pointer-events-none'>
				<div
					className='absolute border-4 border-yellow-500 bg-yellow-500 bg-opacity-25 rounded-lg shadow-lg'
					style={{
						left,
						top,
						width,
						height,
					}}>
					<div className='absolute -top-10 left-0 bg-yellow-500 text-white px-3 py-1 rounded text-sm font-semibold shadow'>
						Artifact focus area
					</div>
				</div>
				{artifactEntries.length > 0 && (
					<div className='absolute top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded text-xs space-y-1'>
						{artifactEntries.map(([key, score]) => (
							<div key={key} className='flex justify-between gap-4'>
								<span className='capitalize'>{key.replace(/_/g, ' ')}</span>
								<span>{formatPercentage(score)}%</span>
							</div>
						))}
					</div>
				)}
			</div>
		);
	}

	// Get image element for positioning
	const img = imageRef.current;
	if (!img || !img.complete || !img.naturalWidth) {
		console.log('Image not loaded yet for artifacts overlay');
		return null;
	}

	const naturalWidth = img.naturalWidth;
	const naturalHeight = img.naturalHeight;

	// Collect all artifact regions from different sources
	const artifactRegions = [
		...safeVisualEvidence.regions.filter(
			(r) =>
				r.type &&
				(r.type.includes('artifact') ||
					r.type.includes('border') ||
					r.type.includes('edge'))
		),
		...(safeVisualEvidence.artifacts.borderRegions || []),
		...(safeVisualEvidence.artifacts.edgeRegions || []),
		...(safeVisualEvidence.artifacts.lightingRegions || []),
		...(safeVisualEvidence.artifacts.textureRegions || []),
	];

	console.log(
		'Artifact regions found:',
		artifactRegions.length,
		artifactRegions
	);

	// If no specific artifact regions, show face area with artifact indicators
	if (artifactRegions.length === 0) {
		if (safeVisualEvidence.faceDetection.boundingBox) {
			const bbox = safeVisualEvidence.faceDetection.boundingBox;
			const leftPercent = (bbox.x / naturalWidth) * 100;
			const topPercent = (bbox.y / naturalHeight) * 100;
			const widthPercent = (bbox.width / naturalWidth) * 100;
			const heightPercent = (bbox.height / naturalHeight) * 100;

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
					<div
						className='absolute border-4 border-yellow-500 bg-yellow-500 bg-opacity-25 rounded-lg'
						style={{
							left: `${leftPercent}%`,
							top: `${topPercent}%`,
							width: `${widthPercent}%`,
							height: `${heightPercent}%`,
							zIndex: 20,
							boxShadow:
								'0 0 25px rgba(234, 179, 8, 0.8), inset 0 0 20px rgba(234, 179, 8, 0.3)',
							pointerEvents: 'none',
							borderWidth: '4px',
							borderStyle: 'solid',
							borderColor: '#eab308',
						}}>
						<div className='absolute -top-12 left-0 bg-yellow-500 text-white px-4 py-2 text-sm rounded-lg font-bold shadow-2xl whitespace-nowrap z-30 border-2 border-yellow-300'>
							⚠️ Artifact Analysis Area
						</div>
					</div>
				</div>
			);
		}
		return null;
	}

	// Render artifact regions
	return (
		<div
			className='absolute pointer-events-none'
			style={{ left: 0, top: 0, width: '100%', height: '100%', zIndex: 15 }}>
			{artifactRegions.map((region, index) => {
				const coords = region.coordinates || region;
				if (!coords || (!coords.x && !coords.left)) {
					console.warn('Artifact region missing coordinates:', region);
					return null;
				}

				const x = coords.x || coords.left || 0;
				const y = coords.y || coords.top || 0;
				const width = coords.width || 100;
				const height = coords.height || 100;
				// Use color from region, or determine based on type/score
				let color = region.color;
				if (!color) {
					if (region.type?.includes('border')) {
						color = '#ef4444';
					} else if (region.type?.includes('edge')) {
						color = '#f59e0b';
					} else if (region.type?.includes('texture')) {
						color = '#f59e0b';
					} else {
						color = '#f59e0b';
					}
				}

				// Calculate percentage positions
				const leftPercent = (x / naturalWidth) * 100;
				const topPercent = (y / naturalHeight) * 100;
				const widthPercent = (width / naturalWidth) * 100;
				const heightPercent = (height / naturalHeight) * 100;

				return (
					<div
						key={index}
						className='absolute border-4 bg-opacity-30 rounded-lg'
						style={{
							left: `${leftPercent}%`,
							top: `${topPercent}%`,
							width: `${widthPercent}%`,
							height: `${heightPercent}%`,
							borderColor: color,
							backgroundColor: color,
							zIndex: 20,
							boxShadow: `0 0 20px ${color}80, inset 0 0 15px ${color}40`,
							pointerEvents: 'none',
							borderWidth: '4px',
							borderStyle: 'solid',
						}}>
						<div
							className='absolute -top-10 left-0 px-3 py-2 text-sm rounded-lg text-white font-bold shadow-xl whitespace-nowrap z-30 border-2'
							style={{ backgroundColor: color, borderColor: color }}>
							{region.description || region.type || 'Artifact'}
							{region.score !== undefined &&
								` (${formatPercentage(region.score)}%)`}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default ArtifactsOverlay;

