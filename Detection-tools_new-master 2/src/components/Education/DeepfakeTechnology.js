/** @format */

import React from "react";
import { motion } from "framer-motion";
import { Cpu, Network, Users, Mic } from "lucide-react";

const DeepfakeTechnology = () => {
  const technologies = [
    {
      icon: Network,
      title: "Generative Adversarial Networks (GANs)",
      description:
        "Two competing neural networks: one generates fakes, the other detects them — creating hyper-realistic results.",
    },
    {
      icon: Cpu,
      title: "Autoencoders",
      description:
        "Compress and reconstruct facial data for precise face swapping and manipulation.",
    },
    {
      icon: Users,
      title: "Face Swapping",
      description:
        "Advanced alignment and blending to seamlessly replace faces in videos and images.",
    },
    {
      icon: Mic,
      title: "Voice Cloning",
      description:
        "AI trained on speech samples to mimic tone, accent, emotion, and intonation.",
    },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center px-4 lg:px-8 py-10 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-center text-gray-900 mt-8"
        >
          The Technology Behind Deepfakes
        </motion.h2>

        {/* GAN Diagrams */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <grok-card
            data-id="5dbb7f"
            data-type="image_card"
            data-arg-size="LARGE"
          ></grok-card>

          <grok-card
            data-id="3b124c"
            data-type="image_card"
            data-arg-size="LARGE"
          ></grok-card>

          <grok-card
            data-id="c4ed13"
            data-type="image_card"
            data-arg-size="LARGE"
          ></grok-card>
        </motion.div>

        {/* Tech Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {technologies.map((tech, i) => {
            const Icon = tech.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-3xl p-7 shadow-xl hover:shadow-purple-300/50 transition-all"
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {tech.title}
                    </h3>
                    <p className="text-base text-gray-700 leading-relaxed">
                      {tech.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DeepfakeTechnology;
