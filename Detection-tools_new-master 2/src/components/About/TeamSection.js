import React from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

const TeamSection = () => {
  const team = [
    {
      name: "AI Research Team",
      role: "Machine Learning Engineers",
      description:
        "Experts in computer vision, deep learning, and forensic analysis techniques.",
    },
    {
      name: "Security Team",
      role: "Cybersecurity Specialists",
      description:
        "Focused on privacy, data protection, and secure processing of user content.",
    },
    {
      name: "Product Team",
      role: "User Experience Designers",
      description:
        "Creating intuitive interfaces and educational content for deepfake awareness.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Our Team
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A dedicated team of experts working together to advance deepfake
            detection technology.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
              }}
              className="card text-center"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {member.name}
              </h3>
              <p className="text-primary-600 font-medium mb-3">{member.role}</p>
              <p className="text-gray-600">{member.description}</p>
            </motion.div>
          ))}{" "}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
