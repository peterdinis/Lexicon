"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";
import demoImage from "../../public/img/demo.png";

const Hero: FC = () => {
  return (
    <div className="min-h-screen flex flex-col dark:bg-[#1f1f1f] bg-blue-50">
      <div className="flex flex-col items-center justify-center md:justify-start text-center gap-y-8 flex-1 px-4 py-8">
        <div className="max-w-3xl space-y-4">
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

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl md:text-2xl font-medium dark:text-white text-gray-700"
          >
            The collaborative workspace where
            <br /> ideas flow, teams connect, and work gets done smarter.
          </motion.h3>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex space-x-4 text-sm text-gray-500 dark:text-sky-100 font-medium justify-center"
          >
            <span>📝 Organize</span>
            <span>🤝 Collaborate</span>
            <span>🚀 Innovate</span>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-center px-4"
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

      <motion.div
        className="mt-12 w-fullflex items-center justify-center py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <div className="w-full max-w-6xl mx-auto px-4">
          <Image
            src={demoImage}
            alt="Lexicon DEMO"
            priority
            className="w-full h-auto object-contain rounded-xl shadow-lg"
            width={1200}
            height={600}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
