from datetime import datetime, timezone
import ssl
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.auth import auth_middleware
from app.templates import templates
from app.models.request_models import CreateRequestPayload, CostEstimatePayload
from app.repositories.request_repository import (
    create_request,
    get_request_by_id,
    list_requests_by_user,
)
from app.services.cost_estimator import estimate_template_cost
from app.services.request_provisioning_service import provision_request_via_pull_request
from app.mappers.template_parameter_mapper import map_template_parameters_to_module_inputs
from app.validators.template_validator_registry import run_template_validator

app = FastAPI(title="Infra Provisioning Backend")

allowed_origins = [
    "http://localhost:5173",
    "https://aip.odido.nl:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/templates")
async def get_templates(user=Depends(auth_middleware)):
    return [t.model_dump() for t in templates]

@app.get("/api/templates/{template_id}")
async def get_template(template_id: str, user=Depends(auth_middleware)):
    template = next((t for t in templates if t.id == template_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template.model_dump()

@app.post("/api/templates/{template_id}/cost-estimate")
async def cost_estimate(
    template_id: str,
    payload: CostEstimatePayload,
    user=Depends(auth_middleware),
):
    template = next((t for t in templates if t.id == template_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    return estimate_template_cost(template_id, payload.parameters or {})

@app.post("/api/requests")
async def create_request_endpoint(
    payload: CreateRequestPayload,
    user=Depends(auth_middleware),
):
    print("Incoming /api/requests body:", payload.model_dump())
    print("AWS_REGION:", settings.AWS_REGION)
    print("DYNAMODB_REQUESTS_TABLE:", settings.DYNAMODB_REQUESTS_TABLE)

    template = next((t for t in templates if t.id == payload.template_id), None)
    if not template:
        raise HTTPException(status_code=400, detail="Invalid template_id")

    parameters = payload.parameters or {}

    for field in template.parameters:
        if field.required:
            value = parameters.get(field.name)
            if value is None or value == "":
                raise HTTPException(status_code=400, detail=f"{field.label} is required")

    request_id = f"req-{int(datetime.now().timestamp() * 1000)}"

    requested_by = (
        user.get("given_name")
        or user.get("email")
        or user.get("cognito:username")
        or user.get("sub")
        or "unknown"
    )

    requested_by_sub = user.get("sub", "unknown")
    now = datetime.now(timezone.utc).isoformat()

    final_parameters = dict(parameters)

    validation_result = run_template_validator(
        template.id,
        {
            "requestId": request_id,
            "parameters": final_parameters,
        },
    )

    if not validation_result["valid"]:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Template request validation failed",
                "errors": validation_result["errors"],
            },
        )

    final_parameters = validation_result.get("normalizedParameters") or final_parameters
    module_inputs = map_template_parameters_to_module_inputs(template.id, final_parameters)

    provision_result = await provision_request_via_pull_request(
        {
            "requestId": request_id,
            "provider": template.provider,
            "templateId": template.id,
            "moduleSource": f"../../modules/{payload.template_id}",
            "parameters": module_inputs,
            "requestedBy": requested_by,
            "createdAt": now,
        }
    )

    record = {
        "request_id": request_id,
        "requested_by": requested_by,
        "requested_by_sub": requested_by_sub,
        "template_id": payload.template_id,
        "parameters": final_parameters,
        "provider": template.provider,
        "status": "PR_CREATED",
        "pr_url": provision_result["prUrl"],
        "branch_name": f"feature/{request_id}-{payload.template_id}",
        "pr_number": provision_result["prNumber"],
        "created_at": now,
        "updated_at": now,
    }

    print("About to write record to DynamoDB:", record)
    create_request(record)
    print("Successfully wrote record to DynamoDB")

    return record

@app.get("/api/requests")
async def get_requests(user=Depends(auth_middleware)):
    requested_by_sub = user.get("sub")
    if not requested_by_sub:
        raise HTTPException(status_code=400, detail="User sub not found in token")

    return list_requests_by_user(requested_by_sub)

@app.get("/api/requests/{request_id}")
async def get_request(request_id: str, user=Depends(auth_middleware)):
    item = get_request_by_id(request_id)
    if not item:
        raise HTTPException(status_code=404, detail="Request not found")

    requested_by_sub = user.get("sub")
    if item.get("requested_by_sub") != requested_by_sub:
        raise HTTPException(status_code=403, detail="Forbidden")

    return item