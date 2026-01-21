/** @format */

import React from 'react';
import {
	Eye,
	Target,
	Layers,
	Activity,
	AlertTriangle,
} from 'lucide-react';

const getOverlayOptionsByType = (type) => {
	if (type === 'video') {
		return [
			{ id: 'frame-analysis', label: 'Frame Analysis', icon: Target },
			{ id: 'frame-by-frame', label: 'Frame by Frame', icon: Eye },
			{
				id: 'suspicious-frames',
				label: 'Suspicious Frames',
				icon: AlertTriangle,
			},
			{ id: 'temporal', label: 'Temporal Analysis', icon: Activity },
			{ id: 'artifacts', label: 'Artifacts', icon: AlertTriangle },
			{ id: 'heatmaps', label: 'Heatmaps', icon: Layers },
		];
	}

	if (type === 'image') {
		return [
			{ id: 'face-detection', label: 'Face Detection', icon: Target },
			{ id: 'artifacts', label: 'Artifacts', icon: AlertTriangle },
			{ id: 'forensic', label: 'Forensic Analysis', icon: Activity },
			{ id: 'heatmaps', label: 'Heatmaps', icon: Layers },
		];
	}

	return [
		{ id: 'audio-analysis', label: 'Audio Analysis', icon: Activity },
		{ id: 'spectral', label: 'Spectral Analysis', icon: Layers },
		{ id: 'waveform', label: 'Waveform', icon: Target },
		{ id: 'indicators', label: 'Deepfake Indicators', icon: AlertTriangle },
	];
};

function OverlaySelection({
	setSelectedOverlay,
	selectedOverlay,
	analysisResult,
	fileType,
}) {
	const actualFileType = analysisResult?.type || fileType;
	const overlayOptions = getOverlayOptionsByType(actualFileType);

	return (
		<>
			<div className='bg-gradient-to-r from-gray-50 to-gray-100/50 p-1 rounded-lg inline-flex flex-wrap gap-1 border border-gray-200/50'>
				{overlayOptions.map((option) => {
					const Icon = option.icon;
					const isActive = selectedOverlay === option.id;
					return (
						<button
							key={option.id}
							onClick={() => setSelectedOverlay(option.id)}
							className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
								isActive
									? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md scale-105'
									: 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
							}`}>
							<Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-2' : ''}`} />
							<span>{option.label}</span>
						</button>
					);
				})}
			</div>
		</>
	);
}

export default OverlaySelection;
