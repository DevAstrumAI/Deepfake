/** @format */

import React from 'react';
import { Info } from 'lucide-react';
import { formatPercentage } from '../utils/visualEvidenceUtils';

const TemporalAnalysisOverlay = ({
	actualFileType,
	safeVisualEvidence,
}) => {
	if (actualFileType !== 'video' || !safeVisualEvidence.temporalAnalysis) {
		return (
			<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white'>
				<div className='text-center'>
					<Info className='w-8 h-8 mx-auto mb-2' />
					<p>Temporal analysis not available</p>
				</div>
			</div>
		);
	}

	const temporalAnalysis = safeVisualEvidence.temporalAnalysis;
	const consistencyScore = temporalAnalysis.consistency_score || 0;
	const motionAnalysis = temporalAnalysis.motion_analysis || {};

	return (
		<div className='absolute inset-0'>
			<div className='absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded'>
				<div className='text-sm'>
					<div>
						<strong>Consistency Score:</strong>{' '}
						{formatPercentage(consistencyScore)}%
					</div>
					<div>
						<strong>Confidence Variance:</strong>{' '}
						{motionAnalysis.confidence_variance !== undefined
							? motionAnalysis.confidence_variance.toFixed(3)
							: 'N/A'}
					</div>
					<div>
						<strong>Avg Confidence:</strong>{' '}
						{motionAnalysis.average_confidence !== undefined
							? `${formatPercentage(motionAnalysis.average_confidence)}%`
							: 'N/A'}
					</div>
				</div>
			</div>

			<div className='absolute top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded'>
				<div className='text-sm'>
					<div
						className={`font-bold ${
							consistencyScore > 0.7
								? 'text-green-400'
								: consistencyScore > 0.4
								? 'text-yellow-400'
								: 'text-red-400'
						}`}>
						{consistencyScore > 0.7
							? 'Consistent'
							: consistencyScore > 0.4
							? 'Moderate'
							: 'Inconsistent'}
					</div>
					<div className='text-xs text-gray-300'>Frame Consistency</div>
				</div>
			</div>
		</div>
	);
};

export default TemporalAnalysisOverlay;

