import os
import logging
import re
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from elasticsearch import Elasticsearch

from app.mcp.server import mcp, get_pr_diff, clone_repo, read_file, write_file, commit_and_push, merge_pr
from app.agents.pr_agent import PRAgent

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI PR Agent - Backend AI")

# Initialize Elasticsearch
elasticsearch_url = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
es = Elasticsearch(elasticsearch_url)

# Initialize PR Agent
pr_agent = PRAgent()

class AnalyzeRequest(BaseModel):
    pr_id: int = Field(..., description="The pull request number", json_schema_extra={"example": 7})
    repo: str = Field(..., description="Repository in 'owner/repo' format", json_schema_extra={"example": "Akshatsainiaks/AI-PR-REVIEWER"})
    branch: str = Field(..., description="The branch name of the PR", json_schema_extra={"example": "nmana"})
    base: str = Field("main", description="The base branch of the PR", json_schema_extra={"example": "main"})

@app.get("/health")
async def health():
    es_status = "unhealthy"
    try:
        if es.ping():
            es_status = "healthy"
    except Exception as e:
        logger.error(f"Elasticsearch health check failed: {e}")
        
    return {
        "status": "healthy", 
        "service": "backend-ai",
        "elasticsearch": es_status
    }

def get_files_from_diff(diff_text: str):
    """Extract file paths from a unified git diff."""
    return re.findall(r"diff --git a/(.*?) b/", diff_text)

@app.post("/agent/analyze")
async def analyze_pr(request: AnalyzeRequest):
    """
    Endpoint to analyze PR changes using Groq.
    """
    github_token = os.getenv("GITHUB_TOKEN")
    if not github_token:
        raise HTTPException(status_code=500, detail="GITHUB_TOKEN not configured")

    logger.info(f"Analyzing PR {request.pr_id} in {request.repo}")
    
    # Ensure repo format is clean
    request.repo = request.repo.strip("/")
    
    # 1. Fetch Diff
    diff_data = get_pr_diff(request.repo, request.pr_id, github_token)
    if "error" in diff_data:
        raise HTTPException(status_code=400, detail=diff_data["error"])
    
    diff_text = diff_data["diff"]
    
    # 2. Analyze with LLM
    analysis = pr_agent.analyze_diff(diff_text)
    
    return {
        "pr_id": request.pr_id,
        "analysis": analysis
    }

@app.post("/agent/fix-and-merge")
async def fix_and_merge(request: AnalyzeRequest):
    """
    Endpoint to analyze, fix, and merge a PR.
    """
    github_token = os.getenv("GITHUB_TOKEN")
    work_dir_base = os.getenv("WORK_DIR", "/tmp/ai-agent-workspace")
    if not github_token:
        raise HTTPException(status_code=500, detail="GITHUB_TOKEN not configured")

    logger.info(f"Starting Fix & Merge for PR {request.pr_id} in {request.repo}")
    
    # Ensure repo format is clean
    request.repo = request.repo.strip("/")

    # 1. Fetch Diff and Analyze
    diff_data = get_pr_diff(request.repo, request.pr_id, github_token)
    if "error" in diff_data:
        raise HTTPException(status_code=400, detail=diff_data["error"])
    
    diff_text = diff_data["diff"]
    analysis = pr_agent.analyze_diff(diff_text)
    
    if analysis.get("is_correct") and not analysis.get("fix_suggested"):
        logger.info(f"PR {request.pr_id} is correct. Proceeding to merge.")
    else:
        logger.info(f"PR {request.pr_id} has issues. Attempting to fix.")
        
        # 2. Clone Repo
        workspace = os.path.join(work_dir_base, str(request.pr_id))
        clone_res = clone_repo(request.repo, workspace, github_token)
        if clone_res.get("status") == "error":
             raise HTTPException(status_code=500, detail=f"Failed to clone: {clone_res.get('stderr')}")

        # Checkout branch if not already there
        import subprocess
        subprocess.run(["git", "checkout", request.branch], cwd=workspace)

        # 3. Apply Fixes
        files = get_files_from_diff(diff_text)
        for file_path in files:
            original_content = read_file(file_path, workspace)
            if original_content.startswith("Error:"):
                logger.warning(f"Could not read file {file_path}: {original_content}")
                continue
            
            fixed_content = pr_agent.generate_fix(diff_text, file_path, original_content)
            write_file(file_path, fixed_content, workspace)
        
        # 4. Commit and Push
        push_res = commit_and_push(workspace, request.branch, "AI-generated fixes for PR issues")
        if push_res.get("status") == "error":
            raise HTTPException(status_code=500, detail=f"Push failed: {push_res.get('stderr')}")

    # 5. Merge PR
    merge_res = merge_pr(request.repo, request.pr_id, github_token)
    
    return {
        "pr_id": request.pr_id,
        "analysis": analysis,
        "merge_status": merge_res
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
