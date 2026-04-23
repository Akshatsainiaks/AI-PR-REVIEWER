from fastmcp import FastMCP
import subprocess
import os
import requests
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

mcp = FastMCP("pr-agent-tools")

@mcp.tool()
def get_pr_diff(repo: str, pr_number: int, github_token: str) -> dict:
    """
    Fetch unified diff for a PR.
    Args:
        repo: Repository in format 'owner/repo'
        pr_number: Pull request number
        github_token: GitHub Personal Access Token
    """
    url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}"
    headers = {
        "Authorization": f"Bearer {github_token}",
        "Accept": "application/vnd.github.v3.diff"
    }

    logger.info(f"Fetching diff for PR {pr_number} in {repo}")
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        logger.error(f"Failed to fetch diff: {response.text}")
        return {"error": f"Failed to fetch diff: {response.status_code}", "details": response.text}
        
    return {"diff": response.text}

@mcp.tool()
def read_file(path: str, workspace: str) -> str:
    """
    Read file content from cloned workspace.
    Args:
        path: Relative path to the file
        workspace: Absolute path to the workspace root
    """
    full_path = os.path.join(workspace, path)
    if not os.path.exists(full_path):
        return f"Error: File {path} not found in workspace."
    
    try:
        with open(full_path, "r") as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {str(e)}"

@mcp.tool()
def write_file(path: str, content: str, workspace: str) -> bool:
    """
    Write/overwrite file in workspace.
    Args:
        path: Relative path to the file
        content: Content to write
        workspace: Absolute path to the workspace root
    """
    full_path = os.path.join(workspace, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    try:
        with open(full_path, "w") as f:
            f.write(content)
        return True
    except Exception as e:
        logger.error(f"Error writing file {path}: {str(e)}")
        return False

@mcp.tool()
def run_command(command: str, workspace: str, timeout: int = 120) -> dict:
    """
    Run shell command safely in workspace.
    Args:
        command: Command to execute
        workspace: Working directory
        timeout: Execution timeout in seconds
    """
    logger.info(f"Running command: {command} in {workspace}")
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=workspace,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {"error": "Command timed out", "stdout": "", "stderr": f"Timeout after {timeout}s", "exit_code": -1}
    except Exception as e:
        return {"error": str(e), "stdout": "", "stderr": str(e), "exit_code": -1}

@mcp.tool()
def create_pr(title: str, body: str, branch: str, base: str, github_token: str, repo: str) -> dict:
    """
    Create GitHub PR via API.
    Args:
        title: PR Title
        body: PR Description
        branch: Head branch (e.g., 'ai/fix-123')
        base: Base branch (e.g., 'main')
        github_token: GitHub Personal Access Token
        repo: Repository in format 'owner/repo'
    """
    url = f"https://api.github.com/repos/{repo}/pulls"
    headers = {
        "Authorization": f"Bearer {github_token}",
        "Accept": "application/vnd.github.v3+json"
    }
    payload = {
        "title": title,
        "body": body,
        "head": branch,
        "base": base
    }
    
    logger.info(f"Creating PR in {repo} from {branch} to {base}")
    res = requests.post(url, json=payload, headers=headers)
    return res.json()

@mcp.tool()
def clone_repo(repo: str, workspace: str, github_token: str) -> dict:
    """
    Clone a repository to the local workspace.
    Args:
        repo: Repository in format 'owner/repo'
        workspace: Local directory to clone into
        github_token: GitHub Personal Access Token
    """
    repo_url = f"https://x-access-token:{github_token}@github.com/{repo}.git"
    
    # Ensure workspace exists
    os.makedirs(workspace, exist_ok=True)
    
    logger.info(f"Cloning {repo} to {workspace}")
    try:
        # If directory is not empty, we assume it's already cloned or we should clean it
        if os.listdir(workspace):
            logger.warning(f"Workspace {workspace} is not empty. Skipping clone.")
            return {"status": "already_exists", "message": "Workspace not empty"}

        result = subprocess.run(
            ["git", "clone", repo_url, "."],
            cwd=workspace,
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            return {"status": "error", "stderr": result.stderr}
        return {"status": "success", "message": f"Cloned {repo} successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@mcp.tool()
def commit_and_push(workspace: str, branch: str, message: str) -> dict:
    """
    Commit all changes and push to the remote branch.
    Args:
        workspace: Local repository directory
        branch: Branch to push to
        message: Commit message
    """
    try:
        # Configure local user for commit if not set
        subprocess.run(["git", "config", "user.email", "ai-agent@example.com"], cwd=workspace)
        subprocess.run(["git", "config", "user.name", "AI Agent"], cwd=workspace)
        
        # Add all
        subprocess.run(["git", "add", "."], cwd=workspace)
        
        # Commit
        commit_res = subprocess.run(["git", "commit", "-m", message], cwd=workspace, capture_output=True, text=True)
        if commit_res.returncode != 0:
            return {"status": "error", "message": "Commit failed", "stderr": commit_res.stderr}
            
        # Push
        push_res = subprocess.run(["git", "push", "origin", branch], cwd=workspace, capture_output=True, text=True)
        if push_res.returncode != 0:
            return {"status": "error", "message": "Push failed", "stderr": push_res.stderr}
            
        return {"status": "success", "message": "Committed and pushed successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@mcp.tool()
def merge_pr(repo: str, pr_number: int, github_token: str) -> dict:
    """
    Merge a GitHub Pull Request.
    Args:
        repo: Repository in format 'owner/repo'
        pr_number: Pull request number
        github_token: GitHub Personal Access Token
    """
    url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}/merge"
    headers = {
        "Authorization": f"Bearer {github_token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    logger.info(f"Merging PR {pr_number} in {repo}")
    res = requests.put(url, headers=headers)
    try:
        return res.json()
    except:
        return {"status": 1, "text": res.text}