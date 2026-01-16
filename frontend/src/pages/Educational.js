import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Shield, 
  AlertTriangle, 
  Eye, 
  Brain, 
  Zap,
  CheckCircle,
  XCircle,
  Lightbulb,
  Target,
  Users
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';

const Educational = () => {
  const { api } = useAnalysis();
  const [loading, setLoading] = useState(false);

  // Educational content is now hardcoded in sections below
  // Removed API call as it's not being used

  const sections = [
    {
      id: 'what-are-deepfakes',
      title: 'What are Deepfakes?',
      icon: Brain,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Deepfakes are AI-generated media that replace a person's likeness with someone else's. 
            They use deep learning techniques, particularly Generative Adversarial Networks (GANs), 
            to create realistic but fake images, videos, or audio.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Key Characteristics:</h4>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>Highly realistic appearance</li>
              <li>Created using artificial intelligence</li>
              <li>Can be used for entertainment or malicious purposes</li>
              <li>Becoming increasingly difficult to detect</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'how-to-spot',
      title: 'How to Spot Deepfakes',
      icon: Eye,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            While deepfakes are becoming more sophisticated, there are still telltale signs that can help you identify them.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                <XCircle className="w-4 h-4 mr-2" />
                Warning Signs
              </h4>
              <ul className="list-disc list-inside text-red-800 space-y-1 text-sm">
                <li>Inconsistent lighting or shadows</li>
                <li>Unnatural facial movements</li>
                <li>Audio-video synchronization issues</li>
                <li>Blurred or pixelated areas around faces</li>
                <li>Unusual eye movements or blinking</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Authentic Indicators
              </h4>
              <ul className="list-disc list-inside text-green-800 space-y-1 text-sm">
                <li>Consistent lighting throughout</li>
                <li>Natural facial expressions</li>
                <li>Proper audio synchronization</li>
                <li>Clear, sharp image quality</li>
                <li>Realistic eye contact and movement</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'detection-methods',
      title: 'Our Detection Methods',
      icon: Zap,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Our AI system uses multiple advanced techniques to detect deepfakes with high accuracy.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Multiple AI Models</h4>
                  <p className="text-gray-600 text-sm">
                    We use an ensemble of pre-trained models including EfficientNet, ResNet, and Vision Transformers.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Face Analysis</h4>
                  <p className="text-gray-600 text-sm">
                    Detailed analysis of facial features, symmetry, and natural movement patterns.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Forensic Analysis</h4>
                  <p className="text-gray-600 text-sm">
                    Frequency domain analysis, edge detection, and texture uniformity checks.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Ensemble Voting</h4>
                  <p className="text-gray-600 text-sm">
                    Combines predictions from multiple models for higher accuracy and reliability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'prevention',
      title: 'How to Protect Yourself',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Here are some practical steps you can take to protect yourself from deepfake content.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                Best Practices
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Verify information from multiple sources</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Be skeptical of sensational content</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Use our detection tool for verification</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Educate others about deepfakes</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Red Flags
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Content that seems too good to be true</span>
                </li>
                <li className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Unusual behavior from known people</span>
                </li>
                <li className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Requests for money or personal information</span>
                </li>
                <li className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Content from unverified sources</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'technology',
      title: 'The Technology Behind Deepfakes',
      icon: Brain,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Understanding the technology behind deepfakes can help you better identify and protect against them.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Key Technologies:</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Generative Adversarial Networks (GANs)</h5>
                <p className="text-gray-600 text-sm">
                  Two neural networks compete to create increasingly realistic fake content.
                </p>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Autoencoders</h5>
                <p className="text-gray-600 text-sm">
                  Neural networks that learn to compress and reconstruct images.
                </p>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Face Swapping</h5>
                <p className="text-gray-600 text-sm">
                  Techniques to replace faces in images and videos with other faces.
                </p>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Voice Cloning</h5>
                <p className="text-gray-600 text-sm">
                  AI systems that can mimic human voices with high accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'future',
      title: 'The Future of Deepfakes',
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            As AI technology continues to advance, deepfakes are becoming more sophisticated and harder to detect.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Positive Applications</h4>
              <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
                <li>Entertainment and film industry</li>
                <li>Educational content creation</li>
                <li>Historical recreations</li>
                <li>Accessibility improvements</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">Concerns</h4>
              <ul className="list-disc list-inside text-red-800 space-y-1 text-sm">
                <li>Misinformation and fake news</li>
                <li>Identity theft and fraud</li>
                <li>Privacy violations</li>
                <li>Political manipulation</li>
              </ul>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">The Importance of Detection</h4>
            <p className="text-yellow-800 text-sm">
              As deepfake technology evolves, so must our detection methods. Our AI system is continuously 
              updated to stay ahead of new deepfake techniques and maintain high accuracy in detection.
            </p>
          </div>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Educational Content</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Deepfake Education Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn about deepfakes, how to detect them, and how to protect yourself from AI-generated content
          </p>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 ml-4">
                    {section.title}
                  </h2>
                </div>
                {section.content}
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-center text-white"
        >
          <h2 className="text-2xl font-bold mb-4">
            Ready to Test Your Knowledge?
          </h2>
          <p className="text-primary-100 mb-6">
            Upload a file and see our AI detection system in action
          </p>
          <a
            href="/upload"
            className="inline-flex items-center space-x-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
          >
            <Zap className="w-5 h-5" />
            <span>Try Detection Tool</span>
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Educational;
