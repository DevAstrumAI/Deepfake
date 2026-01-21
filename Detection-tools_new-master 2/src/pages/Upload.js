/** @format */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
	Upload as UploadIcon,
	File,
	Image,
	Video,
	Music,
	X,
	CheckCircle,
	AlertCircle,
	Loader2,
	Eye,
	Trash2,
	Shield,
	Play,
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import toast from 'react-hot-toast';

const Upload = () => {
	const navigate = useNavigate();
	const { api, loading } = useAnalysis();
	const [uploadedFiles, setUploadedFiles] = useState([]);

	const onDrop = useCallback(
		async (acceptedFiles) => {
			const newFiles = acceptedFiles.map((file) => ({
				file,
				id: Math.random().toString(36).substr(2, 9),
				status: 'pending',
				progress: 0,
			}));

			setUploadedFiles((prev) => [...prev, ...newFiles]);

			// Upload files
			for (const fileData of newFiles) {
				try {
					const result = await api.uploadFile(fileData.file);
					setUploadedFiles((prev) =>
						prev.map((f) =>
							f.id === fileData.id
								? { ...f, ...result, status: 'uploaded', progress: 100 }
								: f
						)
					);
				} catch (error) {
					setUploadedFiles((prev) =>
						prev.map((f) =>
							f.id === fileData.id
								? { ...f, status: 'error', error: error.message }
								: f
						)
					);
				}
			}
		},
		[api]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			'image/*': ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'],
			'video/*': [
				'.mp4',
				'.avi',
				'.mov',
				'.mkv',
				'.webm',
				'.flv',
				'.wmv',
				'.m4v',
				'.3gp',
				'.ogv',
			],
			'audio/*': ['.wav', '.mp3', '.flac', '.aac', '.ogg'],
		},
		maxSize: 100 * 1024 * 1024, // 100MB
		multiple: true,
	});

	const handleAnalyze = async (fileId) => {
		try {
			await api.startAnalysis(fileId);
			navigate(`/results/${fileId}`);
		} catch (error) {
			console.error('Analysis failed:', error);
			toast.error('Failed to start analysis');
		}
	};

	const handleDelete = async (fileId) => {
		try {
			await api.deleteFile(fileId);
			setUploadedFiles((prev) => prev.filter((f) => f.file_id !== fileId));
		} catch (error) {
			console.error('Delete failed:', error);
		}
	};

	const getFileIcon = (fileType) => {
		switch (fileType) {
			case 'image':
				return <Image className='w-5 h-5 text-blue-500' />;
			case 'video':
				return <Video className='w-5 h-5 text-red-500' />;
			case 'audio':
				return <Music className='w-5 h-5 text-green-500' />;
			default:
				return <File className='w-5 h-5 text-gray-500' />;
		}
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<div className='min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] lg:overflow-hidden bg-white flex flex-col lg:flex-row'>
			{/* Left Section - Info */}
			<div className='lg:w-1/2 p-8 lg:p-12 xl:p-16 flex flex-col justify-center relative lg:overflow-y-auto lg:pb-32'>
				<div className='max-w-xl mx-auto lg:mx-0'>
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}>
						<div className='px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 font-bold text-lg mb-8 flex items-center gap-2 w-fit'>
							<Shield className='w-4 h-4' />
							Advanced Deepfake Detection
						</div>

						<h1 className='text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight'>
							Be Protected Against Deepfake
						</h1>

						<p className='text-lg text-gray-600 mb-8 leading-relaxed'>
							We offer an AI tool that can identify if an audio, video or image
							is real or deepfake with 95% accuracy
						</p>

						<div className='space-y-4 mb-10'>
							{[
								'Detects deepfake voice, video and image from all major AI models',
								'Integrated background noise/music remover',
								'Multilingual detection capabilities',
							].map((feature, idx) => (
								<div key={idx} className='flex items-center gap-3'>
									<div className='flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center'>
										<CheckCircle className='w-4 h-4 text-purple-600' />
									</div>
									<span className='text-gray-700'>{feature}</span>
								</div>
							))}
						</div>

						<div className='bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-4'>
							<AlertCircle className='w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5' />
							<div>
								<h4 className='font-semibold text-blue-900 mb-1'>
									Privacy & Security
								</h4>
								<p className='text-sm text-blue-700 leading-relaxed'>
									Your uploaded files are processed securely and automatically
									deleted after analysis. No data is stored permanently or
									shared with third parties. All analysis happens on our secure
									servers.
								</p>
							</div>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Right Section - Upload Card */}
			<div className='lg:w-1/2 bg-gray-50 flex items-center justify-center p-4 lg:p-8 lg:h-full lg:overflow-y-auto'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className='w-full max-w-xl'>
					<div className='bg-white rounded-3xl shadow-xl p-8 border border-gray-100'>
						<div className='flex items-center justify-between mb-8'>
							<h2 className='text-2xl font-bold text-gray-900'>
								Analyze Audio/Video File
							</h2>
							<span className='bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full'>
								Premium
							</span>
						</div>

						<div
							{...getRootProps()}
							className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 mb-6 ${
								isDragActive
									? 'border-purple-500 bg-purple-50'
									: 'border-gray-200 hover:border-purple-400 hover:bg-gray-50'
							}`}>
							<input {...getInputProps()} />
							<div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
								<UploadIcon className='w-8 h-8 text-purple-600' />
							</div>
							<h3 className='text-lg font-bold text-gray-900 mb-2'>
								{isDragActive
									? 'Drop files here'
									: 'Drop audio/video file here or click to browse'}
							</h3>
							<p className='text-sm text-gray-500 mb-6'>
								Supports MP3, WAV, OGG, M4A up to 10 minutes
							</p>
							<button className='bg-purple-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200'>
								Browse Files
							</button>
						</div>

						{uploadedFiles.length > 0 && (
							<div className='space-y-3 mb-6 max-h-60 overflow-y-auto custom-scrollbar'>
								{uploadedFiles.map((fileData) => (
									<div
										key={fileData.id || fileData.file_id}
										className='flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100'>
										<div className='flex items-center gap-3 overflow-hidden'>
											{getFileIcon(fileData.file_type)}
											<div className='truncate'>
												<p className='text-sm font-medium text-gray-900 truncate max-w-[150px]'>
													{fileData.filename || fileData.file?.name}
												</p>
												<p className='text-xs text-gray-500'>
													{formatFileSize(
														fileData.file_size || fileData.file?.size
													)}
												</p>
											</div>
										</div>
										<div className='flex items-center gap-2'>
											{fileData.status === 'uploaded' && (
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleAnalyze(fileData.file_id);
													}}
													className='p-1.5 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors'
													title='Analyze'>
													<Eye className='w-4 h-4' />
												</button>
											)}
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleDelete(fileData.file_id);
												}}
												className='p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors'
												title='Delete'>
												<Trash2 className='w-4 h-4' />
											</button>
										</div>
									</div>
								))}
							</div>
						)}

						<button
							disabled={loading || uploadedFiles.length === 0}
							onClick={() => {
								// Determine action - analyze last uploaded file or all?
								// For now, if files are uploaded, analyze the last one or prompt
								const info = uploadedFiles.find((f) => f.status === 'uploaded');
								if (info) handleAnalyze(info.file_id);
								else if (
									uploadedFiles.length > 0 &&
									!uploadedFiles.some((f) => f.status === 'uploaded')
								) {
									toast.error('File currently processing or error state');
								} else {
									toast('Upload a file first', { icon: '📁' });
								}
							}}
							className='w-full bg-purple-600 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed'>
							{loading ? (
								<>
									<Loader2 className='w-5 h-5 animate-spin' />
									Processing...
								</>
							) : (
								<>
									<Play className='w-5 h-5 fill-current' />
									Start Detection
								</>
							)}
						</button>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default Upload;
