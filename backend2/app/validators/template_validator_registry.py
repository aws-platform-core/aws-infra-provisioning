from app.validators.s3_request_validator import validate_aws_s3_request

template_validator_map = {
    "aws-s3-bucket": validate_aws_s3_request,
}

def run_template_validator(template_id: str, input_data: dict) -> dict:
    validator = template_validator_map.get(template_id)
    if not validator:
        return {
            "valid": True,
            "errors": [],
            "normalizedParameters": input_data["parameters"],
        }

    return validator(input_data)