/** @format */
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

function VideoCharts({ result }) {
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
	if (!result || !result.frame_analysis) return null;

	const frameAnalysis = result.frame_analysis;
	// const videoInfo = result.video_info || {};
	const videoScore = result.video_score || {};

	// Prepare frame data for charts
	const frameData =
		frameAnalysis.frame_results?.map((frame, index) => ({
			frame: index + 1,
			timestamp: frame.timestamp || index * 0.2,
			confidence: formatConfidence(frame.confidence || 0),
			prediction: frame.prediction || 'UNKNOWN',
		})) || [];

	// Prepare confidence over time data
	const confidenceData = frameData.map((frame) => ({
		time: frame.timestamp,
		confidence: frame.confidence,
		prediction: frame.prediction,
	}));

	// Prepare frame distribution data
	const totalFrames = frameAnalysis.total_frames_analyzed || 0;
	const fakeFrames = frameAnalysis.fake_frames || 0;
	const realFrames = frameAnalysis.real_frames || 0;

	const frameDistributionData = [
		{ name: 'Real', value: realFrames, color: '#22c55e' },
		{ name: 'Fake', value: fakeFrames, color: '#ef4444' },
	];

	// Prepare model comparison data from all frames
	const modelData = [];
	const modelStats = {};

	if (frameAnalysis.frame_results && frameAnalysis.frame_results.length > 0) {
		// Calculate average confidence for each model across all frames
		frameAnalysis.frame_results.forEach((frame) => {
			if (frame.details?.model_predictions) {
				Object.entries(frame.details.model_predictions).forEach(
					([model, prediction]) => {
						const confidence = frame.details.model_confidences?.[model] || 0;
						if (!modelStats[model]) {
							modelStats[model] = {
								name: model.replace('_', ' ').toUpperCase(),
								confidences: [],
								predictions: [],
							};
						}
						modelStats[model].confidences.push(confidence);
						modelStats[model].predictions.push(prediction);
					}
				);
			}
		});

		// Calculate averages and create chart data
		Object.entries(modelStats).forEach(([model, stats]) => {
			const avgConfidence =
				stats.confidences.reduce((a, b) => a + b, 0) / stats.confidences.length;
			const fakeCount = stats.predictions.filter((p) => p === 1).length;
			const realCount = stats.predictions.filter((p) => p === 0).length;
			const dominantPrediction = fakeCount > realCount ? 'FAKE' : 'REAL';

			modelData.push({
				model: stats.name,
				confidence: formatConfidence(avgConfidence * 100),
				prediction: dominantPrediction,
				fakeFrames: fakeCount,
				realFrames: realCount,
				totalFrames: stats.predictions.length,
			});
		});
	}

	return (
		<div className='space-y-6'>
			<h2 className='text-2xl font-bold text-gray-900 mb-6'>
				Video Deepfake Analysis Charts
			</h2>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Frame Predictions Over Time */}
				<div className='card'>
					<h3 className='text-xl font-semibold text-gray-900 mb-4'>
						Frame Predictions Over Time
					</h3>
					<div className='h-64'>
						<ResponsiveContainer width='100%' height='100%'>
							<LineChart data={confidenceData}>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='time' name='Time (seconds)' />
								<YAxis domain={[60, 90]} name='Confidence (%)' />
								<Tooltip />
								<Line
									type='monotone'
									dataKey='confidence'
									stroke='#3b82f6'
									strokeWidth={2}
									name='Predictions'
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Confidence Over Time */}
				<div className='card'>
					<h3 className='text-xl font-semibold text-gray-900 mb-4'>
						Confidence Over Time
					</h3>
					<div className='h-64'>
						<ResponsiveContainer width='100%' height='100%'>
							<LineChart data={confidenceData}>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='time' name='Time (seconds)' />
								<YAxis domain={[60, 90]} name='Confidence (%)' />
								<Tooltip />
								<Line
									type='monotone'
									dataKey='confidence'
									stroke='#ef4444'
									strokeWidth={2}
									name='Confidence'
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Frame Distribution */}
				<div className='card'>
					<h3 className='text-xl font-semibold text-gray-900 mb-4'>
						Frame Distribution
					</h3>
					<div className='h-64'>
						<ResponsiveContainer width='100%' height='100%'>
							<RechartsPieChart>
								<Pie
									data={frameDistributionData}
									cx='50%'
									cy='50%'
									labelLine={false}
									label={({ name, value, percent }) =>
										`${name}: ${value} (${(percent * 100).toFixed(1)}%)`
									}
									outerRadius={80}
									fill='#8884d8'
									dataKey='value'>
									{frameDistributionData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip />
							</RechartsPieChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Model Comparison */}
				{modelData.length > 0 && (
					<div className='card'>
						<h3 className='text-xl font-semibold text-gray-900 mb-4'>
							AI Model Performance Analysis
						</h3>
						<div className='h-64'>
							<ResponsiveContainer width='100%' height='100%'>
								<BarChart data={modelData}>
									<CartesianGrid strokeDasharray='3 3' />
									<XAxis dataKey='model' />
									<YAxis />
									<Tooltip
										formatter={(value, name) => [
											`${value}%`,
											name === 'confidence' ? 'Average Confidence' : name,
										]}
										labelFormatter={(label) => `Model: ${label}`}
									/>
									<Bar dataKey='confidence' fill='#3b82f6' name='confidence' />
								</BarChart>
							</ResponsiveContainer>
						</div>
						<div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
							{modelData.map((model, index) => (
								<div key={index} className='bg-gray-50 p-3 rounded'>
									<div className='font-medium text-sm mb-2'>{model.model}</div>
									<div className='text-xs text-gray-600 space-y-1'>
										<div>Avg Confidence: {model.confidence}%</div>
										<div>Dominant Prediction: {model.prediction}</div>
										<div>Fake Frames: {model.fakeFrames}</div>
										<div>Real Frames: {model.realFrames}</div>
										<div>Total Frames: {model.totalFrames}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Video Statistics */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
				<div className='card text-center'>
					<div className='text-2xl font-bold text-gray-900 mb-1'>
						{totalFrames}
					</div>
					<div className='text-gray-600'>Total Frames</div>
				</div>
				<div className='card text-center'>
					<div className='text-2xl font-bold text-red-600 mb-1'>
						{fakeFrames}
					</div>
					<div className='text-gray-600'>Fake Frames</div>
				</div>
				<div className='card text-center'>
					<div className='text-2xl font-bold text-green-600 mb-1'>
						{realFrames}
					</div>
					<div className='text-gray-600'>Real Frames</div>
				</div>
				<div className='card text-center'>
					<div className='text-2xl font-bold text-gray-900 mb-1'>
						{formatConfidence(videoScore.average_confidence || 0)}%
					</div>
					<div className='text-gray-600'>Avg Confidence</div>
				</div>
			</div>
		</div>
	);
}

export default VideoCharts;
