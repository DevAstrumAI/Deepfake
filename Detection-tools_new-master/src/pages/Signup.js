/** @format */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, UserPlus, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
	const navigate = useNavigate();
	const { signup, isAuthenticated } = useAuth();
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [loading, setLoading] = useState(false);

	// Redirect if already authenticated
	React.useEffect(() => {
		if (isAuthenticated) {
			navigate('/upload');
		}
	}, [isAuthenticated, navigate]);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validation
		if (formData.password !== formData.confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}

		if (formData.password.length < 6) {
			toast.error('Password must be at least 6 characters');
			return;
		}

		setLoading(true);

		const result = await signup(
			formData.username,
			formData.email,
			formData.password
		);

		setLoading(false);

		if (result.success) {
			navigate('/upload');
		}
	};

	return (
		<div className='min-h-screen lg:h-screen flex flex-col lg:flex-row bg-white lg:overflow-hidden'>
			{/* Left Section - Info & Features */}
			<div className='lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative lg:overflow-y-auto'>
				<div className='max-w-xl mx-auto lg:mx-0'>
					<Link to='/' className='inline-flex items-center space-x-2 mb-12'>
						<div className='w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center'>
							<Shield className='w-6 h-6 text-white' />
						</div>
						<span className='text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-900'>
							DeepfakeDetector
						</span>
					</Link>

					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}>
						<h1 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight'>
							AI Deepfake Detector
						</h1>
						<p className='text-lg text-gray-600 mb-10 leading-relaxed'>
							Protect yourself from manipulated media with our advanced
							AI-powered deepfake detection technology. Upload videos or images
							and get instant, accurate analysis.
						</p>

						<div className='space-y-6 mb-12'>
							<div className='flex items-start'>
								<div className='flex-shrink-0'>
									<CheckCircle className='h-6 w-6 text-primary-600' />
								</div>
								<div className='ml-4'>
									<h3 className='text-lg font-medium text-gray-900'>
										Advanced Detection Technology
									</h3>
									<p className='mt-1 text-gray-500'>
										State-of-the-art algorithms analyze facial features and
										inconsistencies with high accuracy.
									</p>
								</div>
							</div>
							<div className='flex items-start'>
								<div className='flex-shrink-0'>
									<CheckCircle className='h-6 w-6 text-primary-600' />
								</div>
								<div className='ml-4'>
									<h3 className='text-lg font-medium text-gray-900'>
										Instant Results
									</h3>
									<p className='mt-1 text-gray-500'>
										Get detailed reports in seconds with confidence scores and
										visual evidence.
									</p>
								</div>
							</div>
							<div className='flex items-start'>
								<div className='flex-shrink-0'>
									<CheckCircle className='h-6 w-6 text-primary-600' />
								</div>
								<div className='ml-4'>
									<h3 className='text-lg font-medium text-gray-900'>
										Secure & Private
									</h3>
									<p className='mt-1 text-gray-500'>
										Your files are processed securely and automatically deleted
										after analysis.
									</p>
								</div>
							</div>
						</div>

						<div className='grid grid-cols-3 gap-8 border-t border-gray-100 pt-8 text-center lg:text-left'>
							<div>
								<div className='text-3xl font-bold text-primary-600'>99%</div>
								<div className='text-sm text-gray-500 mt-1'>Accuracy</div>
							</div>
							<div>
								<div className='text-3xl font-bold text-primary-600'>
									&lt;5s
								</div>
								<div className='text-sm text-gray-500 mt-1'>Analysis Time</div>
							</div>
							<div>
								<div className='text-3xl font-bold text-primary-600'>100%</div>
								<div className='text-sm text-gray-500 mt-1'>Secure</div>
							</div>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Right Section - Signup Form */}
			<div className='lg:w-1/2 bg-gray-50 flex items-center justify-center p-4 lg:p-8 lg:h-full lg:overflow-y-auto'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className='bg-white rounded-2xl shadow-xl w-full max-w-md p-8 lg:p-10'>
					<div className='text-center mb-8'>
						<h2 className='text-3xl font-bold text-gray-900'>
							Create your account
						</h2>
						<p className='mt-2 text-sm text-gray-600'>
							Or{' '}
							<Link
								to='/login'
								className='font-medium text-primary-600 hover:text-primary-500'>
								sign in
							</Link>{' '}
							to existing account
						</p>
					</div>

					<form className='space-y-5' onSubmit={handleSubmit}>
						<div>
							<label
								htmlFor='username'
								className='block text-xs font-semibold text-primary-700 uppercase tracking-wider mb-1'>
								Username
							</label>
							<input
								id='username'
								name='username'
								type='text'
								required
								value={formData.username}
								onChange={handleChange}
								className='block w-full px-4 py-3 bg-primary-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors sm:text-sm'
								placeholder='testing123'
							/>
						</div>

						<div>
							<label
								htmlFor='email'
								className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>
								Email Address
							</label>
							<input
								id='email'
								name='email'
								type='email'
								required
								value={formData.email}
								onChange={handleChange}
								className='block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors sm:text-sm'
								placeholder='Email address'
							/>
						</div>

						<div>
							<label
								htmlFor='password'
								className='block text-xs font-semibold text-primary-700 uppercase tracking-wider mb-1'>
								Password
							</label>
							<input
								id='password'
								name='password'
								type='password'
								required
								value={formData.password}
								onChange={handleChange}
								className='block w-full px-4 py-3 bg-primary-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors sm:text-sm'
								placeholder='••••••'
							/>
						</div>

						<div>
							<label
								htmlFor='confirmPassword'
								className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>
								Confirm Password
							</label>
							<input
								id='confirmPassword'
								name='confirmPassword'
								type='password'
								required
								value={formData.confirmPassword}
								onChange={handleChange}
								className='block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors sm:text-sm'
								placeholder='Confirm Password'
							/>
						</div>

						<div className='pt-2'>
							<button
								type='submit'
								disabled={loading}
								className='w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors duration-200'>
								{loading ? 'Creating account...' : 'Start for free'}
							</button>
						</div>

						<p className='text-center text-xs text-gray-500 mt-4'>
							By signing up, you agree to our Terms and Privacy Policy
						</p>
					</form>
				</motion.div>
			</div>
		</div>
	);
};

export default Signup;
