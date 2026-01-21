/** @format */

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, BookOpen, Shield, Lightbulb } from "lucide-react";

import WhatAreDeepfakes from "../components/Education/WhatAreDeepfakes";
import HowToSpot from "../components/Education/HowToSpot";
import DetectionMethods from "../components/Education/DetectionMethods";
import DeepfakeTechnology from "../components/Education/DeepfakeTechnology";
import ProtectYourself from "../components/Education/ProtectYourself";
import FutureOfDeepfakes from "../components/Education/FutureOfDeepfakes";

const Educational = () => {
  const scrollRef = useRef(null);

  const sections = [
    {
      component: (
        <div className="w-full h-full flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-purple-200/70 rounded-full flex items-center justify-center shadow-inner">
                <BookOpen className="w-12 h-12 text-purple-700" />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8">
              Deepfake Education Center
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Learn about deepfakes, understand how they work, master detection
              techniques, and discover how to protect yourself in an AI-powered
              world.
            </p>
          </motion.div>
        </div>
      ),
      bg: "bg-gradient-to-br from-purple-50 to-purple-100",
    },
    { component: <WhatAreDeepfakes />, bg: "bg-white" },
    { component: <HowToSpot />, bg: "bg-gray-50" },
    { component: <DetectionMethods />, bg: "bg-white" },
    { component: <DeepfakeTechnology />, bg: "bg-gray-50" },
    { component: <ProtectYourself />, bg: "bg-white" },
    { component: <FutureOfDeepfakes />, bg: "bg-gray-50" },
    {
      component: (
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Ready to Test Your Skills?
            </h2>
            <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-4xl mx-auto">
              Put your knowledge into practice with our advanced deepfake
              detection tool.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="/upload"
                className="inline-flex items-center justify-center gap-3 bg-white text-purple-600 font-bold text-lg px-10 py-5 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-purple-400/50 hover:scale-105"
              >
                <Shield className="w-6 h-6" />
                Start Detecting Now
              </a>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-3 bg-transparent border-4 border-white text-white font-bold text-lg px-10 py-5 rounded-xl hover:bg-white hover:text-purple-600 transition-all duration-300 hover:scale-105"
              >
                <Lightbulb className="w-6 h-6" />
                Back to Home
              </a>
            </div>
          </motion.div>
        </div>
      ),
      bg: "bg-gradient-to-r from-purple-600 to-purple-800",
    },
  ];

  return (
    <div ref={scrollRef} className="scroll-smooth snap-y snap-mandatory">
      {sections.map((section, index) => (
        <section
          key={index}
          className={`min-h-[calc(100vh-4rem)] snap-start flex items-center justify-center relative ${section.bg}`}
        >
          <div className="w-full h-full flex items-center justify-center px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-150px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="w-full max-w-7xl mx-auto"
            >
              {section.component}
            </motion.div>
          </div>

          {index === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronDown className="w-10 h-10 text-purple-600 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg" />
              </motion.div>
              <p className="text-sm text-purple-600 mt-2 font-medium">
                Scroll down
              </p>
            </motion.div>
          )}
        </section>
      ))}
    </div>
  );
};

export default Educational;
