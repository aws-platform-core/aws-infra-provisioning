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
  
  function isValidKmsArn(value: string): boolean {
    return /^arn:aws:kms:[a-z0-9-]+:[0-9]{12}:key\/[A-Za-z0-9-]+$/.test(value);
  }
  
  function isValidDocumentName(value: string): boolean {
    return /^[A-Za-z0-9._/-]+$/.test(value);
  }
  
  function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim() !== "";
  }
  
  export function validateAwsS3Request(
    input: TemplateValidationInput
  ): TemplateValidationResult {
    const errors: string[] = [];
    const params = { ...input.parameters };
  
    const environment = typeof params.environment === "string" ? params.environment : "";
    const encryptionMode =
      typeof params.encryption_mode === "string" ? params.encryption_mode : "sse-s3";
    const websiteHostingEnabled = Boolean(params.website_hosting_enabled);
    const forceDestroy = Boolean(params.force_destroy);
  
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
  
    if (!["sse-s3", "kms"].includes(encryptionMode)) {
      errors.push("Encryption mode must be either 'sse-s3' or 'kms'.");
    }
  
    if (encryptionMode === "kms") {
      if (!isNonEmptyString(params.kms_key_arn)) {
        errors.push("KMS Key ARN is required when encryption mode is 'kms'.");
      } else if (!isValidKmsArn(params.kms_key_arn)) {
        errors.push("KMS Key ARN is invalid.");
      }
    } else {
      params.kms_key_arn = "";
    }
  
    const lifecyclePolicyType =
      typeof params.lifecycle_policy_type === "string"
        ? params.lifecycle_policy_type
        : "none";
  
    if (
      !["none", "logs-30-delete-365", "archive-30-90", "glacier-60"].includes(
        lifecyclePolicyType
      )
    ) {
      errors.push("Lifecycle policy type is invalid.");
    }
  
    if (websiteHostingEnabled) {
      if (!isNonEmptyString(params.index_document)) {
        errors.push("Index document is required when static website hosting is enabled.");
      } else if (!isValidDocumentName(params.index_document)) {
        errors.push("Index document name is invalid.");
      }
  
      if (
        isNonEmptyString(params.error_document) &&
        !isValidDocumentName(params.error_document)
      ) {
        errors.push("Error document name is invalid.");
      }
    } else {
      params.index_document = "";
      params.error_document = "";
    }
  
    if (forceDestroy && environment === "prod") {
      errors.push("Force destroy is not allowed for production buckets.");
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