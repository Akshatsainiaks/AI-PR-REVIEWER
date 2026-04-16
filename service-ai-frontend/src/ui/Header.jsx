import React from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { GitBranch, Zap } from "lucide-react"

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
]

export function Header() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
            <Zap className="h-4 w-4 text-primary" />
          </div>

          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
            CodeLens
          </span>

          <span className="text-xs text-muted-foreground font-mono">
            AI
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to

            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative px-3 py-1.5 text-sm transition-colors"
              >
                <span
                  className={
                    isActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }
                >
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm">
            <GitBranch className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">
              Connect GitHub
            </span>
          </div>
        </div>

      </div>
    </header>
  )
}
export default Header