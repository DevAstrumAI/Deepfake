/** @format */

import React from 'react';

function FaceAnalysis({ details }) {
	return (
		<>
			{details.face_features && (
				<div className='card'>
					<h3 className='text-xl font-semibold text-gray-900 mb-4'>
						Face Analysis
					</h3>
					<div className='grid md:grid-cols-2 gap-4'>
						<div className='space-y-3'>
							<div className='flex justify-between'>
								<span className='text-gray-600'>Face Detected</span>
								<span
									className={
										details.face_features.face_detected
											? 'text-green-600'
											: 'text-red-600'
									}>
									{details.face_features.face_detected ? 'Yes' : 'No'}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-600'>Face Symmetry</span>
								<span className='text-gray-900'>
									{(details.face_features.face_symmetry * 100).toFixed(1)}%
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-gray-600'>Face Size Ratio</span>
								<span className='text-gray-900'>
									{(details.face_features.face_size_ratio * 100).toFixed(1)}%
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default FaceAnalysis;
