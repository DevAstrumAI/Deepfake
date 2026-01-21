/** @format */

import AudioAnalysis from '../AudioAnalysis';
import AudioPlayer from '../AudioPlayer';
import VideoCharts from './videoCharts';
import AudioWaveform from '../AudioWaveform';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart as RechartsPieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
	RadarChart,
	Radar,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	AreaChart,
	Area,
	Legend,
} from 'recharts';
import {
	TrendingUp,
	Activity,
	Zap,
	Eye,
	Shield,
	AlertTriangle,
	CheckCircle,
	BarChart3,
	PieChart,
} from 'lucide-react';

function ChartsAnalysis({ result }) {
	const { fileId } = useParams();

	const getFileExtension = (filename) => {
		if (!filename) return '.wav';
		const lastDot = filename.lastIndexOf('.');
		return lastDot !== -1 ? filename.substring(lastDot) : '.wav';
	};

	const formatConfidence = (confidence) => {
		if (confidence <= 1) {
			return Math.round(confidence * 100);
		} else {
			return Math.round(confidence);
		}
	};

	if (!result) return null;

	// Handle video analysis charts
	if (result.type === 'video' && result.frame_analysis) {
		return <VideoCharts result={result} />;
	}

	// Handle audio analysis charts
	if (result.type === 'audio') {
		const apiBaseUrl = process.env.REACT_APP_API_URL || 'https://deepfake-qbl3.onrender.com';
		const baseAudioUrl = `${apiBaseUrl}/uploads/${fileId}${getFileExtension(
			result.filename
		)}`;
		const authToken =
			typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
		const secureAudioUrl = authToken
			? `${baseAudioUrl}?token=${encodeURIComponent(authToken)}`
			: baseAudioUrl;

		return (
			<div className='space-y-6'>
				<div className='card'>
					<h3 className='text-xl font-semibold text-gray-900 mb-4'>
						Audio Preview
					</h3>
					<AudioPlayer
						audioUrl={secureAudioUrl}
						title={result.filename || 'Audio File'}
					/>
				</div>
				<AudioWaveform audioUrl={secureAudioUrl} height={120} />
				<AudioAnalysis analysisResult={result} />
			</div>
		);
	}

	// Extract data for image analysis
	const details = result.details || {};
	const faceFeatures = details.face_features || {};
	const forensic = faceFeatures.forensic_analysis || {};
	const quality = faceFeatures.image_quality || {};
	const artifact = faceFeatures.artifact_analysis || {};
	
	// Get OpenAI detailed scores as fallback
	const openaiScores = details.openai_analysis?.detailed_scores || {};
	
	// Helper function to get nested value with fallbacks
	const getNestedValue = (obj, path, fallback = 0) => {
		// Handle null or undefined path
		if (!path || path === null || path === undefined) {
			return fallback;
		}
		
		// Handle null or undefined object
		if (!obj || obj === null || obj === undefined) {
			return fallback;
		}
		
		const keys = path.split('.');
		let current = obj;
		for (const key of keys) {
			if (current && typeof current === 'object' && key in current) {
				current = current[key];
			} else {
				return fallback;
			}
		}
		return current !== undefined && current !== null ? current : fallback;
	};

	// Model Confidence Data
	const modelData = [];
	if (details.model_predictions) {
		Object.entries(details.model_predictions).forEach(([model, prediction]) => {
			const confidence = details.model_confidences?.[model] || 0;
			modelData.push({
				name: model.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
					confidence: formatConfidence(confidence),
					prediction: prediction === 1 ? 'FAKE' : 'REAL',
				});
		});
	}

	// Forensic Analysis Radar Data - Try multiple paths
	const getForensicValue = (forensicPath, artifactPath = null, openaiKey = null) => {
		let value = 0;
		
		// Try forensic path first (only if path is provided)
		if (forensicPath) {
			value = getNestedValue(forensic, forensicPath);
		}
		
		// Try artifact path if provided and value not found
		if ((value === 0 || value === null || value === undefined) && artifactPath) {
			value = getNestedValue(artifact, artifactPath);
		}
		
		// Try openai_analysis detailed_scores
		if ((value === 0 || value === null || value === undefined) && openaiKey) {
			value = openaiScores[openaiKey] || 0;
		}
		
		// Convert to percentage if value is between 0-1
		if (value > 0 && value <= 1) {
			value = value * 100;
		}
		
		return formatConfidence(value || 0);
	};

	const forensicData = [
		{
			subject: 'Lighting',
			score: getForensicValue('lighting_analysis.brightness_uniformity', null, 'lighting_consistency'),
			fullMark: 100,
		},
		{
			subject: 'Skin',
			score: getForensicValue('skin_analysis.skin_naturalness', null, 'skin_texture_score'),
			fullMark: 100,
		},
		{
			subject: 'Symmetry',
			score: getForensicValue('symmetry_analysis.face_symmetry', null, 'facial_symmetry_score'),
			fullMark: 100,
		},
		{
			subject: 'Edges',
			score: getForensicValue(null, 'edge_analysis.edge_uniformity', 'edge_uniformity'),
			fullMark: 100,
		},
		{
			subject: 'Texture',
			score: getForensicValue(null, 'texture_analysis.texture_consistency', 'skin_texture_score'),
			fullMark: 100,
		},
		{
			subject: 'Borders',
			score: getForensicValue(null, 'border_analysis.border_quality', 'border_quality'),
			fullMark: 100,
		},
	];

	// Image Quality Metrics - Try multiple paths
	const getQualityValue = (key, normalizeFn = (v) => v) => {
		// Try face_features.image_quality path first
		let value = quality[key];
		
		// Try face_features.image_quality directly
		if (value === undefined || value === null) {
			value = faceFeatures.image_quality?.[key];
		}
		
		// Try details.image_quality path
		if (value === undefined || value === null) {
			value = details.image_quality?.[key];
		}
		
		// Default to 0 if still not found
		value = value || 0;
		
		// Apply normalization
		return formatConfidence(normalizeFn(value));
	};

	const qualityData = [
		{
			name: 'Brightness',
			value: getQualityValue('brightness', (v) => {
				// If value is 0-255, normalize to 0-100
				if (v > 1 && v <= 255) return Math.min(100, (v / 2.55));
				// If value is 0-1, convert to percentage
				if (v > 0 && v <= 1) return v * 100;
				// If already 0-100, return as is
				if (v >= 0 && v <= 100) return v;
				return 0;
			}),
			max: 100,
		},
		{
			name: 'Contrast',
			value: getQualityValue('contrast', (v) => {
				if (v > 1 && v <= 255) return Math.min(100, (v / 2.55));
				if (v > 0 && v <= 1) return v * 100;
				if (v >= 0 && v <= 100) return v;
				return 0;
			}),
			max: 100,
		},
		{
			name: 'Sharpness',
			value: getQualityValue('sharpness', (v) => {
				// Sharpness is typically 0-1000+, normalize to 0-100
				if (v > 10) return Math.min(100, v / 10);
				if (v > 0 && v <= 1) return v * 100;
				if (v >= 0 && v <= 100) return v;
				return 0;
			}),
			max: 100,
		},
		{
			name: 'Noise Level',
			value: getQualityValue('noise_level', (v) => {
				// Noise level is typically 0-10, normalize to 0-100
				if (v > 0 && v <= 10) return Math.min(100, v * 10);
				if (v > 0 && v <= 1) return v * 100;
				if (v >= 0 && v <= 100) return v;
				return 0;
			}),
			max: 100,
		},
	];

	// Feature Scores Breakdown - Use same helper function
	const getFeatureScore = (forensicPath = null, artifactPath = null, openaiKey = null) => {
		let value = 0;
		
		// Try forensic path first (only if path is provided)
		if (forensicPath && forensicPath !== null) {
			value = getNestedValue(forensic, forensicPath);
		}
		
		// Try artifact path if provided and value not found
		if ((value === 0 || value === null || value === undefined) && artifactPath && artifactPath !== null) {
			value = getNestedValue(artifact, artifactPath);
		}
		
		// Try openai_analysis detailed_scores
		if ((value === 0 || value === null || value === undefined) && openaiKey) {
			value = openaiScores[openaiKey] || 0;
		}
		
		// Convert to percentage if value is between 0-1
		if (value > 0 && value <= 1) {
			value = value * 100;
		}
		
		return formatConfidence(value || 0);
	};

	const featureScores = [
		{
			name: 'Border Quality',
			score: getFeatureScore(null, 'border_analysis.border_quality', 'border_quality'),
			color: '#3b82f6',
		},
		{
			name: 'Edge Uniformity',
			score: getFeatureScore(null, 'edge_analysis.edge_uniformity', 'edge_uniformity'),
			color: '#8b5cf6',
		},
		{
			name: 'Lighting Consistency',
			score: getFeatureScore('lighting_analysis.brightness_uniformity', null, 'lighting_consistency'),
			color: '#10b981',
		},
		{
			name: 'Skin Texture',
			score: getFeatureScore('skin_analysis.skin_naturalness', null, 'skin_texture_score'),
			color: '#f59e0b',
		},
		{
			name: 'Facial Symmetry',
			score: getFeatureScore('symmetry_analysis.face_symmetry', null, 'facial_symmetry_score'),
			color: '#ef4444',
		},
		{
			name: 'Texture Consistency',
			score: getFeatureScore(null, 'texture_analysis.texture_consistency', 'skin_texture_score'),
			color: '#ec4899',
		},
	];

	// Prediction Distribution - Fix pie chart calculation
	const confidencePercent = formatConfidence(result.confidence);
	const pieData = [
		{
			name: 'Real',
			value: result.prediction === 'REAL' ? confidencePercent : 100 - confidencePercent,
			color: '#22c55e',
		},
		{
			name: 'Fake',
			value: result.prediction === 'FAKE' ? confidencePercent : 100 - confidencePercent,
			color: '#ef4444',
		},
	];

	// Confidence Trend (if available)
	const confidenceTrend = [
		{ name: 'Initial', value: formatConfidence(result.confidence * 0.8) },
		{ name: 'Analysis', value: formatConfidence(result.confidence * 0.9) },
		{ name: 'Final', value: formatConfidence(result.confidence) },
	];

	const COLORS = {
		primary: '#3b82f6',
		success: '#22c55e',
		danger: '#ef4444',
		warning: '#f59e0b',
		purple: '#8b5cf6',
		pink: '#ec4899',
	};

	return (
		<div className='space-y-6'>
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className='mb-6'>
				<h2 className='text-3xl font-bold text-gray-900 mb-2'>
					Analysis Charts & Metrics
				</h2>
				<p className='text-gray-600'>
					Comprehensive visual breakdown of deepfake detection analysis
				</p>
			</motion.div>

			{/* Grid Layout */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Model Confidence Comparison */}
				{modelData.length > 0 ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.1 }}
						className='card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200'>
						<div className='flex items-center justify-between mb-4'>
							<div className='flex items-center gap-2'>
								<div className='p-2 bg-blue-500 rounded-lg'>
									<BarChart3 className='w-5 h-5 text-white' />
								</div>
								<h3 className='text-xl font-bold text-gray-900'>
									Model Confidence
					</h3>
							</div>
						</div>
						<div className='h-80'>
						<ResponsiveContainer width='100%' height='100%'>
								<BarChart data={modelData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
									<CartesianGrid strokeDasharray='3 3' stroke='#e0e7ff' />
									<XAxis
										dataKey='name'
										angle={-45}
										textAnchor='end'
										height={80}
										tick={{ fill: '#64748b', fontSize: 12 }}
									/>
									<YAxis
										domain={[0, 100]}
										tick={{ fill: '#64748b' }}
										label={{
											value: 'Confidence %',
											angle: -90,
											position: 'insideLeft',
											style: { fill: '#64748b' },
										}}
									/>
									<Tooltip
										contentStyle={{
											backgroundColor: 'rgba(255, 255, 255, 0.95)',
											border: '1px solid #e0e7ff',
											borderRadius: '8px',
											boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
										}}
										formatter={(value) => [`${value}%`, 'Confidence']}
									/>
									<Bar
										dataKey='confidence'
										radius={[8, 8, 0, 0]}
										fill='url(#colorGradient)'>
										{modelData.map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={
													entry.prediction === 'FAKE'
														? COLORS.danger
														: COLORS.success
												}
											/>
										))}
									</Bar>
									<defs>
										<linearGradient id='colorGradient' x1='0' y1='0' x2='0' y2='1'>
											<stop offset='0%' stopColor='#3b82f6' stopOpacity={1} />
											<stop offset='100%' stopColor='#1d4ed8' stopOpacity={1} />
										</linearGradient>
									</defs>
							</BarChart>
						</ResponsiveContainer>
					</div>
					</motion.div>
				) : null}

			{/* Prediction Distribution */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.2 }}
					className='card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200'>
					<div className='flex items-center justify-between mb-4'>
						<div className='flex items-center gap-2'>
							<div className='p-2 bg-purple-500 rounded-lg'>
								<PieChart className='w-5 h-5 text-white' />
							</div>
							<h3 className='text-xl font-bold text-gray-900'>
					Prediction Distribution
				</h3>
						</div>
					</div>
					<div className='h-80'>
					<ResponsiveContainer width='100%' height='100%'>
						<RechartsPieChart>
							<Pie
								data={pieData}
								cx='50%'
								cy='50%'
									labelLine={true}
									label={({ name, value, percent }) => {
										// Only show label if value is significant (> 5%)
										if (value > 5) {
											return `${name}: ${value}%`;
										}
										return '';
									}}
									outerRadius={110}
									innerRadius={30}
									fill='#8884d8'
								dataKey='value'
									stroke='#fff'
									strokeWidth={3}>
								{pieData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={entry.color}
											stroke={entry.color}
											strokeWidth={3}
										/>
								))}
							</Pie>
								<Tooltip
									contentStyle={{
										backgroundColor: 'rgba(255, 255, 255, 0.98)',
										border: '2px solid #8b5cf6',
										borderRadius: '8px',
										boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
										fontSize: '14px',
										fontWeight: 600,
									}}
									formatter={(value, name, props) => [
										`${value}%`,
										`${props.payload.name} Prediction`
									]}
								/>
								<Legend
									verticalAlign='bottom'
									height={50}
									iconType='circle'
									formatter={(value, entry) => {
										const data = pieData.find(d => d.name === value);
										return (
											<span style={{ color: '#475569', fontWeight: 600, fontSize: '14px' }}>
												{value}: {data?.value || 0}%
											</span>
										);
									}}
								/>
							</RechartsPieChart>
						</ResponsiveContainer>
					</div>
					{/* Additional Info */}
					<div className='mt-4 text-center'>
						<p className='text-sm text-gray-600'>
							<span className='font-semibold'>Overall Confidence:</span>{' '}
							<span className='font-bold text-lg'>{confidencePercent}%</span>
						</p>
						<p className='text-xs text-gray-500 mt-1'>
							Prediction: <span className='font-semibold'>{result.prediction}</span>
						</p>
					</div>
				</motion.div>

				{/* Forensic Analysis Radar */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.3 }}
					className='card bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200'>
					<div className='flex items-center justify-between mb-4'>
						<div className='flex items-center gap-2'>
							<div className='p-2 bg-emerald-500 rounded-lg'>
								<Activity className='w-5 h-5 text-white' />
							</div>
							<h3 className='text-xl font-bold text-gray-900'>
								Forensic Analysis
							</h3>
						</div>
					</div>
					<div className='h-80'>
						<ResponsiveContainer width='100%' height='100%'>
							<RadarChart data={forensicData}>
								<PolarGrid stroke='#cbd5e1' strokeWidth={1} />
								<PolarAngleAxis
									dataKey='subject'
									tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }}
								/>
								<PolarRadiusAxis
									angle={90}
									domain={[0, 100]}
									tick={{ fill: '#64748b', fontSize: 11 }}
									tickCount={6}
								/>
								<Radar
									name='Score'
									dataKey='score'
									stroke='#10b981'
									fill='#10b981'
									fillOpacity={0.7}
									strokeWidth={3}
									dot={{ fill: '#10b981', r: 5 }}
									activeDot={{ r: 7 }}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: 'rgba(255, 255, 255, 0.98)',
										border: '2px solid #10b981',
										borderRadius: '8px',
										boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
										fontSize: '14px',
										fontWeight: 600,
									}}
									formatter={(value, name, props) => [
										`${value}%`,
										`${props.payload.subject} Score`
									]}
									labelFormatter={(label) => `Feature: ${label}`}
								/>
							</RadarChart>
						</ResponsiveContainer>
						{/* Legend with values */}
						<div className='mt-4 grid grid-cols-3 gap-2 text-xs'>
							{forensicData.map((item, idx) => (
								<div key={idx} className='flex items-center justify-between px-2 py-1 bg-gray-50 rounded'>
									<span className='text-gray-600 font-medium'>{item.subject}:</span>
									<span className='font-bold text-emerald-600'>{item.score}%</span>
								</div>
							))}
						</div>
					</div>
				</motion.div>

				{/* Feature Scores Breakdown */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.4 }}
					className='card bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200'>
					<div className='flex items-center justify-between mb-4'>
						<div className='flex items-center gap-2'>
							<div className='p-2 bg-amber-500 rounded-lg'>
								<TrendingUp className='w-5 h-5 text-white' />
							</div>
							<h3 className='text-xl font-bold text-gray-900'>
								Feature Scores
							</h3>
						</div>
					</div>
					<div className='h-80'>
						<ResponsiveContainer width='100%' height='100%'>
							<BarChart
								data={featureScores}
								layout='vertical'
								margin={{ top: 20, right: 80, left: 120, bottom: 20 }}>
								<CartesianGrid strokeDasharray='3 3' stroke='#fde68a' />
								<XAxis 
									type='number' 
									domain={[0, 100]} 
									tick={{ fill: '#64748b', fontSize: 12 }}
									label={{ 
										value: 'Score (%)', 
										position: 'insideBottom', 
										offset: -5,
										style: { fill: '#64748b', fontSize: 12, fontWeight: 600 }
									}}
								/>
								<YAxis
									dataKey='name'
									type='category'
									tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
									width={110}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: 'rgba(255, 255, 255, 0.98)',
										border: '2px solid #f59e0b',
										borderRadius: '8px',
										boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
										fontSize: '14px',
										fontWeight: 600,
									}}
									formatter={(value, name, props) => [
										`${value}%`,
										`${props.payload.name} Score`
									]}
									labelFormatter={() => 'Feature Analysis'}
								/>
								<Bar
									dataKey='score'
									radius={[0, 8, 8, 0]}
									label={{ 
										position: 'right', 
										fill: '#1e293b',
										fontSize: 13,
										fontWeight: 700,
										formatter: (value) => value > 0 ? `${value}%` : ''
									}}>
									{featureScores.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</motion.div>

				{/* Image Quality Metrics */}
				{qualityData.length > 0 ? (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.5 }}
						className='card bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200'>
					<div className='flex items-center justify-between mb-4'>
						<div className='flex items-center gap-2'>
							<div className='p-2 bg-cyan-500 rounded-lg'>
								<Eye className='w-5 h-5 text-white' />
							</div>
							<h3 className='text-xl font-bold text-gray-900'>
								Image Quality Metrics
							</h3>
						</div>
					</div>
					<div className='h-80'>
							<ResponsiveContainer width='100%' height='100%'>
								<AreaChart data={qualityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
									<defs>
										<linearGradient id='qualityGradient' x1='0' y1='0' x2='0' y2='1'>
											<stop offset='5%' stopColor='#06b6d4' stopOpacity={0.8} />
											<stop offset='95%' stopColor='#06b6d4' stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray='3 3' stroke='#bae6fd' />
									<XAxis
										dataKey='name'
										tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
									/>
									<YAxis
										domain={[0, 100]}
										tick={{ fill: '#64748b', fontSize: 12 }}
										label={{
											value: 'Quality Score (%)',
											angle: -90,
											position: 'insideLeft',
											style: { fill: '#64748b', fontSize: 12, fontWeight: 600 },
										}}
									/>
									<Tooltip
										contentStyle={{
											backgroundColor: 'rgba(255, 255, 255, 0.98)',
											border: '2px solid #06b6d4',
											borderRadius: '8px',
											boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
											fontSize: '14px',
											fontWeight: 600,
										}}
										formatter={(value, name, props) => [
											`${value}%`,
											`${props.payload.name} Quality`
										]}
										labelFormatter={(label) => `Metric: ${label}`}
									/>
									<Area
										type='monotone'
										dataKey='value'
										stroke='#06b6d4'
										strokeWidth={3}
										fillOpacity={1}
										fill='url(#qualityGradient)'
										dot={{ fill: '#06b6d4', r: 5, strokeWidth: 2, stroke: '#fff' }}
										activeDot={{ r: 7, strokeWidth: 2 }}
									/>
								</AreaChart>
							</ResponsiveContainer>
						{/* Quality Metrics Summary */}
						<div className='mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs'>
							{qualityData.map((item, idx) => (
								<div key={idx} className='flex flex-col items-center px-2 py-2 bg-cyan-50 rounded border border-cyan-200'>
									<span className='text-gray-600 font-medium text-center mb-1'>{item.name}</span>
									<span className='font-bold text-cyan-600 text-base'>{item.value}%</span>
								</div>
							))}
						</div>
					</div>
				</motion.div>
				) : null}

				{/* Confidence Trend */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.6 }}
					className='card bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200'>
					<div className='flex items-center justify-between mb-4'>
						<div className='flex items-center gap-2'>
							<div className='p-2 bg-rose-500 rounded-lg'>
								<TrendingUp className='w-5 h-5 text-white' />
							</div>
							<h3 className='text-xl font-bold text-gray-900'>
								Confidence Trend
							</h3>
						</div>
					</div>
					<div className='h-80'>
						<ResponsiveContainer width='100%' height='100%'>
							<LineChart data={confidenceTrend} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
								<CartesianGrid strokeDasharray='3 3' stroke='#fecdd3' />
								<XAxis 
									dataKey='name' 
									tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
								/>
								<YAxis
									domain={[0, 100]}
									tick={{ fill: '#64748b', fontSize: 12 }}
									label={{
										value: 'Confidence (%)',
										angle: -90,
										position: 'insideLeft',
										style: { fill: '#64748b', fontSize: 12, fontWeight: 600 },
									}}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: 'rgba(255, 255, 255, 0.98)',
										border: '2px solid #f43f5e',
										borderRadius: '8px',
										boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
										fontSize: '14px',
										fontWeight: 600,
									}}
									formatter={(value, name, props) => [
										`${value}%`,
										`${props.payload.name} Stage Confidence`
									]}
									labelFormatter={(label) => `Analysis Stage: ${label}`}
								/>
								<Line
									type='monotone'
									dataKey='value'
									stroke='#f43f5e'
									strokeWidth={4}
									dot={{ fill: '#f43f5e', r: 7, strokeWidth: 2, stroke: '#fff' }}
									activeDot={{ r: 9, strokeWidth: 2 }}
									label={{ 
										position: 'top', 
										fill: '#1e293b',
										fontSize: 13,
										fontWeight: 700,
										formatter: (value) => `${value}%`
									}}
								/>
							</LineChart>
						</ResponsiveContainer>
						{/* Trend Summary */}
						<div className='mt-4 flex items-center justify-center gap-4 text-sm'>
							<div className='flex items-center gap-2'>
								<div className='w-3 h-3 rounded-full bg-rose-500'></div>
								<span className='text-gray-600'>Initial: <span className='font-bold text-rose-600'>{confidenceTrend[0].value}%</span></span>
							</div>
							<div className='flex items-center gap-2'>
								<div className='w-3 h-3 rounded-full bg-rose-400'></div>
								<span className='text-gray-600'>Analysis: <span className='font-bold text-rose-600'>{confidenceTrend[1].value}%</span></span>
							</div>
							<div className='flex items-center gap-2'>
								<div className='w-3 h-3 rounded-full bg-rose-600'></div>
								<span className='text-gray-600'>Final: <span className='font-bold text-rose-600'>{confidenceTrend[2].value}%</span></span>
							</div>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Summary Cards */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.7 }}
					className='card bg-gradient-to-br from-blue-500 to-indigo-600 text-white'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-blue-100 text-sm font-medium mb-1'>
								Overall Confidence
							</p>
							<p className='text-3xl font-bold'>
								{formatConfidence(result.confidence)}%
							</p>
						</div>
						<Shield className='w-12 h-12 text-blue-200' />
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8 }}
					className={`card text-white ${
						result.prediction === 'FAKE'
							? 'bg-gradient-to-br from-red-500 to-rose-600'
							: 'bg-gradient-to-br from-green-500 to-emerald-600'
					}`}>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-white/80 text-sm font-medium mb-1'>
								Prediction
							</p>
							<p className='text-3xl font-bold'>{result.prediction}</p>
						</div>
						{result.prediction === 'FAKE' ? (
							<AlertTriangle className='w-12 h-12 text-red-200' />
						) : (
							<CheckCircle className='w-12 h-12 text-green-200' />
						)}
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.9 }}
					className='card bg-gradient-to-br from-purple-500 to-pink-600 text-white'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-purple-100 text-sm font-medium mb-1'>
								Analysis Features
							</p>
							<p className='text-3xl font-bold'>
								{featureScores.filter((f) => f.score > 0).length}
							</p>
						</div>
						<Zap className='w-12 h-12 text-purple-200' />
				</div>
				</motion.div>
			</div>
		</div>
	);
}

export default ChartsAnalysis;
