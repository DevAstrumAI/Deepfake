/** @format */

import {
	generateHeatmaps,
	calculateTemporalAnalysisFromFrames,
	generateVideoHeatmapsFromFrames,
	deriveVideoArtifactRegions,
	generateRegionsFromBackend,
	generateRegions,
} from './visualEvidenceUtils';

/**
 * Generate visual evidence data from analysis results
 */
export const generateVisualEvidence = (
	analysisResult,
	actualFileType,
	faceFeatures,
	artifactAnalysis,
	forensicAnalysis,
	frameResults,
	suspiciousFrames
) => {
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
				image_data: backendEvidence.image_data || null,
			};
		}
	}

	console.log('No backend visual evidence, generating fallback data');

	// Fallback to generating from analysis results
	if (actualFileType === 'video') {
		const derivedTemporal = calculateTemporalAnalysisFromFrames(
			frameResults,
			suspiciousFrames
		);
		const derivedHeatmaps = generateVideoHeatmapsFromFrames(
			frameResults,
			suspiciousFrames,
			derivedTemporal
		);
		const derivedRegions = deriveVideoArtifactRegions(suspiciousFrames);
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
			detected: faceFeatures.face_detected || true,
			confidence: faceFeatures.face_confidence || 0.85,
			region: faceFeatures.face_region || null,
			boundingBox: faceFeatures.face_region
				? {
						x: faceFeatures.face_region.left,
						y: faceFeatures.face_region.top,
						width: faceFeatures.face_region.width,
						height: faceFeatures.face_region.height,
				  }
				: { x: 100, y: 100, width: 200, height: 250 },
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
		heatmaps: generateHeatmaps(artifactAnalysis, forensicAnalysis),
		regions: generateRegions(faceFeatures, artifactAnalysis),
	};

	return evidence;
};

