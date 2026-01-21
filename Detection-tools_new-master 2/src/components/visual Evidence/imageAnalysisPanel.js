/** @format */

import React from 'react';
import FaceAnalysis from '../results/faceAnalysis';
import ModelPredictions from '../results/modelPrediction';
import ForensicAnalysis from '../results/forensicAnalysis';
import ImageAnalysis from './imageAnalysis'; 
import { Scan, ShieldCheck, ShieldAlert } from 'lucide-react';

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

	// const formatPercentage = (value, decimals = 1) =>
	// 	normalizePercentageValue(value).toFixed(decimals);

	const formatConfidence = (confidence, decimals = 0) =>
		Number(normalizePercentageValue(confidence).toFixed(decimals));

    const isFake = analysisResult.prediction === 'FAKE';

	return (
		<div className='mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-8'>
            {/* Header Section */}
			<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100'>
                <div className='flex items-center gap-4'>
                    <div className={`p-3 rounded-xl ${isFake ? 'bg-red-50' : 'bg-green-50'}`}>
                        <Scan className={`w-8 h-8 ${isFake ? 'text-red-500' : 'text-green-500'}`} />
                    </div>
                    <div>
                        <h3 className='text-2xl font-bold text-gray-900'>
                            Image Analysis Report
                        </h3>
                        <p className='text-sm text-gray-500 mt-1'>
                            Comprehensive breakdown of visual and data-driven analysis
                        </p>
                    </div>
                </div>

				<div className='flex items-center gap-3'>
                    <div className='text-right mr-2 hidden md:block'>
                         <div className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Detection Result</div>
                         <div className='text-sm font-semibold text-gray-700'>{formatConfidence(analysisResult.confidence)}% Confidence</div>
                    </div>
					<div
						className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all ${
							isFake
								? 'bg-red-500 text-white shadow-red-200'
								: 'bg-green-500 text-white shadow-green-200'
						}`}>
                        {isFake ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
						{analysisResult.prediction}
					</div>
				</div>
			</div> 

			{/* Image Analysis Details */}
			<ImageAnalysis safeVisualEvidence={safeVisualEvidence} />

			{/* Detailed Analysis */}
            <div className='space-y-6'>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FaceAnalysis details={details} />
                    <ModelPredictions details={details} />
                </div>
			    <ForensicAnalysis details={details} />
            </div>
		</div>
	);
}
 
export default ImageAnalysisPanel;
