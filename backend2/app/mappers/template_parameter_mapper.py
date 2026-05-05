def map_template_parameters_to_module_inputs(
    template_id: str,
    parameters: dict,
) -> dict:
    if template_id == "aws-s3-bucket":
        return {
            "bucket_name": parameters.get("bucket_name"),
            "environment": parameters.get("environment"),
            "versioning": parameters.get("versioning"),
            "encryption_enabled": parameters.get("encryption_enabled"),
            "website_hosting_enabled": parameters.get("website_hosting_enabled"),
            "index_document": parameters.get("index_document"),
            "error_document": parameters.get("error_document"),
            "tags": {
                "Owner": parameters.get("tag_owner"),
                "CostCenter": parameters.get("tag_cost_center"),
                "Project": parameters.get("tag_project"),
                "Environment": parameters.get("environment"),
            },
        }

    return parameters