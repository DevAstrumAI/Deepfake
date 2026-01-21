/** @format */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';

const AnalysisModal = ({ isOpen, onClose, currentStep = 'upload', fileName = '' }) => {
	const [taskStatus, setTaskStatus] = useState({
		extracting: 'completed', // completed, processing, pending
		runningModels: 'processing',
		generatingReport: 'pending',
	});

	const steps = [
		{ id: 'upload', label: 'Upload', number: 1 },
		{ id: 'analyse', label: 'Analyse', number: 2 },
		{ id: 'review', label: 'Review', number: 3 },
		{ id: 'report', label: 'Report', number: 4 },
	];

	// Update task status based on current step
	useEffect(() => {
		if (currentStep === 'upload') {
			setTaskStatus({
				extracting: 'completed',
				runningModels: 'processing',
				generatingReport: 'pending',
			});
		} else if (currentStep === 'analyse') {
			setTaskStatus({
				extracting: 'completed',
				runningModels: 'processing',
				generatingReport: 'pending',
			});
		} else if (currentStep === 'review') {
			setTaskStatus({
				extracting: 'completed',
				runningModels: 'completed',
				generatingReport: 'processing',
			});
		} else if (currentStep === 'report') {
			setTaskStatus({
				extracting: 'completed',
				runningModels: 'completed',
				generatingReport: 'completed',
			});
		}
	}, [currentStep]);

	const getStepStatus = (stepId) => {
		const stepIndex = steps.findIndex((s) => s.id === stepId);
		const currentIndex = steps.findIndex((s) => s.id === currentStep);
		
		if (stepIndex < currentIndex) return 'completed';
		if (stepIndex === currentIndex) return 'active';
		return 'pending';
	};

	const TaskCard = ({ title, description, status }) => {
		return (
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className='bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-start gap-3'>
				{/* Status Icon */}
				<div className='flex-shrink-0 mt-0.5'>
					{status === 'completed' && (
						<div className='w-5 h-5 rounded-full bg-green-500 flex items-center justify-center'>
							<CheckCircle className='w-4 h-4 text-white' />
						</div>
					)}
					{status === 'processing' && (
						<div className='w-5 h-5 flex items-center justify-center'>
							<div className='relative w-5 h-5'>
								<div className='absolute inset-0 rounded-full border-2 border-purple-100'></div>
								<motion.div
									animate={{ rotate: 360 }}
									transition={{
										duration: 1,
										repeat: Infinity,
										ease: 'linear',
									}}
									className='absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 border-r-purple-400'
								/>
							</div>
						</div>
					)}
					{status === 'pending' && (
						<div className='w-5 h-5 rounded-full bg-gray-200'></div>
					)}
				</div>

				{/* Content */}
				<div className='flex-1'>
					<h4
						className={`font-semibold text-sm mb-1 ${
							status === 'pending' ? 'text-gray-400' : 'text-gray-900'
						}`}>
						{title}
					</h4>
					<p
						className={`text-xs ${
							status === 'pending' ? 'text-gray-300' : 'text-gray-600'
						}`}>
						{description}
					</p>
				</div>
			</motion.div>
		);
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'
				onClick={onClose}>
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.95, opacity: 0 }}
					onClick={(e) => e.stopPropagation()}
					className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative'>
					{/* Close Button */}
					<button
						onClick={onClose}
						className='absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors'>
						<X className='w-6 h-6' />
					</button>

					{/* Header */}
					<div className='mb-8'>
						<div className='flex items-center justify-between mb-6'>
							<h2 className='text-2xl font-bold text-gray-900'>
								Deepfake Detection Analysis
							</h2>
						</div>

						{/* Progress Stepper */}
						<div className='flex items-center justify-between mb-8'>
							{steps.map((step, index) => {
								const status = getStepStatus(step.id);
								const isLast = index === steps.length - 1;

								return (
									<React.Fragment key={step.id}>
										<div className='flex flex-col items-center'>
											{/* Step Circle */}
											<div
												className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
													status === 'completed'
														? 'bg-purple-500 text-white'
														: status === 'active'
														? 'bg-purple-500 text-white ring-4 ring-purple-200'
														: 'bg-gray-200 text-gray-400'
												}`}>
												{status === 'completed' ? (
													<CheckCircle className='w-5 h-5' />
												) : (
													step.number
												)}
											</div>
											{/* Step Label */}
											<span
												className={`mt-2 text-xs font-medium ${
													status === 'active'
														? 'text-purple-600'
														: status === 'completed'
														? 'text-gray-600'
														: 'text-gray-400'
												}`}>
												{step.label}
											</span>
										</div>

										{/* Connector Line */}
										{!isLast && (
											<div
												className={`flex-1 h-0.5 mx-2 ${
													status === 'completed' || getStepStatus(steps[index + 1].id) === 'active'
														? 'bg-purple-500'
														: 'bg-gray-200'
												}`}
											/>
										)}
									</React.Fragment>
								);
							})}
						</div>
					</div>

					{/* Main Content */}
					<div className='text-center mb-8'>
						{/* Animated Spinner - Large gradient spinner */}
						<div className='flex justify-center mb-6'>
							<div className='relative w-24 h-24'>
								{/* Outer light purple circle */}
								<div className='absolute inset-0 rounded-full border-4 border-purple-100'></div>
								{/* Animated gradient arc */}
								<motion.div
									animate={{ rotate: 360 }}
									transition={{
										duration: 1.5,
										repeat: Infinity,
										ease: 'linear',
									}}
									className='absolute inset-0 rounded-full'
									style={{
										border: '4px solid transparent',
										borderTop: '4px solid #8b5cf6',
										borderRight: '4px solid #a855f7',
										clipPath: 'inset(0 0 0 0)',
									}}
								/>
							</div>
						</div>

						{/* Status Message */}
						<h3 className='text-xl font-bold text-gray-900 mb-2'>
							Analyzing Media...
						</h3>
						<p className='text-gray-600 text-sm'>
							Our AI system is examining the file for authenticity markers.
						</p>
					</div>

					{/* Task Cards */}
					<div className='space-y-3'>
						<TaskCard
							title='Extracting Features'
							description='Analyzing pixel patterns and metadata.'
							status={taskStatus.extracting}
						/>
						<TaskCard
							title='Running Detection Models'
							description='Applying neural network analysis.'
							status={taskStatus.runningModels}
						/>
						<TaskCard
							title='Generating Report'
							description='Compiling insights and evidence.'
							status={taskStatus.generatingReport}
						/>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default AnalysisModal;

