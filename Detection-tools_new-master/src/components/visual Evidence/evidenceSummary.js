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

function EvidenceSummary({
	actualFileType,
	safeVisualEvidence,
	analysisResult,
}) {
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
			{actualFileType === 'video' ? (
				<>
					<div className='bg-blue-50 p-4 rounded-lg'>
						<div className='flex items-center space-x-2 mb-2'>
							<Target className='w-4 h-4 text-blue-600' />
							<span className='font-medium text-blue-900'>Frame Analysis</span>
						</div>
						<div className='text-sm text-blue-700'>
							{safeVisualEvidence.frameAnalysis?.total_frames || 0} frames
							analyzed
							<br />
							{safeVisualEvidence.frameAnalysis?.fake_frames || 0} fake frames
							detected
						</div>
					</div>

					<div className='bg-yellow-50 p-4 rounded-lg'>
						<div className='flex items-center space-x-2 mb-2'>
							<Activity className='w-4 h-4 text-yellow-600' />
							<span className='font-medium text-yellow-900'>
								Temporal Analysis
							</span>
						</div>
						<div className='text-sm text-yellow-700'>
							Consistency:{' '}
							{formatPercentage(
								safeVisualEvidence.temporalAnalysis?.consistency_score || 0
							)}
							%
							<br />
							Avg Confidence:{' '}
							{formatPercentage(
								safeVisualEvidence.temporalAnalysis?.motion_analysis
									?.average_confidence || 0
							)}
							%
						</div>
					</div>

					<div className='bg-red-50 p-4 rounded-lg'>
						<div className='flex items-center space-x-2 mb-2'>
							<AlertTriangle className='w-4 h-4 text-red-600' />
							<span className='font-medium text-red-900'>Video Quality</span>
						</div>
						<div className='text-sm text-red-700'>
							{safeVisualEvidence.heatmaps.length} analysis heatmaps
							<br />
							{safeVisualEvidence.frameAnalysis?.frame_results?.length ||
								0}{' '}
							detailed frames
						</div>
					</div>
				</>
			) : actualFileType === 'image' ? (
				<>
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
									{formatPercentage(
										safeVisualEvidence.faceDetection.confidence
									)}
									% confidence
								</>
							) : (
								<>
									<XCircle className='w-4 h-4 inline mr-1' />
									No face detected
								</>
							)}
						</div>
					</div>

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

					<div className='bg-red-50 p-4 rounded-lg'>
						<div className='flex items-center space-x-2 mb-2'>
							<Activity className='w-4 h-4 text-red-600' />
							<span className='font-medium text-red-900'>
								Forensic Analysis
							</span>
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
				</>
			) : (
				<>
					<div className='bg-blue-50 p-4 rounded-lg'>
						<div className='flex items-center space-x-2 mb-2'>
							<Activity className='w-4 h-4 text-blue-600' />
							<span className='font-medium text-blue-900'>Audio Analysis</span>
						</div>
						<div className='text-sm text-blue-700'>
							Duration:{' '}
							{analysisResult.details?.preprocessing_info?.duration?.toFixed(
								1
							) || 'N/A'}
							s
							<br />
							Sample Rate:{' '}
							{analysisResult.details?.preprocessing_info?.sample_rate ||
								'N/A'}{' '}
							Hz
						</div>
					</div>

					<div className='bg-yellow-50 p-4 rounded-lg'>
						<div className='flex items-center space-x-2 mb-2'>
							<Layers className='w-4 h-4 text-yellow-600' />
							<span className='font-medium text-yellow-900'>
								Spectral Features
							</span>
						</div>
						<div className='text-sm text-yellow-700'>
							F0:{' '}
							{analysisResult.details?.comprehensive_features?.f0_mean?.toFixed(
								1
							) || 'N/A'}{' '}
							Hz
							<br />
							Energy:{' '}
							{analysisResult.details?.comprehensive_features?.energy_mean?.toFixed(
								3
							) || 'N/A'}
						</div>
					</div>

					<div className='bg-red-50 p-4 rounded-lg'>
						<div className='flex items-center space-x-2 mb-2'>
							<AlertTriangle className='w-4 h-4 text-red-600' />
							<span className='font-medium text-red-900'>
								Deepfake Indicators
							</span>
						</div>
						<div className='text-sm text-red-700'>
							{
								Object.keys(analysisResult.details?.deepfake_indicators || {})
									.length
							}{' '}
							indicators analyzed
							<br />
							Prediction: {analysisResult.prediction} (
							{formatPercentage(analysisResult.confidence || 0)}%)
						</div>
					</div>
				</>
			)}
		</>
	);
}

export default EvidenceSummary;
