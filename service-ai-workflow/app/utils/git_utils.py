import os
import git
import shutil
import logging

logger = logging.getLogger(__name__)

def clone_repository(repo_url: str, local_path: str, github_token: str = None):
    """
    Clones a GitHub repository to a local directory.
    If github_token is provided, it uses it for authentication.
    """
    if os.path.exists(local_path):
        logger.info(f"Removing existing directory: {local_path}")
        shutil.rmtree(local_path)
    
    os.makedirs(local_path, exist_ok=True)
    
    # Format URL with token if available
    if github_token and repo_url.startswith("https://github.com/"):
        auth_url = repo_url.replace("https://github.com/", f"https://x-access-token:{github_token}@github.com/")
    else:
        auth_url = repo_url
        
    logger.info(f"Cloning {repo_url} to {local_path}")
    repo = git.Repo.clone_from(auth_url, local_path)
    return repo

def create_branch(repo_path: str, branch_name: str, base_branch: str = "main"):
    """
    Creates and checks out a new branch.
    """
    repo = git.Repo(repo_path)
    
    # Ensure base branch is up to date
    repo.git.checkout(base_branch)
    repo.git.pull()
    
    # Create and checkout new branch
    new_branch = repo.create_head(branch_name)
    new_branch.checkout()
    logger.info(f"Created and checked out branch: {branch_name}")
    return repo

def commit_and_push(repo_path: str, message: str, branch_name: str):
    """
    Commits all changes and pushes to the remote branch.
    """
    repo = git.Repo(repo_path)
    repo.git.add(A=True)
    repo.index.commit(message)
    origin = repo.remote(name='origin')
    origin.push(branch_name)
    logger.info(f"Committed and pushed to {branch_name}")
