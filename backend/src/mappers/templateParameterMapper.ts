export function mapTemplateParametersToModuleInputs(
  templateId: string,
  parameters: Record<string, unknown>
): Record<string, unknown> {
  switch (templateId) {
    case "aws-s3-bucket":
      return {
        bucket_name: parameters.bucket_name,
        environment: parameters.environment,
        versioning: parameters.versioning,
        encryption_enabled: parameters.encryption_enabled,
        website_hosting_enabled: parameters.website_hosting_enabled,
        index_document: parameters.index_document,
        error_document: parameters.error_document,
        tags: {
          Owner: parameters.tag_owner,
          CostCenter: parameters.tag_cost_center,
          Project: parameters.tag_project,
          Environment: parameters.environment,
        },
      };

    default:
      return parameters;
  }
}