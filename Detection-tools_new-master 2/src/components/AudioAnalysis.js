import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Zap,
  Volume2,
  Clock,
  Mic,
  Microscope,
  Theater,
  Music
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AudioAnalysis = ({ analysisResult, className = "" }) => {
  if (!analysisResult || !analysisResult.details) {
    return (
      <div className={`bg-gray-100 rounded-lg p-6 text-center ${className}`}>
        <p className="text-gray-500">No audio analysis data available</p>
      </div>
    );
  }

  const details = analysisResult.details;
  const comprehensiveFeatures = details.comprehensive_features || {};
  const modelPredictions = details.model_predictions || {};
  const modelConfidences = details.model_confidences || {};
  const deepfakeIndicators = details.deepfake_indicators || {};

  // Prepare data for visualizations
  const modelData = Object.entries(modelPredictions).map(([model, prediction]) => ({
    model: model === 'aasist' ? 'AASIST' : model === 'rawnet2' ? 'RawNet2' : model === 'hybrid' ? 'Hybrid' : model,
    confidence: Math.round((modelConfidences[model] || 0) * 100),
    prediction: prediction === 1 ? 'FAKE' : 'REAL'
  }));

  const featureData = [
    { name: 'Energy', value: Math.round((comprehensiveFeatures.energy_mean || 0) * 1000) },
    { name: 'ZCR', value: Math.round((comprehensiveFeatures.zcr_mean || 0) * 100) },
    { name: 'F0 Mean', value: Math.round(comprehensiveFeatures.f0_mean || 0) },
    { name: 'Spectral Centroid', value: Math.round(comprehensiveFeatures.spectral_centroid_mean || 0) }
  ].filter(item => item.value > 0);

  const indicatorData = Object.entries(deepfakeIndicators).map(([indicator, value]) => ({
    indicator: indicator.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: Math.round(value * 100),
    severity: value > 0.7 ? 'high' : value > 0.4 ? 'medium' : 'low'
  }));

  const predictionData = [
    { name: 'Real', value: modelData.filter(m => m.prediction === 'REAL').length, color: '#22C55E' },
    { name: 'Fake', value: modelData.filter(m => m.prediction === 'FAKE').length, color: '#EF4444' }
  ];

  // const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`space-y-6 ${className}`}
    >
      {/* Model Predictions Chart */}
      {modelData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Model Predictions</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={modelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Confidence']}
                labelFormatter={(label) => `Model: ${label}`}
              />
              <Bar dataKey="confidence" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Audio Features */}
      {featureData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Activity className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Audio Features</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={featureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Prediction Distribution */}
      {predictionData.some(p => p.value > 0) && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Prediction Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={predictionData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {predictionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

        {/* Deepfake Indicators */}
        {indicatorData.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Activity className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Deepfake Indicators</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={indicatorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="indicator" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Severity']}
                  labelFormatter={(label) => `Indicator: ${label}`}
                />
                <Bar dataKey="value" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Audio Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-lg p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {details.preprocessing_info?.duration?.toFixed(1) || 'N/A'}s
            </div>
            <div className="text-gray-600 text-sm">Duration</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Volume2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {details.preprocessing_info?.sample_rate || 'N/A'}
            </div>
            <div className="text-gray-600 text-sm">Sample Rate (Hz)</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round((comprehensiveFeatures.energy_mean || 0) * 1000)}
            </div>
            <div className="text-gray-600 text-sm">Energy (×1000)</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Mic className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round((comprehensiveFeatures.zcr_mean || 0) * 100)}
            </div>
            <div className="text-gray-600 text-sm">ZCR (×100)</div>
          </div>
        </div>

				{/* Analysis Methods Used */}
				{details.analysis_methods && (
					<div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300'>
						<div className='bg-gradient-to-r from-slate-500 to-gray-600 p-6'>
							<h3 className='text-xl font-bold text-white flex items-center'>
								<Microscope className='w-6 h-6 mr-3' />
								Analysis Methods Used
							</h3>
						</div>
						<div className='p-6'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{details.analysis_methods.map((method, index) => (
									<div key={index} className='flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:shadow-md transition-all duration-200'>
										<div className='w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse'></div>
										<span className='text-slate-800 font-medium'>{method}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

								{/* MFCC Features */}
								{comprehensiveFeatures.mfcc_mean && (
									<div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300'>
										<div className='bg-gradient-to-r from-rose-500 to-pink-600 p-6'>
											<h4 className='text-lg font-bold text-white flex items-center'>
												<Theater className='w-5 h-5 mr-2' />
												MFCC Features (Speech Characteristics)
											</h4>
										</div>
										<div className='p-6'>
											<div className='text-sm text-rose-700 mb-4'>
												{comprehensiveFeatures.mfcc_mean.length} features analyzed for speech pattern recognition
											</div>
											<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3'>
												{comprehensiveFeatures.mfcc_mean
													.slice(0, 8)
													.map((value, index) => (
														<div
															key={index}
															className='bg-white p-3 rounded-lg border border-rose-300 text-center hover:shadow-md transition-all duration-200 hover:scale-105'>
															<div className='text-xs font-medium text-rose-600 mb-1'>
																MFCC {index + 1}
															</div>
															<div className='text-lg font-bold text-rose-900'>
																{value?.toFixed(2) || 'N/A'}
															</div>
														</div>
													))}
											</div>
										</div>
									</div>
								)}

								{/* Pitch Analysis */}
								{comprehensiveFeatures.f0_mean !== undefined && (
									<div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300'>
										<div className='bg-gradient-to-r from-violet-500 to-purple-600 p-6'>
											<h4 className='text-lg font-bold text-white flex items-center'>
												<Music className='w-5 h-5 mr-2' />
												Pitch Analysis
											</h4>
										</div>
										<div className='p-6'>
											<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
												<div className='bg-white p-4 rounded-lg border border-violet-300 hover:shadow-md transition-all duration-200'>
													<div className='text-sm font-medium text-violet-700 mb-1'>
														Fundamental Frequency (F0)
													</div>
													<div className='text-2xl font-bold text-violet-900'>
														{comprehensiveFeatures.f0_mean?.toFixed(1) || 'N/A'} Hz
													</div>
												</div>
												<div className='bg-white p-4 rounded-lg border border-violet-300 hover:shadow-md transition-all duration-200'>
													<div className='text-sm font-medium text-violet-700 mb-1'>F0 Variation</div>
													<div className='text-2xl font-bold text-violet-900'>
														{comprehensiveFeatures.f0_std?.toFixed(1) || 'N/A'} Hz
													</div>
												</div>
												<div className='bg-white p-4 rounded-lg border border-violet-300 hover:shadow-md transition-all duration-200'>
													<div className='text-sm font-medium text-violet-700 mb-1'>Voiced Ratio</div>
													<div className='text-2xl font-bold text-violet-900'>
														{(comprehensiveFeatures.voiced_ratio * 100)?.toFixed(1) || 'N/A'}%
													</div>
												</div>
												<div className='bg-white p-4 rounded-lg border border-violet-300 hover:shadow-md transition-all duration-200'>
													<div className='text-sm font-medium text-violet-700 mb-1'>Energy Mean</div>
													<div className='text-2xl font-bold text-violet-900'>
														{comprehensiveFeatures.energy_mean?.toFixed(3) || 'N/A'}
													</div>
												</div>
											</div>
										</div>
									</div>
								)}
    </motion.div>
  );
};

export default AudioAnalysis;
