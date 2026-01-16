/** @format */

import React from 'react';
import FaceAnalysis from '../results/faceAnalysis';
import ModelPredictions from '../results/modelPrediction';
import ForensicAnalysis from '../results/forensicAnalysis';
import ImageAnalysis from './imageAnalysis';

function ImageAnalysisPanel({ analysisResult, safeVisualEvidence, details }) {
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

	const formatConfidence = (confidence, decimals = 0) =>
		Number(normalizePercentageValue(confidence).toFixed(decimals));
	return (
		<>
			<div className='mt-4 bg-white rounded-lg shadow-lg p-4'>
				<div className='flex items-center justify-between mb-4'>
					<h3 className='text-lg font-semibold text-gray-900'>
						Image Analysis
					</h3>
					<div className='flex items-center space-x-2'>
						<span className='text-sm text-gray-600'>
							{analysisResult.prediction} (
							{formatConfidence(analysisResult.confidence)}% confidence)
						</span>
						<span
							className={`px-2 py-1 rounded-full text-xs font-medium ${
								analysisResult.prediction === 'FAKE'
									? 'bg-red-100 text-red-800'
									: 'bg-green-100 text-green-800'
							}`}>
							{analysisResult.prediction}
						</span>
					</div>
				</div> 

				{/* Image Analysis Details */}
				<ImageAnalysis safeVisualEvidence={safeVisualEvidence} />

				{/* Detailed Analysis */}
				<FaceAnalysis details={details} />
				<ModelPredictions details={details} />
				<ForensicAnalysis details={details} />
			</div>
		</>
	);
}

export default ImageAnalysisPanel;
