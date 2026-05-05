import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PORT: int = int(os.getenv("PORT", "8080"))
    CORS_ORIGIN: str = os.getenv("CORS_ORIGIN", "http://localhost:5173")
    AWS_REGION: str = os.getenv("AWS_REGION", "")
    COGNITO_USER_POOL_ID: str = os.getenv("COGNITO_USER_POOL_ID", "")
    COGNITO_CLIENT_ID: str = os.getenv("COGNITO_CLIENT_ID", "")

    DYNAMODB_REQUESTS_TABLE: str = os.getenv("DYNAMODB_REQUESTS_TABLE", "")

    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")
    GITHUB_OWNER: str = os.getenv("GITHUB_OWNER", "")
    GITHUB_REPO: str = os.getenv("GITHUB_REPO", "")
    GITHUB_BASE_BRANCH: str | None = os.getenv("GITHUB_BASE_BRANCH")

    TF_BACKEND_BUCKET: str = os.getenv("TF_BACKEND_BUCKET", "")
    TF_BACKEND_LOCK_TABLE: str = os.getenv("TF_BACKEND_LOCK_TABLE", "")
    TF_BACKEND_REGION: str = os.getenv("TF_BACKEND_REGION", os.getenv("AWS_REGION", ""))

    HTTPS_CERT_PATH: str = os.getenv("HTTPS_CERT_PATH", "")
    HTTPS_KEY_PATH: str = os.getenv("HTTPS_KEY_PATH", "")

settings = Settings()