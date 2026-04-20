import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Lightbulb, Sparkles } from "lucide-react";

const typeConfig = {
  good: {
    icon: CheckCircle2,
    label: "Good Practice",
    className: "text-success border-success/20 bg-success/5",
    iconClass: "text-success",
  },
  issue: {
    icon: AlertTriangle,
    label: "Issue",
    className: "text-destructive border-destructive/20 bg-destructive/5",
    iconClass: "text-destructive",
  },
  suggestion: {
    icon: Lightbulb,
    label: "Suggestion",
    className: "text-warning border-warning/20 bg-warning/5",
    iconClass: "text-warning",
  },
};

export function AIReviewPanel({ data }) {
  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        No AI data available
      </p>
    );
  }

  const analysis = data?.analysis || {};

  // ✅ HANDLE BACKEND STRUCTURE
  const rawItems =
    analysis?.issues ||
    analysis?.problems ||
    [];

  // ✅ TRANSFORM INTO UI-FRIENDLY FORMAT
  const reviewItems = rawItems.map((item) => ({
    title:
      item.title ||
      item.type ||
      item.message ||
      "Issue detected",

    description:
      item.description ||
      item.detail ||
      item.message ||
      "No details provided",

    type:
      item.severity === "high"
        ? "issue"
        : item.severity === "medium"
        ? "suggestion"
        : "good",
  }));

  // ✅ HANDLE ERROR + SUMMARY
  const summary =
    analysis?.summary ||
    (analysis?.error
      ? "⚠️ AI could not fully analyze this PR (too large). Try a smaller PR."
      : "No summary available");

  return (
    <div className="space-y-4">

      {/* SUMMARY */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">AI Summary</h3>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {summary}
        </p>
      </motion.div>

      {/* ISSUES */}
      <div className="space-y-2">
        {reviewItems.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No issues found 🎉
          </p>
        ) : (
          reviewItems.map((item, i) => {
            const config =
              typeConfig[item.type] || typeConfig.issue;

            const Icon = config.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-lg border p-3 ${config.className}`}
              >
                <div className="flex items-start gap-2">

                  <Icon className={`h-4 w-4 ${config.iconClass}`} />

                  <div className="flex-1">

                    <p className="text-xs font-medium">
                      {item.title}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>

                  </div>

                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}