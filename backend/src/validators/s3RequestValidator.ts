export type TemplateValidationInput = {
    requestId: string;
    parameters: Record<string, unknown>;
  };
  
  export type TemplateValidationResult = {
    valid: boolean;
    errors: string[];
    normalizedParameters?: Record<string, unknown>;
  };
  
  function normalizeBucketBaseName(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  
  function isValidBucketName(value: string): boolean {
    return /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(value);
  }
  
  function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim() !== "";
  }
  
  export function validateAwsS3Request(
    input: TemplateValidationInput
  ): TemplateValidationResult {
    const errors: string[] = [];
    const params = { ...input.parameters };
  
    const environment =
      typeof params.environment === "string" ? params.environment : "";
  
    if (!isNonEmptyString(params.bucket_name)) {
      errors.push("Bucket name is required.");
    }
  
    if (isNonEmptyString(params.bucket_name)) {
      const normalizedBase = normalizeBucketBaseName(params.bucket_name);
  
      if (!normalizedBase) {
        errors.push("Bucket name is invalid after normalization.");
      } else {
        const shortRequestId = input.requestId.replace("req-", "").slice(0, 8);
        const finalBucketName = `${normalizedBase}-${shortRequestId}`;
  
        if (finalBucketName.length > 63) {
          errors.push(
            `Final bucket name '${finalBucketName}' exceeds the 63 character limit.`
          );
        }
  
        if (!isValidBucketName(finalBucketName)) {
          errors.push(
            `Final bucket name '${finalBucketName}' is invalid. Use lowercase letters, numbers, and hyphens only.`
          );
        }
  
        params.bucket_name = finalBucketName;
      }
    }
  
    if (!["dev", "agile", "prod"].includes(environment)) {
      errors.push("Environment must be one of: dev, agile, prod.");
    }
  
    if (!isNonEmptyString(params.tag_owner)) {
      errors.push("Tag Owner is required.");
    }
  
    if (!isNonEmptyString(params.tag_cost_center)) {
      errors.push("Tag Cost Center is required.");
    }
  
    if (!isNonEmptyString(params.tag_project)) {
      errors.push("Tag Project is required.");
    }
  
    return {
      valid: errors.length === 0,
      errors,
      normalizedParameters: errors.length === 0 ? params : undefined,
    };
  }