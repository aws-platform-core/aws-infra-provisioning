function normalizeBucketBaseName(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}
function isValidBucketName(value) {
    return /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(value);
}
function isValidDocumentName(value) {
    return /^[A-Za-z0-9._/-]+$/.test(value);
}
function isNonEmptyString(value) {
    return typeof value === "string" && value.trim() !== "";
}
export function validateAwsS3Request(input) {
    const errors = [];
    const params = { ...input.parameters };
    const environment = typeof params.environment === "string" ? params.environment.toLowerCase().trim() : "";
    const websiteHostingEnabled = Boolean(params.website_hosting_enabled);
    if (!isNonEmptyString(params.bucket_name)) {
        errors.push("Bucket name is required.");
    }
    if (isNonEmptyString(params.bucket_name)) {
        const normalizedBase = normalizeBucketBaseName(params.bucket_name);
        if (!normalizedBase) {
            errors.push("Bucket name is invalid after normalization.");
        }
        else {
            const shortRequestId = input.requestId.replace("req-", "").slice(0, 8);
            const finalBucketName = `${normalizedBase}-${shortRequestId}`;
            if (finalBucketName.length > 63) {
                errors.push(`Final bucket name '${finalBucketName}' exceeds the 63 character limit.`);
            }
            if (!isValidBucketName(finalBucketName)) {
                errors.push(`Final bucket name '${finalBucketName}' is invalid. Use lowercase letters, numbers, and hyphens only.`);
            }
            params.bucket_name = finalBucketName;
        }
    }
    if (!["dev", "qa", "prod"].includes(environment)) {
        errors.push("Environment must be one of: dev, qa, prod.");
    }
    if (typeof params.encryption_enabled !== "boolean") {
        params.encryption_enabled = true;
    }
    if (websiteHostingEnabled) {
        if (!isNonEmptyString(params.index_document)) {
            errors.push("Index document is required when static website hosting is enabled.");
        }
        else if (!isValidDocumentName(params.index_document)) {
            errors.push("Index document name is invalid.");
        }
        if (isNonEmptyString(params.error_document) &&
            !isValidDocumentName(params.error_document)) {
            errors.push("Error document name is invalid.");
        }
    }
    else {
        params.index_document = "";
        params.error_document = "";
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
