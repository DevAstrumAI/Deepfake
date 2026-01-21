/** @format */

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  Shield,
  Upload,
  BarChart3,
  BookOpen,
  Zap,
  TrendingUp,
  Users,
  Clock,
  Award,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Play,
  Image as ImageIcon,
  Video,
  Music,
} from "lucide-react";

const Home = () => {
  const { currentUser } = useAuth();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  const features = [
    {
      icon: Shield,
      title: "AI-Powered Detection",
      description:
        "Hybrid approach combining AASIST, RawNet2, and comprehensive feature analysis for perfect accuracy in detecting deepfakes.",
      gradient: "linear-gradient(135deg, #914ffc 0%, #7d3ee0 100%)",
    },
    {
      icon: Zap,
      title: "Multi-Modal Analysis",
      description:
        "State-of-the-art ensemble models for superior image, video, and audio detection.",
      gradient: "linear-gradient(135deg, #d3c6e8 0%, #b8a5d9 100%)",
    },
    {
      icon: BarChart3,
      title: "Detailed Reports",
      description:
        "Confidence scores, visual explanations, and downloadable PDF reports.",
      gradient: "linear-gradient(135deg, #914ffc 0%, #d3c6e8 100%)",
    },
    {
      icon: BookOpen,
      title: "Educational Content",
      description:
        "Learn about deepfakes, detection techniques, and prevention strategies.",
      gradient: "linear-gradient(135deg, #7d3ee0 0%, #914ffc 100%)",
    },
  ];

  const stats = [
    { icon: TrendingUp, label: "Accuracy Rate", value: "95%", color: "#914ffc" },
    { icon: Users, label: "Files Analyzed", value: "50K+", color: "#d3c6e8" },
    { icon: Clock, label: "Avg. Processing", value: "< 30s", color: "#914ffc" },
    { icon: Award, label: "Detection Models", value: "6+", color: "#d3c6e8" },
  ];

  const supportedFormats = [
    { 
      type: "Images", 
      formats: ["JPG", "PNG", "BMP", "TIFF", "WebP"],
      icon: ImageIcon,
      color: "linear-gradient(135deg, #914ffc 0%, #d3c6e8 100%)"
    },
    { 
      type: "Videos", 
      formats: ["MP4", "AVI", "MOV", "MKV", "WebM"],
      icon: Video,
      color: "linear-gradient(135deg, #7d3ee0 0%, #914ffc 100%)"
    },
    { 
      type: "Audio", 
      formats: ["WAV", "MP3", "FLAC", "AAC"],
      icon: Music,
      color: "linear-gradient(135deg, #d3c6e8 0%, #914ffc 100%)"
    },
  ];

  const benefits = [
    "Real-time deepfake detection",
    "Multi-format support",
    "Enterprise-grade security",
    "API integration available",
    "Detailed analytics dashboard",
    "24/7 monitoring & alerts",
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden" style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
      }}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" style={{ backgroundColor: '#914ffc' }}></div>
          <div className="absolute top-40 right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob animation-delay-2000" style={{ backgroundColor: '#d3c6e8' }}></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" style={{ backgroundColor: '#914ffc' }}></div>
        </div>

        <div className="relative w-full px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              Powered by Advanced AI Technology
            </motion.span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-tight"
          >
            Detect Deepfakes with
            <br />
            <span className="bg-clip-text text-transparent animate-gradient" style={{
              backgroundImage: 'linear-gradient(90deg, #914ffc 0%, #d3c6e8 50%, #914ffc 100%)',
              backgroundSize: '200% 200%'
            }}>
              AI Precision
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl mb-12 w-full px-4 leading-relaxed"
            style={{ color: '#e0e0e0' }}
          >
            Advanced deepfake detection for images, videos, and audio using cutting-edge
            <span className="font-semibold" style={{ color: '#914ffc' }}> AASIST</span>, 
            <span className="font-semibold" style={{ color: '#d3c6e8' }}> RawNet2</span>, and 
            <span className="font-semibold" style={{ color: '#914ffc' }}> feature-based analysis</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {currentUser ? (
              <Link
                to="/upload"
                className="group relative px-8 py-4 text-white text-lg font-semibold rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #914ffc 0%, #7d3ee0 100%)',
                  boxShadow: '0 20px 40px rgba(145, 79, 252, 0.4)'
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Start Analysis
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                  background: 'linear-gradient(135deg, #7d3ee0 0%, #914ffc 100%)'
                }}></div>
              </Link>
            ) : (
              <Link
                to="/signup"
                className="group relative px-8 py-4 text-white text-lg font-semibold rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #914ffc 0%, #7d3ee0 100%)',
                  boxShadow: '0 20px 40px rgba(145, 79, 252, 0.4)'
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Get Started
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                  background: 'linear-gradient(135deg, #7d3ee0 0%, #914ffc 100%)'
                }}></div>
              </Link>
            )}

            <Link
              to="/educational"
              className="group px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-lg font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Watch Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Instant Results</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Enterprise Ready</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20" style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)'
      }}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 group-hover:scale-110 transition-transform" style={{
                    backgroundColor: `${stat.color}20`
                  }}>
                    <Icon className="w-7 h-7" style={{ color: stat.color }} />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium" style={{ color: '#b0b0b0' }}>{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24" style={{
        background: 'linear-gradient(180deg, #16213e 0%, #1a1a2e 50%, #16213e 100%)'
      }}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ color: '#ffffff' }}>
              Powerful Detection
              <span className="block bg-clip-text text-transparent" style={{
                backgroundImage: 'linear-gradient(90deg, #914ffc 0%, #d3c6e8 100%)'
              }}>
                Features
              </span>
            </h2>
            <p className="text-xl w-full px-4" style={{ color: '#b0b0b0' }}>
              Our advanced AI system combines multiple detection methods for comprehensive analysis
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" style={{
                    background: feature.gradient
                  }}></div>
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg" style={{
                    background: feature.gradient
                  }}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 transition-all" style={{ color: '#ffffff' }}>
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: '#b0b0b0' }}>{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Supported Formats Section */}
      <section className="py-24" style={{
        background: 'linear-gradient(180deg, #16213e 0%, #1a1a2e 100%)'
      }}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#ffffff' }}>
              Supported File Formats
            </h2>
            <p className="text-xl w-full px-4" style={{ color: '#b0b0b0' }}>
              Analyze various media types with our comprehensive format support
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {supportedFormats.map((format, index) => {
              const IconComponent = format.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative rounded-2xl p-8 text-center overflow-hidden group"
                  style={{
                    background: format.color
                  }}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="relative z-10">
                    {/* Professional Icon with Animation */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ 
                        delay: index * 0.2,
                        type: "spring",
                        stiffness: 200,
                        damping: 15
                      }}
                      whileHover={{ 
                        scale: 1.15,
                        rotate: [0, -10, 10, -10, 0],
                        transition: { duration: 0.5 }
                      }}
                      className="flex items-center justify-center mb-6"
                    >
                      <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 blur-xl opacity-50" style={{
                          background: format.color
                        }}></div>
                        {/* Icon container */}
                        <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl" style={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(10px)',
                          border: '2px solid rgba(255, 255, 255, 0.2)'
                        }}>
                          <IconComponent className="w-10 h-10 text-white" strokeWidth={2.5} />
                        </div>
                      </div>
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-white mb-6">{format.type}</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {format.formats.map((fmt, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 + index * 0.2 }}
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-lg text-sm font-semibold hover:bg-white/30 transition-all cursor-default"
                        >
                          {fmt}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #f8f9ff 0%, #ede7f8 50%, #f8f9ff 100%)'
      }}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20" style={{
            background: 'linear-gradient(135deg, #914ffc 0%, #d3c6e8 100%)'
          }}></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20" style={{
            background: 'linear-gradient(135deg, #d3c6e8 0%, #914ffc 100%)'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#1a1a2e' }}>
                Why Choose Our
                <span className="block" style={{
                  background: 'linear-gradient(90deg, #914ffc 0%, #d3c6e8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Deepfake Detection?
                </span>
              </h2>
              <p className="text-xl mb-8 leading-relaxed" style={{ color: '#4a4a5c' }}>
                Experience enterprise-grade deepfake detection with cutting-edge AI technology.
                Protect your content and verify authenticity with confidence.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                    style={{ color: '#2d2d3a' }}
                  >
                    <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center shadow-md" style={{
                      background: 'linear-gradient(135deg, #914ffc 0%, #d3c6e8 100%)'
                    }}>
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-base">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-3xl p-8 lg:p-12 shadow-2xl border" style={{
                background: 'linear-gradient(135deg, #914ffc 0%, #d3c6e8 100%)',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}>
                {/* Decorative glow */}
                <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30" style={{
                  background: 'linear-gradient(135deg, #914ffc 0%, #d3c6e8 100%)'
                }}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl mb-6 mx-auto shadow-lg" style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-center mb-4" style={{ color: '#ffffff' }}>
                    Enterprise Ready
                  </h3>
                  <p className="text-center mb-8 leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                    Trusted by leading organizations worldwide for secure and accurate deepfake detection.
                  </p>
                  <div className="flex justify-center gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-1" style={{ color: '#ffffff' }}>99.9%</div>
                      <div className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Uptime</div>
                    </div>
                    <div className="w-px" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}></div>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-1" style={{ color: '#ffffff' }}>24/7</div>
                      <div className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden" style={{
        background: 'linear-gradient(90deg, #914ffc 0%, #7d3ee0 50%, #914ffc 100%)'
      }}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative w-full px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Detect Deepfakes?
            </h2>
            <p className="text-xl text-purple-100 mb-10 w-full px-4">
              Upload your media and get instant AI-powered analysis. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? (
                <Link
                  to="/upload"
                  className="group px-10 py-5 bg-white text-purple-600 text-lg font-bold rounded-xl shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Upload className="w-6 h-6" />
                  Start Analysis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="group px-10 py-5 bg-white text-purple-600 text-lg font-bold rounded-xl shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-6 h-6" />
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <Link
                to="/educational"
                className="px-10 py-5 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white text-lg font-bold rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <BookOpen className="w-6 h-6" />
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
