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
def get_pr_diff(repo: str, pr_number: int, github_token: str = None) -> dict:
    """
    Fetch the unified diff for a specific GitHub Pull Request.

    Args:
        repo (str): Repository in format 'owner/repo'.
        pr_number (int): The pull request number.
        github_token (str, optional): GitHub Personal Access Token.

    Returns:
        dict: A dictionary containing 'diff' string or an 'error' message.
    """
    url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}"
    headers = {
        "Accept": "application/vnd.github.v3.diff",
    }
    if github_token:
        headers["Authorization"] = f"Bearer {github_token}"

    logger.info(f"Fetching diff for PR {pr_number} in {repo}")
    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            logger.error(
                f"Failed to fetch diff (status {response.status_code}): {response.text}"
            )
            return {
                "error": f"Failed to fetch diff: {response.status_code}",
                "details": response.text,
            }
        return {"diff": response.text}
    except Exception as e:
        logger.error(f"Network error while fetching diff: {str(e)}", exc_info=True)
        return {"error": f"Network error: {str(e)}"}


@mcp.tool()
def read_file(path: str, workspace: str) -> str:
    """
    Reads the content of a file from the local workspace.

    Args:
        path (str): Relative path to the file within the workspace.
        workspace (str): Absolute path to the repository root.

    Returns:
        str: The content of the file or an error message starting with 'Error:'.
    """
    full_path = os.path.normpath(os.path.join(workspace, path))
    
    # Security check: ensure path is within workspace
    if not full_path.startswith(os.path.abspath(workspace)):
        return f"Error: Attempted to read file outside of workspace: {path}"

    if not os.path.exists(full_path):
        return f"Error: File {path} not found in workspace."

    try:
        with open(full_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        logger.error(f"Error reading file {path}: {str(e)}", exc_info=True)
        return f"Error reading file: {str(e)}"


@mcp.tool()
def write_file(path: str, content: str, workspace: str) -> bool:
    """
    Writes or overwrites a file in the workspace with new content.

    Args:
        path (str): Relative path to the file.
        content (str): New content for the file.
        workspace (str): Absolute path to the repository root.

    Returns:
        bool: True if successful, False otherwise.
    """
    full_path = os.path.normpath(os.path.join(workspace, path))
    
    # Security check: ensure path is within workspace
    if not full_path.startswith(os.path.abspath(workspace)):
        logger.error(f"Blocked attempt to write outside of workspace: {path}")
        return False

    os.makedirs(os.path.dirname(full_path), exist_ok=True)

    try:
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    except Exception as e:
        logger.error(f"Error writing file {path}: {str(e)}", exc_info=True)
        return False


@mcp.tool()
def run_command(command: str, workspace: str, timeout: int = 120) -> dict:
    """
    Executes a shell command within the workspace directory.

    Args:
        command (str): The shell command string to execute.
        workspace (str): The directory in which to run the command.
        timeout (int): Maximum execution time in seconds. Defaults to 120.

    Returns:
        dict: Process result including 'stdout', 'stderr', and 'exit_code'.
    """
    logger.info(f"Executing command: {command} in {workspace}")
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=workspace,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode,
        }
    except subprocess.TimeoutExpired:
        logger.error(f"Command timed out after {timeout}s: {command}")
        return {
            "error": "Command timed out",
            "stdout": "",
            "stderr": f"Timeout after {timeout}s",
            "exit_code": -1,
        }
    except Exception as e:
        logger.error(f"Unhandled error during command execution: {str(e)}", exc_info=True)
        return {"error": str(e), "stdout": "", "stderr": str(e), "exit_code": -1}


@mcp.tool()
def create_pr(
    title: str, body: str, branch: str, base: str, github_token: str, repo: str
) -> dict:
    """
    Creates a new Pull Request on GitHub.

    Args:
        title (str): The title of the PR.
        body (str): The description or body of the PR.
        branch (str): The head branch containing changes.
        base (str): The target base branch (e.g., 'main').
        github_token (str): GitHub Personal Access Token.
        repo (str): Repository in 'owner/repo' format.

    Returns:
        dict: The JSON response from the GitHub API.
    """
    url = f"https://api.github.com/repos/{repo}/pulls"
    headers = {
        "Authorization": f"Bearer {github_token}",
        "Accept": "application/vnd.github.v3+json",
    }
    payload = {"title": title, "body": body, "head": branch, "base": base}

    logger.info(f"Creating PR in {repo} for branch {branch}")
    try:
        res = requests.post(url, json=payload, headers=headers)
        return res.json()
    except Exception as e:
        logger.error(f"Failed to create PR: {str(e)}", exc_info=True)
        return {"error": str(e)}


@mcp.tool()
def clone_repo(
    repo: str, workspace: str, github_token: str = None
) -> dict:
    """
    Clones a GitHub repository to a local directory or refreshes the remote URL.

    Args:
        repo (str): Repository in 'owner/repo' format.
        workspace (str): Absolute directory to clone into.
        github_token (str, optional): GitHub Personal Access Token for auth.

    Returns:
        dict: Status message indicating success or failure.
    """
    if github_token:
        repo_url = f"https://x-access-token:{github_token}@github.com/{repo}.git"
    else:
        repo_url = f"https://github.com/{repo}.git"

    try:
        os.makedirs(workspace, exist_ok=True)
        
        # Branch/Remote refresh logic
        if os.path.exists(workspace) and os.path.isdir(workspace) and os.listdir(workspace):
            logger.info(f"Refreshing remote URL in existing workspace: {workspace}")
            subprocess.run(
                ["git", "remote", "set-url", "origin", repo_url],
                cwd=workspace,
                capture_output=True,
                text=True,
                check=True
            )
            return {"status": "success", "message": "Refreshed remote URL"}

        logger.info(f"Cloning {repo} to {workspace}")
        result = subprocess.run(
            ["git", "clone", repo_url, "."],
            cwd=workspace,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            logger.error(f"Clone failed: {result.stderr}")
            return {"status": "error", "stderr": result.stderr}
        return {"status": "success", "message": f"Cloned {repo} successfully"}
    except subprocess.CalledProcessError as e:
        logger.error(f"Git command failed: {e.stderr}", exc_info=True)
        return {"status": "error", "message": "Git operation failed", "stderr": e.stderr}
    except Exception as e:
        logger.error(f"Failed to clone repository: {str(e)}", exc_info=True)
        return {"status": "error", "message": str(e)}


@mcp.tool()
def commit_and_push(workspace: str, branch: str, message: str) -> dict:
    """
    Stages all changes, commits, and pushes them to the specified branch.

    Args:
        workspace (str): Directory of the local repository.
        branch (str): Remote branch to target.
        message (str): The commit message.

    Returns:
        dict: Status object with success or error details.
    """
    try:
        # Default Git config for the AI agent
        subprocess.run(
            ["git", "config", "user.email", "ai-agent@example.com"], cwd=workspace, check=True
        )
        subprocess.run(
            ["git", "config", "user.name", "AI Agent"], cwd=workspace, check=True
        )

        subprocess.run(["git", "add", "."], cwd=workspace, check=True)

        commit_res = subprocess.run(
            ["git", "commit", "-m", message],
            cwd=workspace,
            capture_output=True,
            text=True,
        )