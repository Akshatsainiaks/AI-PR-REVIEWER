import os
import logging
import re
import subprocess
import uvicorn
from typing import List, Dict, Any

from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from elasticsearch import Elasticsearch

from app.mcp.server import (
    mcp,
    get_pr_diff,
    clone_repo,
    read_file,
    write_file,
    commit_and_push,
    merge_pr,
)
from app.agents.pr_agent import PRAgent

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="AI PR Agent - Backend AI")

# Initialize external services
elasticsearch_url = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
es = Elasticsearch(elasticsearch_url)
pr_agent = PRAgent()


class AnalyzeRequest(BaseModel):
    """
    Schema for PR analysis and fix requests.
    """

    pr_id: int = Field(
        ..., description="The pull request number", json_schema_extra={"example": 7}
    )
    repo: str = Field(
        ...,
        description="Repository in 'owner/repo' format",
        json_schema_extra={"example": "Akshatsainiaks/AI-PR-REVIEWER"},
    )
    branch: str = Field(
        ...,
        description="The branch name of the PR",
        json_schema_extra={"example": "nmana"},
    )
    base: str = Field(
        "main",
        description="The base branch of the PR",
        json_schema_extra={"example": "main"},
    )


@app.get("/health")
async def health():
    """
    Service health check endpoint.
    Checks connectivity to internal dependencies like Elasticsearch.
    """
    es_status = "unhealthy"
    try:
        if es.ping():
            es_status = "healthy"
    except Exception as e:
        logger.error(f"Elasticsearch health check failed: {str(e)}")

    return {"status": "healthy", "service": "backend-ai", "elasticsearch": es_status}


def _extract_files_from_diff(diff_text: str) -> List[str]:
    """
    Parses a unified git diff to extract the list of affected file paths.

    Args:
        diff_text (str): The raw git diff string.

    Returns:
        List[str]: A list of relative file paths found in the diff.
    """
    return re.findall(r"diff --git a/(.*?) b/", diff_text)


def _apply_ai_fixes(workspace: str, diff_text: str, branch: str) -> None:
    """
    Orchestrates the process of reading affected files, generating fixes via LLM,
    and writing them back to the workspace.

    Args:
        workspace (str): Path to the cloned repository.
        diff_text (str): The diff containing issues.
        branch (str): The branch name to checkout.
        
    Raises:
        Exception: If any step fails during fix application.
    """
    logger.info(f"Checking out branch {branch} in workspace {workspace}")
    subprocess.run(["git", "checkout", branch], cwd=workspace, check=True)

    files = _extract_files_from_diff(diff_text)
    if not files:
        logger.warning("No files extracted from diff.")
        return

    for file_path in files:
        logger.info(f"Generating AI fix for: {file_path}")
        original_content = read_file(file_path, workspace)

        if original_content.startswith("Error:"):
            logger.warning(f"Skipping fix for {file_path} due to read error: {original_content}")
            continue

        fixed_content = pr_agent.generate_fix(diff_text, file_path, original_content)
        if fixed_content and fixed_content != original_content:
            write_file(file_path, fixed_content, workspace)
            logger.info(f"Successfully updated: {file_path}")
        else:
            logger.info(f"No changes generated for: {file_path}")


@app.post("/agent/analyze")
async def analyze_pr(request: AnalyzeRequest):
    """
    Performs an AI analysis of a PR's diff without applying fixes.
    """
    try:
        github_token = os.getenv("GITHUB_TOKEN")
        repo = request.repo.strip("/")

        diff_data = get_pr_diff(repo, request.pr_id, github_token)
        if "error" in diff_data:
            logger.error(f"Failed to fetch diff: {diff_data['error']}")
            raise HTTPException(status_code=400, detail=diff_data["error"])

        analysis = pr_agent.analyze_diff(diff_data["diff"])
        return {"pr_id": request.pr_id, "analysis": analysis}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during analysis")


@app.post("/agent/fix-and-merge")
async def fix_and_merge(request: AnalyzeRequest):
    """
    Full autonomous workflow: Analyze PR -> Generate Fixes -> Push Changes -> Merge.
    """
    try:
        github_token = os.getenv("GITHUB_TOKEN")
        work_dir_base = os.getenv("WORK_DIR", "./workspace")
        repo = request.repo.strip("/")

        # 1. Analysis Phase
        diff_data = get_pr_diff(repo, request.pr_id, github_token)
        if "error" in diff_data:
            raise HTTPException(status_code=400, detail=f"Diff fetch failed: {diff_data['error']}")

        diff_text = diff_data["diff"]
        analysis = pr_agent.analyze_diff(diff_text)

        # 2. Fix Phase (if needed)
        should_fix = analysis.get("fix_suggested", False) or not analysis.get("is_correct", True)
        
        if should_fix:
            logger.info(f"Workflow: Attempting to fix issues in PR {request.pr_id}")
            workspace = os.path.join(work_dir_base, str(request.pr_id))
            
            # Clone and setup
            clone_res = clone_repo(repo, workspace, github_token)
            if clone_res.get("status") == "error":
                raise HTTPException(status_code=500, detail=f"Repo setup failed: {clone_res.get('stderr')}")

            # Apply LLM Fixes
            _apply_ai_fixes(workspace, diff_text, request.branch)

            # Commit and Push
            commit_msg = f"AI: Applied automated fixes for PR #{request.pr_id}\n\nIssues addressed:\n"
            for p in analysis.get("problems", []):
                commit_msg += f"- {p.get('file')}: {p.get('issue')}\n"

            push_res = commit_and_push(workspace, request.branch, commit_msg)
            if push_res.get("status") == "error":
                raise HTTPException(status_code=500, detail=f"Push failed: {push_res.get('stderr')}")
        else:
            logger.info(f"Workflow: No fixes needed for PR {request.pr_id}")

        # 3. Merge Phase
        logger.info(f"Workflow: Finalizing PR {request.pr_id} with merge")
        merge_res = merge_pr(repo, request.pr_id, github_token)

        return {
            "pr_id": request.pr_id,
            "status": "completed",
            "analysis": analysis,
            "merge_result": merge_res
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Critical workflow error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Workflow failed: {str(e)}")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
