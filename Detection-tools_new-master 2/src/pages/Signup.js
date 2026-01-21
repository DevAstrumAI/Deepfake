/** @format */

import React, { useState } from 'react';
import { Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
	const { signup } = useAuth();
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
	}); 
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (formData.password !== formData.confirmPassword) {
			alert('Passwords do not match');
			return;
		}
		if (formData.password.length < 6) {
			alert('Password must be at least 6 characters');
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
			// Success is handled by AuthContext toast
		}
	};

	return (
		<div className='min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] lg:overflow-hidden bg-white flex flex-col lg:flex-row'>
			{/* Left Side - Product Information (Reduced width & gaps) */}
			<div className='lg:w-3/5 p-8 lg:p-10 xl:p-12 flex flex-col justify-center bg-gradient-to-br from-purple-50 to-white'>
				<div className='max-w-xl mx-auto w-full'>
					{/* Reduced from max-w-2xl */}
					{/* Main Heading */}
					<h1 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-5'>
						AI Deepfake Detector
					</h1>
					<p className='text-lg lg:text-xl text-gray-600 mb-10 leading-relaxed'>
						Protect yourself from manipulated media with our advanced AI-powered
						deepfake detection technology. Upload videos or images and get
						instant, accurate analysis.
					</p>
					{/* Features - Tighter spacing */}
					<div className='space-y-6'>
						<div>
							<h3 className='text-lg lg:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2'>
								<CheckCircle className='w-5 h-5 text-purple-600 flex-shrink-0' />
								Advanced Detection Technology
							</h3>
							<p className='text-gray-600 text-base ml-7'>
								State-of-the-art algorithms analyze facial features and
								inconsistencies with high accuracy.
							</p>
						</div>

						<div>
							<h3 className='text-lg lg:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2'>
								<CheckCircle className='w-5 h-5 text-purple-600 flex-shrink-0' />
								Instant Results
							</h3>
							<p className='text-gray-600 text-base ml-7'>
								Get detailed reports in seconds with confidence scores and
								visual evidence.
							</p>
						</div>

						<div>
							<h3 className='text-lg lg:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2'>
								<CheckCircle className='w-5 h-5 text-purple-600 flex-shrink-0' />
								Secure & Private
							</h3>
							<p className='text-gray-600 text-base ml-7'>
								Your files are processed securely and automatically deleted
								after analysis.
							</p>
						</div>
					</div>
					{/* Stats - Compact */}
					<div className='grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-gray-200'>
						<div className='text-center'>
							<div className='text-3xl font-bold text-purple-600 mb-1'>99%</div>
							<div className='text-sm text-gray-600'>Accuracy</div>
						</div>
						<div className='text-center'>
							<div className='text-3xl font-bold text-purple-600 mb-1'>
								&lt;5s
							</div>
							<div className='text-sm text-gray-600'>Analysis Time</div>
						</div>
						<div className='text-center'>
							<div className='text-3xl font-bold text-purple-600 mb-1'>
								100%
							</div>
							<div className='text-sm text-gray-600'>Secure</div>
						</div>
					</div>
				</div>
			</div>

			{/* Right Side - Signup Form (Tighter & centered) */}
			<div className='lg:w-2/5 bg-gray-50 p-8 lg:p-10 xl:p-12 flex items-center justify-center'>
				<div className='w-full max-w-sm'>
					{' '}
					{/* Reduced from max-w-md */}
					<div className='bg-white rounded-3xl shadow-2xl p-8 border border-gray-100'>
						{/* Header */}
						<div className='text-center mb-7'>
							<h2 className='text-3xl font-bold text-gray-900 mb-2'>
								Create your account
							</h2>
							<p className='text-gray-600 text-base'>
								Or{' '}
								<a
									href='#'
									className='font-medium text-purple-600 hover:text-purple-500'>
									sign in
								</a>{' '}
								to existing account
							</p>
						</div>

						{/* Form - Reduced spacing */}
						<form onSubmit={handleSubmit} className='space-y-5'>
							<div className='relative'>
								<input
									id='username'
									name='username'
									type='text'
									required
									value={formData.username}
									onChange={handleChange}
									className='peer w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors bg-white text-gray-900'
									placeholder=' '
								/>
								<label
									htmlFor='username'
									className='absolute left-5 -top-2.5 bg-white px-2 text-xs font-medium text-purple-600 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-600'>
									Username
								</label>
							</div>

							<div className='relative'>
								<input
									id='email'
									name='email'
									type='email'
									required
									value={formData.email}
									onChange={handleChange}
									className='peer w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors bg-white text-gray-900'
									placeholder=' '
								/>
								<label
									htmlFor='email'
									className='absolute left-5 -top-2.5 bg-white px-2 text-xs font-medium text-purple-600 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-600'>
									Email address
								</label>
							</div>

							<div className='relative'>
								<input
									id='password'
									name='password'
									type='password'
									required
									value={formData.password}
									onChange={handleChange}
									className='peer w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors bg-white text-gray-900'
									placeholder=' '
								/>
								<label
									htmlFor='password'
									className='absolute left-5 -top-2.5 bg-white px-2 text-xs font-medium text-purple-600 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-600'>
									Password
								</label>
							</div>

							<div className='relative'>
								<input
									id='confirmPassword'
									name='confirmPassword'
									type='password'
									required
									value={formData.confirmPassword}
									onChange={handleChange}
									className='peer w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors bg-white text-gray-900'
									placeholder=' '
								/>
								<label
									htmlFor='confirmPassword'
									className='absolute left-5 -top-2.5 bg-white px-2 text-xs font-medium text-purple-600 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-600'>
									Confirm Password
								</label>
							</div>

							<button
								type='submit'
								disabled={loading}
								className='w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 text-base disabled:opacity-50'>
								{loading ? 'Creating Account...' : 'Start for free'}
							</button>

							<p className='text-xs text-gray-500 text-center mt-3'>
								By signing up, you agree to our Terms and Privacy Policy
							</p>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Signup;
