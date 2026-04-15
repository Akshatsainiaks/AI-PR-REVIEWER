import os
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import logging
from elasticsearch import Elasticsearch


from app.mcp import mcp

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI PR Agent - Backend AI")

# Initialize Elasticsearch
elasticsearch_url = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
es = Elasticsearch(elasticsearch_url)


class AnalyzeRequest(BaseModel):
    pr_id: int
    repo: str
    branch: str
    base: str = "main"

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

@app.post("/agent/analyze")
async def analyze_pr(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    """
    Endpoint to trigger PR analysis.
    This will eventually call the AI reasoning loop.
    """
    logger.info(f"Received analysis request for PR {request.pr_id} in {request.repo}")
    
    # TODO: Implement AI reasoning loop
    # 1. Clone repo to WORK_DIR
    # 2. Extract diff using MCP tool
    # 3. Analyze with LLM
    # 4. Plan fixes
    
    return {"message": "Analysis started", "pr_id": request.pr_id}

@app.post("/agent/apply")
async def apply_fix(request: AnalyzeRequest):
    """
    Endpoint to apply suggested fixes.
    """
    logger.info(f"Applying fix for PR {request.pr_id}")
    return {"message": "Fix application initiated", "pr_id": request.pr_id}

# Note: In a production setup, you might want to run the MCP server 
# as a separate process or integrated via a specific protocol.
# Here we've defined the tools that the agent will use internally.

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
