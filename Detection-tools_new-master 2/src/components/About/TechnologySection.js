import React from "react";
import { motion } from "framer-motion";
import { Code } from "lucide-react";

const TechnologySection = () => {
  const technologies = [
    {
      name: "PyTorch",
      description: "Deep Learning Framework",
    },
    {
      name: "FastAPI",
      description: "Backend API Framework",
    },
    {
      name: "React",
      description: "Frontend Framework",
    },
    {
      name: "OpenCV",
      description: "Computer Vision Library",
    },
    {
      name: "TensorFlow",
      description: "Machine Learning Platform",
    },
    {
      name: "PostgreSQL",
      description: "Database System",
    },
    {
      name: "Docker",
      description: "Containerization",
    },
    {
      name: "AWS",
      description: "Cloud Infrastructure",
    },
  ];

  return (
    <section className="py-20 bg-white">
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
            Technology Stack
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built with modern technologies and best practices for performance,
            security, and scalability.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {technologies.map((tech, index) => (
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
              className="text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tech.name}
              </h3>
              <p className="text-gray-600 text-sm">{tech.description}</p>
            </motion.div>
          ))}{" "}
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
