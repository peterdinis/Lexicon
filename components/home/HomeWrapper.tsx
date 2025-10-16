"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, CheckSquare, Calendar, Folder, Share2, Zap, Sparkles } from "lucide-react"
import { FC } from "react"
import { ModeToggle } from "../shared/ModeToggle"

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
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Sparkles className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="text-xl font-bold">Lexicon</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <ModeToggle />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="sm" className="bg-primary text-primary-foreground">
                  Try for free
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
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

      {/* Features Section */}
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
              <h2 className="mb-4 text-4xl font-bold md:text-5xl">Everything you need</h2>
              <p className="text-lg text-muted-foreground">Powerful features to help you work smarter, not harder</p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: FileText,
                  title: "Rich Text Editor",
                  description: "Beautiful editor with tables, images, code blocks, and more",
                },
                {
                  icon: CheckSquare,
                  title: "Task Management",
                  description: "Organize todos with priorities, tags, and multiple views",
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
                  description: "Share pages with team members and control permissions",
                },
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  description: "Instant sync and real-time updates across devices",
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
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">Lexicon</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 Lexicon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


export default HomeWrapper