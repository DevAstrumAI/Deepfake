/** @format */

import React from 'react';
import {
	TrendingUp,
	XCircle,
	CheckCircle,
	AlertTriangle,
	Clock,
	Zap,
} from 'lucide-react';

function RenderSummary({ result }) {
	const getPredictionColor = (prediction) => {
		switch (prediction?.toUpperCase()) {
			case 'FAKE':
				return 'text-red-600 bg-red-100';
			case 'REAL':
				return 'text-green-600 bg-green-100';
			default:
				return 'text-yellow-600 bg-yellow-100';
		}
	};
	const getPredictionIcon = (prediction) => {
		switch (prediction?.toUpperCase()) {
			case 'FAKE':
				return <XCircle className='w-6 h-6 text-red-600' />;
			case 'REAL':
				return <CheckCircle className='w-6 h-6 text-green-600' />;
			default:
				return <AlertTriangle className='w-6 h-6 text-yellow-600' />;
		}
	};
	const formatConfidence = (confidence) => {
		// Handle both decimal (0-1) and percentage (0-100) formats
		if (confidence <= 1) {
			// If confidence is decimal (0-1), convert to percentage
			return Math.round(confidence * 100);
		} else {
			// If confidence is already percentage (0-100), just round it
			return Math.round(confidence);
		}
	};
	if (!result) return null;
	return (
		<div className='space-y-6'>
			{/* Main Result */}
			<div className='card text-center'>
				<div className='flex justify-center mb-4'>
					{getPredictionIcon(result.prediction)}
				</div>
				<h2 className='text-2xl font-bold text-gray-900 mb-2'>
					{result.prediction === 'FAKE'
						? 'Deepfake Detected'
						: 'Authentic Content'}
				</h2>
				<div className='flex items-center justify-center space-x-4 mb-4'>
					<span
						className={`px-3 py-1 rounded-full text-sm font-medium ${getPredictionColor(
							result.prediction
						)}`}>
						{result.prediction}
					</span>
					<span className='text-2xl font-bold text-gray-900'>
						{formatConfidence(result.confidence)}% Confidence
					</span>
				</div>

				{/* Confidence Bar */}
				<div className='w-full bg-gray-200 rounded-full h-3 mb-4'>
					<div
						className={`h-3 rounded-full transition-all duration-500 ${
							result.prediction === 'FAKE' ? 'bg-red-500' : 'bg-green-500'
						}`}
						style={{ width: `${formatConfidence(result.confidence)}%` }}
					/>
				</div>

				<p className='text-gray-600'>
					{result.prediction === 'FAKE'
						? result.type === 'audio'
							? 'This audio shows signs of being artificially generated or manipulated.'
							: 'This content shows signs of being artificially generated or manipulated.'
						: result.type === 'audio'
						? 'This audio appears to be authentic and unmodified.'
						: 'This content appears to be authentic and unmodified.'}
				</p>
			</div>

			{/* Quick Stats */}
			<div className='grid md:grid-cols-3 gap-4'>
				<div className='card text-center'>
					<div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3'>
						<Clock className='w-6 h-6 text-blue-600' />
					</div>
					<div className='text-2xl font-bold text-gray-900 mb-1'>
						{result.analysis_time
							? new Date(result.analysis_time).toLocaleTimeString()
							: 'N/A'}
					</div>
					<div className='text-gray-600'>Analysis Time</div>
				</div>

				<div className='card text-center'>
					<div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3'>
						<Zap className='w-6 h-6 text-purple-600' />
					</div>
					<div className='text-2xl font-bold text-gray-900 mb-1'>
						{result.model_info?.models_used?.length || 'N/A'}
					</div>
					<div className='text-gray-600'>AI Models Used</div>
				</div>

				<div className='card text-center'>
					<div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3'>
						<TrendingUp className='w-6 h-6 text-green-600' />
					</div>
					<div className='text-2xl font-bold text-gray-900 mb-1'>
						{formatConfidence(result.confidence)}%
					</div>
					<div className='text-gray-600'>Accuracy</div>
				</div>
			</div>
		</div>
	);
}

export default RenderSummary;
