# AI-PR-REVIEWER

An autonomous AI agent system for pull request analysis, automated fixing, and real-time monitoring.

## 🏗 System Architecture

The system consists of three main components:

1.  **Main Service (Node.js)**: Orchestrator, auth provider, webhook receiver, and WebSocket broadcaster.
2.  **AI Agent (FastAPI + MCP)**: The reasoning loop that analyzes PRs and applies fixes using deterministic tools.
3.  **Frontend (React + Vite)**: Real-time dashboard for monitoring AI actions and PR status.

## 📂 Components

### [AI Agent (backend-ai)](./backend-ai)
- **Tech Stack**: Python, FastAPI, FastMCP, `uv`.
- **Purpose**: Hosts the AI reasoning logic and provides tools for file operations and git actions via MCP.
- **Setup**: 
  ```bash
  cd backend-ai
  uv sync
  ```

### [Main Service (backend)](./backend)
- **Tech Stack**: Node.js, Express, Socket.IO, Prisma.
- **Purpose**: Handles user authentication, GitHub webhooks, and broadcasts live updates to the frontend.

### [Frontend](./frontend)
- **Tech Stack**: React, Vite, Socket.IO Client.
- **Purpose**: Visual dashboard to track the AI's step-by-step progress on specific PRs.

## 🚦 Getting Started

Detailed instructions for each component are located in their respective directories.

1.  Set up the **Backend AI** service first (see [README.md](./backend-ai/README.md)).
2.  Configure the **Node.js Service** with your GitHub App credentials.
3.  Launch the **Frontend** to see the magic happen.
