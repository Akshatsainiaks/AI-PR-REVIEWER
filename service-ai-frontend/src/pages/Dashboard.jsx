import React, { useState, useEffect } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { Search, Filter, GitBranch, FolderGit2 } from "lucide-react"

import { PRCard } from "../pages/PRCard"
import { SkeletonPR } from "../ui/SkeletonPR"
import { Header } from "../ui/Header"
import { Input } from "../ui/input"
import API from "../services/api"

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
})

const repos = [
  { name: "frontend-app", prs: 5 },
  { name: "api-server", prs: 3 },
]

function Dashboard() {
  const [prUrl, setPrUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/login";
  }, []);

  const handleAnalyze = async () => {
    if (!prUrl) return alert("Enter PR URL");

    try {
      setLoading(true);

      const res = await API.post("/pr/analyze", {
        prUrl,
      });

      localStorage.setItem("aiData", JSON.stringify(res.data));

      window.location.href = `/pr/${res.data.prId}`;
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-20 text-center">

        {/* TITLE */}
        <h1 className="text-3xl font-bold mb-4">
          AI PR Reviewer 🚀
        </h1>

        <p className="text-muted-foreground mb-8">
          Paste any GitHub Pull Request and get instant AI review
        </p>

        {/* INPUT */}
        <div className="flex gap-3">
          <Input
            placeholder="https://github.com/user/repo/pull/123"
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
          />

          <button
            onClick={handleAnalyze}
            className="px-5 py-2 bg-primary text-white rounded-lg"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

      </div>
    </div>
  );
}
export default Dashboard