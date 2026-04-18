import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Zap, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { FaGithub } from "react-icons/fa"
import { Button } from "../ui/button"
import { Input } from "../ui/input";
import { Label } from "../ui/label";


export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — CodeLens AI" },
      { name: "description", content: "Create your CodeLens AI account and start reviewing code with AI" },
    ],
  }),
  component: Register,
});

const benefits = [
  "AI-powered code reviews on every PR",
  "Instant bug detection & quality scores",
  "Free for public repositories",
];

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await res.json();
    console.log("register RESPONSE:", data);

    if (res.ok) {
      alert("Register successful ✅");

      // redirect to login
      window.location.href = "/login";
    } else {
      alert(data.error || "Register failed ❌");
    }
  } catch (err) {
    console.error(err);
    alert("Server error ❌");
  }
};
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="bg-grid-pattern absolute inset-0 opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mx-6"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            CodeLens
          </span>
          <span className="text-sm text-muted-foreground font-mono">AI</span>
        </Link>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Start reviewing code with AI in seconds
            </p>
          </div>

          {/* GitHub Button */}
          <Button variant="outline" className="w-full gap-2 mb-6 h-11"
            onClick={() => {
            window.location.href = "http://localhost:3000/api/auth/github";
            }}
            >
            <FaGithub  className="h-4 w-4" />
            Sign up with GitHub
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">
                or sign up with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 gap-2 glow-primary">
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Benefits */}
          <div className="mt-6 space-y-2">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-success shrink-0" />
                {b}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
export default Register;