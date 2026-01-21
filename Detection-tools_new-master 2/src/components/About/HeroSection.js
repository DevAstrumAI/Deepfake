import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

const HeroSection = ({ stats }) => {
  return (
    <section className="h-full w-full bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 flex items-center justify-center">
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
        className="text-center px-6 max-w-5xl"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-purple-200/70 rounded-full flex items-center justify-center shadow-inner">
            <Shield className="w-10 h-10 text-purple-700" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          About DeepfakeDetector
        </h1>

        <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-10">
          A professional deepfake detection system built with cutting-edge AI
          technology to help identify and combat AI-generated content in images,
          videos, and audio.
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-purple-100/70 backdrop-blur-md rounded-xl px-7 py-5
                                                         shadow-lg border border-purple-200/60
                                                         hover:shadow-purple-300/60 transition"
            >
              <div className="text-2xl font-bold text-purple-700">
                {stat.value}{" "}
              </div>
              <div className="text-gray-700 text-sm">{stat.label} </div>
            </div>
          ))}{" "}
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
