/** @format */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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

import HeatmapDetails from './visual Evidence/heatmapDetails';
import FaceDetectionDetails from './visual Evidence/faceDetectionDetails';
import EvidenceSummary from './visual Evidence/evidenceSummary';
import ImageAnalysisPanel from './visual Evidence/imageAnalysisPanel';
import OverlaySelector from './visual Evidence/overlaySelector';
import OverlaySelection from './visual Evidence/overlaySelection';
import VideoFrameAnaylsis from './visual Evidence/videoFrameAnalysis';
import ImageViewer from './visual Evidence/ImageViewer';

const getDefaultOverlay = (type) => {
	if (type === 'image') return 'face-detection';
	if (type === 'video') return 'frame-analysis';
	if (type === 'audio') return 'audio-analysis';
	return '';
};

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

const VisualEvidence = ({
	analysisResult,
	fileId,
	fileType,
	className = '',
}) => {
	// const details = analysisResult.details;
	// Determine actual file type from analysis result
	const actualFileType = analysisResult?.type || fileType;

	const [selectedOverlay, setSelectedOverlay] = useState(
		getDefaultOverlay(actualFileType)
	);
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
	const [showFrameAnalysis, setShowFrameAnalysis] = useState(false);
	const [filterSuspicious, setFilterSuspicious] = useState(true);
	const [selectedFrame, setSelectedFrame] = useState(null);
	const [extractedFrames, setExtractedFrames] = useState([]);
	const [isExtractingFrames, setIsExtractingFrames] = useState(false);
	const [selectedHeatmapIndex, setSelectedHeatmapIndex] = useState(0);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [overlayPositions, setOverlayPositions] = useState(null);
	const canvasRef = useRef(null);
	const imageRef = useRef(null);
	const videoRef = useRef(null);
	const frameCanvasRef = useRef(null);

	// API paths for secure asset loading
	const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
	const baseFileUrl = fileId ? `${apiBaseUrl}/uploads/${fileId}` : null;
	const authToken =
		typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
	const secureFileUrl = baseFileUrl
		? `${baseFileUrl}${
				authToken ? `?token=${encodeURIComponent(authToken)}` : ''
		  }`
		: null;
	const overlayOptions = getOverlayOptionsByType(actualFileType);

	// Get frame analysis data
	const frameAnalysis =
		analysisResult?.visual_evidence?.frame_analysis ||
		analysisResult?.frame_analysis ||
		{};
	const frameResults = frameAnalysis.frame_results || [];
	const suspiciousFrames = frameResults.filter(
		(frame) => frame.prediction === 'FAKE' || frame.confidence < 0.5
	);
	const filteredFrames = filterSuspicious ? suspiciousFrames : frameResults;

	// Effect to extract frames when video loads or filter changes
	useEffect(() => {
		if (actualFileType === 'video' && filteredFrames.length > 0) {
			const timer = setTimeout(() => {
				extractFrames();
			}, 1000); // Wait for video to load

			return () => clearTimeout(timer);
		}
	}, [actualFileType, filteredFrames.length]);

	// Effect to update current frame when index changes
	useEffect(() => {
		if (
			extractedFrames.length > 0 &&
			currentFrameIndex < extractedFrames.length
		) {
			setSelectedFrame(extractedFrames[currentFrameIndex]);
		}
	}, [currentFrameIndex, extractedFrames]);

	// Ensure overlay selection stays valid across file type changes
	useEffect(() => {
		const validOverlayIds = getOverlayOptionsByType(actualFileType).map(
			(option) => option.id
		);
		if (!selectedOverlay || !validOverlayIds.includes(selectedOverlay)) {
			const defaultOverlay = getDefaultOverlay(actualFileType);
			const fallbackOverlay = defaultOverlay || validOverlayIds[0] || '';
			if (fallbackOverlay && fallbackOverlay !== selectedOverlay) {
				setSelectedOverlay(fallbackOverlay);
			}
		}
	}, [actualFileType, selectedOverlay]);

	if (!analysisResult || !analysisResult.details) {
		return (
			<div className={`bg-gray-100 rounded-lg p-6 text-center ${className}`}>
				<AlertTriangle className='w-8 h-8 text-gray-400 mx-auto mb-2' />
				<p className='text-gray-500'>No visual evidence data available</p>
			</div>
		);
	}

	const details = analysisResult.details;
	const faceFeatures = details.face_features || {};
	const artifactAnalysis = faceFeatures.artifact_analysis || {};
	const forensicAnalysis = faceFeatures.forensic_analysis || {};

	// Use visual evidence data from backend if available, otherwise generate from analysis results
	const generateVisualEvidence = () => {
		console.log('generateVisualEvidence - analysisResult:', analysisResult);
		console.log(
			'generateVisualEvidence - visual_evidence:',
			analysisResult.visual_evidence
		);

		// Check if backend provided visual evidence data
		if (analysisResult.visual_evidence) {
			const backendEvidence = analysisResult.visual_evidence;
			console.log('Using backend visual evidence:', backendEvidence);

			if (actualFileType === 'video') {
				return {
					frameAnalysis: backendEvidence.frame_analysis || {},
					temporalAnalysis: backendEvidence.temporal_analysis || {},
					spatialAnalysis: backendEvidence.spatial_analysis || {},
					heatmaps: backendEvidence.heatmaps || [],
					regions: [],
				};
			} else {
				return {
					faceDetection: {
						detected: backendEvidence.face_detection?.detected || false,
						confidence: backendEvidence.face_detection?.confidence || 0,
						boundingBox: backendEvidence.face_detection?.bounding_box || null,
					},
					artifacts: {
						borderRegions: backendEvidence.artifacts?.border_regions || [],
						edgeRegions: backendEvidence.artifacts?.edge_regions || [],
						lightingRegions: backendEvidence.artifacts?.lighting_regions || [],
						textureRegions: backendEvidence.artifacts?.texture_regions || [],
					},
					forensic: {
						anomalyScores:
							backendEvidence.forensic_analysis?.anomaly_scores || {},
						problematicRegions:
							backendEvidence.forensic_analysis?.problematic_regions || [],
					},
					heatmaps: backendEvidence.heatmaps || [],
					regions: generateRegionsFromBackend(backendEvidence),
					image_data: backendEvidence.image_data || null, // Include base64 image data
				};
			}
		}

		console.log('No backend visual evidence, generating fallback data');

		// Fallback to generating from analysis results
		if (actualFileType === 'video') {
			const derivedTemporal = calculateTemporalAnalysisFromFrames();
			const derivedHeatmaps = generateVideoHeatmapsFromFrames();
			const derivedRegions = deriveVideoArtifactRegions();
			const firstDetectedFace = frameResults.find(
				(frame) =>
					frame.face_detection?.detected && frame.face_detection.bounding_box
			);

			return {
				frameAnalysis: {
					total_frames: frameResults.length,
					fake_frames: suspiciousFrames.length,
					real_frames: Math.max(
						frameResults.length - suspiciousFrames.length,
						0
					),
					frame_results: frameResults,
				},
				temporalAnalysis: derivedTemporal,
				spatialAnalysis: {
					artifact_regions: derivedRegions,
					problematic_frames: suspiciousFrames.slice(0, 20),
				},
				heatmaps: derivedHeatmaps,
				regions: derivedRegions,
				artifacts: {
					borderRegions: derivedRegions,
					edgeRegions: [],
					lightingRegions: [],
					textureRegions: [],
				},
				faceDetection: firstDetectedFace
					? {
							detected: true,
							confidence: firstDetectedFace.face_detection.confidence || 0,
							boundingBox: firstDetectedFace.face_detection.bounding_box,
					  }
					: { detected: false, confidence: 0, boundingBox: null },
			};
		}

		const evidence = {
			faceDetection: {
				detected: faceFeatures.face_detected || true, // Default to true for testing
				confidence: faceFeatures.face_confidence || 0.85, // Default confidence for testing
				region: faceFeatures.face_region || null,
				boundingBox: faceFeatures.face_region
					? {
							x: faceFeatures.face_region.left,
							y: faceFeatures.face_region.top,
							width: faceFeatures.face_region.width,
							height: faceFeatures.face_region.height,
					  }
					: { x: 100, y: 100, width: 200, height: 250 }, // Default bounding box for testing
			},
			artifacts: {
				borderAnalysis: artifactAnalysis.border_analysis || {},
				edgeAnalysis: artifactAnalysis.edge_analysis || {},
				lightingAnalysis: artifactAnalysis.lighting_analysis || {},
				textureAnalysis: artifactAnalysis.texture_analysis || {},
				blendingAnalysis: artifactAnalysis.blending_analysis || {},
			},
			forensic: {
				lightingAnalysis: forensicAnalysis.lighting_analysis || {},
				skinAnalysis: forensicAnalysis.skin_analysis || {},
				symmetryAnalysis: forensicAnalysis.symmetry_analysis || {},
				edgeAnalysis: forensicAnalysis.edge_analysis || {},
				frequencyAnalysis: forensicAnalysis.frequency_analysis || {},
			},
			heatmaps: generateHeatmaps(),
			regions: generateRegions(),
		};

		return evidence;
	};

	const generateHeatmaps = () => {
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

	const calculateTemporalAnalysisFromFrames = () => {
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

	const generateVideoHeatmapsFromFrames = () => {
		if (!frameResults.length) return [];
		const temporalMetrics = calculateTemporalAnalysisFromFrames();
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

	const deriveVideoArtifactRegions = () => {
		if (!frameResults.length) return [];
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

	const generateRegionsFromBackend = (backendEvidence) => {
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

	const generateRegions = () => {
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

	const visualEvidence = generateVisualEvidence();

	// Ensure visualEvidence has proper structure with defaults
	const safeVisualEvidence = {
		faceDetection: visualEvidence.faceDetection || {
			detected: false,
			confidence: 0,
			boundingBox: null,
		},
		artifacts: visualEvidence.artifacts || {
			borderRegions: [],
			edgeRegions: [],
			lightingRegions: [],
			textureRegions: [],
		},
		forensic: visualEvidence.forensic || {
			anomalyScores: {},
			problematicRegions: [],
		},
		frameAnalysis: visualEvidence.frameAnalysis || {
			total_frames: 0,
			fake_frames: 0,
			real_frames: 0,
			frame_results: [],
		},
		temporalAnalysis: visualEvidence.temporalAnalysis || {
			consistency_score: 0,
			motion_analysis: {},
		},
		spatialAnalysis: visualEvidence.spatialAnalysis || {
			face_regions: [],
			artifact_regions: [],
			problematic_frames: [],
		},
		heatmaps: visualEvidence.heatmaps || [],
		regions: visualEvidence.regions || [],
	};

	// Calculate display heatmap for image replacement
	const gradcamHeatmaps =
		safeVisualEvidence.heatmaps?.filter(
			(h) => h.type === 'gradcam' && h.image_data
		) || [];
	const displayHeatmap =
		gradcamHeatmaps.length > 0
			? gradcamHeatmaps[
					selectedHeatmapIndex >= 0 &&
					selectedHeatmapIndex < gradcamHeatmaps.length
						? selectedHeatmapIndex
						: 0
			  ]
			: null;

	const handleZoomIn = () => {
		setZoom((prev) => Math.min(prev * 1.2, 3));
	};

	const handleZoomOut = () => {
		setZoom((prev) => Math.max(prev / 1.2, 0.5));
	};

	const handleReset = () => {
		setZoom(1);
		setPan({ x: 0, y: 0 });
	};

	const handleMouseDown = (e) => {
		setIsDragging(true);
		setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
	};

	const handleMouseMove = (e) => {
		if (isDragging) {
			setPan({
				x: e.clientX - dragStart.x,
				y: e.clientY - dragStart.y,
			});
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	const handleFrameNavigation = (direction) => {
		if (direction === 'prev' && currentFrameIndex > 0) {
			setCurrentFrameIndex(currentFrameIndex - 1);
		} else if (
			direction === 'next' &&
			currentFrameIndex < extractedFrames.length - 1
		) {
			setCurrentFrameIndex(currentFrameIndex + 1);
		}
	};

	const handleFrameSelect = (frameIndex) => {
		setCurrentFrameIndex(frameIndex);
		if (extractedFrames[frameIndex]) {
			setSelectedFrame(extractedFrames[frameIndex]);
		}
	};

	const handleImageLoad = ({
		naturalWidth,
		naturalHeight,
		containerWidth,
		containerHeight,
	}) => {
		setImageLoaded(true);

		const scaleX = containerWidth / naturalWidth;
		const scaleY = containerHeight / naturalHeight;
		const scale = Math.min(scaleX, scaleY);

		const offsetX = (containerWidth - naturalWidth * scale) / 2;
		const offsetY = (containerHeight - naturalHeight * scale) / 2;

		setOverlayPositions({
			scale,
			offsetX,
			offsetY,
			imageWidth: naturalWidth,
			imageHeight: naturalHeight,
		});
	};

	const seekToFrame = (frameNumber) => {
		if (videoRef.current && frameResults.length > 0) {
			const frame = frameResults.find((f) => f.frame_number === frameNumber);
			if (frame) {
				videoRef.current.currentTime = frame.timestamp || 0;
			}
		}
	};

	const getSuspiciousReasons = (frame) => {
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

	// Extract frames from video
	const extractFrames = async () => {
		if (!videoRef.current || actualFileType !== 'video') {
			console.log('extractFrames: No video ref or not video type');
			return;
		}

		console.log(
			'extractFrames: Starting extraction, filteredFrames.length:',
			filteredFrames.length
		);
		setIsExtractingFrames(true);
		const frames = [];
		const video = videoRef.current;
		const canvas = frameCanvasRef.current;

		if (!canvas) {
			console.log('extractFrames: No canvas ref');
			setIsExtractingFrames(false);
			return;
		}

		const ctx = canvas.getContext('2d');
		// Extract frames based on filteredFrames (suspicious frames when filter is on)
		const framesToExtract = filteredFrames.slice(0, 20); // Limit to 20 frames for performance
		console.log('extractFrames: Extracting', framesToExtract.length, 'frames');

		try {
			for (let i = 0; i < framesToExtract.length; i++) {
				const frame = framesToExtract[i];
				if (frame && frame.timestamp !== undefined) {
					console.log(
						`extractFrames: Processing frame ${i}, timestamp: ${frame.timestamp}`
					);
					video.currentTime = frame.timestamp;

					await new Promise((resolve) => {
						video.addEventListener('seeked', resolve, { once: true });
					});

					// Draw frame to canvas
					canvas.width = video.videoWidth;
					canvas.height = video.videoHeight;
					ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

					// Convert to data URL
					const frameDataUrl = canvas.toDataURL('image/jpeg', 0.8);

					frames.push({
						...frame,
						imageData: frameDataUrl,
						index: i,
					});
				}
			}

			console.log('extractFrames: Extracted', frames.length, 'frames');
			setExtractedFrames(frames);
		} catch (error) {
			console.error('Error extracting frames:', error);
		} finally {
			setIsExtractingFrames(false);
		}
	};

	const getFileExtension = (filename) => {
		if (!filename) return actualFileType === 'image' ? '.jpg' : '.wav';
		const lastDot = filename.lastIndexOf('.');
		return lastDot !== -1 ? filename.substring(lastDot) : '.jpg';
	};

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

	const formatConfidence = (confidence, decimals = 0) =>
		Number(normalizePercentageValue(confidence).toFixed(decimals));

	const renderOverlay = () => {
		console.log('renderOverlay - selectedOverlay:', selectedOverlay);
		console.log('renderOverlay - safeVisualEvidence:', safeVisualEvidence);

		if (!selectedOverlay) {
			console.log('No overlay selected');
			return null;
		}

		switch (selectedOverlay) {
			case 'face-detection':
				return renderFaceDetectionOverlay();
			case 'frame-analysis':
				return (
					<div className='absolute inset-0 pointer-events-none'>
						{renderFrameAnalysisOverlay()}
					</div>
				);
			case 'frame-by-frame':
				return (
					<div className='absolute inset-0 pointer-events-none'>
						{renderFrameByFrameOverlay()}
					</div>
				);
			case 'suspicious-frames':
				return (
					<div className='absolute inset-0 pointer-events-none'>
						{renderSuspiciousFramesOverlay()}
					</div>
				);
			case 'temporal':
				return (
					<div className='absolute inset-0 pointer-events-none'>
						{renderTemporalAnalysisOverlay()}
					</div>
				);
			case 'artifacts':
				return (
					<div className='absolute inset-0 pointer-events-none'>
						{renderArtifactsOverlay()}
					</div>
				);
			case 'forensic':
				return (
					<div className='absolute inset-0 pointer-events-none'>
						{renderForensicOverlay()}
					</div>
				);
			case 'heatmaps':
				return (
					<div className='absolute inset-0 pointer-events-none'>
						{renderHeatmapsOverlay()}
					</div>
				);
			case 'audio-analysis':
				return renderAudioAnalysisOverlay();
			case 'spectral':
				return renderSpectralAnalysisOverlay();
			case 'waveform':
				return renderWaveformOverlay();
			case 'indicators':
				return renderIndicatorsOverlay();
			default:
				return null;
		}
	};

	const renderFaceDetectionOverlay = () => {
		console.log(
			'renderFaceDetectionOverlay - safeVisualEvidence.faceDetection:',
			safeVisualEvidence.faceDetection
		);
		console.log('renderFaceDetectionOverlay - imageLoaded:', imageLoaded);
		console.log(
			'renderFaceDetectionOverlay - imageRef.current:',
			imageRef.current
		);

		if (
			!safeVisualEvidence.faceDetection ||
			!safeVisualEvidence.faceDetection.detected
		) {
			console.log('No face detected, showing no face message');
			return (
				<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white'>
					<div className='text-center'>
						<XCircle className='w-8 h-8 mx-auto mb-2' />
						<p>No face detected</p>
					</div>
				</div>
			);
		}

		const bbox = safeVisualEvidence.faceDetection.boundingBox;
		console.log('Face detection bounding box:', bbox);

		if (!bbox) {
			console.log('No bounding box available');
			return (
				<div className='absolute inset-0 flex items-center justify-center bg-yellow-500 bg-opacity-50 text-white'>
					<div className='text-center'>
						<AlertTriangle className='w-8 h-8 mx-auto mb-2' />
						<p>Face detected but no bounding box data</p>
					</div>
				</div>
			);
		}

		console.log('Rendering face detection overlay with bbox:', bbox);

		// Get image element to calculate proper positioning
		const img = imageRef.current;
		if (
			!img ||
			!imageLoaded ||
			!img.complete ||
			!img.naturalWidth ||
			!img.naturalHeight
		) {
			console.log(
				'Image not loaded yet - img:',
				img,
				'complete:',
				img?.complete,
				'naturalWidth:',
				img?.naturalWidth,
				'imageLoaded:',
				imageLoaded
			);
			return (
				<div className='absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 text-white'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2'></div>
						<p>Loading image...</p>
					</div>
				</div>
			);
		}

		const naturalWidth = img.naturalWidth;
		const naturalHeight = img.naturalHeight;

		// Get the actual displayed image dimensions (accounting for object-contain)
		const imgRect = img.getBoundingClientRect();
		const container = img.parentElement;
		if (!container) return null;
		const containerRect = container.getBoundingClientRect();

		// Calculate the scale factor for object-contain
		const containerWidth = containerRect.width;
		const containerHeight = containerRect.height;
		const scaleX = containerWidth / naturalWidth;
		const scaleY = containerHeight / naturalHeight;
		const scale = Math.min(scaleX, scaleY); // object-contain uses the smaller scale

		// Calculate the actual displayed image size
		const displayedImageWidth = naturalWidth * scale;
		const displayedImageHeight = naturalHeight * scale;

		// Calculate the offset (centering) for object-contain
		const offsetX = (containerWidth - displayedImageWidth) / 2;
		const offsetY = (containerHeight - displayedImageHeight) / 2;

		// Convert bounding box coordinates to displayed coordinates
		const left = offsetX + bbox.x * scale;
		const top = offsetY + bbox.y * scale;
		const width = bbox.width * scale;
		const height = bbox.height * scale;

		console.log('Face overlay positioning:', {
			natural: { width: naturalWidth, height: naturalHeight },
			container: { width: containerWidth, height: containerHeight },
			displayedImage: {
				width: displayedImageWidth,
				height: displayedImageHeight,
			},
			scale,
			offset: { x: offsetX, y: offsetY },
			bbox,
			final: { left, top, width, height },
		});

		return (
			<div
				className='absolute pointer-events-none'
				style={{
					left: 0,
					top: 0,
					width: '100%',
					height: '100%',
					zIndex: 15,
				}}>
				{/* Face bounding box - positioned using pixel coordinates */}
				<div
					className='absolute rounded-lg'
					style={{
						left: `${left}px`,
						top: `${top}px`,
						width: `${width}px`,
						height: `${height}px`,
						zIndex: 20,
						pointerEvents: 'none',
						border: '5px solid #3b82f6',
						backgroundColor: 'rgba(59, 130, 246, 0.15)',
						boxShadow:
							'0 0 40px rgba(59, 130, 246, 1), 0 0 20px rgba(59, 130, 246, 0.8), inset 0 0 30px rgba(59, 130, 246, 0.3)',
						borderRadius: '8px',
						minWidth: '20px',
						minHeight: '20px',
					}}>
					{/* Corner markers for better visibility */}
					<div className='absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg'></div>
					<div className='absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg'></div>
					<div className='absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg'></div>
					<div className='absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg'></div>

					{/* Label */}
					<div className='absolute -top-14 left-0 bg-blue-600 text-white px-4 py-2 text-sm rounded-lg font-bold shadow-2xl whitespace-nowrap z-30 border-2 border-blue-400 flex items-center gap-2'>
						<Target className='w-4 h-4' />
						<span>
							Face Detected (
							{formatPercentage(safeVisualEvidence.faceDetection.confidence)}%
							confidence)
						</span>
					</div>
				</div>
			</div>
		);
	};

	const renderArtifactsOverlay = () => {
		console.log(
			'renderArtifactsOverlay - safeVisualEvidence.regions:',
			safeVisualEvidence.regions
		);
		console.log(
			'renderArtifactsOverlay - safeVisualEvidence.artifacts:',
			safeVisualEvidence.artifacts
		);

		if (actualFileType === 'video') {
			const videoElement = videoRef.current;
			const overlayFrame =
				selectedFrame ||
				extractedFrames[currentFrameIndex] ||
				filteredFrames[currentFrameIndex] ||
				frameResults[currentFrameIndex];

			if (!videoElement) {
				return (
					<div className='absolute inset-0 flex items-center justify-center'>
						<div className='bg-black bg-opacity-60 text-white px-4 py-2 rounded'>
							Preparing video overlay...
						</div>
					</div>
				);
			}

			if (!overlayFrame || !overlayFrame.face_detection?.bounding_box) {
				return (
					<div className='absolute inset-0 flex items-center justify-center'>
						<div className='bg-black bg-opacity-60 text-white px-4 py-2 rounded'>
							No artifact regions detected for current frame
						</div>
					</div>
				);
			}

			const rect = videoElement.getBoundingClientRect();
			const displayWidth = rect.width || videoElement.clientWidth || 1;
			const displayHeight = rect.height || videoElement.clientHeight || 1;
			const naturalWidth = videoElement.videoWidth || displayWidth;
			const naturalHeight = videoElement.videoHeight || displayHeight;
			const scaleX = displayWidth / naturalWidth;
			const scaleY = displayHeight / naturalHeight;

			const bbox = overlayFrame.face_detection.bounding_box;
			const left = (bbox.x || 0) * scaleX;
			const top = (bbox.y || 0) * scaleY;
			const width = (bbox.width || 0) * scaleX;
			const height = (bbox.height || 0) * scaleY;
			const artifactScores = overlayFrame.artifacts || {};
			const artifactEntries = Object.entries(artifactScores).filter(
				([, score]) => typeof score === 'number'
			);

			return (
				<div className='absolute inset-0 pointer-events-none'>
					<div
						className='absolute border-4 border-yellow-500 bg-yellow-500 bg-opacity-25 rounded-lg shadow-lg'
						style={{
							left,
							top,
							width,
							height,
						}}>
						<div className='absolute -top-10 left-0 bg-yellow-500 text-white px-3 py-1 rounded text-sm font-semibold shadow'>
							Artifact focus area
						</div>
					</div>
					{artifactEntries.length > 0 && (
						<div className='absolute top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded text-xs space-y-1'>
							{artifactEntries.map(([key, score]) => (
								<div key={key} className='flex justify-between gap-4'>
									<span className='capitalize'>{key.replace(/_/g, ' ')}</span>
									<span>{formatPercentage(score)}%</span>
								</div>
							))}
						</div>
					)}
				</div>
			);
		}

		// Get image element for positioning
		const img = imageRef.current;
		if (!img || !img.complete || !img.naturalWidth) {
			console.log('Image not loaded yet for artifacts overlay');
			return null;
		}

		const naturalWidth = img.naturalWidth;
		const naturalHeight = img.naturalHeight;

		// Collect all artifact regions from different sources
		const artifactRegions = [
			...safeVisualEvidence.regions.filter(
				(r) =>
					r.type &&
					(r.type.includes('artifact') ||
						r.type.includes('border') ||
						r.type.includes('edge'))
			),
			...(safeVisualEvidence.artifacts.borderRegions || []),
			...(safeVisualEvidence.artifacts.edgeRegions || []),
			...(safeVisualEvidence.artifacts.lightingRegions || []),
			...(safeVisualEvidence.artifacts.textureRegions || []),
		];

		console.log(
			'Artifact regions found:',
			artifactRegions.length,
			artifactRegions
		);

		// If no specific artifact regions, show face area with artifact indicators
		if (artifactRegions.length === 0) {
			if (safeVisualEvidence.faceDetection.boundingBox) {
				const bbox = safeVisualEvidence.faceDetection.boundingBox;
				const leftPercent = (bbox.x / naturalWidth) * 100;
				const topPercent = (bbox.y / naturalHeight) * 100;
				const widthPercent = (bbox.width / naturalWidth) * 100;
				const heightPercent = (bbox.height / naturalHeight) * 100;

				return (
					<div
						className='absolute pointer-events-none'
						style={{
							left: 0,
							top: 0,
							width: '100%',
							height: '100%',
							zIndex: 15,
						}}>
						<div
							className='absolute border-4 border-yellow-500 bg-yellow-500 bg-opacity-25 rounded-lg'
							style={{
								left: `${leftPercent}%`,
								top: `${topPercent}%`,
								width: `${widthPercent}%`,
								height: `${heightPercent}%`,
								zIndex: 20,
								boxShadow:
									'0 0 25px rgba(234, 179, 8, 0.8), inset 0 0 20px rgba(234, 179, 8, 0.3)',
								pointerEvents: 'none',
								borderWidth: '4px',
								borderStyle: 'solid',
								borderColor: '#eab308',
							}}>
							<div className='absolute -top-12 left-0 bg-yellow-500 text-white px-4 py-2 text-sm rounded-lg font-bold shadow-2xl whitespace-nowrap z-30 border-2 border-yellow-300'>
								⚠️ Artifact Analysis Area
							</div>
						</div>
					</div>
				);
			}
			return null;
		}

		// Render artifact regions
		return (
			<div
				className='absolute pointer-events-none'
				style={{ left: 0, top: 0, width: '100%', height: '100%', zIndex: 15 }}>
				{artifactRegions.map((region, index) => {
					const coords = region.coordinates || region;
					if (!coords || (!coords.x && !coords.left)) {
						console.warn('Artifact region missing coordinates:', region);
						return null;
					}

					const x = coords.x || coords.left || 0;
					const y = coords.y || coords.top || 0;
					const width = coords.width || 100;
					const height = coords.height || 100;
					// Use color from region, or determine based on type/score
					let color = region.color;
					if (!color) {
						if (region.type?.includes('border')) {
							color = '#ef4444';
						} else if (region.type?.includes('edge')) {
							color = '#f59e0b';
						} else if (region.type?.includes('texture')) {
							color = '#f59e0b';
						} else {
							color = '#f59e0b';
						}
					}

					// Calculate percentage positions
					const leftPercent = (x / naturalWidth) * 100;
					const topPercent = (y / naturalHeight) * 100;
					const widthPercent = (width / naturalWidth) * 100;
					const heightPercent = (height / naturalHeight) * 100;

					return (
						<div
							key={index}
							className='absolute border-4 bg-opacity-30 rounded-lg'
							style={{
								left: `${leftPercent}%`,
								top: `${topPercent}%`,
								width: `${widthPercent}%`,
								height: `${heightPercent}%`,
								borderColor: color,
								backgroundColor: color,
								zIndex: 20,
								boxShadow: `0 0 20px ${color}80, inset 0 0 15px ${color}40`,
								pointerEvents: 'none',
								borderWidth: '4px',
								borderStyle: 'solid',
							}}>
							<div
								className='absolute -top-10 left-0 px-3 py-2 text-sm rounded-lg text-white font-bold shadow-xl whitespace-nowrap z-30 border-2'
								style={{ backgroundColor: color, borderColor: color }}>
								{region.description || region.type || 'Artifact'}
								{region.score !== undefined &&
									` (${formatPercentage(region.score)}%)`}
							</div>
						</div>
					);
				})}
			</div>
		);
	};

	const renderForensicOverlay = () => {
		console.log(
			'renderForensicOverlay - safeVisualEvidence.forensic:',
			safeVisualEvidence.forensic
		);

		return (
			<div className='absolute inset-0 pointer-events-none flex items-center justify-center'>
				<div className='relative'>
					{/* Enhanced Forensic analysis indicators */}
					{Object.entries(safeVisualEvidence.forensic.anomalyScores || {}).map(
						([key, analysis]) => {
							if (analysis && analysis.score !== undefined) {
								const hasIssues = analysis.score < 0.7; // Low scores indicate issues
								const severity =
									analysis.score < 0.3
										? 'high'
										: analysis.score < 0.5
										? 'medium'
										: 'low';
								const color =
									severity === 'high'
										? '#ef4444'
										: severity === 'medium'
										? '#f59e0b'
										: '#22c55e';

								if (hasIssues && safeVisualEvidence.faceDetection.boundingBox) {
									const bbox = safeVisualEvidence.faceDetection.boundingBox;
									return (
										<div
											key={key}
											className='absolute group'
											style={{
												left: bbox.x - 200, // Adjust for image center
												top: bbox.y - 150, // Adjust for image center
												width: bbox.width,
												height: bbox.height,
												zIndex: 15,
												pointerEvents: 'none',
											}}>
											<div
												className='absolute -top-8 left-0 text-sm font-bold cursor-help'
												style={{ color: color }}
												title={`${key.replace('_', ' ').toUpperCase()}: ${
													analysis.score < 0.3
														? 'High risk of artificial manipulation'
														: analysis.score < 0.5
														? 'Medium risk detected'
														: 'Low risk - appears authentic'
												}`}>
												{key.replace('_', ' ').toUpperCase()}:{' '}
												{formatPercentage(analysis.score)}%
											</div>

											{/* Detailed tooltip on hover */}
											<div
												className='absolute -top-40 left-0 bg-black bg-opacity-95 text-white px-4 py-3 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-xl'
												style={{ minWidth: '280px', maxWidth: '320px' }}>
												<div className='font-bold mb-2 text-sm'>
													{key.replace('_', ' ').toUpperCase()} ANALYSIS
												</div>
												<div className='text-gray-200 mb-2'>
													<div className='font-semibold mb-1'>
														Score: {formatPercentage(analysis.score)}%
													</div>
													{key === 'lighting' ? (
														<div className='text-gray-300 text-xs leading-relaxed'>
															{analysis.score >= 0.7
																? '✅ Uniform lighting across the face indicates natural photography. Real images typically have consistent lighting patterns.'
																: analysis.score >= 0.5
																? '⚠️ Moderate lighting variation detected. Some inconsistencies may suggest manipulation or AI generation.'
																: '❌ Inconsistent lighting patterns detected. Low scores (<50%) indicate artificial lighting, a common deepfake indicator. Real photos have more uniform lighting.'}
														</div>
													) : key === 'skin' ? (
														<div className='text-gray-300 text-xs leading-relaxed'>
															{analysis.score >= 0.7
																? '✅ Natural skin texture with realistic variation. Authentic images show natural skin imperfections.'
																: analysis.score >= 0.5
																? '⚠️ Some skin texture anomalies detected. May indicate smoothing or manipulation.'
																: '❌ Unnaturally smooth skin detected. Very low scores suggest AI-generated skin texture, a common deepfake artifact.'}
														</div>
													) : key === 'edge' || key.includes('edge') ? (
														<div className='text-gray-300 text-xs leading-relaxed'>
															{analysis.score >= 0.7
																? '✅ Natural edge patterns with smooth transitions. Real photos have organic edge distributions that flow naturally across facial features.'
																: analysis.score >= 0.5
																? '⚠️ Some edge inconsistencies detected. Unusual edge patterns or sharp transitions may suggest manipulation or AI generation.'
																: '❌ Unnatural edge patterns detected. Low scores (<50%) indicate sharp artificial edges, grid-like patterns, or inconsistent edge distributions - common signs of AI-generated content. Real faces have smooth, natural edge transitions.'}
														</div>
													) : analysis.score < 0.3 ? (
														`High risk: ${
															key === 'compression'
																? 'Compression artifacts inconsistent with natural photography'
																: 'Digital patterns suggest artificial generation'
														}`
													) : analysis.score < 0.5 ? (
														`Medium risk: Minor ${key} inconsistencies detected`
													) : (
														`Low risk: Natural ${key} patterns consistent with authentic image`
													)}
												</div>
												{analysis.confidence && (
													<div className='mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400'>
														Confidence: {formatPercentage(analysis.confidence)}%
													</div>
												)}
											</div>
										</div>
									);
								}
							}
							return null;
						}
					)}

					{/* Additional forensic indicators for different regions */}
					{safeVisualEvidence.forensic.regions &&
						safeVisualEvidence.forensic.regions.map((region, index) => {
							if (region.type === 'forensic-anomaly' && region.coordinates) {
								const severity =
									region.score < 0.3
										? 'high'
										: region.score < 0.5
										? 'medium'
										: 'low';
								const color =
									severity === 'high'
										? '#ef4444'
										: severity === 'medium'
										? '#f59e0b'
										: '#22c55e';

								return (
									<div
										key={`forensic-${index}`}
										className='absolute border-4 bg-opacity-30'
										style={{
											left: region.coordinates.x - 200, // Adjust for image center
											top: region.coordinates.y - 150, // Adjust for image center
											width: region.coordinates.width,
											height: region.coordinates.height,
											borderColor: color,
											backgroundColor: color,
											zIndex: 15,
										}}>
										<div
											className='absolute -top-8 left-0 px-3 py-1 text-sm rounded text-white font-bold'
											style={{ backgroundColor: color }}>
											{region.description} ({formatPercentage(region.score)}%)
										</div>
									</div>
								);
							}
							return null;
						})}

					{/* Enhanced Forensic analysis summary overlay with explainability */}
					<div
						className='absolute bg-black bg-opacity-90 text-white px-4 py-3 rounded-lg'
						style={{
							top: -300, // Higher to avoid overlap with prediction
							left: -250, // Further left to avoid overlap
							zIndex: 20,
							minWidth: '300px',
							maxWidth: '350px',
						}}>
						<div className='text-sm font-bold mb-3 text-center'>
							FORENSIC ANALYSIS
						</div>
						<div className='text-xs space-y-2'>
							{Object.entries(
								safeVisualEvidence.forensic.anomalyScores || {}
							).map(([key, analysis]) => {
								if (analysis && analysis.score !== undefined) {
									const severity =
										analysis.score < 0.3
											? 'HIGH RISK'
											: analysis.score < 0.5
											? 'MEDIUM RISK'
											: 'LOW RISK';
									const color =
										analysis.score < 0.3
											? '#ef4444'
											: analysis.score < 0.5
											? '#f59e0b'
											: '#22c55e';

									// Get explainability text based on the metric
									const getExplainability = (metricKey, score) => {
										const explanations = {
											lighting: {
												high: 'Inconsistent lighting patterns suggest artificial manipulation',
												medium: 'Minor lighting inconsistencies detected',
												low: 'Natural lighting patterns consistent with authentic image',
											},
											skin: {
												high: 'Skin texture anomalies indicate potential deepfake generation',
												medium: 'Minor skin texture irregularities detected',
												low: 'Natural skin texture consistent with authentic image',
											},
											edge: {
												high: 'Sharp edge artifacts suggest AI-generated content',
												medium: 'Minor edge inconsistencies detected',
												low: 'Natural edge transitions consistent with authentic image',
											},
											compression: {
												high: 'Compression artifacts inconsistent with natural photography',
												medium: 'Minor compression inconsistencies detected',
												low: 'Natural compression patterns consistent with authentic image',
											},
											noise: {
												high: 'Digital noise patterns suggest artificial generation',
												medium: 'Minor noise inconsistencies detected',
												low: 'Natural noise patterns consistent with authentic image',
											},
										};

										const riskLevel =
											score < 0.3 ? 'high' : score < 0.5 ? 'medium' : 'low';
										return (
											explanations[metricKey]?.[riskLevel] ||
											`${metricKey} analysis: ${riskLevel} risk detected`
										);
									};

									return (
										<div
											key={key}
											className='border-b border-gray-600 pb-2 last:border-b-0'>
											<div className='flex justify-between items-center mb-1'>
												<span className='font-semibold'>
													{key.replace('_', ' ').toUpperCase()}:
												</span>
												<span style={{ color }} className='font-bold'>
													{severity} ({formatPercentage(analysis.score)}%)
												</span>
											</div>
											<div className='text-gray-300 text-xs leading-relaxed'>
												{getExplainability(key, analysis.score)}
											</div>
										</div>
									);
								}
								return null;
							})}

							{/* Overall forensic conclusion */}
							<div className='mt-3 pt-2 border-t border-gray-600'>
								<div className='text-center'>
									<div className='text-xs text-gray-400 mb-1'>
										OVERALL FORENSIC CONCLUSION
									</div>
									<div className='text-sm font-bold'>
										{analysisResult.prediction === 'FAKE'
											? 'Multiple forensic anomalies detected suggesting artificial generation'
											: 'Forensic analysis consistent with authentic image'}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderFrameAnalysisOverlay = () => {
		if (actualFileType !== 'video' || !safeVisualEvidence.frameAnalysis) {
			return (
				<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white'>
					<div className='text-center'>
						<Info className='w-8 h-8 mx-auto mb-2' />
						<p>Frame analysis not available</p>
					</div>
				</div>
			);
		}

		const frameResults = safeVisualEvidence.frameAnalysis.frame_results || [];
		const currentFrame = frameResults[0]; // Show first frame as example

		if (!currentFrame) {
			return (
				<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white'>
					<div className='text-center'>
						<Info className='w-8 h-8 mx-auto mb-2' />
						<p>No frame data available</p>
					</div>
				</div>
			);
		}

		return (
			<div className='absolute inset-0'>
				{/* Frame information overlay */}
				<div className='absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded'>
					<div className='text-sm'>
						<div>
							<strong>Frame:</strong> {currentFrame.frame_number}
						</div>
						<div>
							<strong>Timestamp:</strong> {currentFrame.timestamp?.toFixed(2)}s
						</div>
						<div>
							<strong>Prediction:</strong> {currentFrame.prediction}
						</div>
						<div>
							<strong>Confidence:</strong>{' '}
							{formatPercentage(currentFrame.confidence)}%
						</div>
					</div>
				</div>

				{/* Face detection overlay */}
				{currentFrame.face_detection?.detected &&
					currentFrame.face_detection.bounding_box && (
						<div
							className='absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20'
							style={{
								left: currentFrame.face_detection.bounding_box.x,
								top: currentFrame.face_detection.bounding_box.y,
								width: currentFrame.face_detection.bounding_box.width,
								height: currentFrame.face_detection.bounding_box.height,
							}}>
							<div className='absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 text-xs rounded'>
								Face ({formatPercentage(currentFrame.face_detection.confidence)}
								%)
							</div>
						</div>
					)}

				{/* Artifact regions */}
				{currentFrame.artifacts &&
					Object.entries(currentFrame.artifacts).map(([key, score]) => {
						if (score < 0.7 && currentFrame.face_detection?.bounding_box) {
							const bbox = currentFrame.face_detection.bounding_box;
							return (
								<div
									key={key}
									className='absolute border-2 border-red-500 bg-red-500 bg-opacity-20'
									style={{
										left: bbox.x,
										top: bbox.y,
										width: bbox.width,
										height: bbox.height,
									}}>
									<div className='absolute -top-6 left-0 bg-red-500 text-white px-2 py-1 text-xs rounded'>
										{key.replace('_', ' ')} ({formatPercentage(score)}%)
									</div>
								</div>
							);
						}
						return null;
					})}
			</div>
		);
	};

	const renderTemporalAnalysisOverlay = () => {
		if (actualFileType !== 'video' || !safeVisualEvidence.temporalAnalysis) {
			return (
				<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white'>
					<div className='text-center'>
						<Info className='w-8 h-8 mx-auto mb-2' />
						<p>Temporal analysis not available</p>
					</div>
				</div>
			);
		}

		const temporalAnalysis = safeVisualEvidence.temporalAnalysis;
		const consistencyScore = temporalAnalysis.consistency_score || 0;
		const motionAnalysis = temporalAnalysis.motion_analysis || {};

		return (
			<div className='absolute inset-0'>
				{/* Temporal analysis overlay */}
				<div className='absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded'>
					<div className='text-sm'>
						<div>
							<strong>Consistency Score:</strong>{' '}
							{formatPercentage(consistencyScore)}%
						</div>
						<div>
							<strong>Confidence Variance:</strong>{' '}
							{motionAnalysis.confidence_variance !== undefined
								? motionAnalysis.confidence_variance.toFixed(3)
								: 'N/A'}
						</div>
						<div>
							<strong>Avg Confidence:</strong>{' '}
							{motionAnalysis.average_confidence !== undefined
								? `${formatPercentage(motionAnalysis.average_confidence)}%`
								: 'N/A'}
						</div>
					</div>
				</div>

				{/* Consistency indicator */}
				<div className='absolute top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded'>
					<div className='text-sm'>
						<div
							className={`font-bold ${
								consistencyScore > 0.7
									? 'text-green-400'
									: consistencyScore > 0.4
									? 'text-yellow-400'
									: 'text-red-400'
							}`}>
							{consistencyScore > 0.7
								? 'Consistent'
								: consistencyScore > 0.4
								? 'Moderate'
								: 'Inconsistent'}
						</div>
						<div className='text-xs text-gray-300'>Frame Consistency</div>
					</div>
				</div>

				{/* Overall video quality indicator */}
				<div className='absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded'>
					<div className='text-sm'>
						<div>
							<strong>Total Frames:</strong>{' '}
							{safeVisualEvidence.frameAnalysis?.total_frames || 0}
						</div>
						<div>
							<strong>Fake Frames:</strong>{' '}
							{safeVisualEvidence.frameAnalysis?.fake_frames || 0}
						</div>
						<div>
							<strong>Real Frames:</strong>{' '}
							{safeVisualEvidence.frameAnalysis?.real_frames || 0}
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderHeatmapsOverlay = () => {
		console.log(
			'renderHeatmapsOverlay - safeVisualEvidence.heatmaps:',
			safeVisualEvidence.heatmaps
		);

		if (
			!safeVisualEvidence.heatmaps ||
			safeVisualEvidence.heatmaps.length === 0
		) {
			return (
				<div className='absolute inset-0 flex items-center justify-center'>
					<div className='bg-black bg-opacity-75 text-white px-4 py-2 rounded'>
						<p className='text-sm'>No heatmaps available</p>
					</div>
				</div>
			);
		}

		// Filter Grad-CAM heatmaps
		const gradcamHeatmaps = safeVisualEvidence.heatmaps.filter(
			(h) => h.type === 'gradcam' && h.image_data
		);
		const otherHeatmaps = safeVisualEvidence.heatmaps.filter(
			(h) => h.type !== 'gradcam' || !h.image_data
		);

		// Use selected heatmap or first available
		const displayHeatmap =
			gradcamHeatmaps.length > 0
				? gradcamHeatmaps[
						selectedHeatmapIndex >= 0 &&
						selectedHeatmapIndex < gradcamHeatmaps.length
							? selectedHeatmapIndex
							: 0
				  ]
				: null;

		// Heatmap overlay is now rendered on the image itself
		// This function doesn't need to render anything as controls are in side panel
		return null;
	};

	const renderAudioAnalysisOverlay = () => {
		return (
			<div className='absolute inset-0'>
				<div className='absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded'>
					<div className='text-sm'>
						<div>
							<strong>Audio Analysis</strong>
						</div>
						<div>
							Duration:{' '}
							{analysisResult.details?.preprocessing_info?.duration?.toFixed(
								1
							) || 'N/A'}
							s
						</div>
						<div>
							Sample Rate:{' '}
							{analysisResult.details?.preprocessing_info?.sample_rate || 'N/A'}{' '}
							Hz
						</div>
						<div>Prediction: {analysisResult.prediction}</div>
						<div>
							Confidence: {(analysisResult.confidence || 0).toFixed(1)}%
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderSpectralAnalysisOverlay = () => {
		return (
			<div className='absolute inset-0'>
				<div className='absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded'>
					<div className='text-sm'>
						<div>
							<strong>Spectral Analysis</strong>
						</div>
						<div>
							F0 Mean:{' '}
							{analysisResult.details?.comprehensive_features?.f0_mean?.toFixed(
								1
							) || 'N/A'}{' '}
							Hz
						</div>
						<div>
							Spectral Centroid:{' '}
							{analysisResult.details?.comprehensive_features?.spectral_centroid_mean?.toFixed(
								0
							) || 'N/A'}{' '}
							Hz
						</div>
						<div>
							Energy:{' '}
							{analysisResult.details?.comprehensive_features?.energy_mean?.toFixed(
								3
							) || 'N/A'}
						</div>
						<div>
							ZCR:{' '}
							{analysisResult.details?.comprehensive_features?.zcr_mean?.toFixed(
								3
							) || 'N/A'}
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderWaveformOverlay = () => {
		return (
			<div className='absolute inset-0'>
				<div className='absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded'>
					<div className='text-sm'>
						<div>
							<strong>Waveform Analysis</strong>
						</div>
						<div>
							Voiced Ratio:{' '}
							{formatPercentage(
								analysisResult.details?.comprehensive_features?.voiced_ratio ||
									0
							)}
							%
						</div>
						<div>
							F0 Variation:{' '}
							{analysisResult.details?.comprehensive_features?.f0_std?.toFixed(
								1
							) || 'N/A'}{' '}
							Hz
						</div>
						<div>
							Energy Variation:{' '}
							{analysisResult.details?.comprehensive_features?.energy_std?.toFixed(
								3
							) || 'N/A'}
						</div>
					</div>
				</div>
			</div>
		);
	};

	const renderIndicatorsOverlay = () => {
		const indicators = analysisResult.details?.deepfake_indicators || {};
		return (
			<div className='absolute inset-0'>
				<div className='absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded max-w-sm'>
					<div className='text-sm'>
						<div>
							<strong>Deepfake Indicators</strong>
						</div>
						{Object.entries(indicators).map(([key, value]) => (
							<div key={key} className='mt-1'>
								<div className='flex justify-between'>
									<span className='capitalize'>{key.replace(/_/g, ' ')}:</span>
									<span
										className={`font-bold ${
											value > 0.7
												? 'text-red-400'
												: value > 0.4
												? 'text-yellow-400'
												: 'text-green-400'
										}`}>
										{formatPercentage(value)}%
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	};

	const renderFrameByFrameOverlay = () => {
		if (actualFileType !== 'video' || !frameResults.length) {
			return (
				<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white'>
					<div className='text-center'>
						<Info className='w-8 h-8 mx-auto mb-2' />
						<p>Frame-by-frame analysis not available</p>
					</div>
				</div>
			);
		}

		const currentFrame = filteredFrames[currentFrameIndex];
		if (!currentFrame) return null;

		return (
			<div className='absolute inset-0'>
				{/* Frame Navigation Controls */}
				<div className='absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded'>
					<div className='flex items-center space-x-2 mb-2'>
						<button
							onClick={() => handleFrameNavigation('prev')}
							disabled={currentFrameIndex === 0}
							className='p-1 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50'>
							<ChevronLeft className='w-4 h-4' />
						</button>
						<span className='text-sm'>
							Frame {currentFrameIndex + 1} of {extractedFrames.length}
						</span>
						<button
							onClick={() => handleFrameNavigation('next')}
							disabled={currentFrameIndex === extractedFrames.length - 1}
							className='p-1 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50'>
							<ChevronRight className='w-4 h-4' />
						</button>
					</div>
					<div className='text-xs'>
						<div>Frame #{currentFrame.frame_number}</div>
						<div>Time: {currentFrame.timestamp?.toFixed(2)}s</div>
					</div>
				</div>

				{/* Frame Analysis Details */}
				<div className='absolute top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded max-w-sm'>
					<div className='text-sm'>
						<div className='flex items-center space-x-2 mb-2'>
							<span>
								<strong>Frame Analysis</strong>
							</span>
							<span
								className={`px-2 py-1 rounded text-xs ${
									currentFrame.prediction === 'FAKE'
										? 'bg-red-500'
										: 'bg-green-500'
								}`}>
								{currentFrame.prediction}
							</span>
						</div>
						<div>Confidence: {formatPercentage(currentFrame.confidence)}%</div>

						{currentFrame.artifacts && (
							<div className='mt-2'>
								<div className='text-xs font-medium'>Artifacts:</div>
								<div>
									Border:{' '}
									{formatPercentage(currentFrame.artifacts.border_quality)}%
								</div>
								<div>
									Edges:{' '}
									{formatPercentage(currentFrame.artifacts.edge_uniformity)}%
								</div>
								<div>
									Lighting:{' '}
									{formatPercentage(
										currentFrame.artifacts.lighting_consistency
									)}
									%
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Face Detection Overlay */}
				{currentFrame.face_detection?.detected &&
					currentFrame.face_detection.bounding_box && (
						<div
							className='absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20'
							style={{
								left: currentFrame.face_detection.bounding_box.x,
								top: currentFrame.face_detection.bounding_box.y,
								width: currentFrame.face_detection.bounding_box.width,
								height: currentFrame.face_detection.bounding_box.height,
							}}>
							<div className='absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 text-xs rounded'>
								Face ({formatPercentage(currentFrame.face_detection.confidence)}
								%)
							</div>
						</div>
					)}
			</div>
		);
	};

	const renderSuspiciousFramesOverlay = () => {
		if (actualFileType !== 'video' || !suspiciousFrames.length) {
			return (
				<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white'>
					<div className='text-center'>
						<CheckCircle className='w-8 h-8 mx-auto mb-2 text-green-400' />
						<p>No suspicious frames detected</p>
					</div>
				</div>
			);
		}

		return (
			<div className='absolute inset-0'>
				{/* Navigation Controls */}
				<div className='absolute bottom-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded'>
					<div className='flex items-center space-x-2'>
						<button
							onClick={() => handleFrameNavigation('prev')}
							disabled={currentFrameIndex === 0}
							className='p-1 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50'>
							<ChevronLeft className='w-4 h-4' />
						</button>
						<span className='text-sm'>
							{currentFrameIndex + 1} / {extractedFrames.length}
						</span>
						<button
							onClick={() => handleFrameNavigation('next')}
							disabled={currentFrameIndex === extractedFrames.length - 1}
							className='p-1 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50'>
							<ChevronRight className='w-4 h-4' />
						</button>
					</div>
				</div>
			</div>
		);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className={`space-y-6 ${className}`}>
			{/* Header */}
			<div className='bg-white rounded-lg shadow-lg p-6'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center space-x-2'>
						<Eye className='w-5 h-5 text-primary-600' />
						<h3 className='text-lg font-semibold text-gray-900'>
							Visual Evidence
						</h3>
					</div>
					<div className='flex items-center space-x-2'>
						<button
							onClick={handleZoomOut}
							className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded'
							title='Zoom Out'>
							<ZoomOut className='w-4 h-4' />
						</button>
						<span className='text-sm text-gray-600'>
							{Math.round(zoom * 100)}%
						</span>
						<button
							onClick={handleZoomIn}
							className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded'
							title='Zoom In'>
							<ZoomIn className='w-4 h-4' />
						</button>
						<button
							onClick={handleReset}
							className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded'
							title='Reset View'>
							<RotateCcw className='w-4 h-4' />
						</button>
					</div>
				</div>

				{/* Overlay Selection */}
				<OverlaySelection
					setSelectedOverlay={setSelectedOverlay}
					selectedOverlay={selectedOverlay}
					analysisResult={analysisResult}
					fileType={fileType}
				/>

				{/* Image Viewer */}
				<div className='relative bg-gray-100 rounded-lg overflow-hidden'>
					<div className='flex gap-4'>
						{/* Image Container */}
						<ImageViewer
							analysisResult={analysisResult}
							secureFileUrl={secureFileUrl}
							baseFileUrl={baseFileUrl}
							renderOverlay={renderOverlay}
							extractedFrames={extractedFrames}
							selectedFrame={selectedFrame}
							handleFrameNavigation={handleFrameNavigation}
							currentFrameIndex={currentFrameIndex}
							isExtractingFrames={isExtractingFrames}
							selectedOverlay={selectedOverlay}
							safeVisualEvidence={safeVisualEvidence}
							selectedHeatmapIndex={selectedHeatmapIndex}
							onImageLoad={handleImageLoad}
							fileId={fileId}
							pan={pan}
							zoom={zoom}
							setPan={setPan}
						/>

						{/* Side Panel for Information */}
						<OverlaySelector
							selectedOverlay={selectedOverlay}
							safeVisualEvidence={safeVisualEvidence}
							analysisResult={analysisResult}
							fileType={fileType}
							selectedFrame={selectedFrame}
							setSelectedHeatmapIndex={setSelectedHeatmapIndex}
							selectedHeatmapIndex={selectedHeatmapIndex}
							handleFrameSelect={handleFrameSelect}
							isExtractingFrames={isExtractingFrames}
							visualEvidence={visualEvidence}
						/>
					</div>

					<div className='hidden w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500'>
						<div className='text-center'>
							<AlertTriangle className='w-8 h-8 mx-auto mb-2' />
							<p className='font-medium'>File not found or not accessible</p>
							<p className='text-sm text-gray-400 mb-4'>File ID: {fileId}</p>
							<div className='bg-yellow-50 p-3 rounded-lg text-left max-w-md'>
								<p className='text-sm text-yellow-800 font-medium mb-2'>
									Possible causes:
								</p>
								<ul className='text-xs text-yellow-700 space-y-1'>
									<li>• Backend server was restarted</li>
									<li>• File was not properly uploaded</li>
									<li>• File was deleted or moved</li>
									<li>• Session expired</li>
								</ul>
							</div>
							<div className='mt-4'>
								<button
									onClick={() => window.location.reload()}
									className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm'>
									Refresh Page
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Image Analysis Panel */}
				{actualFileType === 'image' && (
					<ImageAnalysisPanel
						analysisResult={analysisResult}
						safeVisualEvidence={safeVisualEvidence}
						details={details}
					/>
				)}

				{/* Frame Analysis Panel */}
				{actualFileType === 'video' && frameResults.length > 0 && (
					<VideoFrameAnaylsis
						setFilterSuspicious={setFilterSuspicious}
						filterSuspicious={filterSuspicious}
						setShowFrameAnalysis={setShowFrameAnalysis}
						showFrameAnalysis={showFrameAnalysis}
						analysisResult={analysisResult}
						extractedFrames={extractedFrames}
						currentFrameIndex={currentFrameIndex}
					/>
				)}

				{/* Evidence Summary */}
				<div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
					<EvidenceSummary
						analysisResult={analysisResult}
						actualFileType={actualFileType}
						safeVisualEvidence={safeVisualEvidence}
					/>
				</div>

				{/* Detailed Analysis */}
				<div className='mt-4 space-y-3'>
					<h4 className='font-medium text-gray-900'>Analysis Details</h4>
					{/* Face Detection Details */}
					<FaceDetectionDetails safeVisualEvidence={safeVisualEvidence} />
					{/* Heatmap Details & Artifact Details */}
					<HeatmapDetails safeVisualEvidence={safeVisualEvidence} />
				</div>
			</div>
		</motion.div>
	);
};

export default VisualEvidence;
