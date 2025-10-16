"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, CheckSquare, Calendar, Folder, Share2, Zap, Sparkles } from "lucide-react"
import { FC } from "react"
import { ModeToggle } from "../shared/ModeToggle"
import Navigation from "../shared/Navigation"
import HeroWrapper from "./HeroWrapper"
import FeaturesWrapper from "./FeaturesWrapper"
import Footer from "../shared/Footer"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 },
}

const HomeWrapper: FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <HeroWrapper />

      {/* Features Section */}
      <FeaturesWrapper />

      {/* Stats Section */}
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-3xl rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-12 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">Ready to get started?</h2>
            <p className="mb-8 text-lg text-muted-foreground">Join thousands of teams already using Lexicon</p>
            <Link href="/auth/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="h-12 px-8 text-base bg-primary text-primary-foreground">
                  Start for free
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}


export default HomeWrapper