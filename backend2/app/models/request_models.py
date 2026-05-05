from typing import Any, Optional
from pydantic import BaseModel

class CreateRequestPayload(BaseModel):
    template_id: Optional[str] = None
    parameters: dict[str, Any] | None = None

class CostEstimatePayload(BaseModel):
    parameters: dict[str, Any] | None = None

class RequestRecord(BaseModel):
    request_id: str
    requested_by: str
    requested_by_sub: str
    provider: str
    template_id: str
    parameters: dict[str, Any]
    status: str
    branch_name: str
    pr_url: str
    pr_number: int
    created_at: str
    updated_at: str