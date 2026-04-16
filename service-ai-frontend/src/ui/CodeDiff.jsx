import React from "react"
import { motion } from "framer-motion"

const sampleDiff = [
  { type: "context", content: "import { useState, useEffect } from 'react';", lineNumber: 1 },
  { type: "context", content: "", lineNumber: 2 },
  { type: "removed", content: "function fetchData(url) {", lineNumber: 3 },
  { type: "added", content: "async function fetchData(url: string): Promise<Response> {", lineNumber: 3, annotation: "✨ Added TypeScript types & async" },
  { type: "context", content: "  try {", lineNumber: 4 },
  { type: "removed", content: "    const response = fetch(url);", lineNumber: 5 },
  { type: "added", content: "    const response = await fetch(url);", lineNumber: 5, annotation: "🐛 Missing await keyword" },
  { type: "context", content: "    if (!response.ok) {", lineNumber: 6 },
  { type: "removed", content: "      throw 'Network error';", lineNumber: 7 },
  { type: "added", content: "      throw new Error(`HTTP ${response.status}: ${response.statusText}`);", lineNumber: 7, annotation: "💡 Better error messages" },
  { type: "context", content: "    }", lineNumber: 8 },
  { type: "context", content: "    return response;", lineNumber: 9 },
  { type: "removed", content: "  } catch(e) {", lineNumber: 10 },
  { type: "removed", content: "    console.log(e);", lineNumber: 11 },
  { type: "added", content: "  } catch (error: unknown) {", lineNumber: 10 },
  { type: "added", content: "    console.error('Fetch failed:', error);", lineNumber: 11, annotation: "💡 Use console.error for errors" },
  { type: "added", content: "    throw error;", lineNumber: 12, annotation: "🐛 Re-throw to propagate" },
  { type: "context", content: "  }", lineNumber: 13 },
  { type: "context", content: "}", lineNumber: 14 },
]

export function CodeDiff() {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card">
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <span className="text-xs font-mono text-muted-foreground">
          src/utils/api.ts
        </span>
        <span className="text-xs text-muted-foreground">+8 -4</span>
      </div>

      <div className="overflow-x-auto">
        <pre className="text-xs leading-6">
          {sampleDiff.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex group ${
                line.type === "added"
                  ? "line-added"
                  : line.type === "removed"
                  ? "line-removed"
                  : ""
              }`}
            >
              <span className="w-12 text-right pr-3 text-muted-foreground/50 select-none shrink-0 font-mono">
                {line.lineNumber}
              </span>

              <span className="w-5 text-center select-none shrink-0 font-mono">
                {line.type === "added" ? (
                  <span className="text-success">+</span>
                ) : line.type === "removed" ? (
                  <span className="text-destructive">-</span>
                ) : (
                  " "
                )}
              </span>

              <span className="flex-1 font-mono pr-4">
                {line.content}
              </span>

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
  )
}