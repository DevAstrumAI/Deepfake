/** @format */

/**
 * Utility functions for visual evidence processing
 */

export const getDefaultOverlay = (type) => {
	if (type === 'image') return 'face-detection';
	if (type === 'video') return 'frame-analysis';
	if (type === 'audio') return 'audio-analysis';
	return '';
};

export const getOverlayOptionsByType = (type) => {
	const { Target, Eye, AlertTriangle, Activity, Layers } = require('lucide-react');

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

export const normalizePercentageValue = (value) => {
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

export const formatPercentage = (value, decimals = 1) =>
	normalizePercentageValue(value).toFixed(decimals);

export const formatConfidence = (confidence, decimals = 0) =>
	Number(normalizePercentageValue(confidence).toFixed(decimals));

export const getFileExtension = (filename, defaultType = 'image') => {
	if (!filename) return defaultType === 'image' ? '.jpg' : '.wav';
	const lastDot = filename.lastIndexOf('.');
	return lastDot !== -1 ? filename.substring(lastDot) : '.jpg';
};

export const generateHeatmaps = (artifactAnalysis, forensicAnalysis) => {
	const heatmaps = [];

	// Generate heatmap for border quality
	if (artifactAnalysis.border_analysis?.border_quality !== undefined) {
		heatmaps.push({
			type: 'border-quality',
			intensity: artifactAnalysis.border_analysis.border_quality,
			color:
				artifactAnalysis.border_analysis.border_quality > 0.7
					? '#22c55e'
					: artifactAnalysis.border_analysis.border_quality > 0.4
					? '#f59e0b'
					: '#ef4444',
			description: 'Border Quality Analysis',
		});
	}

	// Generate heatmap for edge consistency
	if (artifactAnalysis.edge_analysis?.edge_uniformity !== undefined) {
		heatmaps.push({
			type: 'edge-uniformity',
			intensity: artifactAnalysis.edge_analysis.edge_uniformity,
			color:
				artifactAnalysis.edge_analysis.edge_uniformity > 0.7
					? '#22c55e'
					: artifactAnalysis.edge_analysis.edge_uniformity > 0.4
					? '#f59e0b'
					: '#ef4444',
			description: 'Edge Uniformity Analysis',
		});
	}

	// Generate heatmap for lighting consistency
	if (
		forensicAnalysis.lighting_analysis?.brightness_uniformity !== undefined
	) {
		heatmaps.push({
			type: 'lighting-uniformity',
			intensity: forensicAnalysis.lighting_analysis.brightness_uniformity,
			color:
				forensicAnalysis.lighting_analysis.brightness_uniformity > 0.7
					? '#22c55e'
					: forensicAnalysis.lighting_analysis.brightness_uniformity > 0.4
					? '#f59e0b'
					: '#ef4444',
			description: 'Lighting Uniformity Analysis',
		});
	}

	return heatmaps;
};

export const calculateTemporalAnalysisFromFrames = (frameResults, suspiciousFrames) => {
	if (!frameResults.length) {
		return { consistency_score: 0, motion_analysis: {} };
	}

	const confidences = frameResults.map((frame) => frame.confidence || 0);
	const averageConfidence =
		confidences.reduce((sum, value) => sum + value, 0) / confidences.length;
	const variance =
		confidences.reduce(
			(sum, value) => sum + Math.pow(value - averageConfidence, 2),
			0
		) / confidences.length;
	const suddenChanges = frameResults.reduce((count, frame, index) => {
		if (index === 0) return count;
		const prev = frameResults[index - 1];
		const diff = Math.abs((frame.confidence || 0) - (prev.confidence || 0));
		return diff > 0.2 ? count + 1 : count;
	}, 0);
	const predictionSwaps = frameResults.reduce((count, frame, index) => {
		if (index === 0) return 0;
		return frame.prediction !== frameResults[index - 1].prediction
			? count + 1
			: count;
	}, 0);

	const variancePenalty = Math.min(1, variance * 4);
	const changePenalty = suddenChanges / Math.max(1, frameResults.length);
	const swapPenalty = predictionSwaps / Math.max(1, frameResults.length);
	const consistencyScore = Math.max(
		0,
		1 - (variancePenalty + changePenalty + swapPenalty)
	);

	return {
		consistency_score: Number(consistencyScore.toFixed(3)),
		motion_analysis: {
			average_confidence: Number(averageConfidence.toFixed(3)),
			confidence_variance: Number(variance.toFixed(3)),
			sudden_changes: suddenChanges,
			prediction_swaps: predictionSwaps,
			fake_ratio: frameResults.length
				? Number((suspiciousFrames.length / frameResults.length).toFixed(3))
				: 0,
		},
	};
};

export const generateVideoHeatmapsFromFrames = (frameResults, suspiciousFrames, temporalMetrics) => {
	if (!frameResults.length) return [];
	const averageConfidence =
		temporalMetrics.motion_analysis.average_confidence || 0;
	const fakeDensity = frameResults.length
		? suspiciousFrames.length / frameResults.length
		: 0;

	return [
		{
			type: 'frame-confidence',
			intensity: averageConfidence,
			color:
				averageConfidence > 0.7
					? '#22c55e'
					: averageConfidence > 0.4
					? '#f59e0b'
					: '#ef4444',
			description: 'Average frame confidence across the video',
		},
		{
			type: 'fake-density',
			intensity: fakeDensity,
			color:
				fakeDensity < 0.2
					? '#22c55e'
					: fakeDensity < 0.5
					? '#f59e0b'
					: '#ef4444',
			description: 'Density of suspicious frames in the timeline',
		},
		{
			type: 'consistency-trend',
			intensity: temporalMetrics.consistency_score || 0,
			color:
				temporalMetrics.consistency_score > 0.7
					? '#22c55e'
					: temporalMetrics.consistency_score > 0.4
					? '#f59e0b'
					: '#ef4444',
			description:
				'Temporal consistency derived from frame-to-frame variance',
		},
	];
};

export const deriveVideoArtifactRegions = (suspiciousFrames) => {
	if (!suspiciousFrames.length) return [];
	const regions = [];

	suspiciousFrames.slice(0, 10).forEach((frame) => {
		const bbox = frame.face_detection?.bounding_box;
		if (bbox) {
			regions.push({
				type: 'border-artifacts',
				coordinates: {
					x: bbox.x,
					y: bbox.y,
					width: bbox.width,
					height: bbox.height,
				},
				description: `Frame #${frame.frame_number} flagged as ${frame.prediction}`,
				score: 1 - (frame.confidence || 0),
				color: '#ef4444',
			});
		}
	});

	return regions;
};

export const generateRegionsFromBackend = (backendEvidence) => {
	const regions = [];

	// Add face detection region
	if (backendEvidence.face_detection?.bounding_box) {
		regions.push({
			type: 'face-region',
			coordinates: backendEvidence.face_detection.bounding_box,
			color: '#3b82f6',
			description: 'Detected Face Region',
			confidence: backendEvidence.face_detection.confidence || 0,
		});
	}

	// Add artifact regions
	backendEvidence.artifacts?.border_regions?.forEach((region) => {
		if (region.coordinates && region.coordinates.x !== undefined) {
			regions.push({
				type: 'border-artifacts',
				coordinates: region.coordinates,
				color: '#ef4444',
				description: region.description,
				score: region.score,
				severity:
					region.score > 0.7 ? 'low' : region.score > 0.4 ? 'medium' : 'high',
			});
		}
	});

	backendEvidence.artifacts?.edge_regions?.forEach((region) => {
		if (region.coordinates && region.coordinates.x !== undefined) {
			regions.push({
				type: 'edge-artifacts',
				coordinates: region.coordinates,
				color: '#f59e0b',
				description: region.description,
				score: region.score,
				severity:
					region.score > 0.7 ? 'low' : region.score > 0.4 ? 'medium' : 'high',
			});
		}
	});

	return regions;
};

export const generateRegions = (faceFeatures, artifactAnalysis) => {
	const regions = [];

	if (faceFeatures.face_region) {
		regions.push({
			type: 'face-region',
			coordinates: {
				x: faceFeatures.face_region.left,
				y: faceFeatures.face_region.top,
				width: faceFeatures.face_region.width,
				height: faceFeatures.face_region.height,
			},
			color: '#3b82f6',
			description: 'Detected Face Region',
			confidence: faceFeatures.face_confidence || 0,
		});
	}

	// Add artifact regions based on analysis
	if (
		artifactAnalysis.border_analysis?.border_region &&
		artifactAnalysis.border_analysis.border_region.x !== undefined
	) {
		regions.push({
			type: 'border-artifacts',
			coordinates: artifactAnalysis.border_analysis.border_region,
			color: '#ef4444',
			description: 'Border Artifacts Detected',
			severity: 'high',
		});
	}

	if (
		artifactAnalysis.edge_analysis?.problematic_regions &&
		artifactAnalysis.edge_analysis.problematic_regions.x !== undefined
	) {
		regions.push({
			type: 'edge-artifacts',
			coordinates: artifactAnalysis.edge_analysis.problematic_regions,
			color: '#f59e0b',
			description: 'Edge Inconsistencies',
			severity: 'medium',
		});
	}

	return regions;
};

export const getSuspiciousReasons = (frame, formatPercentage) => {
	const reasons = [];

	if (frame.prediction === 'FAKE') {
		reasons.push('Predicted as fake');
	}

	if (frame.confidence < 0.5) {
		reasons.push(`Low confidence (${formatPercentage(frame.confidence)}%)`);
	}

	if (frame.artifacts) {
		if (frame.artifacts.border_quality < 0.7) {
			reasons.push('Poor border quality');
		}
		if (frame.artifacts.edge_uniformity < 0.7) {
			reasons.push('Inconsistent edges');
		}
		if (frame.artifacts.lighting_consistency < 0.7) {
			reasons.push('Inconsistent lighting');
		}
	}

	if (frame.forensic_analysis) {
		Object.entries(frame.forensic_analysis).forEach(([key, value]) => {
			if (typeof value === 'number' && value < 0.7) {
				reasons.push(`${key.replace('_', ' ')} anomaly`);
			}
		});
	}

	return reasons.length > 0 ? reasons : ['No specific issues detected'];
};

