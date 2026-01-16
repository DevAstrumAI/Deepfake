import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Upload, 
  BarChart3, 
  BookOpen, 
  Zap, 
  TrendingUp,
  Users,
  Clock,
  Award
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const handleStartAnalysis = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login');
    }
  };
  
  const features = [
    {
      icon: Shield,
      title: 'AI-Powered Detection',
      description: 'Hybrid approach combining AASIST, RawNet2, and comprehensive feature analysis for perfect accuracy in detecting deepfakes in images, videos, and audio.',
      color: 'text-primary-600'
    },
    {
      icon: Zap,
      title: 'Multi-Modal Analysis',
      description: 'Hybrid ensemble combining state-of-the-art AASIST and RawNet2 models with comprehensive feature analysis for superior audio deepfake detection.',
      color: 'text-yellow-600'
    },
    {
      icon: BarChart3,
      title: 'Detailed Reports',
      description: 'Comprehensive analysis reports with confidence scores, visual explanations, and downloadable PDFs.',
      color: 'text-green-600'
    },
    {
      icon: BookOpen,
      title: 'Educational Content',
      description: 'Learn about deepfakes, detection methods, and how to protect yourself from AI-generated content.',
      color: 'text-purple-600'
    }
  ];

  const stats = [
    { icon: TrendingUp, label: 'Accuracy Rate', value: '90%+' },
    { icon: Users, label: 'Files Analyzed', value: '10K+' },
    { icon: Clock, label: 'Avg. Processing', value: '< 30s' },
    { icon: Award, label: 'Detection Models', value: '6+' }
  ];

  const supportedFormats = [
    { type: 'Images', formats: ['JPG', 'PNG', 'BMP', 'TIFF', 'WebP'] },
    { type: 'Videos', formats: ['MP4', 'AVI', 'MOV', 'MKV', 'WebM'] },
    { type: 'Audio', formats: ['WAV', 'MP3', 'FLAC', 'AAC'] }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Detect Deepfakes with
                <span className="text-gradient block">AI Precision</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Professional deepfake detection system using advanced computer vision and machine learning. 
                Analyze images, videos, and audio with hybrid approach combining AASIST, RawNet2, and comprehensive feature analysis for perfect detection accuracy.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/upload"
                onClick={handleStartAnalysis}
                className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 shadow-glow"
              >
                <Upload className="w-5 h-5" />
                <span>Start Analysis</span>
              </Link>
              <Link
                to="/educational"
                className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>Learn More</span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Detection Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced AI system combines multiple detection methods for comprehensive analysis
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Supported Formats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Supported File Formats
            </h2>
            <p className="text-xl text-gray-600">
              Analyze various media types with our comprehensive format support
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {supportedFormats.map((format, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {format.type}
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {format.formats.map((fmt, fmtIndex) => (
                    <span
                      key={fmtIndex}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Detect Deepfakes?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Upload your media files and get instant AI-powered analysis with detailed reports and explanations.
            </p>
            <Link
              to="/upload"
              onClick={handleStartAnalysis}
              className="inline-flex items-center space-x-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              <Upload className="w-5 h-5" />
              <span>Start Free Analysis</span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
