import React from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import {
  Zap,
  GitPullRequest,
  Shield,
  BarChart3,
  ArrowRight,
  Sparkles,
} from "lucide-react"

import { Button } from "@/ui/button"   
import { CodeDiff } from "@/ui/CodeDiff"

export const Route = createFileRoute("/")({
  component: Index,
})

const features = [
  {
    icon: GitPullRequest,
    title: "PR Analysis",
    description:
      "Fetch and analyze pull requests from any GitHub repository in real-time.",
  },
  {
    icon: Shield,
    title: "Bug Detection",
    description:
      "AI identifies potential bugs, security issues, and anti-patterns in your code.",
  },
  {
    icon: BarChart3,
    title: "Quality Score",
    description:
      "Get a 0–100 code quality score with detailed breakdowns per file.",
  },
  {
    icon: Sparkles,
    title: "Smart Suggestions",
    description:
      "Receive actionable improvement suggestions with inline annotations.",
  },
]

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">CodeLens</span>
            <span className="text-xs text-muted-foreground font-mono">AI</span>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>

            <Link to="/register">
              <Button size="sm" className="gap-2">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
      <div className="bg-grid-pattern absolute inset-0 opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />  
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs text-primary mb-6">
              <Sparkles className="h-3 w-3" />
              AI-Powered Code Review
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Review PRs with
              <br />
              Superhuman Precision
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Connect your GitHub repos and let AI analyze every pull request.
            </p>

            <div className="flex justify-center gap-3">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CodeDiff />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl p-5"
            >
              <feature.icon className="h-5 w-5 text-primary mb-3" />
              <h3 className="text-sm font-medium">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        CodeLens AI — Built for developers
      </footer>
    </div>
  )
}
export default Index