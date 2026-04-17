  import React, { useState, useEffect } from "react"
  import { createFileRoute } from "@tanstack/react-router"
  import { motion } from "framer-motion"
  import { Search, Filter, GitBranch, FolderGit2 } from "lucide-react"
  import { PRCard } from "../pages/PRCard";
  import { SkeletonPR } from "../ui/SkeletonPR";
  import { Header } from "../ui/Header"
  import { Input } from "../ui/input"

  export const Route = createFileRoute("/dashboard")({
    component: Dashboard,
  })

  const repos = [
    { name: "frontend-app", prs: 5, language: "JavaScript" },
    { name: "api-server", prs: 3, language: "Python" },
    { name: "mobile-sdk", prs: 2, language: "Kotlin" },
    { name: "design-system", prs: 1, language: "JavaScript" },
  ]

 

  

const mockPRs = [
  {
    id: "1",
    title: "feat: Add async error handling to API utilities",
    number: 142,
    repo: "frontend-app",
    author: "sarah-dev",
    authorAvatar: "",
    branch: "feat/error-handling",
    status: "open",
    score: 82,
    comments: 4,
    filesChanged: 3,
    createdAt: "2h ago",
    reviewed: true,
  },
  {
    id: "2",
    title: "fix: Resolve memory leak in WebSocket connection",
    number: 138,
    repo: "api-server",
    author: "alex-eng",
    authorAvatar: "",
    branch: "fix/ws-memory-leak",
    status: "open",
    score: 65,
    comments: 7,
    filesChanged: 5,
    createdAt: "5h ago",
    reviewed: true,
  },
  {
    id: "3",
    title: "refactor: Migrate auth module to JWT tokens",
    number: 135,
    repo: "frontend-app",
    author: "mike-sec",
    authorAvatar: "",
    branch: "refactor/jwt-auth",
    status: "merged",
    score: 91,
    comments: 12,
    filesChanged: 8,
    createdAt: "1d ago",
    reviewed: true,
  },
  {
    id: "4",
    title: "chore: Update dependencies and fix lint warnings",
    number: 130,
    repo: "design-system",
    author: "bot-renovate",
    authorAvatar: "",
    branch: "chore/deps-update",
    status: "open",
    score: null,
    comments: 0,
    filesChanged: 2,
    createdAt: "2d ago",
    reviewed: false,
  },
  {
    id: "5",
    title: "feat: Implement real-time notification system",
    number: 127,
    repo: "api-server",
    author: "sarah-dev",
    authorAvatar: "",
    branch: "feat/notifications",
    status: "open",
    score: 45,
    comments: 3,
    filesChanged: 11,
    createdAt: "3d ago",
    reviewed: true,
  },
  {
    id: "6",
    title: "fix: iOS keyboard push-up layout issue",
    number: 89,
    repo: "mobile-sdk",
    author: "alex-eng",
    authorAvatar: "",
    branch: "fix/ios-keyboard",
    status: "closed",
    score: 73,
    comments: 2,
    filesChanged: 1,
    createdAt: "5d ago",
    reviewed: true,
  },
]

function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRepo, setSelectedRepo] = useState(null)

  const filteredPRs = mockPRs.filter((pr) => {
    const matchesSearch =
      pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.repo.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRepo = !selectedRepo || pr.repo === selectedRepo

    return matchesSearch && matchesRepo
  })

   useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 shrink-0 hidden lg:block"
          >
            <div className="sticky top-20 space-y-6">

              {/* Repo list */}
              <div>
                <h3 className="text-xs font-medium text-muted-foreground mb-3">
                  Repositories
                </h3>

                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedRepo(null)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      !selectedRepo
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <FolderGit2 className="h-4 w-4" />
                    All Repositories
                    <span className="ml-auto text-xs">{mockPRs.length}</span>
                  </button>

                  {repos.map((repo) => (
                    <button
                      key={repo.name}
                      onClick={() => setSelectedRepo(repo.name)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        selectedRepo === repo.name
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <GitBranch className="h-3.5 w-3.5" />
                      <span className="truncate text-xs">{repo.name}</span>
                      <span className="ml-auto text-xs">{repo.prs}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="glass-card rounded-xl p-4">
                <h3 className="text-xs text-muted-foreground mb-3">
                  Quick Stats
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Reviews Today</span>
                    <span>12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Score</span>
                    <span className="text-success">76</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issues Found</span>
                    <span className="text-warning">23</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.aside>

          {/* Main */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Pull Requests
            </h1>

            {/* Search */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                <Input
                  placeholder="Search pull requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <button className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>

            PR list
             <div className="space-y-3">
              {filteredPRs.map((pr, i) => (
                <PRCard key={pr.id} pr={pr} index={i} />
              ))}
            </div> 
          </div>

        </div>
      </div>
    </div>
  )
}
export default Dashboard