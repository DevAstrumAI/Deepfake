/** @format */

import { useEffect } from 'react';

/**
 * Custom hook for extracting frames from video
 */
export const useFrameExtraction = (
	actualFileType,
	filteredFrames,
	videoRef,
	frameCanvasRef,
	setExtractedFrames,
	setIsExtractingFrames
) => {
	useEffect(() => {
		if (actualFileType === 'video' && filteredFrames.length > 0) {
			const timer = setTimeout(() => {
				extractFrames();
			}, 1000);

			return () => clearTimeout(timer);
		}
	}, [actualFileType, filteredFrames.length]);

	const extractFrames = async () => {
		if (!videoRef.current || actualFileType !== 'video') {
			console.log('extractFrames: No video ref or not video type');
			return;
		}

		console.log(
			'extractFrames: Starting extraction, filteredFrames.length:',
			filteredFrames.length
		);
		setIsExtractingFrames(true);
		const frames = [];
		const video = videoRef.current;
		const canvas = frameCanvasRef.current;

		if (!canvas) {
			console.log('extractFrames: No canvas ref');
			setIsExtractingFrames(false);
			return;
		}

		const ctx = canvas.getContext('2d');
		const framesToExtract = filteredFrames.slice(0, 20);
		console.log('extractFrames: Extracting', framesToExtract.length, 'frames');

		try {
			for (let i = 0; i < framesToExtract.length; i++) {
				const frame = framesToExtract[i];
				if (frame && frame.timestamp !== undefined) {
					console.log(
						`extractFrames: Processing frame ${i}, timestamp: ${frame.timestamp}`
					);
					video.currentTime = frame.timestamp;

					await new Promise((resolve) => {
						video.addEventListener('seeked', resolve, { once: true });
					});

					canvas.width = video.videoWidth;
					canvas.height = video.videoHeight;
					ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

					const frameDataUrl = canvas.toDataURL('image/jpeg', 0.8);

					frames.push({
						...frame,
						imageData: frameDataUrl,
						index: i,
					});
				}
			}

			console.log('extractFrames: Extracted', frames.length, 'frames');
			setExtractedFrames(frames);
		} catch (error) {
			console.error('Error extracting frames:', error);
		} finally {
			setIsExtractingFrames(false);
		}
	};
};

