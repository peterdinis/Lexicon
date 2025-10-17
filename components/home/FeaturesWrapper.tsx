"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  CheckSquare,
  FileText,
  Folder,
  Share2,
  Zap,
} from "lucide-react";
import { FC } from "react";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 },
};

const FeaturesWrapper: FC = () => {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto max-w-6xl"
        >
          <motion.div variants={fadeInUp} className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Everything you need
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features to help you work smarter, not harder
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "Rich Text Editor",
                description:
                  "Beautiful editor with tables, images, code blocks, and more",
              },
              {
                icon: CheckSquare,
                title: "Task Management",
                description:
                  "Organize todos with priorities, tags, and multiple views",
              },
              {
                icon: Calendar,
                title: "Calendar Planning",
                description: "Schedule events and manage your time effectively",
              },
              {
                icon: Folder,
                title: "Folders & Organization",
                description: "Keep everything organized with nested folders",
              },
              {
                icon: Share2,
                title: "Collaboration",
                description:
                  "Share pages with team members and control permissions",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description:
                  "Instant sync and real-time updates across devices",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
                >
                  <feature.icon className="h-6 w-6" />
                </motion.div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesWrapper;
