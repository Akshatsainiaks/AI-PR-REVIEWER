import React from "react";
import { motion } from "framer-motion";

// fallback (your current sample)
const fallbackDiff = [
  { type: "context", content: "No diff available", lineNumber: 1 },
];

export function CodeDiff({ diffData }) {
  const lines = diffData?.length ? diffData : fallbackDiff;

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card">
      {/* HEADER */}
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <span className="text-xs font-mono text-muted-foreground">
          {diffData?.file || "unknown-file.ts"}
        </span>
        <span className="text-xs text-muted-foreground">
          +{diffData?.added || 0} -{diffData?.removed || 0}
        </span>
      </div>

      {/* DIFF */}
      <div className="overflow-x-auto">
        <pre className="text-xs leading-6">
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`flex group ${
                line.type === "added"
                  ? "line-added"
                  : line.type === "removed"
                  ? "line-removed"
                  : ""
              }`}
            >
              {/* LINE NUMBER */}
              <span className="w-12 text-right pr-3 text-muted-foreground/50 font-mono">
                {line.lineNumber || i + 1}
              </span>

              {/* SYMBOL */}
              <span className="w-5 text-center font-mono">
                {line.type === "added" ? (
                  <span className="text-success">+</span>
                ) : line.type === "removed" ? (
                  <span className="text-destructive">-</span>
                ) : (
                  " "
                )}
              </span>

              {/* CODE */}
              <span className="flex-1 font-mono pr-4">
                {line.content}
              </span>

              {/* AI ANNOTATION */}
              {line.annotation && (
                <span className="text-primary/80 text-[10px] pr-4 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {line.annotation}
                </span>
              )}
            </motion.div>
          ))}
        </pre>
      </div>
    </div>
  );
}