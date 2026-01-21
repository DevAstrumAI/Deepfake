/** @format */

import React from 'react';
import {
	Eye,
	Target,
	Layers,
	Activity,
	ChevronLeft,
	ChevronRight,
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
			<div className='bg-gray-100/80 p-1.5 rounded-xl inline-flex flex-wrap gap-1 mb-6 border border-gray-200'>
				{overlayOptions.map((option) => {
					const Icon = option.icon;
					const isActive = selectedOverlay === option.id;
					return (
						<button
							key={option.id}
							onClick={() => setSelectedOverlay(option.id)}
							className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
								isActive
									? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
							}`}>
							<Icon className={`w-4 h-4 ${isActive ? 'stroke-2' : ''}`} />
							<span>{option.label}</span>
						</button>
					);
				})}
			</div>
		</>
	);
}

export default OverlaySelection;
