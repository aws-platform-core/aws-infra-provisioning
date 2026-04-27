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