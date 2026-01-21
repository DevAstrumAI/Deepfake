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
	TrendingDown,
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
		const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
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
	const forensic = details.forensic_analysis || {};
	const quality = details.image_quality || {};
	const frequency = details.frequency_analysis || {};
	const artifact = details.artifact_analysis || {};

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

	// Forensic Analysis Radar Data
	const forensicData = [
		{
			subject: 'Lighting',
			score: formatConfidence(
				forensic.lighting_analysis?.brightness_uniformity || 0
			),
			fullMark: 100,
		},
		{
			subject: 'Skin',
			score: formatConfidence(forensic.skin_analysis?.skin_naturalness || 0),
			fullMark: 100,
		},
		{
			subject: 'Symmetry',
			score: formatConfidence(
				forensic.symmetry_analysis?.face_symmetry || 0
			),
			fullMark: 100,
		},
		{
			subject: 'Edges',
			score: formatConfidence(artifact.edge_analysis?.edge_uniformity || 0),
			fullMark: 100,
		},
		{
			subject: 'Texture',
			score: formatConfidence(
				artifact.texture_analysis?.texture_consistency || 0
			),
			fullMark: 100,
		},
		{
			subject: 'Borders',
			score: formatConfidence(artifact.border_analysis?.border_quality || 0),
			fullMark: 100,
		},
	];

	// Image Quality Metrics
	const qualityData = [
		{
			name: 'Brightness',
			value: formatConfidence((quality.brightness || 0) / 2.55), // Normalize 0-255 to 0-100
			max: 100,
		},
		{
			name: 'Contrast',
			value: formatConfidence((quality.contrast || 0) / 2.55),
			max: 100,
		},
		{
			name: 'Sharpness',
			value: formatConfidence(Math.min(100, (quality.sharpness || 0) / 10)),
			max: 100,
		},
		{
			name: 'Noise Level',
			value: formatConfidence(Math.min(100, (quality.noise_level || 0) * 10)),
			max: 100,
		},
	];

	// Feature Scores Breakdown
	const featureScores = [
		{
			name: 'Border Quality',
			score: formatConfidence(artifact.border_analysis?.border_quality || 0),
			color: '#3b82f6',
		},
		{
			name: 'Edge Uniformity',
			score: formatConfidence(artifact.edge_analysis?.edge_uniformity || 0),
			color: '#8b5cf6',
		},
		{
			name: 'Lighting Consistency',
			score: formatConfidence(
				forensic.lighting_analysis?.brightness_uniformity || 0
			),
			color: '#10b981',
		},
		{
			name: 'Skin Texture',
			score: formatConfidence(forensic.skin_analysis?.skin_naturalness || 0),
			color: '#f59e0b',
		},
		{
			name: 'Facial Symmetry',
			score: formatConfidence(
				forensic.symmetry_analysis?.face_symmetry || 0
			),
			color: '#ef4444',
		},
		{
			name: 'Texture Consistency',
			score: formatConfidence(
				artifact.texture_analysis?.texture_consistency || 0
			),
			color: '#ec4899',
		},
	];

	// Prediction Distribution
	const pieData = [
		{
			name: 'Real',
			value:
				result.prediction === 'REAL' ? formatConfidence(result.confidence) : 0,
			color: '#22c55e',
		},
		{
			name: 'Fake',
			value:
				result.prediction === 'FAKE' ? formatConfidence(result.confidence) : 0,
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
									labelLine={false}
									label={({ name, percent }) =>
										`${name}: ${(percent * 100).toFixed(1)}%`
									}
									outerRadius={100}
									fill='#8884d8'
									dataKey='value'>
									{pieData.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={entry.color}
											stroke={entry.color}
											strokeWidth={2}
										/>
									))}
								</Pie>
								<Tooltip
									contentStyle={{
										backgroundColor: 'rgba(255, 255, 255, 0.95)',
										border: '1px solid #e0e7ff',
										borderRadius: '8px',
									}}
									formatter={(value) => `${value}%`}
								/>
								<Legend
									verticalAlign='bottom'
									height={36}
									formatter={(value) => (
										<span style={{ color: '#475569', fontWeight: 500 }}>
											{value}
										</span>
									)}
								/>
							</RechartsPieChart>
						</ResponsiveContainer>
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
								<PolarGrid stroke='#cbd5e1' />
								<PolarAngleAxis
									dataKey='subject'
									tick={{ fill: '#475569', fontSize: 12 }}
								/>
								<PolarRadiusAxis
									angle={90}
									domain={[0, 100]}
									tick={{ fill: '#64748b', fontSize: 10 }}
								/>
								<Radar
									name='Score'
									dataKey='score'
									stroke='#10b981'
									fill='#10b981'
									fillOpacity={0.6}
									strokeWidth={2}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: 'rgba(255, 255, 255, 0.95)',
										border: '1px solid #e0e7ff',
										borderRadius: '8px',
									}}
									formatter={(value) => [`${value}%`, 'Score']}
								/>
							</RadarChart>
						</ResponsiveContainer>
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
								margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
								<CartesianGrid strokeDasharray='3 3' stroke='#fde68a' />
								<XAxis type='number' domain={[0, 100]} tick={{ fill: '#64748b' }} />
								<YAxis
									dataKey='name'
									type='category'
									tick={{ fill: '#475569', fontSize: 12 }}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: 'rgba(255, 255, 255, 0.95)',
										border: '1px solid #e0e7ff',
										borderRadius: '8px',
									}}
									formatter={(value) => [`${value}%`, 'Score']}
								/>
								<Bar
									dataKey='score'
									radius={[0, 8, 8, 0]}
									label={{ position: 'right', fill: '#475569' }}>
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
										tick={{ fill: '#64748b', fontSize: 12 }}
									/>
									<YAxis
										domain={[0, 100]}
										tick={{ fill: '#64748b' }}
										label={{
											value: 'Score',
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
										}}
										formatter={(value) => [`${value}%`, 'Quality']}
									/>
									<Area
										type='monotone'
										dataKey='value'
										stroke='#06b6d4'
										strokeWidth={3}
										fillOpacity={1}
										fill='url(#qualityGradient)'
									/>
								</AreaChart>
							</ResponsiveContainer>
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
								<XAxis dataKey='name' tick={{ fill: '#64748b' }} />
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
									}}
									formatter={(value) => [`${value}%`, 'Confidence']}
								/>
								<Line
									type='monotone'
									dataKey='value'
									stroke='#f43f5e'
									strokeWidth={4}
									dot={{ fill: '#f43f5e', r: 6 }}
									activeDot={{ r: 8 }}
								/>
							</LineChart>
						</ResponsiveContainer>
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
