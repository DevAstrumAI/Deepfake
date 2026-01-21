/** @format */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
	ArrowLeft,
	Download,
	Share2,
	CheckCircle,
	XCircle,
	AlertTriangle,
	BarChart3,
	PieChart,
	TrendingUp,
	Clock,
	FileText,
	Eye,
	Zap,
	Trash2,
	Info,
	Sparkles,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { useAuth } from '../context/AuthContext';

import toast from 'react-hot-toast';

// Visual Evidence component
import VisualEvidence from '../components/VisualEvidence';

import RenderSummary from '../components/results/summary';
import DetailedAnalysis from '../components/results/detailedAanalysis';
import ChartsAnalysis from '../components/results/charts';

const Results = () => {
	const { fileId } = useParams();
	const navigate = useNavigate();
	const { api, files } = useAnalysis();
	const [result, setResult] = useState(null);
	// Initialize loading based on whether we have a fileId or not
	const [loading, setLoading] = useState(!!fileId);
	const [activeTab, setActiveTab] = useState('summary');
	const [debugInfo, setDebugInfo] = useState(null);

	// If no fileId, show all files overview
	const showAllFiles = !fileId;

	// Debug logging
	useEffect(() => {
		console.log('Results component state:', {
			fileId,
			loading,
			result: !!result,
			filesCount: files.length,
			showAllFiles,
		});

		setDebugInfo({
			fileId,
			loading,
			hasResult: !!result,
			filesCount: files.length,
			timestamp: new Date().toISOString(),
		});
	}, [fileId, loading, result, files.length, showAllFiles]);

	// Define fetchResults function outside useEffect so it can be used by retry button
	const fetchResults = async () => {
		try {
			// If no fileId, just show the files list
			if (!fileId) {
				setLoading(false);
				return;
			}

			// First check if we have results in the context
			const file = files.find((f) => f.file_id === fileId);
			if (file && file.result) {
				setResult(file.result);
				setLoading(false);
				return;
			}

			// If no results in context, fetch from API
			const response = await api.getResults(fileId);
			console.log('API Response:', response);
			if (response.status === 'completed') {
				console.log('Setting result:', response.result);
				setResult(response.result);
				setLoading(false);
			} else if (response.status === 'processing') {
				// Start polling for results
				const pollInterval = setInterval(async () => {
					try {
						const pollResponse = await api.getResults(fileId);
						if (pollResponse.status === 'completed') {
							setResult(pollResponse.result);
							setLoading(false);
							clearInterval(pollInterval);
						} else if (pollResponse.status === 'error') {
							toast.error(`Analysis failed: ${pollResponse.error}`);
							setLoading(false);
							clearInterval(pollInterval);
						}
					} catch (error) {
						console.error('Polling error:', error);
					}
				}, 2000);

				// Cleanup interval after 5 minutes
				setTimeout(() => {
					clearInterval(pollInterval);
					if (loading) {
						toast.error('Analysis timed out');
						setLoading(false);
					}
				}, 300000);
			} else if (response.status === 'error') {
				toast.error(`Analysis failed: ${response.error}`);
				setLoading(false);
			} else {
				// If status is unknown, start polling
				const pollInterval = setInterval(async () => {
					try {
						const pollResponse = await api.getResults(fileId);
						if (pollResponse.status === 'completed') {
							setResult(pollResponse.result);
							setLoading(false);
							clearInterval(pollInterval);
						} else if (pollResponse.status === 'error') {
							toast.error(`Analysis failed: ${pollResponse.error}`);
							setLoading(false);
							clearInterval(pollInterval);
						}
					} catch (error) {
						console.error('Polling error:', error);
					}
				}, 2000);

				// Cleanup interval after 5 minutes
				setTimeout(() => {
					clearInterval(pollInterval);
					if (loading) {
						toast.error('Analysis timed out');
						setLoading(false);
					}
				}, 300000);
			}
		} catch (error) {
			console.error('Error fetching results:', error);
			toast.error('Failed to fetch results');
			setLoading(false);
		}
	};

	// Call fetchResults when component mounts or fileId changes
	useEffect(() => {
		if (fileId) {
			fetchResults();
		}
	}, [fileId, api, files]);

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

	const { getAuthHeaders } = useAuth();

	const generateReport = async () => {
		if (!fileId) {
			toast.error('No file selected');
			return;
		}

		try {
			toast.loading('Generating PDF report...', { id: 'pdf-report' });

			const API_BASE_URL = process.env.REACT_APP_API_URL || '';
			const token = localStorage.getItem('auth_token');
			const response = await fetch(`${API_BASE_URL}/report/${fileId}`, {
				method: 'GET',
				headers: {
					...(token && { Authorization: `Bearer ${token}` }),
				},
			});

			if (!response.ok) {
				throw new Error('Failed to generate report');
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `deepfake_analysis_report_${fileId}.pdf`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			toast.success('PDF report downloaded successfully!', {
				id: 'pdf-report',
			});
		} catch (error) {
			console.error('Error generating PDF report:', error);
			toast.error('Failed to generate PDF report. Please try again.', {
				id: 'pdf-report',
			});
		}
	};

	const shareResults = () => {
		// Share results (placeholder)
		toast.success('Results shared!');
	};

	const renderVisualEvidence = () => {
		if (!result) return null;

		// Only show visual evidence for images and videos
		if (result.type === 'audio') {
			return (
				<div className='space-y-6'>
					<div className='card text-center'>
						<Eye className='w-16 h-16 text-gray-400 mx-auto mb-4' />
						<h3 className='text-xl font-semibold text-gray-900 mb-2'>
							Visual Evidence Not Available
						</h3>
						<p className='text-gray-600'>
							Visual evidence is only available for image and video files. For
							audio files, please check the audio analysis charts and detailed
							analysis tabs.
						</p>
					</div>
				</div>
			);
		}

		return (
			<div className='space-y-6'>
				<VisualEvidence
					analysisResult={result}
					fileId={fileId}
					fileType={result.type}
				/>
			</div>
		);
	};

	// Show loading state while fetching results
	if (loading || (fileId && !result)) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='spinner mx-auto mb-4'></div>
					<h2 className='text-xl font-semibold text-gray-900 mb-2'>
						Loading Results
					</h2>
					<p className='text-gray-600'>
						Please wait while we fetch your analysis results...
					</p>
					{fileId && (
						<div className='mt-4 text-sm text-gray-500'>File ID: {fileId}</div>
					)}
				</div>
			</div>
		);
	}

	// Show error state only if we have a fileId but no result after loading
	if (fileId && !result && !loading) {
		return (
			<div className='min-h-screen bg-gray-50 flex items-center justify-center'>
				<div className='text-center'>
					<XCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
					<h2 className='text-xl font-semibold text-gray-900 mb-2'>
						No Results Found
					</h2>
					<p className='text-gray-600 mb-4'>
						The analysis results could not be loaded for this file.
					</p>
					<div className='space-y-2'>
						<button
							onClick={() => {
								setLoading(true);
								fetchResults();
							}}
							className='btn-secondary mr-2'>
							Retry
						</button>
						<button onClick={() => navigate('/upload')} className='btn-primary'>
							Upload New File
						</button>
					</div>
					{fileId && (
						<div className='mt-4 text-sm text-gray-500'>File ID: {fileId}</div>
					)}
					{debugInfo && (
						<div className='mt-4 text-xs text-gray-400 bg-gray-100 p-2 rounded'>
							<div>
								Debug: Loading={debugInfo.loading.toString()}, HasResult=
								{debugInfo.hasResult.toString()}
							</div>
							<div>Files in context: {debugInfo.filesCount}</div>
							<div>Time: {debugInfo.timestamp}</div>
						</div>
					)}
				</div>
			</div>
		);
	}

	// If showing all files (no fileId), show files overview
	if (showAllFiles) {
		return (
		<div className='min-h-screen py-8' style={{
			background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)'
		}}>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					{/* Header */}
					<div className='flex items-center justify-between mb-8'>
						<div className='flex items-center space-x-4'>
							<button
								onClick={() => navigate('/upload')}
								className='btn-secondary flex items-center space-x-2'>
								<ArrowLeft className='w-4 h-4' />
								<span>Back to Upload</span>
							</button>
							<div>
								<h1 className='text-3xl font-bold text-gray-900'>
									Analysis Results
								</h1>
								<p className='text-gray-600'>
									All uploaded files and their analysis status
								</p>
							</div>
						</div>
					</div>

					{/* All Files List */}
					<div className='mb-8'>
						<h2 className='text-xl font-semibold text-gray-900 mb-4'>
							All Uploaded Files
						</h2>
						{loading && files.length === 0 ? (
							<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'>
								<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
								<p className='text-gray-600'>Loading files...</p>
							</div>
						) : files.length === 0 ? (
							<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center'>
								<FileText className='w-16 h-16 text-gray-400 mx-auto mb-4' />
								<h3 className='text-lg font-medium text-gray-900 mb-2'>
									No files uploaded yet
								</h3>
								<p className='text-gray-600 mb-4'>
									Upload some files to see their analysis results here.
								</p>
								<button
									onClick={() => navigate('/upload')}
									className='btn-primary'>
									Upload Files
								</button>
							</div>
						) : (
							<div className='bg-white rounded-lg shadow-sm border border-gray-200'>
								<div className='overflow-x-auto'>
									<table className='min-w-full divide-y divide-gray-200'>
										<thead className='bg-gray-50'>
											<tr>
												<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
													File
												</th>
												<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
													Type
												</th>
												<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
													Status
												</th>
												<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
													Prediction
												</th>
												<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
													Confidence
												</th>
												<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
													Uploaded
												</th>
												<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
													Actions
												</th>
											</tr>
										</thead>
										<tbody className='bg-white divide-y divide-gray-200'>
											{files.map((file) => (
												<tr
													key={file.file_id}
													className='hover:bg-gray-50 cursor-pointer'
													onClick={() => navigate(`/results/${file.file_id}`)}>
													<td className='px-6 py-4 whitespace-nowrap'>
														<div className='flex items-center'>
															<div className='flex-shrink-0 h-10 w-10'>
																{file.file_type === 'video' ? (
																	<div className='h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center'>
																		<FileText className='h-5 w-5 text-red-600' />
																	</div>
																) : (
																	<div className='h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center'>
																		<FileText className='h-5 w-5 text-blue-600' />
																	</div>
																)}
															</div>
															<div className='ml-4'>
																<div className='text-sm font-medium text-gray-900'>
																	{file.original_name}
																</div>
																<div className='text-sm text-gray-500'>
																	{file.file_id}
																</div>
															</div>
														</div>
													</td>
													<td className='px-6 py-4 whitespace-nowrap'>
														<span
															className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
																file.file_type === 'video'
																	? 'bg-red-100 text-red-800'
																	: 'bg-blue-100 text-blue-800'
															}`}>
															{file.file_type.toUpperCase()}
														</span>
													</td>
													<td className='px-6 py-4 whitespace-nowrap'>
														{file.status === 'completed' ? (
															<span className='inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
																<CheckCircle className='w-3 h-3 mr-1' />
																Completed
															</span>
														) : file.status === 'processing' ? (
															<span className='inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800'>
																<Clock className='w-3 h-3 mr-1' />
																Processing
															</span>
														) : file.status === 'error' ? (
															<span className='inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'>
																<XCircle className='w-3 h-3 mr-1' />
																Error
															</span>
														) : (
															<span className='inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'>
																<AlertTriangle className='w-3 h-3 mr-1' />
																Pending
															</span>
														)}
													</td>
													<td className='px-6 py-4 whitespace-nowrap'>
														{file.result ? (
															<span
																className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
																	file.result.prediction === 'FAKE'
																		? 'bg-red-100 text-red-800'
																		: 'bg-green-100 text-green-800'
																}`}>
																{file.result.prediction === 'FAKE' ? (
																	<XCircle className='w-3 h-3 mr-1' />
																) : (
																	<CheckCircle className='w-3 h-3 mr-1' />
																)}
																{file.result.prediction}
															</span>
														) : (
															<span className='text-gray-400'>-</span>
														)}
													</td>
													<td className='px-6 py-4 whitespace-nowrap'>
														{file.result ? (
															<div className='flex items-center'>
																<div className='w-16 bg-gray-200 rounded-full h-2 mr-2'>
																	<div
																		className={`h-2 rounded-full ${
																			file.result.confidence > 70
																				? 'bg-green-500'
																				: file.result.confidence > 40
																				? 'bg-yellow-500'
																				: 'bg-red-500'
																		}`}
																		style={{
																			width: `${file.result.confidence}%`,
																		}}></div>
																</div>
																<span className='text-sm text-gray-900'>
																	{formatConfidence(file.result.confidence)}%
																</span>
															</div>
														) : (
															<span className='text-gray-400'>-</span>
														)}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
														{file.uploaded_at
															? new Date(file.uploaded_at).toLocaleDateString()
															: 'N/A'}
													</td>
													<td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
														<div className='flex space-x-2'>
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	navigate(`/results/${file.file_id}`);
																}}
																className='text-blue-600 hover:text-blue-900'
																title='View Details'>
																<Eye className='w-4 h-4' />
															</button>
															{file.result && (
																<button
																	onClick={async (e) => {
																		e.stopPropagation();
																		try {
																			toast.loading(
																				'Generating PDF report...',
																				{ id: `pdf-${file.file_id}` }
																			);

																			const API_BASE_URL =
																				process.env.REACT_APP_API_URL || '';
																			const token =
																				localStorage.getItem('auth_token');
																			const response = await fetch(
																				`${API_BASE_URL}/report/${file.file_id}`,
																				{
																					method: 'GET',
																					headers: {
																						...(token && {
																							Authorization: `Bearer ${token}`,
																						}),
																					},
																				}
																			);

																			if (!response.ok) {
																				throw new Error(
																					'Failed to generate report'
																				);
																			}

																			const blob = await response.blob();
																			const url =
																				window.URL.createObjectURL(blob);
																			const a = document.createElement('a');
																			a.href = url;
																			a.download = `deepfake_analysis_report_${file.file_id}.pdf`;
																			document.body.appendChild(a);
																			a.click();
																			window.URL.revokeObjectURL(url);
																			document.body.removeChild(a);

																			toast.success('PDF report downloaded!', {
																				id: `pdf-${file.file_id}`,
																			});
																		} catch (error) {
																			console.error(
																				'Error generating PDF report:',
																				error
																			);
																			toast.error(
																				'Failed to generate PDF report',
																				{ id: `pdf-${file.file_id}` }
																			);
																		}
																	}}
																	className='text-green-600 hover:text-green-900'
																	title='Download Report'>
																	<Download className='w-4 h-4' />
																</button>
															)}
															<button
																onClick={async (e) => {
																	e.stopPropagation();
																	if (
																		window.confirm(
																			`Are you sure you want to delete "${file.original_name}"? This action cannot be undone.`
																		)
																	) {
																		try {
																			await api.deleteFile(file.file_id);
																		} catch (error) {
																			console.error('Delete error:', error);
																		}
																	}
																}}
																className='text-red-600 hover:text-red-900'
																title='Delete File'>
																<Trash2 className='w-4 h-4' />
															</button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 py-8'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				{/* Modern Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='mb-8'>
					<div className='bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6'>
						<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
					<div className='flex items-center space-x-4'>
								<motion.button
									whileHover={{ scale: 1.05, x: -3 }}
									whileTap={{ scale: 0.95 }}
							onClick={() => navigate('/results')}
									className='flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors'>
							<ArrowLeft className='w-4 h-4' />
							<span>Back to All Results</span>
								</motion.button>
								<div className='hidden md:block w-px h-8 bg-gray-300'></div>
						<div>
									<h1 className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
								Analysis Results
							</h1>
									<p className='text-gray-600 mt-1 flex items-center gap-2'>
										<Sparkles className='w-4 h-4 text-purple-500' />
								Deepfake detection analysis complete
							</p>
						</div>
					</div>

							<div className='flex items-center space-x-3'>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
							onClick={generateReport}
									className='flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold transition-all shadow-sm hover:shadow-md'>
									<Download className='w-5 h-5' />
							<span>Download Report</span>
								</motion.button>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
							onClick={shareResults}
									className='flex items-center space-x-2 px-5 py-2.5 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all'
									style={{
										background: 'linear-gradient(135deg, #914ffc 0%, #d3c6e8 100%)'
									}}>
									<Share2 className='w-5 h-5' />
							<span>Share</span>
								</motion.button>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Modern Tabs */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1, duration: 0.5 }}
					className='mb-8'>
					<div className='bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-2'>
						<nav className='flex space-x-2'>
							{[
								{ id: 'summary', label: 'Summary', icon: FileText },
								{ id: 'detailed', label: 'Detailed Analysis', icon: BarChart3 },
								{ id: 'charts', label: 'Charts', icon: PieChart },
								{ id: 'visual', label: 'Visual Evidence', icon: Eye },
							].map((tab) => {
								const Icon = tab.icon;
								const isActive = activeTab === tab.id;
								return (
									<motion.button
										key={tab.id}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => setActiveTab(tab.id)}
										className={`relative flex items-center space-x-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
											isActive
												? 'text-white shadow-lg'
												: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
										}`}
										style={isActive ? {
											background: 'linear-gradient(135deg, #914ffc 0%, #d3c6e8 100%)'
										} : {}}
									>
										<Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
										<span>{tab.label}</span>
										{isActive && (
											<motion.div
												layoutId='activeTab'
												className='absolute inset-0 rounded-xl -z-10'
												style={{
													background: 'linear-gradient(135deg, #914ffc 0%, #d3c6e8 100%)'
												}}
												transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
											/>
										)}
									</motion.button>
								);
							})}
						</nav>
					</div>
				</motion.div>

				{/* Tab Content */}
				<motion.div
					key={activeTab}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}>
					{activeTab === 'summary' && <RenderSummary result={result} />}
					{activeTab === 'detailed' && <DetailedAnalysis result={result} />}
					{activeTab === 'charts' && <ChartsAnalysis result={result} />}
					{activeTab === 'visual' && renderVisualEvidence()}
				</motion.div>
			</div>
		</div>
	);
};

export default Results;
