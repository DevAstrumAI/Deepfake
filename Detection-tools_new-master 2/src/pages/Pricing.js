/** @format */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
	Check,
	Zap,
	Shield,
	Crown,
	Sparkles,
	ArrowRight,
	TrendingUp,
	Users,
	BarChart3,
	Clock,
	Infinity,
	FileImage,
	Video,
	Music,
} from 'lucide-react';

const Pricing = () => {
	const pricingPlans = [
		{
			name: 'Starter',
			price: '$29',
			period: '/month',
			description: 'Perfect for individuals and small projects',
			icon: Zap,
			gradient: 'from-blue-500 to-cyan-500',
			bgGradient: 'from-blue-50 to-cyan-50',
			borderColor: 'border-blue-200',
			features: [
				'50 analyses per month',
				'Image & Video detection',
				'Basic forensic analysis',
				'Standard processing speed',
				'Email support',
				'PDF reports included',
			],
			popular: false,
		},
		{
			name: 'Professional',
			price: '$99',
			period: '/month',
			description: 'Ideal for businesses and content creators',
			icon: Shield,
			gradient: 'from-purple-500 to-pink-500',
			bgGradient: 'from-purple-50 to-pink-50',
			borderColor: 'border-purple-300',
			features: [
				'500 analyses per month',
				'Image, Video & Audio detection',
				'Advanced forensic analysis',
				'Priority processing',
				'Priority email support',
				'Detailed PDF reports',
				'API access (coming soon)',
				'Heatmap visualization',
			],
			popular: true,
		},
		{
			name: 'Enterprise',
			price: 'Custom',
			period: '',
			description: 'For large organizations with custom needs',
			icon: Crown,
			gradient: 'from-amber-500 to-orange-500',
			bgGradient: 'from-amber-50 to-orange-50',
			borderColor: 'border-amber-200',
			features: [
				'Unlimited analyses',
				'All media types supported',
				'Complete forensic suite',
				'Dedicated processing',
				'24/7 priority support',
				'Custom report templates',
				'Full API access',
				'White-label options',
				'Custom integrations',
				'Dedicated account manager',
			],
			popular: false,
		},
	];

	const features = [
		{
			icon: FileImage,
			title: 'Image Detection',
			description: 'Advanced AI-powered image deepfake detection',
		},
		{
			icon: Video,
			title: 'Video Analysis',
			description: 'Frame-by-frame video deepfake analysis',
		},
		{
			icon: Music,
			title: 'Audio Detection',
			description: 'Comprehensive audio deepfake detection',
		},
		{
			icon: BarChart3,
			title: 'Detailed Reports',
			description: 'Comprehensive analysis reports with visualizations',
		},
		{
			icon: Clock,
			title: 'Fast Processing',
			description: 'Quick analysis with priority processing options',
		},
		{
			icon: Shield,
			title: 'Secure & Private',
			description: 'Your files are processed securely and privately',
		},
	];

	const faqs = [
		{
			question: 'Can I change plans later?',
			answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
		},
		{
			question: 'What happens if I exceed my monthly limit?',
			answer: 'You can purchase additional analyses or upgrade to a higher plan. We will notify you when you reach 80% of your limit.',
		},
		{
			question: 'Do you offer refunds?',
			answer: 'Yes, we offer a 30-day money-back guarantee. If you are not satisfied, contact us for a full refund.',
		},
		{
			question: 'Is my data secure?',
			answer: 'Absolutely. All files are processed securely and deleted after analysis. We never store your media files permanently.',
		},
		{
			question: 'Can I use this for commercial purposes?',
			answer: 'Yes, Professional and Enterprise plans include commercial usage rights. Starter plan is for personal use only.',
		},
		{
			question: 'What payment methods do you accept?',
			answer: 'We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.',
		},
	];

	return (
		<div className='w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50'>
			{/* Hero Section */}
			<div className='w-full px-4 sm:px-6 lg:px-8 pt-20 pb-16'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className='text-center max-w-4xl mx-auto'>
					<div className='inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6'>
						<Sparkles className='w-4 h-4' />
						Simple, Transparent Pricing
					</div>
					<h1 className='text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6'>
						Choose Your Plan
					</h1>
					<p className='text-xl text-gray-600 mb-12'>
						Select the perfect plan for your deepfake detection needs. All plans
						include our advanced AI-powered analysis.
					</p>
				</motion.div>

				{/* Pricing Cards */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20'>
					{pricingPlans.map((plan, index) => {
						const Icon = plan.icon;
						return (
							<motion.div
								key={plan.name}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								className={`relative bg-white rounded-2xl shadow-lg border-2 ${
									plan.popular
										? `${plan.borderColor} scale-105 z-10`
										: 'border-gray-200'
								} overflow-hidden hover:shadow-2xl transition-all duration-300`}>
								{plan.popular && (
									<div
										className={`absolute top-0 left-0 right-0 bg-gradient-to-r ${plan.gradient} text-white text-center py-2 text-sm font-bold`}>
										Most Popular
									</div>
								)}
								<div
									className={`p-8 ${plan.popular ? 'pt-12' : 'pt-8'} bg-gradient-to-br ${plan.bgGradient}`}>
									<div
										className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} text-white mb-6 shadow-lg`}>
										<Icon className='w-8 h-8' />
									</div>
									<h3 className='text-2xl font-bold text-gray-900 mb-2'>
										{plan.name}
									</h3>
									<p className='text-gray-600 mb-6'>{plan.description}</p>
									<div className='flex items-baseline mb-6'>
										<span className='text-5xl font-bold text-gray-900'>
											{plan.price}
										</span>
										{plan.period && (
											<span className='text-gray-600 ml-2'>
												{plan.period}
											</span>
										)}
									</div>
									<Link
										to='/upload'
										className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
											plan.popular
												? `bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg transform hover:scale-105`
												: 'bg-white text-gray-900 border-2 border-gray-200 hover:border-purple-300 hover:text-purple-600'
										}`}>
										Get Started
										<ArrowRight className='w-4 h-4 inline-block ml-2' />
									</Link>
								</div>
								<div className='p-8 pt-0'>
									<ul className='space-y-4'>
										{plan.features.map((feature, idx) => (
											<li key={idx} className='flex items-start gap-3'>
												<Check className='w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5' />
												<span className='text-gray-700'>{feature}</span>
											</li>
										))}
									</ul>
								</div>
							</motion.div>
						);
					})}
				</div>

				{/* Features Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					className='max-w-7xl mx-auto mb-20'>
					<div className='text-center mb-12'>
						<h2 className='text-4xl font-bold text-gray-900 mb-4'>
							Included in All Plans
						</h2>
						<p className='text-xl text-gray-600'>
							Every plan includes our core features and capabilities
						</p>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{features.map((feature, index) => {
							const Icon = feature.icon;
							return (
								<motion.div
									key={index}
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
									className='bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300'>
									<div className='bg-gradient-to-br from-purple-100 to-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4'>
										<Icon className='w-6 h-6 text-purple-600' />
									</div>
									<h3 className='text-lg font-bold text-gray-900 mb-2'>
										{feature.title}
									</h3>
									<p className='text-gray-600'>{feature.description}</p>
								</motion.div>
							);
						})}
					</div>
				</motion.div>

				{/* FAQ Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.6 }}
					className='max-w-4xl mx-auto mb-20'>
					<div className='text-center mb-12'>
						<h2 className='text-4xl font-bold text-gray-900 mb-4'>
							Frequently Asked Questions
						</h2>
						<p className='text-xl text-gray-600'>
							Everything you need to know about our pricing
						</p>
					</div>
					<div className='space-y-4'>
						{faqs.map((faq, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
								className='bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300'>
								<h3 className='text-lg font-bold text-gray-900 mb-2'>
									{faq.question}
								</h3>
								<p className='text-gray-600'>{faq.answer}</p>
							</motion.div>
						))}
					</div>
				</motion.div>

				{/* CTA Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 1 }}
					className='max-w-4xl mx-auto text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white'>
					<h2 className='text-4xl font-bold mb-4'>
						Ready to Get Started?
					</h2>
					<p className='text-xl text-purple-100 mb-8'>
						Start detecting deepfakes with our advanced AI technology today
					</p>
					<Link
						to='/upload'
						className='inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 shadow-lg'>
						Start Free Analysis
						<ArrowRight className='w-5 h-5' />
					</Link>
				</motion.div>
			</div>
		</div>
	);
};

export default Pricing;

