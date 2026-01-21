/** @format */

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, Eye, Zap } from "lucide-react";

const WhatAreDeepfakes = () => {
  return (
    <div className="w-full h-full flex items-center justify-center px-4 lg:px-8 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
            What Are Deepfakes?
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Deepfakes are synthetic media created using artificial intelligence
            to replace a person's likeness with someone else's — making fake
            content appear incredibly realistic.
          </p>
        </motion.div>

        {/* Visual Examples */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            src="https://i.ytimg.com/vi/x7G8ECJ_0l4/maxresdefault.jpg"
            alt="Deepfake face swap example"
            className="rounded-xl shadow-xl w-full h-56 md:h-60 object-cover"
          />
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            delay={0.2}
            src="https://d2q9lphzn5ioni.cloudfront.net/uploads/uploads_img/face-swap-evolution-split-screen-comparison-1024x683.webp"
            alt="Famous deepfake example"
            className="rounded-xl shadow-xl w-full h-56 md:h-60 object-cover"
          />
        </div>

        {/* Characteristics */}
        <div className="grid md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0 }}
            className="text-center"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              Highly realistic appearance
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              AI-powered creation
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              Can be malicious or entertaining
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              Increasingly hard to detect
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WhatAreDeepfakes;
