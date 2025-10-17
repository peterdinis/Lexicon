"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FC } from "react";
import { Button } from "../ui/button";

const CTAWrapper: FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-3xl rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-12 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Ready to get started?
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of teams already using Lexicon
          </p>
          <Link href="/auth/signup">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-primary text-primary-foreground"
              >
                Start for free
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTAWrapper;
