import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Lock, Target } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Advanced AI Detection",
      description:
        "State-of-the-art machine learning models with 90%+ accuracy for detecting deepfakes in various media formats.",
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description:
        "Fast analysis with optimized algorithms that provide results in under 30 seconds for most files.",
    },
    {
      icon: Lock,
      title: "Privacy First",
      description:
        "Your files are processed securely and automatically deleted after analysis. No data is stored permanently.",
    },
    {
      icon: Target,
      title: "Multiple Detection Methods",
      description:
        "Combines face analysis, forensic techniques, and ensemble AI models for comprehensive detection.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Key Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform combines advanced AI technology with user-friendly
            design to provide comprehensive deepfake detection capabilities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                className="card"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}{" "}
                    </h3>
                    <p className="text-gray-600">{feature.description} </p>
                  </div>
                </div>
              </motion.div>
            );
          })}{" "}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
