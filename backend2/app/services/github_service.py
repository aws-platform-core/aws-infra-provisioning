import base64
import httpx
from app.config import settings

if not settings.GITHUB_TOKEN or not settings.GITHUB_OWNER or not settings.GITHUB_REPO:
    raise RuntimeError("Missing GitHub configuration")

BASE_URL = "https://api.github.com"

def _headers():
    return {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"token {settings.GITHUB_TOKEN}",
    }

async def get_resolved_base_branch() -> str:
    if settings.GITHUB_BASE_BRANCH:
        return settings.GITHUB_BASE_BRANCH

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/repos/{settings.GITHUB_OWNER}/{settings.GITHUB_REPO}",
            headers=_headers(),
        )
        response.raise_for_status()
        return response.json()["default_branch"]

async def get_base_branch_sha() -> dict:
    branch = await get_resolved_base_branch()

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/repos/{settings.GITHUB_OWNER}/{settings.GITHUB_REPO}/git/ref/heads/{branch}",
            headers=_headers(),
        )
        response.raise_for_status()
        data = response.json()

    return {"branch": branch, "sha": data["object"]["sha"]}

async def create_branch(branch_name: str, sha: str) -> None:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/repos/{settings.GITHUB_OWNER}/{settings.GITHUB_REPO}/git/refs",
            headers=_headers(),
            json={
                "ref": f"refs/heads/{branch_name}",
                "sha": sha,
            },
        )
        response.raise_for_status()

async def get_file_sha(path: str, branch: str) -> str | None:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{BASE_URL}/repos/{settings.GITHUB_OWNER}/{settings.GITHUB_REPO}/contents/{path}",
            headers=_headers(),
            params={"ref": branch},
        )

        if response.status_code == 404:
            return None

        response.raise_for_status()
        data = response.json()

        if isinstance(data, dict) and "sha" in data:
            return data["sha"]

        return None

async def upsert_file(path: str, content: str, branch: str, message: str) -> None:
    sha = await get_file_sha(path, branch)

    payload = {
        "message": message,
        "content": base64.b64encode(content.encode("utf-8")).decode("utf-8"),
        "branch": branch,
    }

    if sha:
        payload["sha"] = sha

    async with httpx.AsyncClient() as client:
        response = await client.put(
            f"{BASE_URL}/repos/{settings.GITHUB_OWNER}/{settings.GITHUB_REPO}/contents/{path}",
            headers=_headers(),
            json=payload,
        )
        response.raise_for_status()

async def create_pull_request(branch_name: str, title: str, body: str) -> dict:
    base_branch = await get_resolved_base_branch()

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/repos/{settings.GITHUB_OWNER}/{settings.GITHUB_REPO}/pulls",
            headers=_headers(),
            json={
                "title": title,
                "head": branch_name,
                "base": base_branch,
                "body": body,
            },
        )
        response.raise_for_status()
        data = response.json()

    return {"number": data["number"], "url": data["html_url"]}