/** @format */

import React from 'react';
import {
	Target,
	AlertTriangle,
	Activity,
	CheckCircle,
	XCircle,
    Scan 
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

    // Calculate artifacts count safely
    const artifactCount = safeVisualEvidence.regions ? safeVisualEvidence.regions.filter((r) =>
        r.type.includes('artifact')
    ).length : 0;

    // Calculate forensic issues count safely
    const forensicIssuesCount = safeVisualEvidence.forensic ? Object.values(safeVisualEvidence.forensic).filter(
        (analysis) =>
            analysis &&
            typeof analysis === 'object' &&
            Object.values(analysis).some((value) =>
                typeof value === 'boolean' ? value : false
            )
    ).length : 0;

	return (
		<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
			{/* Face Detection Card */}
			<div className='bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group'>
				<div className='flex items-center gap-3 mb-4'>
                    <div className='bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors'>
					    <Target className='w-5 h-5 text-blue-600' />
                    </div>
                    <div className='flex-1'>
                        <div className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Face Detection</div>
                    </div>
                    {safeVisualEvidence.faceDetection.detected ? (
                        <div className='px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full flex items-center gap-1'>
                             <CheckCircle className='w-3 h-3' />
                             DETECTED
                        </div>
                    ) : (
                        <div className='px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full flex items-center gap-1'>
                            <XCircle className='w-3 h-3' />
                            NONE
                        </div>
                    )}
				</div>
                
                <div>
                    <div className='text-2xl font-bold text-gray-800 leading-tight'>
                        {safeVisualEvidence.faceDetection.detected ? (
                            <span>{formatPercentage(safeVisualEvidence.faceDetection.confidence)}%</span>
                        ) : (
                            <span>No Face</span>
                        )}
                    </div>
                     <div className='text-xs text-gray-400 mt-1 font-medium'>
                        {safeVisualEvidence.faceDetection.detected ? 'Confidence Score' : 'No face found in image'}
                    </div>
                </div>
			</div>

			{/* Artifacts Card */}
			<div className='bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group'>
                <div className='flex items-center gap-3 mb-4'>
                    <div className='bg-amber-50 p-2 rounded-lg group-hover:bg-amber-100 transition-colors'>
                        <AlertTriangle className='w-5 h-5 text-amber-600' />
                    </div>
                     <div className='flex-1'>
                        <div className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Visual Artifacts</div>
                    </div>
                    {artifactCount > 0 ? (
                        <div className='px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full'>
                            FOUND
                        </div>
                    ) : (
                         <div className='px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full'>
                            CLEAR
                        </div>
                    )}
                </div>

                <div>
                    <div className='text-2xl font-bold text-gray-800 leading-tight'>
                        {artifactCount}
                    </div>
                    <div className='text-xs text-gray-400 mt-1 font-medium'>
                        {artifactCount === 1 ? 'Region Detected' : 'Regions Detected'}
                    </div>
                </div>
			</div>

			{/* Forensic Analysis Card */}
			<div className='bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group'>
                <div className='flex items-center gap-3 mb-4'>
                    <div className='bg-red-50 p-2 rounded-lg group-hover:bg-red-100 transition-colors'>
					    <Activity className='w-5 h-5 text-red-600' />
                    </div>
                    <div className='flex-1'>
                        <div className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Forensic Analysis</div>
                    </div>
                    {forensicIssuesCount > 0 ? (
                         <div className='px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full'>
                            ISSUES
                        </div>
                    ) : (
                         <div className='px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full'>
                            CLEAR
                        </div>
                    )}
                </div>

                <div>
                     <div className='text-2xl font-bold text-gray-800 leading-tight'>
                        {forensicIssuesCount}
                    </div>
                    <div className='text-xs text-gray-400 mt-1 font-medium'>
                         {forensicIssuesCount === 1 ? 'Issue Detected' : 'Issues Detected'}
                    </div>
                </div>
			</div>
		</div>
	);
}
 
export default ImageAnalysis;
