/** @format */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
	Shield,
	Mail,
	Lock,
	User,
	AlertCircle,
	Loader2,
	CheckCircle,
	Sparkles,
	Zap,
	Clock,
	ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const { signup } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
		setError('');
	};

	const validateForm = () => {
		if (formData.password.length < 6) {
			setError('Password must be at least 6 characters');
			return false;
		}
		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match');
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		if (!validateForm()) {
			return;
		}

		setLoading(true);

		try {
			const result = await signup(
				formData.email,
				formData.password,
				formData.name
			);
			if (result.success) {
				toast.success('Account created successfully!');
				navigate('/upload');
			} else {
				setError(result.error || 'Failed to create account');
				toast.error(result.error || 'Failed to create account');
			}
		} catch (err) {
			setError('An unexpected error occurred');
			toast.error('An unexpected error occurred');
		} finally {
			setLoading(false);
		}
	};

	const features = [
		{
			icon: Zap,
			title: 'Advanced Detection Technology',
			description:
				'State-of-the-art algorithms analyze facial features and inconsistencies with high accuracy.',
		},
		{
			icon: Clock,
			title: 'Instant Results',
			description:
				'Get detailed reports in seconds with confidence scores and visual evidence.',
		},
		{
			icon: ShieldCheck,
			title: 'Secure & Private',
			description:
				'Your files are processed securely and automatically deleted after analysis.',
		},
	];

	const stats = [
		{ value: '99%', label: 'Accuracy' },
		{ value: '<5s', label: 'Analysis Time' },
		{ value: '100%', label: 'Secure' },
	];

	return (
		<div className='h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex overflow-hidden'>
			{/* Left Panel - Features & Info */}
			<div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-purple-700 p-8 flex-col justify-center relative overflow-hidden'>
				{/* Background Pattern */}
				<div className='absolute inset-0 opacity-10'>
					<div className='absolute inset-0' style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					}}></div>
				</div>

				<motion.div
					initial={{ opacity: 0, x: -50 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
					className='relative z-10'>
					{/* Logo */}
					<div className='mb-6'>
						<div className='inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl mb-3'>
							<Shield className='w-7 h-7 text-white' />
						</div>
						<h1 className='text-4xl font-black text-white mb-3 tracking-tight'>
							AI Deepfake Detector
						</h1>
						<p className='text-lg text-purple-100 leading-relaxed'>
							Protect yourself from manipulated media with our advanced
							AI-powered deepfake detection technology. Upload videos or images
							and get instant, accurate analysis.
						</p>
					</div>

					{/* Features */}
					<div className='space-y-4 mb-8'>
						{features.map((feature, index) => {
							const Icon = feature.icon;
							return (
								<motion.div
									key={index}
									initial={{ opacity: 0, x: -30 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
									className='flex items-start gap-4 group'>
									<div className='flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all'>
										<Icon className='w-5 h-5 text-white' />
									</div>
									<div>
										<h3 className='text-base font-bold text-white mb-1'>
											{feature.title}
										</h3>
										<p className='text-sm text-purple-100 leading-relaxed'>
											{feature.description}
										</p>
									</div>
								</motion.div>
							);
						})}
					</div>

					{/* Stats */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.5 }}
						className='grid grid-cols-3 gap-4'>
						{stats.map((stat, index) => (
							<div
								key={index}
								className='text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20'>
								<div className='text-3xl font-black text-white mb-1'>
									{stat.value}
								</div>
								<div className='text-xs text-purple-100 font-semibold uppercase tracking-wide'>
									{stat.label}
								</div>
							</div>
						))}
					</motion.div>
				</motion.div>
			</div>

			{/* Right Panel - Signup Form */}
			<div className='w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto'>
				<motion.div
					initial={{ opacity: 0, x: 50 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.6 }}
					className='w-full max-w-md'>
					{/* Form Card */}
					<div className='bg-white rounded-3xl shadow-2xl p-8 border border-gray-200'>
						{/* Header */}
						<div className='mb-6'>
							<h2 className='text-3xl font-black text-gray-900 mb-2'>
								Create your account
							</h2>
							<p className='text-gray-600'>
								Or{' '}
								<Link
									to='/login'
									className='text-purple-600 font-bold hover:text-purple-700 transition-colors'>
									sign in to existing account
								</Link>
							</p>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className='space-y-4'>
							{error && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									className='bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-2'>
									<AlertCircle className='w-5 h-5 flex-shrink-0 mt-0.5' />
									<div className='flex-1'>
										<span className='text-sm font-semibold block'>{error}</span>
									</div>
								</motion.div>
							)}

							{/* Username Field */}
							<div>
								<label
									htmlFor='name'
									className='block text-sm font-bold text-gray-700 mb-1.5'>
									Username
								</label>
								<div className='relative'>
									<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
										<User className='w-5 h-5 text-gray-400' />
									</div>
									<input
										id='name'
										name='name'
										type='text'
										value={formData.name}
										onChange={handleChange}
										required
										className='w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 font-medium'
										placeholder='Enter your username'
									/>
								</div>
							</div>

							{/* Email Field */}
							<div>
								<label
									htmlFor='email'
									className='block text-sm font-bold text-gray-700 mb-1.5'>
									Email address
								</label>
								<div className='relative'>
									<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
										<Mail className='w-5 h-5 text-gray-400' />
									</div>
									<input
										id='email'
										name='email'
										type='email'
										value={formData.email}
										onChange={handleChange}
										required
										className='w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 font-medium'
										placeholder='you@example.com'
									/>
								</div>
							</div>

							{/* Password Field */}
							<div>
								<label
									htmlFor='password'
									className='block text-sm font-bold text-gray-700 mb-1.5'>
									Password
								</label>
								<div className='relative'>
									<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
										<Lock className='w-5 h-5 text-gray-400' />
									</div>
									<input
										id='password'
										name='password'
										type='password'
										value={formData.password}
										onChange={handleChange}
										required
										className='w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 font-medium'
										placeholder='Create a password'
									/>
								</div>
								{formData.password.length > 0 && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className='flex items-center gap-2 text-xs mt-2'>
										{formData.password.length >= 6 ? (
											<>
												<CheckCircle className='w-4 h-4 text-green-500' />
												<span className='text-green-600 font-medium'>
													Password is valid
												</span>
											</>
										) : (
											<>
												<AlertCircle className='w-4 h-4 text-yellow-500' />
												<span className='text-yellow-600 font-medium'>
													Password must be at least 6 characters
												</span>
											</>
										)}
									</motion.div>
								)}
							</div>

							{/* Confirm Password Field */}
							<div>
								<label
									htmlFor='confirmPassword'
									className='block text-sm font-bold text-gray-700 mb-1.5'>
									Confirm Password
								</label>
								<div className='relative'>
									<div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
										<Lock className='w-5 h-5 text-gray-400' />
									</div>
									<input
										id='confirmPassword'
										name='confirmPassword'
										type='password'
										value={formData.confirmPassword}
										onChange={handleChange}
										required
										className='w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 font-medium'
										placeholder='Confirm your password'
									/>
								</div>
								{formData.confirmPassword.length > 0 && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className='flex items-center gap-2 text-xs mt-2'>
										{formData.password === formData.confirmPassword ? (
											<>
												<CheckCircle className='w-4 h-4 text-green-500' />
												<span className='text-green-600 font-medium'>
													Passwords match
												</span>
											</>
										) : (
											<>
												<AlertCircle className='w-4 h-4 text-red-500' />
												<span className='text-red-600 font-medium'>
													Passwords do not match
												</span>
											</>
										)}
									</motion.div>
								)}
							</div>

							{/* Submit Button */}
							<motion.button
								type='submit'
								disabled={loading}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className='w-full bg-purple-600 text-white py-3.5 px-6 rounded-xl font-bold text-base shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-5'>
								{loading ? (
									<>
										<Loader2 className='w-5 h-5 animate-spin' />
										<span>Creating account...</span>
									</>
								) : (
									<span>Sign Up</span>
								)}
							</motion.button>
						</form>

						{/* Terms */}
						<div className='mt-6 text-center'>
							<p className='text-xs text-gray-500'>
								By signing up, you agree to our{' '}
								<Link
									to='/terms'
									className='text-purple-600 font-semibold hover:text-purple-700 transition-colors'>
									Terms
								</Link>{' '}
								and{' '}
								<Link
									to='/privacy'
									className='text-purple-600 font-semibold hover:text-purple-700 transition-colors'>
									Privacy Policy
								</Link>
							</p>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default Signup;
