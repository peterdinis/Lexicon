"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

const Footer: FC = () => {
  return (
    <motion.footer
      className="bg-gray-100 dark:bg-[#1f1f1f] py-10 mt-16"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Logo / Name */}
        <div className="text-2xl font-bold text-gray-800 dark:text-white">
          Lexicon
        </div>

        {/* Social Icons */}
        <div className="flex gap-4 text-gray-600 dark:text-gray-300">
          <Link
            href="https://twitter.com"
            target="_blank"
            aria-label="Twitter"
            className="hover:text-emerald-500 transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </Link>
          <Link
            href="https://linkedin.com"
            target="_blank"
            aria-label="LinkedIn"
            className="hover:text-emerald-500 transition-colors"
          >
            <Linkedin className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Lexicon. All rights reserved.
      </div>
    </motion.footer>
  );
};

export default Footer;
