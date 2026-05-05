from app.config import settings

if not settings.TF_BACKEND_BUCKET or not settings.TF_BACKEND_LOCK_TABLE or not settings.TF_BACKEND_REGION:
    raise RuntimeError("Missing TF_BACKEND_BUCKET, TF_BACKEND_LOCK_TABLE, or TF_BACKEND_REGION")

def infer_terraform_type(value):
    if isinstance(value, str):
        return "string"
    if isinstance(value, bool):
        return "bool"
    if isinstance(value, (int, float)):
        return "number"
    if isinstance(value, list):
        return "list(any)"
    if isinstance(value, dict):
        return "map(any)"
    return "any"

def build_module_assignments(parameters: dict) -> str:
    variable_names = list(parameters.keys())
    if not variable_names:
        return ""

    max_key_length = max(len(key) for key in variable_names)
    return "\n".join(
        f"  {key.ljust(max_key_length)} = var.{key}" for key in variable_names
    )

def build_variable_blocks(parameters: dict) -> str:
    blocks = [
        """variable "aws_region" {
  type = string
}"""
    ]

    for key, value in parameters.items():
        tf_type = infer_terraform_type(value)
        blocks.append(
f'''variable "{key}" {{
  type = {tf_type}
}}'''
        )

    return "\n\n".join(blocks)

def generate_terraform_files(input_data: dict) -> list[dict]:
    request_id = input_data["requestId"]
    provider = input_data["provider"]
    template_id = input_data["templateId"]
    module_source = input_data["moduleSource"]
    parameters = input_data["parameters"]
    requested_by = input_data["requestedBy"]
    created_at = input_data["createdAt"]

    stack_dir = f"stacks/{request_id}"
    module_assignments = build_module_assignments(parameters)
    variables_tf = build_variable_blocks(parameters)

    module_block = f'''module "stack" {{
  source = "{module_source}"'''

    if module_assignments:
        module_block += f"\n\n{module_assignments}"

    module_block += "\n}\n"

    main_tf = f'''terraform {{
  required_version = ">= 1.5.0"

  required_providers {{
    aws = {{
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }}
  }}

  backend "s3" {{
    bucket         = "{settings.TF_BACKEND_BUCKET}"
    key            = "infra-requests/{request_id}/terraform.tfstate"
    region         = "{settings.TF_BACKEND_REGION}"
    encrypt        = true
    dynamodb_table = "{settings.TF_BACKEND_LOCK_TABLE}"
  }}
}}

provider "aws" {{
  region = var.aws_region
}}

{module_block}'''

    import json

    tfvars_json = json.dumps(
        {
            "aws_region": settings.TF_BACKEND_REGION,
            **parameters,
        },
        indent=2,
    )

    metadata_json = json.dumps(
        {
            "request_id": request_id,
            "provider": provider,
            "template_id": template_id,
            "requested_by": requested_by,
            "created_at": created_at,
            "backend": {
                "bucket": settings.TF_BACKEND_BUCKET,
                "lock_table": settings.TF_BACKEND_LOCK_TABLE,
                "region": settings.TF_BACKEND_REGION,
            },
        },
        indent=2,
    )

    return [
        {"path": f"{stack_dir}/main.tf", "content": main_tf},
        {"path": f"{stack_dir}/variables.tf", "content": variables_tf},
        {"path": f"{stack_dir}/terraform.tfvars.json", "content": tfvars_json},
        {"path": f"{stack_dir}/metadata.json", "content": metadata_json},
    ]