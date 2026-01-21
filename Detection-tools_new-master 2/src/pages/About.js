/** @format */

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import HeroSection from "../components/About/HeroSection";
import MissionSection from "../components/About/MissionSection";
import FeaturesSection from "../components/About/FeaturesSection";
import TechnologySection from "../components/About/TechnologySection";
import TeamSection from "../components/About/TeamSection";
import ValuesSection from "../components/About/ValuesSection";
import { Shield, Lightbulb } from "lucide-react";
// import ScrollDots from '../components/About/ScrollDots';

const About = () => {
  const scrollRef = useRef(null);
  const sectionRefs = useRef([]);

  const stats = [
    {
      label: "Detection Accuracy",
      value: "90%+",
    },
    {
      label: "Files Processed",
      value: "10K+",
    },
    {
      label: "AI Models Used",
      value: "4+",
    },
    {
      label: "Supported Formats",
      value: "15+",
    },
  ];

  const sections = [
    {
      component: <HeroSection stats={stats} />,
      bg: "bg-gradient-to-br from-purple-50 to-purple-100",
      dark: false,
    },
    {
      component: <MissionSection />,
      bg: "bg-white",
      dark: false,
    },
    {
      component: <FeaturesSection />,
      bg: "bg-gray-50",
      dark: false,
    },
    {
      component: <TechnologySection />,
      bg: "bg-white",
      dark: false,
    },
    {
      component: <TeamSection />,
      bg: "bg-gray-50",
      dark: false,
    },
    {
      component: <ValuesSection />,
      bg: "bg-white",
      dark: false,
    },
    {
      component: (
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              margin: "-100px",
            }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Join the Fight Against Deepfakes
            </h2>
            <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-4xl mx-auto">
              Help us build a safer digital world by using our detection tools
              and spreading awareness.
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
                href="/educational"
                className="inline-flex items-center justify-center gap-3 bg-transparent border-4 border-white text-white font-bold text-lg px-10 py-5 rounded-xl hover:bg-white hover:text-purple-600 transition-all duration-300 hover:scale-105"
              >
                <Lightbulb className="w-6 h-6" />
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      ),
      bg: "bg-gradient-to-r from-purple-600 to-purple-800",
      dark: true,
    },
  ];

  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, sections.length);
  }, [sections.length]);

  return (
    <div ref={scrollRef} className="scroll-smooth snap-y snap-mandatory">
      {/* Sections */}
      {sections.map((section, index) => (
        <section
          key={index}
          ref={(el) => (sectionRefs.current[index] = el)}
          // 👈 crucial!
          className={`min-h-[calc(100vh-4rem)] snap-start flex items-center justify-center relative ${section.bg}`}
        >
          <div className="w-full h-full flex items-center justify-center">
            <motion.div
              initial={{
                opacity: 0,
                y: 50,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                margin: "-150px",
              }}
              transition={{
                duration: 0.8,
                delay: 0.1,
              }}
              className="w-full"
            >
              {section.component}{" "}
            </motion.div>
          </div>
          {/* Scroll Down Indicator - Only on first section */}
          {index === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                }}
              >
                <ChevronDown className="w-10 h-10 text-purple-600 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg" />
              </motion.div>
              <p className="text-sm text-purple-600 mt-2 font-medium">
                Scroll down
              </p>
            </motion.div>
          )}{" "}
        </section>
      ))}
      {/* <ScrollDots containerRef={scrollRef}
                sections={sections}/> */}{" "}
    </div>
  );
};

export default About;
