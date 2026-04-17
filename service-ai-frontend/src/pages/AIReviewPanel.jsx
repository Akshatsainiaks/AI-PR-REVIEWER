import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Lightbulb, Sparkles } from "lucide-react";

const reviewItems = [
  {
    type: "good",
    title: "Proper async/await usage",
    description:
      "Added missing await keyword to fetch call, preventing race conditions.",
    file: "api.ts",
    line: 5,
  },
  {
    type: "issue",
    title: "No request timeout",
    description:
      "fetch() has no timeout configured. Long-running requests could hang indefinitely.",
    file: "api.ts",
    line: 5,
  },
  {
    type: "good",
    title: "TypeScript types added",
    description:
      "Function signature now includes proper input/output types for better type safety.",
    file: "api.ts",
    line: 3,
  },
  {
    type: "suggestion",
    title: "Add retry logic",
    description:
      "Consider implementing exponential backoff for transient network failures.",
    file: "api.ts",
    line: 10,
  },
  {
    type: "issue",
    title: "Missing input validation",
    description:
      "URL parameter is not validated before use. Could lead to SSRF vulnerabilities.",
    file: "api.ts",
    line: 3,
  },
  {
    type: "suggestion",
    title: "Use AbortController",
    description:
      "Add AbortController support for request cancellation on component unmount.",
  },
];

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

export function AIReviewPanel() {
  const summary = `This PR improves error handling and adds TypeScript types to the API utility. 
Key improvements include proper async/await usage and better error messages. 
However, it's missing request timeouts and input validation which could lead to security issues.`;

  return (
    <div className="space-y-4">

      {/* AI Summary */}
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

      {/* Review Items */}
      <div className="space-y-2">
        {reviewItems.map((item, i) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className={`rounded-lg border p-3 ${config.className}`}
            >
              <div className="flex items-start gap-2">
                
                <Icon
                  className={`h-4 w-4 mt-0.5 shrink-0 ${config.iconClass}`}
                />

                <div className="flex-1 min-w-0">

                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium">
                      {item.title}
                    </span>

                    {item.file && (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {item.file}
                        {item.line ? `:${item.line}` : ""}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>

                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}