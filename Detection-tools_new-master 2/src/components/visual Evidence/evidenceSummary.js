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
// import ImageAnalysis from './imageAnalysis';

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
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 w-full'>
                    {/* Frame Analysis Card */}
					<div className='bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50 rounded-2xl border-2 border-blue-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group min-w-0'>
						<div className='flex items-center justify-between mb-4'>
                            <div className='bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform'>
							    <Target className='w-6 h-6 text-white' />
                            </div>
                            <div className='px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-sm'>
                                {safeVisualEvidence.frameAnalysis?.total_frames || 0} FRAMES
                            </div>
						</div>
                        
                        <div>
                            <div className='text-4xl font-black text-blue-700 leading-tight mb-1'>
                                {safeVisualEvidence.frameAnalysis?.fake_frames || 0}
                            </div>
                            <div className='text-sm text-blue-800 font-semibold'>
                                Fake Frames Detected
                            </div>
                            <div className='mt-2 h-2 bg-blue-200 rounded-full overflow-hidden'>
                                <div 
                                    className='h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500'
                                    style={{ 
                                        width: `${safeVisualEvidence.frameAnalysis?.total_frames 
                                            ? (safeVisualEvidence.frameAnalysis.fake_frames / safeVisualEvidence.frameAnalysis.total_frames) * 100 
                                            : 0}%` 
                                    }}
                                />
                            </div>
                        </div>
					</div>

                    {/* Temporal Analysis Card */}
					<div className='bg-gradient-to-br from-amber-50 via-yellow-100/50 to-amber-50 rounded-2xl border-2 border-amber-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group min-w-0'>
						<div className='flex items-center justify-between mb-4'>
                            <div className='bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform'>
							    <Activity className='w-6 h-6 text-white' />
                            </div>
                            <div className='px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-sm'>
                                {formatPercentage(safeVisualEvidence.temporalAnalysis?.consistency_score || 0)}%
                            </div>
						</div>
                        
                        <div>
                            <div className='text-4xl font-black text-amber-700 leading-tight mb-1'>
                                {formatPercentage(safeVisualEvidence.temporalAnalysis?.motion_analysis?.average_confidence || 0)}%
                            </div>
                            <div className='text-sm text-amber-800 font-semibold'>
                                Average Confidence
                            </div>
                            <div className='mt-2 h-2 bg-amber-200 rounded-full overflow-hidden'>
                                <div 
                                    className='h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500'
                                    style={{ 
                                        width: `${formatPercentage(safeVisualEvidence.temporalAnalysis?.motion_analysis?.average_confidence || 0)}%` 
                                    }}
                                />
                            </div>
                        </div>
					</div>

                    {/* Video Quality Card */}
					<div className='bg-gradient-to-br from-red-50 via-rose-100/50 to-red-50 rounded-2xl border-2 border-red-200 p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group min-w-0'>
						<div className='flex items-center justify-between mb-4'>
                            <div className='bg-gradient-to-br from-red-500 to-rose-600 p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform'>
							    <Layers className='w-6 h-6 text-white' />
                            </div>
                            <div className='px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm'>
                                {safeVisualEvidence.heatmaps.length} HEATMAPS
                            </div>
						</div>
                        
                        <div>
                            <div className='text-4xl font-black text-red-700 leading-tight mb-1'>
                                {safeVisualEvidence.heatmaps.length}
                            </div>
                            <div className='text-sm text-red-800 font-semibold'>
                                Heatmaps Generated
                            </div>
                            <div className='mt-2 flex items-center gap-2'>
                                {safeVisualEvidence.heatmaps.length > 0 ? (
                                    <div className='flex gap-1'>
                                        {[...Array(Math.min(safeVisualEvidence.heatmaps.length, 5))].map((_, i) => (
                                            <div key={i} className='w-2 h-2 bg-red-500 rounded-full' />
                                        ))}
                                    </div>
                                ) : (
                                    <div className='text-xs text-red-600'>No heatmaps available</div>
                                )}
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

