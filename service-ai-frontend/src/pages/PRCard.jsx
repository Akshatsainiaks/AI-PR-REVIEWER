import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { GitPullRequest, MessageSquare, Clock, GitBranch } from "lucide-react";
import { Badge } from "../ui/badge";
import { ScoreGauge } from "../ui/ScoreGuage";

const statusConfig = {
  open: { variant: "success", label: "Open" },
  merged: { variant: "info", label: "Merged" },
  closed: { variant: "destructive", label: "Closed" },
};

export function PRCard({ pr, index = 0 }) {
  const status = statusConfig[pr.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link
        to="/pr/$prId"
        params={{ prId: pr.id }}
        className="block"
      >
        <div className="glass-card rounded-xl p-4 hover:border-primary/40 transition-all duration-300 group cursor-pointer">
          <div className="flex items-start justify-between gap-4">
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <GitPullRequest className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs text-muted-foreground font-mono">{pr.repo}</span>
                <span className="text-xs text-muted-foreground">#{pr.number}</span>

                <Badge variant={status.variant} className="text-[10px] px-1.5 py-0">
                  {status.label}
                </Badge>
              </div>

              <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {pr.title}
              </h3>

              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                
                <span className="flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  <span className="font-mono truncate max-w-[120px]">
                    {pr.branch}
                  </span>
                </span>

                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {pr.comments}
                </span>

                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {pr.createdAt}
                </span>

              </div>
            </div>

            <div className="shrink-0">
              {pr.score !== null ? (
                <ScoreGauge score={pr.score} size={56} strokeWidth={4} />
              ) : (
                <div className="w-14 h-14 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground">N/A</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </Link>
    </motion.div>
  );
}