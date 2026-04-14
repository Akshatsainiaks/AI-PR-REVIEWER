# AI PR Agent - Backend AI

This is the AI reasoning service for the PR Reviewer system. It uses FastAPI for the API and FastMCP to expose tools for the AI agent.

## 🚀 Quick Start with `uv`

This project uses [uv](https://github.com/astral-sh/uv) for extremely fast Python package management.

### 1. Installation & Setup

If you haven't installed `uv` yet:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Sync Dependencies
Create a virtual environment and install all dependencies:
```bash
uv sync
```

### 3. Environment Variables
Copy the example environment file and fill in your keys:
```bash
cp .env.example .env
```
Ensure you set your `LLM_API_KEY` and `GITHUB_TOKEN`.

### 4. Running the Service
Start the FastAPI server:
```bash
uv run python -m app.main
```

### 5. Testing MCP Tools
You can inspect and test the MCP tools visually using the MCP inspector:
```bash
uv run mcp inspector app/mcp/server.py
```

---

## 🛠 Useful `uv` Commands

- **Add a new package**: `uv add <package_name>`
- **Remove a package**: `uv remove <package_name>`
- **Run a script**: `uv run <script.py>`
- **Update lockfile**: `uv lock`
- **Sync environment**: `uv sync`

## 📂 Project Structure

- `app/main.py`: FastAPI entry point.
- `app/mcp/server.py`: MCP Tool definitions (read/write files, git ops).
- `app/utils/git_utils.py`: Git operational helpers.
- `app/core/config.py`: Configuration and environment management.
- `pyproject.toml`: Project metadata and dependencies.
