/** @format */

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";

const FutureOfDeepfakes = () => {
  return (
    <div className="w-full h-full flex items-center justify-center px-4 lg:px-8 py-6 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-5">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-center text-gray-900 mt-2"
        >
          The Future of Deepfakes
        </motion.h2>

        {/* Spectrum Illustrations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <grok-card
            data-id="8f9293"
            data-type="image_card"
            data-arg-size="LARGE"
          ></grok-card>

          <grok-card
            data-id="02d82c"
            data-type="image_card"
            data-arg-size="LARGE"
          ></grok-card>

          <grok-card
            data-id="0af097"
            data-type="image_card"
            data-arg-size="LARGE"
          ></grok-card>
        </motion.div>

        {/* Positive vs Concerns */}
        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-7 shadow-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <Sparkles className="w-10 h-10 text-emerald-600" />
              <h3 className="text-2xl font-bold">Positive Applications</h3>
            </div>
            <ul className="space-y-3 text-base text-gray-800">
              <li>• Entertainment & film (de-aging actors, special effects)</li>
              <li>• Historical recreations and education</li>
              <li>• Virtual avatars and real-time translation</li>
              <li>• Accessibility tools (sign language, voice restoration)</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-7 shadow-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <AlertTriangle className="w-10 h-10 text-orange-600" />
              <h3 className="text-2xl font-bold">Major Risks</h3>
            </div>
            <ul className="space-y-3 text-base text-gray-800">
              <li>• Misinformation and fake news spread</li>
              <li>• Identity theft and financial fraud</li>
              <li>• Non-consensual content and revenge porn</li>
              <li>• Political manipulation and election interference</li>
            </ul>
          </motion.div>
        </div>

        {/* Final Message */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-7 shadow-xl"
        >
          <ShieldCheck className="w-14 h-14 text-purple-600 mx-auto mb-4" />
          <p className="text-lg md:text-xl font-bold text-gray-900 max-w-4xl mx-auto">
            As deepfakes evolve, so do detection tools. Stay informed, stay
            vigilant, and use reliable AI detection to protect truth in the
            digital age.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default FutureOfDeepfakes;
