/** @format */

import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  CheckCircle,
  XCircle,
  Sun,
  Smile,
  Volume2,
  Image,
  Eye,
} from "lucide-react";

const HowToSpot = () => {
  const greenFlags = [
    {
      icon: Sun,
      text: "Consistent lighting throughout",
      tip: "No unnatural shadows or highlights",
    },
    {
      icon: Smile,
      text: "Natural facial expressions",
      tip: "Smooth and realistic muscle movements",
    },
    {
      icon: Volume2,
      text: "Proper audio synchronization",
      tip: "Mouth movements match spoken words",
    },
    {
      icon: Image,
      text: "Clear, sharp image quality",
      tip: "No blurring around face or edges",
    },
    {
      icon: Eye,
      text: "Realistic eye contact and movement",
      tip: "Natural blinking and gaze direction",
    },
  ];

  const redFlags = [
    {
      icon: Sun,
      text: "Inconsistent lighting or shadows",
      tip: "Face lit differently from background",
    },
    {
      icon: Smile,
      text: "Unnatural facial movements",
      tip: "Stiff, jerky, or asymmetric expressions",
    },
    {
      icon: Volume2,
      text: "Audio-video synchronization issues",
      tip: "Lip movements don’t match sound",
    },
    {
      icon: Image,
      text: "Blurred or pixelated areas around faces",
      tip: "Especially around mouth, eyes, or hairline",
    },
    {
      icon: Eye,
      text: "Unusual eye movements or blinking",
      tip: "Too fast, too slow, or absent blinking",
    },
  ];

  return (
    <div className="w-full h-auto px-4 lg:px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold text-center text-gray-900 mt-8"
        >
          How to Spot Deepfakes
        </motion.h2>

        {/* Visual Examples Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <grok-card
            data-id="5b2f97"
            data-type="image_card"
            data-arg-size="LARGE"
          ></grok-card>

          <grok-card
            data-id="520dad"
            data-type="image_card"
            data-arg-size="LARGE"
          ></grok-card>

          <grok-card
            data-id="bf64d5"
            data-type="image_card"
            data-arg-size="LARGE"
          ></grok-card>

          <grok-card
            data-id="779d65"
            data-type="image_card"
            data-arg-size="LARGE"
          ></grok-card>
        </motion.div>

        {/* Green vs Red Flags */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Green Flags */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-green-50/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-2xl font-bold flex items-center gap-3 mb-6 text-green-800">
              <CheckCircle className="w-8 h-8 text-green-600" />
              Signs of Authenticity
            </h3>
            <div className="space-y-4">
              {greenFlags.map((flag, i) => {
                const Icon = flag.icon;
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {flag.text}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{flag.tip}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Red Flags */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-red-50/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
          >
            <h3 className="text-2xl font-bold flex items-center gap-3 mb-6 text-red-800">
              <XCircle className="w-8 h-8 text-red-600" />
              Warning Signs of Deepfakes
            </h3>
            <div className="space-y-4">
              {redFlags.map((flag, i) => {
                const Icon = flag.icon;
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {flag.text}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{flag.tip}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Pro Tip */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl p-6 shadow-lg"
        >
          <p className="text-base font-bold text-orange-900">
            Pro Tip: Look for multiple inconsistencies together. When in doubt,
            use a professional detection tool!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default HowToSpot;
