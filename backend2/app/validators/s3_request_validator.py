def normalize_bucket_base_name(value: str) -> str:
    import re

    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9-]+", "-", value.lower().strip())).strip("-")

def is_valid_bucket_name(value: str) -> bool:
    import re
    return re.fullmatch(r"[a-z0-9][a-z0-9-]{1,61}[a-z0-9]", value) is not None

def is_valid_document_name(value: str) -> bool:
    import re
    return re.fullmatch(r"[A-Za-z0-9._/-]+", value) is not None

def is_non_empty_string(value) -> bool:
    return isinstance(value, str) and value.strip() != ""

def validate_aws_s3_request(input_data: dict) -> dict:
    errors: list[str] = []
    params = dict(input_data["parameters"])

    environment = params.get("environment", "")
    environment = environment.lower().strip() if isinstance(environment, str) else ""

    website_hosting_enabled = bool(params.get("website_hosting_enabled"))

    if not is_non_empty_string(params.get("bucket_name")):
        errors.append("Bucket name is required.")

    if is_non_empty_string(params.get("bucket_name")):
        normalized_base = normalize_bucket_base_name(params["bucket_name"])

        if not normalized_base:
            errors.append("Bucket name is invalid after normalization.")
        else:
            short_request_id = input_data["requestId"].replace("req-", "")[:8]
            final_bucket_name = f"{normalized_base}-{short_request_id}"

            if len(final_bucket_name) > 63:
                errors.append(
                    f"Final bucket name '{final_bucket_name}' exceeds the 63 character limit."
                )

            if not is_valid_bucket_name(final_bucket_name):
                errors.append(
                    f"Final bucket name '{final_bucket_name}' is invalid. Use lowercase letters, numbers, and hyphens only."
                )

            params["bucket_name"] = final_bucket_name

    if environment not in ["dev", "qa", "prod", "agile"]:
        errors.append("Environment must be one of: dev, qa, agile, prod.")

    if not isinstance(params.get("encryption_enabled"), bool):
        params["encryption_enabled"] = True

    if website_hosting_enabled:
        if not is_non_empty_string(params.get("index_document")):
            errors.append("Index document is required when static website hosting is enabled.")
        elif not is_valid_document_name(params["index_document"]):
            errors.append("Index document name is invalid.")

        if is_non_empty_string(params.get("error_document")) and not is_valid_document_name(params["error_document"]):
            errors.append("Error document name is invalid.")
    else:
        params["index_document"] = ""
        params["error_document"] = ""

    if not is_non_empty_string(params.get("tag_owner")):
        errors.append("Tag Owner is required.")

    if not is_non_empty_string(params.get("tag_cost_center")):
        errors.append("Tag Cost Center is required.")

    if not is_non_empty_string(params.get("tag_project")):
        errors.append("Tag Project is required.")

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "normalizedParameters": params if len(errors) == 0 else None,
    }