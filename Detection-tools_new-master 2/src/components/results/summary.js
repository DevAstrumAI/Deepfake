/** @format */

import React from 'react';
import { motion } from 'framer-motion';
import {
	TrendingUp,
	XCircle,
	CheckCircle,
	Clock,
	Zap,
	Shield,
	AlertTriangle,
} from 'lucide-react';

function RenderSummary({ result }) {
	if (!result) return null;

	const isFake = result.prediction === 'FAKE';
	const confidencePercent =
		result.confidence <= 1
			? Math.round(result.confidence * 100)
			: Math.round(result.confidence);

	// Enhanced colors and content based on prediction - using custom color scheme
	const colorState = isFake
		? {
				gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)',
				gradientLight: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(248, 113, 113, 0.2) 50%, rgba(252, 165, 165, 0.2) 100%)',
				text: '#ef4444',
				bg: 'rgba(239, 68, 68, 0.1)',
				badgeBg: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
				badgeText: '#ffffff',
				bar: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
				icon: <XCircle className='w-12 h-12 text-white' />,
				iconBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
				title: 'Deepfake Detected',
				description: 'This media shows signs of deepfake manipulation.',
				statusIcon: <AlertTriangle className='w-5 h-5' />,
		  }
		: {
				gradient: 'linear-gradient(135deg, #914ffc 0%, #d3c6e8 50%, #7d3ee0 100%)',
				gradientLight: 'linear-gradient(135deg, rgba(145, 79, 252, 0.2) 0%, rgba(211, 198, 232, 0.2) 50%, rgba(125, 62, 224, 0.2) 100%)',
				text: '#914ffc',
				bg: 'rgba(145, 79, 252, 0.1)',
				badgeBg: 'linear-gradient(135deg, #914ffc 0%, #d3c6e8 100%)',
				badgeText: '#ffffff',
				bar: 'linear-gradient(90deg, #914ffc 0%, #d3c6e8 100%)',
				icon: <CheckCircle className='w-12 h-12 text-white' />,
				iconBg: 'linear-gradient(135deg, #914ffc 0%, #7d3ee0 100%)',
				title: 'Authentic Content',
				description: 'This media appears to be authentic and unmodified.',
				statusIcon: <Shield className='w-5 h-5' />,
		  };

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.15,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
			},
		},
	};

	return (
		<div className='relative w-full'>
			{/* Animated Background Blobs */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<motion.div
					className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl opacity-30"
					style={{ background: colorState.gradientLight }}
					animate={{
						scale: [1, 1.2, 1],
						x: [0, 50, 0],
						y: [0, -30, 0],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						repeatType: 'reverse',
					}}
				/>
				<motion.div
					className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-30"
					style={{ background: colorState.gradientLight }}
					animate={{
						scale: [1, 1.3, 1],
						x: [0, -50, 0],
						y: [0, 30, 0],
					}}
					transition={{
						duration: 10,
						repeat: Infinity,
						repeatType: 'reverse',
					}}
				/>
			</div>

			<motion.div
				variants={containerVariants}
				initial='hidden'
				animate='visible'
				className='relative z-10'>
				{/* Main Result Card */}
				<motion.div
					variants={itemVariants}
					className='relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden'>
					{/* Gradient Header */}
					<div
						className="relative p-8 md:p-12"
						style={{ background: colorState.gradient }}>
						<div className='absolute inset-0 bg-black/10'></div>
						<div className='relative z-10'>
							{/* Status Badge */}
							<motion.div
								initial={{ scale: 0, rotate: -180 }}
								animate={{ scale: 1, rotate: 0 }}
								transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
								className='inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border mb-6'
								style={{
									background: 'rgba(255, 255, 255, 0.2)',
									borderColor: 'rgba(255, 255, 255, 0.3)'
								}}>
								{colorState.statusIcon}
								<span className='text-white font-semibold text-sm'>
									{result.prediction}
								</span>
							</motion.div>

							{/* Main Icon */}
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
								className="w-24 h-24 mx-auto mb-6 rounded-3xl shadow-2xl flex items-center justify-center"
								style={{ background: colorState.iconBg }}>
								{colorState.icon}
							</motion.div>

							{/* Title */}
							<motion.h1
								variants={itemVariants}
								className='text-4xl md:text-6xl font-extrabold text-white mb-4 text-center'>
								{colorState.title}
							</motion.h1>

							{/* Confidence Display */}
							<motion.div
								variants={itemVariants}
								className='text-center mb-6'>
								<div className='inline-flex items-baseline gap-2 mb-2'>
									<motion.span
										initial={{ opacity: 0, scale: 0.5 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: 0.6, type: 'spring' }}
										className='text-7xl md:text-8xl font-black text-white drop-shadow-2xl'>
										{confidencePercent}
									</motion.span>
									<span className='text-3xl md:text-4xl font-bold text-white/80'>
										%
									</span>
								</div>
								<p className='text-white/80 text-lg font-medium'>
									Confidence Level
								</p>
							</motion.div>

							{/* Progress Bar */}
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: '100%' }}
								transition={{ delay: 0.8, duration: 1.5, ease: 'easeOut' }}
								className='max-w-2xl mx-auto'>
								<div className='h-4 w-full bg-white/20 backdrop-blur-md rounded-full overflow-hidden shadow-inner'>
									<motion.div
										initial={{ width: 0 }}
										animate={{ width: `${confidencePercent}%` }}
										transition={{ delay: 1, duration: 1.5, ease: 'easeOut' }}
										className="h-full rounded-full shadow-lg relative overflow-hidden"
										style={{ background: colorState.bar }}>
										<motion.div
											animate={{
												x: ['-100%', '100%'],
											}}
											transition={{
												repeat: Infinity,
												duration: 2,
												ease: 'linear',
											}}
											className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent'
										/>
									</motion.div>
								</div>
							</motion.div>
						</div>
					</div>

					{/* Content Section */}
					<div className='p-8 md:p-12'>
						{/* Description */}
						<motion.p
							variants={itemVariants}
							className='text-xl text-gray-700 text-center mb-10 max-w-2xl mx-auto leading-relaxed'>
							{colorState.description}
						</motion.p>

						{/* Stats Grid */}
						<motion.div
							variants={containerVariants}
							className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8'>
							{/* Analysis Time */}
							<motion.div
								variants={itemVariants}
								whileHover={{ scale: 1.05, y: -5 }}
								className='group relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 hover:shadow-xl transition-all duration-300'>
								<div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl'></div>
								<div className='relative z-10'>
									<div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform'>
										<Clock className='w-8 h-8 text-white' />
									</div>
									<div className='text-3xl font-bold text-gray-900 mb-2'>
										{result.analysis_time
											? new Date(result.analysis_time).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
											  })
											: 'N/A'}
									</div>
									<div className='text-sm text-gray-600 font-semibold'>
										Analysis Time
									</div>
								</div>
							</motion.div>

							{/* Models Used */}
							<motion.div
								variants={itemVariants}
								whileHover={{ scale: 1.05, y: -5 }}
								className='group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 hover:shadow-xl transition-all duration-300'>
								<div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl'></div>
								<div className='relative z-10'>
									<div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform'>
										<Zap className='w-8 h-8 text-white' />
									</div>
									<div className='text-3xl font-bold text-gray-900 mb-2'>
										{result.model_info?.models_used?.length || 3}
									</div>
									<div className='text-sm text-gray-600 font-semibold'>
										Models Used
									</div>
								</div>
							</motion.div>

							{/* Confidence */}
							<motion.div
								variants={itemVariants}
								whileHover={{ scale: 1.05, y: -5 }}
								className='group relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 hover:shadow-xl transition-all duration-300'>
								<div className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl'></div>
								<div className='relative z-10'>
									<div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform'>
										<TrendingUp className='w-8 h-8 text-white' />
									</div>
									<div className='text-3xl font-bold text-gray-900 mb-2'>
										{confidencePercent}%
									</div>
									<div className='text-sm text-gray-600 font-semibold'>
										Confidence
									</div>
								</div>
							</motion.div>
						</motion.div>
					</div>
				</motion.div>
			</motion.div>
		</div>
	);
}

export default RenderSummary;
