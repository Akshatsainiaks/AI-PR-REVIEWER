import os
from pydantic_settings import BaseSettings
from typing import Optional







class Settings(BaseSettings):
    ENV: str = "development"
    PORT: int = 8000
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gpt-4o"
    GITHUB_TOKEN: Optional[str] = None
    NODE_SERVICE_URL: str = "http://localhost:3000"
    WORK_DIR: str = "/tmp/ai-agent-workspace"

    class Config:
        env_file = ".env"


settings = Settings()
