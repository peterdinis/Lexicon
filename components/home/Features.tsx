"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { Check, Users, Zap, FileText } from "lucide-react";

const featuresData = [
  {
    icon: <Check className="w-6 h-6 text-emerald-500" />,
    title: "Centralized Workspaces",
    description: "Keep all your projects, notes, and ideas organized in one place.",
  },
  {
    icon: <Users className="w-6 h-6 text-emerald-500" />,
    title: "Team Collaboration",
    description: "Collaborate in real-time with your team seamlessly.",
  },
  {
    icon: <Zap className="w-6 h-6 text-emerald-500" />,
    title: "Smart Automation",
    description: "Automate repetitive tasks and focus on what matters most.",
  },
  {
    icon: <FileText className="w-6 h-6 text-emerald-500" />,
    title: "Organized Notes",
    description: "Structure your notes and documents effortlessly.",
  },
];

const Features: FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {featuresData.map((feature, index) => (
        <motion.div
          key={index}
          className="flex flex-col items-start gap-3 p-6 rounded-xl bg-gray-50 dark:bg-[#2a2a2a] shadow-md hover:shadow-lg transition-shadow duration-300"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
        >
          <div>{feature.icon}</div>
          <h4 className="text-lg font-semibold">{feature.title}</h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default Features;
