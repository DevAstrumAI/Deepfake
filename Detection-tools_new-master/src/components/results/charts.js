/** @format */

import AudioAnalysis from '../AudioAnalysis';
import AudioPlayer from '../AudioPlayer';
import VideoCharts from './videoCharts';
import AudioWaveform from '../AudioWaveform';

// import { AudioWaveform } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from 'recharts';

function ChartsAnalysis({ result }) {
	const { fileId } = useParams();

	const getFileExtension = (filename) => {
		if (!filename) return '.wav'; // Default fallback
		const lastDot = filename.lastIndexOf('.');
		return lastDot !== -1 ? filename.substring(lastDot) : '.wav';
	};

	const formatConfidence = (confidence) => {
		// Handle both decimal (0-1) and percentage (0-100) formats
		if (confidence <= 1) {
			// If confidence is decimal (0-1), convert to percentage
			return Math.round(confidence * 100);
		} else {
			// If confidence is already percentage (0-100), just round it
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
				{/* Audio Player */}
				<div className='card'>
					<h3 className='text-xl font-semibold text-gray-900 mb-4'>
						Audio Preview
					</h3>
					<AudioPlayer
						audioUrl={secureAudioUrl}
						title={result.filename || 'Audio File'}
					/>
				</div>

				{/* Audio Waveform */}
				<AudioWaveform audioUrl={secureAudioUrl} height={120} />

				{/* Audio Analysis Visualizations */}
				<AudioAnalysis analysisResult={result} />
			</div>
		);
	}

	// Handle image analysis charts
	const chartData = [];
	if (result.details?.model_predictions) {
		Object.entries(result.details.model_predictions).forEach(
			([model, prediction]) => {
				const confidence = result.details.model_confidences?.[model] || 0;
				chartData.push({
					model: model.replace('_', ' ').toUpperCase(),
					confidence: formatConfidence(confidence),
					prediction: prediction === 1 ? 'FAKE' : 'REAL',
				});
			}
		);
	}

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

	return (
		<div className='space-y-6'>
			{/* Confidence Chart */}
			{chartData.length > 0 && (
				<div className='card'>
					<h3 className='text-xl font-semibold text-gray-900 mb-4'>
						Model Confidence Comparison
					</h3>
					<div className='h-64'>
						<ResponsiveContainer width='100%' height='100%'>
							<BarChart data={chartData}>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='model' />
								<YAxis />
								<Tooltip />
								<Bar dataKey='confidence' fill='#3b82f6' />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			)}

			{/* Prediction Distribution */}
			<div className='card'>
				<h3 className='text-xl font-semibold text-gray-900 mb-4'>
					Prediction Distribution
				</h3>
				<div className='h-64'>
					<ResponsiveContainer width='100%' height='100%'>
						<RechartsPieChart>
							<Pie
								data={pieData}
								cx='50%'
								cy='50%'
								outerRadius={80}
								dataKey='value'
								label={({ name, value }) => `${name}: ${value}%`}>
								{pieData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Pie>
							<Tooltip />
						</RechartsPieChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}

export default ChartsAnalysis;
