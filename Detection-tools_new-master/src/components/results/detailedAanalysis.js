/** @format */

import React from 'react';
import VideoDetailAnalysis from './videoDetailAnalysis';
import AudioDetailedAnalysis from './audioAnalysis';
import ForensicAnalysis from './forensicAnalysis';
import FaceAnalysis from './faceAnalysis';
import ModelPredictions from './modelPrediction';

function DetailedAnalysis({ result }) {
	if (!result) return null;

	// Handle video analysis details
	if (result.type === 'video' && result.frame_analysis) {
		return <VideoDetailAnalysis result={result} />;
	}

	// Handle audio analysis details
	if (result.type === 'audio') {
		return <AudioDetailedAnalysis result={result} />;
	}

	// Handle image analysis details
	if (!result.details) return null;
	const details = result.details;

	return (
		<div className='space-y-6'>
			{/* Model Predictions */}
			<ModelPredictions details={details} />

			{/* Face Analysis */}
			<FaceAnalysis details={details} />

			{/* Forensic Analysis */}
			<ForensicAnalysis details={details} />
		</div>
	);
}

export default DetailedAnalysis;
