import os
import json
import logging
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class PRAgent:
    """
    AI Agent responsible for analyzing code changes and generating fixes.
    Uses Groq LLM for reasoning and code generation.
    """

    def __init__(self):
        """
        Initializes the PRAgent with API keys and model configuration.
        
        Raises:
            ValueError: If GROQ_API_KEY is not found in environment.
        """
        self.api_key = os.getenv("GROQ_API_KEY")
        self.model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in environment")

        self.client = Groq(api_key=self.api_key, max_retries=6)

    def analyze_diff(self, diff_text: str) -> dict:
        """
        Analyzes a git diff using Groq LLM to identify bugs and security issues.

        Args:
            diff_text: The unified git diff string to analyze.

        Returns:
            dict: Structured analysis containing 'is_correct', 'summary', 
                  'problems', and 'fix_suggested'.
        """
        max_chars = 12000
        if len(diff_text) > max_chars:
            logger.warning(f"Diff length {len(diff_text)} exceeds {max_chars} chars. Truncating.")
            diff_text = diff_text[:max_chars] + "\n... [DIFF TRUNCATED DUE TO LENGTH] ..."

        prompt = f"""
        Analyze the following git diff and identify any potential bugs, security issues, or code quality problems.
        Provide your analysis in a structured JSON format with the following keys:
        - "is_correct": boolean (true if no issues found)
        - "summary": a brief summary of the changes
        - "problems": a list of objects, each with:
            - "file": path to the file
            - "issue": description of the problem
            - "severity": "low", "medium", or "high"
            - "suggestion": how to fix it
        - "fix_suggested": boolean (true if the AI should attempt to fix these)

        GIT DIFF:
        {diff_text}

        JSON OUTPUT:
        """

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert software engineer. Always respond with valid JSON.",
                    },
                    {"role": "user", "content": prompt},
                ],
                model=self.model,
                response_format={"type": "json_object"},
            )

            response_content = response.choices[0].message.content
            if not response_content:
                throw_err = "Empty response from LLM"
                raise ValueError(throw_err)
                
            analysis = json.loads(response_content)
            logger.info(f"AI Analysis: {analysis}")
            return analysis
        except Exception as e:
            logger.error(f"Error analyzing diff: {str(e)}", exc_info=True)
            return {
                "error": str(e),
                "is_correct": False,
                "problems": [
                    {
                        "file": "unknown",
                        "issue": f"AI analysis failed: {str(e)}",
                        "severity": "high",
                        "suggestion": "Check server logs for traceback",
                    }
                ],
            }

    def generate_fix(
        self, diff_text: str, file_path: str, original_content: str
    ) -> str:
        """
        Generates fixed content for a specific file based on a diff and identified issues.

        Args:
            diff_text: The diff that introduced the issues.
            file_path: Relative path to the file being fixed.
            original_content: Current content of the file.

        Returns:
            str: The entire corrected file content. Returns original if generation fails.
        """
        if len(original_content) > 50000:
            logger.warning(f"File {file_path} too large ({len(original_content)} chars). Skipping fix generation.")
            return original_content

        max_diff_chars = 4000
        if len(diff_text) > max_diff_chars:
            diff_text = diff_text[:max_diff_chars] + "\n... [DIFF TRUNCATED DUE TO LENGTH] ..."

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
                    {
                        "role": "system",
                        "content": "You are an expert developer. Provide only the raw source code. No conversational text.",
                    },
                    {"role": "user", "content": prompt},
                ],
                model=self.model,
            )

            fixed_content = response.choices[0].message.content.strip()
            
            # More robust markdown block removal
            cleaned_content = self._strip_markdown_code_blocks(fixed_content)
            
            return cleaned_content or original_content
        except Exception as e:
            logger.error(f"Error generating fix for {file_path}: {str(e)}", exc_info=True)
            return original_content

    def _strip_markdown_code_blocks(self, content: str) -> str:
        """
        Removes markdown code block delimiters (```) from LLM output.

        Args:
            content: Raw string from LLM.

        Returns:
            str: Content without code block fences.
        """
        # Remove opening fence (e.g., ```python or ```)
        content = re.sub(r"^```[a-zA-Z]*\n", "", content)
        # Remove closing fence
        content = re.sub(r"\n```$", "", content)
        return content.strip()
