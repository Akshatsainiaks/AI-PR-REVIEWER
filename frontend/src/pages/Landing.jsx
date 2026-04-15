import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4">
        <h1 className="text-xl font-bold text-purple-400">AI PR Reviewer</h1>
        <div className="space-x-4">
          <Link to="/" className="hover:text-purple-400">Login</Link>
          <Link to="/register" className="bg-purple-500 px-4 py-2 rounded">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center mt-20 px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          AI Powered Code Review 🚀
        </h1>

        <p className="text-gray-300 max-w-xl mb-6">
          Automatically analyze GitHub pull requests using AI. 
          Get instant feedback, code quality insights, and suggestions.
        </p>

        <div className="space-x-4">
          <Link
            to="/register"
            className="bg-purple-600 px-6 py-3 rounded-lg text-lg"
          >
            Start Free
          </Link>

          <Link
            to="/"
            className="border border-gray-400 px-6 py-3 rounded-lg text-lg"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="mt-24 grid md:grid-cols-3 gap-8 px-10">
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-xl font-bold mb-2">⚡ Fast Analysis</h3>
          <p className="text-gray-400">
            Get instant AI feedback on your pull requests.
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-xl font-bold mb-2">🤖 AI Suggestions</h3>
          <p className="text-gray-400">
            Improve code quality with smart recommendations.
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-xl font-bold mb-2">🔒 Secure</h3>
          <p className="text-gray-400">
            Your code stays safe with secure processing.
          </p>
        </div>
      </div>
    </div>
  );
}