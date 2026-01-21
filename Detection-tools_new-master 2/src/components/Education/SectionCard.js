import React from "react";
import { motion } from "framer-motion";

const SectionCard = ({ icon: Icon, title, children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="card"
    >
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 ml-4">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
};

export default SectionCard;
