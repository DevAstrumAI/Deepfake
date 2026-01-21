import React from "react";
import { motion } from "framer-motion";
import { Target, Lock, Globe, Zap } from "lucide-react";

const MissionSection = () => {
  const missions = [
    {
      icon: Target,
      title: "Accuracy",
      description:
        "We strive for the highest possible detection accuracy using multiple AI models and forensic techniques.",
    },
    {
      icon: Lock,
      title: "Privacy",
      description:
        "Your privacy is our priority. Files are processed securely and deleted immediately after analysis.",
    },
    {
      icon: Globe,
      title: "Accessibility",
      description:
        "Making advanced AI detection tools available to everyone, from individuals to organizations.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading + Mission Logo */}
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
            Our Mission
          </h2>

          {/* Mission Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center shadow-lg">
              <Zap className="w-12 h-12 text-purple-600" />
            </div>
          </div>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            To provide accessible, accurate, and reliable deepfake detection
            tools that help individuals and organizations identify AI-generated
            content and protect against misinformation.
          </p>
        </motion.div>

        {/* Mission Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {missions.map((mission, index) => {
            const Icon = mission.icon;

            return (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: 0.1 * (index + 1),
                }}
                className="group"
              >
                <div className="bg-white border border-purple-100 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                    <Icon className="w-8 h-8 text-purple-600" />
                  </div>

                  {/* Title - now directly under icon, centered */}
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {mission.title}{" "}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {mission.description}{" "}
                  </p>
                </div>
              </motion.div>
            );
          })}{" "}
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
