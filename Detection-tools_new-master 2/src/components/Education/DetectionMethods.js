/** @format */

import React from "react";
import { motion } from "framer-motion";
import { Brain, Eye, Shield, Target } from "lucide-react";

const DetectionMethods = () => {
  const methods = [
    {
      icon: Brain,
      title: "Multiple AI Models",
      description:
        "Ensemble of EfficientNet, ResNet, and Vision Transformers for robust analysis.",
    },
    {
      icon: Eye,
      title: "Face Analysis",
      description:
        "Detailed examination of facial symmetry, landmarks, and natural movement patterns.",
    },
    {
      icon: Shield,
      title: "Forensic Analysis",
      description:
        "Frequency domain checks, edge detection, and texture consistency verification.",
    },
    {
      icon: Target,
      title: "Ensemble Voting",
      description:
        "Combines results from all models for maximum accuracy and reliability.",
    },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center px-4 lg:px-8 py-10 bg-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl lg:text-6xl font-bold text-center text-gray-900 mt-8"
        >
          Our Detection Methods
        </motion.h2>

        {/* Ensemble Diagrams */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <grok-card
            data-id="257f8f"
            data-type="image_card"
            data-arg-size="LARGE"
          ></grok-card>

          <grok-card
            data-id="76b420"
            data-type="image_card"
            data-arg-size="LARGE"
          ></grok-card>

          <grok-card
            data-id="c17faf"
            data-type="image_card"
            data-arg-size="LARGE"
          ></grok-card>
        </motion.div>

        {/* Method Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {methods.map((method, i) => {
            const Icon = method.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {method.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {method.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DetectionMethods;
