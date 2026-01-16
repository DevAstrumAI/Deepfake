/** @format */

import React from 'react';
import {
	Eye,
	ZoomIn,
	ZoomOut,
	RotateCcw,
	Download,
	AlertTriangle,
	CheckCircle,
	XCircle,
	Info,
	Target,
	Layers,
	Activity,
	Play,
	Pause,
	SkipBack,
	SkipForward,
	Clock,
	Filter,
	ChevronLeft,
	ChevronRight,
	EyeOff,
	Zap,
} from 'lucide-react';

function ImageAnalysis({ safeVisualEvidence }) {
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
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
				{/* Face Detection */}
				<div className='bg-blue-50 p-4 rounded-lg'>
					<div className='flex items-center space-x-2 mb-2'>
						<Target className='w-4 h-4 text-blue-600' />
						<span className='font-medium text-blue-900'>Face Detection</span>
					</div>
					<div className='text-sm text-blue-700'>
						{safeVisualEvidence.faceDetection.detected ? (
							<>
								<CheckCircle className='w-4 h-4 inline mr-1' />
								Face detected with{' '}
								{formatPercentage(safeVisualEvidence.faceDetection.confidence)}%
								confidence
							</>
						) : (
							<>
								<XCircle className='w-4 h-4 inline mr-1' />
								No face detected
							</>
						)}
					</div>
				</div>

				{/* Artifacts */}
				<div className='bg-yellow-50 p-4 rounded-lg'>
					<div className='flex items-center space-x-2 mb-2'>
						<AlertTriangle className='w-4 h-4 text-yellow-600' />
						<span className='font-medium text-yellow-900'>Artifacts</span>
					</div>
					<div className='text-sm text-yellow-700'>
						{
							safeVisualEvidence.regions.filter((r) =>
								r.type.includes('artifact')
							).length
						}{' '}
						artifact regions detected
					</div>
				</div>

				{/* Forensic Analysis */}
				<div className='bg-red-50 p-4 rounded-lg'>
					<div className='flex items-center space-x-2 mb-2'>
						<Activity className='w-4 h-4 text-red-600' />
						<span className='font-medium text-red-900'>Forensic Analysis</span>
					</div>
					<div className='text-sm text-red-700'>
						{
							Object.values(safeVisualEvidence.forensic).filter(
								(analysis) =>
									analysis &&
									typeof analysis === 'object' &&
									Object.values(analysis).some((value) =>
										typeof value === 'boolean' ? value : false
									)
							).length
						}{' '}
						forensic issues detected
					</div>
				</div>
			</div>
		</>
	);
}

export default ImageAnalysis;
