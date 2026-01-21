import React from "react";
import { motion } from "framer-motion";
import { Award, Heart, Lightbulb, Users } from "lucide-react";

const ValuesSection = () => {
  const values = [
    {
      icon: Award,
      title: "Excellence",
      description: "Striving for the highest quality in everything we do",
    },
    {
      icon: Heart,
      title: "Integrity",
      description: "Honest, transparent, and ethical in all our practices",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Continuously improving and advancing our technology",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "Supporting and educating our users and the broader community",
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
            Our Values
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The principles that guide our work and shape our commitment to
            users.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
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
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            );
          })}{" "}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
