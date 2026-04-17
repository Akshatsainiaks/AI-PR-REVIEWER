import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  GitPullRequest,
  GitBranch,
  Clock,
  MessageSquare,
  FileCode2,
  Zap,
} from "lucide-react";

import { Header } from "../ui/Header";
import { ScoreGauge } from "../ui/ScoreGuage";
import { CodeDiff } from "../ui/CodeDiff";
import { AIReviewPanel } from "./AIReviewPanel";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export const Route = createFileRoute("/pr/$prId")({
  component: PRDetails,
});

function PRDetails() {
  const { prId } = Route.useParams();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Back */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* PR Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start justify-between gap-6">

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <GitPullRequest className="h-5 w-5 text-primary" />
                <span className="text-sm font-mono text-muted-foreground">
                  frontend-app
                </span>
                <span className="text-sm text-muted-foreground">#142</span>
                <Badge variant="success">Open</Badge>
              </div>

              <h1 className="text-xl font-bold mb-3">
                feat: Add async error handling to API utilities
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                
                <span className="flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5" />
                  <span className="font-mono text-xs">feat/error-handling</span>
                  <span>→</span>
                  <span className="font-mono text-xs">main</span>
                </span>

                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  2 hours ago
                </span>

                <span className="flex items-center gap-1.5">
                  <FileCode2 className="h-3.5 w-3.5" />
                  3 files changed
                </span>

                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  4 comments
                </span>

              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <ScoreGauge score={82} size={100} strokeWidth={6} />

              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Zap className="h-3 w-3 text-primary" />
                Re-analyze
              </Button>
            </div>

          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-6 border-b mb-6 pb-3">
          <button className="text-sm font-medium text-primary border-b-2 border-primary pb-3">
            File Changes
          </button>
          <button className="text-sm text-muted-foreground">
            AI Suggestions
          </button>
          <button className="text-sm text-muted-foreground">
            Summary
          </button>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-5 gap-6">

          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CodeDiff />
            </motion.div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-20">

              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-medium">AI Review</h2>
                <Badge variant="glass" className="text-[10px]">
                  6 findings
                </Badge>
              </div>

              <AIReviewPanel />

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default PRDetails;