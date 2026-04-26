const backendBucket = process.env.TF_BACKEND_BUCKET;
const backendLockTable = process.env.TF_BACKEND_LOCK_TABLE;
const backendRegion = process.env.TF_BACKEND_REGION || process.env.AWS_REGION;
if (!backendBucket || !backendLockTable || !backendRegion) {
    throw new Error("Missing TF_BACKEND_BUCKET, TF_BACKEND_LOCK_TABLE, or TF_BACKEND_REGION");
}
function inferTerraformType(value) {
    if (typeof value === "string")
        return "string";
    if (typeof value === "number")
        return "number";
    if (typeof value === "boolean")
        return "bool";
    if (Array.isArray(value))
        return "list(any)";
    if (typeof value === "object" && value !== null)
        return "map(any)";
    return "any";
}
function buildModuleAssignments(parameters) {
    const variableNames = Object.keys(parameters);
    if (variableNames.length === 0) {
        return "";
    }
    const maxKeyLength = variableNames.reduce((max, key) => Math.max(max, key.length), 0);
    return variableNames
        .map((key) => `  ${key.padEnd(maxKeyLength)} = var.${key}`)
        .join("\n");
}
function buildVariableBlocks(parameters) {
    const variableNames = Object.keys(parameters);
    const blocks = [
        `variable "aws_region" {
  type = string
}`,
        ...variableNames.map((key) => {
            const inferredType = inferTerraformType(parameters[key]);
            return `variable "${key}" {
  type = ${inferredType}
}`;
        }),
    ];
    return blocks.join("\n\n");
}
export function generateTerraformFiles(input) {
    const stackDir = `stacks/${input.requestId}`;
    const moduleAssignments = buildModuleAssignments(input.parameters);
    const variablesTf = buildVariableBlocks(input.parameters);
    const mainTf = `terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }

  backend "s3" {
    bucket         = "${backendBucket}"
    key            = "infra-requests/${input.requestId}/terraform.tfstate"
    region         = "${backendRegion}"
    encrypt        = true
    dynamodb_table = "${backendLockTable}"
  }
}

provider "aws" {
  region = var.aws_region
}

module "stack" {
  source = "${input.moduleSource}"
${moduleAssignments ? `\n\n${moduleAssignments}` : ""}
}
`;
    const tfvarsJson = JSON.stringify({
        aws_region: backendRegion,
        ...input.parameters,
    }, null, 2);
    const metadataJson = JSON.stringify({
        request_id: input.requestId,
        provider: input.provider,
        template_id: input.templateId,
        requested_by: input.requestedBy,
        created_at: input.createdAt,
        backend: {
            bucket: backendBucket,
            lock_table: backendLockTable,
            region: backendRegion,
        },
    }, null, 2);
    return [
        {
            path: `${stackDir}/main.tf`,
            content: mainTf,
        },
        {
            path: `${stackDir}/variables.tf`,
            content: variablesTf,
        },
        {
            path: `${stackDir}/terraform.tfvars.json`,
            content: tfvarsJson,
        },
        {
            path: `${stackDir}/metadata.json`,
            content: metadataJson,
        },
    ];
}
