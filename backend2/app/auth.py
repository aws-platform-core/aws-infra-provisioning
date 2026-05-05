import httpx
from jose import jwt
from fastapi import Header, HTTPException, Depends
from app.config import settings

if not settings.AWS_REGION or not settings.COGNITO_USER_POOL_ID or not settings.COGNITO_CLIENT_ID:
    raise RuntimeError("Missing Cognito environment variables")

ISSUER = f"https://cognito-idp.{settings.AWS_REGION}.amazonaws.com/{settings.COGNITO_USER_POOL_ID}"
JWKS_URL = f"{ISSUER}/.well-known/jwks.json"

_jwks_cache = None

async def get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        async with httpx.AsyncClient() as client:
            response = await client.get(JWKS_URL)
            response.raise_for_status()
            _jwks_cache = response.json()
    return _jwks_cache

async def verify_token(token: str) -> dict:
    jwks = await get_jwks()
    unverified_header = jwt.get_unverified_header(token)

    key = next((k for k in jwks["keys"] if k["kid"] == unverified_header["kid"]), None)
    if not key:
        raise HTTPException(status_code=401, detail="Unauthorized")

    payload = jwt.decode(
        token,
        key,
        algorithms=[unverified_header["alg"]],
        issuer=ISSUER,
        options={
            "verify_aud": False,
            "verify_at_hash": False,
        },
    )

    token_use = payload.get("token_use")
    if token_use not in ["id", "access"]:
        raise HTTPException(status_code=401, detail="Unauthorized")

    aud = payload.get("aud")
    client_id = payload.get("client_id")

    if aud and aud != settings.COGNITO_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if client_id and client_id != settings.COGNITO_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return payload

async def auth_middleware(authorization: str | None = Header(default=None)) -> dict:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0] != "Bearer":
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = parts[1]
    return await verify_token(token)