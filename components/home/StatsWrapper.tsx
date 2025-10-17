"use client";

import { motion } from "framer-motion";
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

const StatsWrapper: FC = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid gap-8 md:grid-cols-3"
        >
          {[
            { value: "20K+", label: "Active Users" },
            { value: "500K+", label: "Pages Created" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat, index) => (
            <motion.div key={index} variants={fadeInUp} className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="mb-2 text-5xl font-bold text-primary"
              >
                {stat.value}
              </motion.div>
              <div className="text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsWrapper;
