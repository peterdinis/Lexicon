"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "../ui/button";

const Hero: FC = () => {
  return (
    <div className="min-h-full flex flex-col dark:bg-[#1f1f1f]">
      <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1">
        <div className="max-w-3xl space-y-4">
          {/* Hlavný nadpis */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold"
          >
            Bring Your Ideas, Projects & Knowledge Together in{" "}
            <span className="relative underline decoration-gradient-from-emerald-400 to-blue-500 underline-offset-4">
              Lexicon
            </span>
          </motion.h1>

          {/* Podnadpis */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl md:text-2xl font-medium dark:text-white text-gray-700"
          >
            The collaborative workspace where
            <br /> ideas flow, teams connect, and work gets done smarter.
          </motion.h3>

          {/* Micro tagline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex space-x-4 text-sm text-gray-500 font-medium justify-center"
          >
            <span>📝 Organize</span>
            <span>🤝 Collaborate</span>
            <span>🚀 Innovate</span>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              Try Lexicon Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Features / Benefits */}
      <motion.div
        className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <div className="flex flex-col items-center gap-2">
          <Check className="w-6 h-6 text-emerald-500" />
          <p className="font-medium">Centralized Workspaces</p>
          <p className="text-sm text-gray-500">
            Keep all your projects and notes in one place.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Check className="w-6 h-6 text-emerald-500" />
          <p className="font-medium">Real-time Collaboration</p>
          <p className="text-sm text-gray-500">
            Work together with your team seamlessly.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Check className="w-6 h-6 text-emerald-500" />
          <p className="font-medium">Smart Organization</p>
          <p className="text-sm text-gray-500">
            Organize ideas, tasks, and notes efficiently.
          </p>
        </div>
      </motion.div>

      {/* Placeholder for screenshot/demo */}
      <motion.div
        className="mt-12 w-full max-w-4xl mx-auto h-64 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        Screenshot / Demo Preview
      </motion.div>
    </div>
  );
};

export default Hero;
