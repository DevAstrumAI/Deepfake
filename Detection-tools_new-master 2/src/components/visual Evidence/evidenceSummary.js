/** @format */

import React from 'react';
import {
	Target,
	AlertTriangle,
	Activity,
    Layers,
	CheckCircle,
	XCircle
} from 'lucide-react';
import ImageAnalysis from './imageAnalysis';

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
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                    {/* Frame Analysis Card */}
					<div className='bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group'>
						<div className='flex items-center gap-3 mb-4'>
                            <div className='bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors'>
							    <Target className='w-5 h-5 text-blue-600' />
                            </div>
							<div className='flex-1'>
                                <div className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Frame Analysis</div>
                            </div>
                            <div className='px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full'>
                                {safeVisualEvidence.frameAnalysis?.total_frames || 0} FRAMES
                            </div>
						</div>
                        
                        <div>
                            <div className='text-2xl font-bold text-gray-800 leading-tight'>
                                {safeVisualEvidence.frameAnalysis?.fake_frames || 0}
                            </div>
                            <div className='text-xs text-gray-400 mt-1 font-medium'>
                                Fake Frames Detected
                            </div>
                        </div>
					</div>

                    {/* Temporal Analysis Card */}
					<div className='bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group'>
						<div className='flex items-center gap-3 mb-4'>
                            <div className='bg-amber-50 p-2 rounded-lg group-hover:bg-amber-100 transition-colors'>
							    <Activity className='w-5 h-5 text-amber-600' />
                            </div>
							<div className='flex-1'>
                                <div className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Temporal</div>
                            </div>
                            <div className='px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full'>
                                {formatPercentage(safeVisualEvidence.temporalAnalysis?.consistency_score || 0)}%
                            </div>
						</div>
                        
                        <div>
                            <div className='text-2xl font-bold text-gray-800 leading-tight'>
                                {formatPercentage(safeVisualEvidence.temporalAnalysis?.motion_analysis?.average_confidence || 0)}%
                            </div>
                            <div className='text-xs text-gray-400 mt-1 font-medium'>
                                Average Confidence
                            </div>
                        </div>
					</div>

                    {/* Video Quality Card */}
					<div className='bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group'>
						<div className='flex items-center gap-3 mb-4'>
                            <div className='bg-red-50 p-2 rounded-lg group-hover:bg-red-100 transition-colors'>
							    <AlertTriangle className='w-5 h-5 text-red-600' />
                            </div>
							<div className='flex-1'>
                                <div className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Quality</div>
                            </div>
						</div>
                        
                        <div>
                            <div className='text-2xl font-bold text-gray-800 leading-tight'>
                                {safeVisualEvidence.heatmaps.length}
                            </div>
                            <div className='text-xs text-gray-400 mt-1 font-medium'>
                                Heatmaps Generated
                            </div>
                        </div>
					</div>
				</div>
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
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                    {/* Audio Analysis Card */}
					<div className='bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group'>
						<div className='flex items-center gap-3 mb-4'>
                            <div className='bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors'>
							    <Activity className='w-5 h-5 text-blue-600' />
                            </div>
							<div className='flex-1'>
                                <div className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Audio Analysis</div>
                            </div>
						</div>
                        
                        <div>
                            <div className='text-2xl font-bold text-gray-800 leading-tight'>
                                {analysisResult.details?.preprocessing_info?.duration?.toFixed(1) || '0.0'}s
                            </div>
                            <div className='text-xs text-gray-400 mt-1 font-medium'>
                                Duration ({analysisResult.details?.preprocessing_info?.sample_rate || 'N/A'} Hz)
                            </div>
                        </div>
					</div>

                    {/* Spectral Features Card */}
					<div className='bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group'>
						<div className='flex items-center gap-3 mb-4'>
                            <div className='bg-amber-50 p-2 rounded-lg group-hover:bg-amber-100 transition-colors'>
							    <Layers className='w-5 h-5 text-amber-600' />
                            </div>
							<div className='flex-1'>
                                <div className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Spectral</div>
                            </div>
						</div>
                        
                        <div>
                             <div className='text-xl font-bold text-gray-800 leading-tight'>
                                {analysisResult.details?.comprehensive_features?.f0_mean?.toFixed(0) || 'N/A'} Hz
                            </div>
                            <div className='text-xs text-gray-400 mt-1 font-medium'>
                                Fundamental Frequency
                            </div>
                        </div>
					</div>

                    {/* Deepfake Indicators Card */}
					<div className='bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group'>
						<div className='flex items-center gap-3 mb-4'>
                            <div className='bg-red-50 p-2 rounded-lg group-hover:bg-red-100 transition-colors'>
							    <AlertTriangle className='w-5 h-5 text-red-600' />
                            </div>
							<div className='flex-1'>
                                <div className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Indicators</div>
                            </div>
						</div>
                        
                        <div>
                            <div className='flex items-baseline gap-2'>
                                <div className='text-2xl font-bold text-gray-800 leading-tight'>
                                    {Object.keys(analysisResult.details?.deepfake_indicators || {}).length}
                                </div>
                                <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${analysisResult.prediction === 'FAKE' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {analysisResult.prediction}
                                </div>
                            </div>
                            <div className='text-xs text-gray-400 mt-1 font-medium'>
                                Deepfake Indicators Found
                            </div>
                        </div>
					</div>
				</div>
			)}
		</>
	);
}

export default EvidenceSummary;

