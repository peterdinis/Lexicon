"use client"

import { motion } from "framer-motion";
import Link from "next/link";
import { FC } from "react";
import { Button } from "../ui/button";

const HeroWrapper: FC = () => {
    return (
       <section className="relative overflow-hidden pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary"
            >
              New: Infinite Canvas
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl text-balance"
            >
              Your Workspace for <span className="text-primary">everything</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-8 text-lg text-muted-foreground md:text-xl text-balance"
            >
              Write, plan, collaborate, and organize. All in one place. The connected Lexicon where better, faster
              work happens.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link href="/auth/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground">
                    Get started free
                  </Button>
                </motion.div>
              </Link>
              <Link href="#features">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent">
                    Learn more
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-6 text-sm text-muted-foreground"
            >
              Over 20,000 teams use Lexicon to stay organized
            </motion.p>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute -top-1/2 -right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute -bottom-1/2 -left-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl"
          />
        </div>
      </section>
    )
}

export default HeroWrapper