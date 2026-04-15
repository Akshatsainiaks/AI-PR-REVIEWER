import os
import json
import logging
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class PRAgent:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in environment")
        
        self.client = Groq(api_key=self.api_key)

    def analyze_diff(self, diff_text: str) -> dict:
        """
        Analyzes a git diff using Groq LLM.
        """
        prompt = f"""
        Analyze the following git diff and identify any potential bugs, security issues, or code quality problems.
        Provide your analysis in a structured JSON format with the following keys:
        - "is_correct": boolean, true if the code is correct and follows best practices.
        - "issues": list of strings, each describing a specific issue found.
        - "fix_suggested": boolean, true if a fix is needed.
        - "summary": a brief summary of your analysis.

        GIT DIFF:
        {diff_text}

        JSON OUTPUT:
        """
        
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are an expert software engineer and code reviewer."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                response_format={"type": "json_object"}
            )
            
            analysis = json.loads(response.choices[0].message.content)
            logger.info(f"AI Analysis: {analysis}")
            return analysis
        except Exception as e:
            logger.error(f"Error analyzing diff: {str(e)}")
            return {"error": str(e), "is_correct": False, "issues": ["AI analysis failed"]}

    def generate_fix(self, diff_text: str, file_path: str, original_content: str) -> str:
        """
        Generates fixed content for a file.
        """
        prompt = f"""
        The following file has issues identified in a recent change (diff).
        Your task is to provide the ENTIRE corrected content of the file.
        
        FILE PATH: {file_path}
        
        ORIGINAL CONTENT:
        ```
        {original_content}
        ```
        
        GIT DIFF CAUSING ISSUES:
        {diff_text}
        
        Please return ONLY the corrected file content, no explanations or markdown blocks.
        """
        
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are an expert developer. Provide only the raw source code."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model
            )
            
            fixed_content = response.choices[0].message.content.strip()
            # Remove markdown code blocks if the LLM included them
            if fixed_content.startswith("```"):
                lines = fixed_content.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].strip() == "```":
                    lines = lines[:-1]
                fixed_content = "\n".join(lines).strip()
                
            return fixed_content
        except Exception as e:
            logger.error(f"Error generating fix: {str(e)}")
            return original_content
