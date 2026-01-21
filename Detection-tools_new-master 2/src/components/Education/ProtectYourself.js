/** @format */

import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const ProtectYourself = () => {
  const bestPractices = [
    "Verify information from multiple trusted sources",
    "Be skeptical of sensational or emotionally charged content",
    "Use professional detection tools for suspicious media",
    "Educate friends and family about deepfake risks",
    "Enable two-factor authentication and strong privacy settings",
  ];

  const redFlags = [
    "Content that seems too good (or bad) to be true",
    "Unusual behavior from known people in videos",
    "Urgent requests for money or sensitive information",
    "Media from unknown or unverified accounts",
  ];

  return (
    <div className="w-full h-full flex items-center justify-center px-4 lg:px-8 py-2 bg-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-center text-gray-900"
        >
          How to Protect Yourself
        </motion.h2>

        {/* Infographics */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8"
        >
          <grok-card
            data-id="1763e2"
            data-type="image_card"
            data-arg-size="LARGE"
          ></grok-card>

          <grok-card
            data-id="caa3e7"
            data-type="image_card"
            data-arg-size="LARGE"
          ></grok-card>
        </motion.div>

        {/* Best Practices vs Red Flags */}
        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-7 shadow-xl"
          >
            <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
              <Lightbulb className="w-8 h-8 text-emerald-600" />
              Best Practices
            </h3>
            <ul className="space-y-4">
              {bestPractices.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-base">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-800">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-7 shadow-xl"
          >
            <h3 className="text-2xl font-bold flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              Red Flags to Watch For
            </h3>
            <ul className="space-y-4">
              {redFlags.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-base">
                  <XCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-800">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProtectYourself;
