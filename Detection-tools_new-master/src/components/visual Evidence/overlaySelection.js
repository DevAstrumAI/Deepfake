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
			<div className='flex flex-wrap gap-2 mb-4'>
				{overlayOptions.map((option) => {
					const Icon = option.icon;
					return (
						<button
							key={option.id}
							onClick={() => setSelectedOverlay(option.id)}
							className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
								selectedOverlay === option.id
									? 'bg-primary-100 text-primary-700 border border-primary-200'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}>
							<Icon className='w-4 h-4' />
							<span>{option.label}</span>
						</button>
					);
				})}
			</div>
		</>
	);
}

export default OverlaySelection;
