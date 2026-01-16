/** @format */

import React from 'react';

function FaceDetectionDetails({ safeVisualEvidence }) {
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
	return (
		<>
			{safeVisualEvidence.faceDetection.detected && (
				<div className='bg-gray-50 p-3 rounded'>
					<div className='text-sm text-gray-700'>
						<strong>Face Region:</strong>{' '}
						{safeVisualEvidence.faceDetection.boundingBox?.width || 0}×
						{safeVisualEvidence.faceDetection.boundingBox?.height || 0} pixels
						<br />
						<strong>Confidence:</strong>{' '}
						{formatPercentage(safeVisualEvidence.faceDetection.confidence)}%
					</div>
				</div>
			)}
		</>
	);
}

export default FaceDetectionDetails;
