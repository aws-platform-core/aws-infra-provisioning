export const templates = [
    {
        id: "aws-s3-bucket",
        provider: "aws",
        name: "AWS S3 Bucket",
        description: "Provision a secure S3 bucket",
        category: "storage",
        terraform_module_path: "../../modules/aws-s3-bucket",
        parameters: [
            {
                name: "bucket_name",
                label: "Bucket Name",
                type: "string",
                required: true,
                placeholder: "my-app-results",
                helperText: "Enter the base bucket name. A unique suffix will be appended automatically during provisioning.",
                pattern: "^[a-z0-9]+(-[a-z0-9]+)+$",
                patternErrorMessage: "Bucket name must use lowercase letters/numbers and hyphens, for example: app-dev-results",
            },
            {
                name: "environment",
                label: "Environment",
                type: "select",
                required: true,
                options: ["dev", "agile", "prod"],
                default: "dev",
                helperText: "Target environment for this bucket.",
            },
            {
                name: "versioning",
                label: "Enable Versioning",
                type: "boolean",
                default: true,
                helperText: "Recommended for protection against accidental overwrite and delete.",
            },
            {
                name: "tag_owner",
                label: "Tag: Owner",
                type: "string",
                required: true,
                placeholder: "platform-team",
                helperText: "Owning team or individual.",
                pattern: "^[A-Za-z0-9._-]{2,50}$",
                patternErrorMessage: "Owner tag must be 2-50 characters and may include letters, numbers, dot, underscore, and hyphen.",
            },
            {
                name: "tag_cost_center",
                label: "Tag: Cost Center",
                type: "string",
                required: true,
                placeholder: "CC1234",
                helperText: "Cost center for billing and chargeback.",
                pattern: "^[A-Za-z0-9._-]{2,30}$",
                patternErrorMessage: "Cost center tag must be 2-30 characters and may include letters, numbers, dot, underscore, and hyphen.",
            },
            {
                name: "tag_project",
                label: "Tag: Project",
                type: "string",
                required: true,
                placeholder: "infra-demo",
                helperText: "Project or application name for tagging.",
                pattern: "^[A-Za-z0-9._-]{2,50}$",
                patternErrorMessage: "Project tag must be 2-50 characters and may include letters, numbers, dot, underscore, and hyphen.",
            },
            // Optional cost estimation inputs
            {
                name: "estimated_storage_gb",
                label: "Estimated Storage (GB)",
                type: "number",
                required: false,
                default: 100,
                helperText: "Optional. Used only for cost estimation, not for provisioning.",
                estimationOnly: true,
                min: 1,
                max: 100000
            },
            {
                name: "estimated_monthly_put_requests",
                label: "Estimated Monthly PUT/LIST Requests",
                type: "number",
                required: false,
                default: 100000,
                helperText: "Optional. Used only for cost estimation, not for provisioning.",
                estimationOnly: true,
                min: 0,
                max: 1000000000
            },
            {
                name: "estimated_monthly_get_requests",
                label: "Estimated Monthly GET Requests",
                type: "number",
                required: false,
                default: 1000000,
                helperText: "Optional. Used only for cost estimation, not for provisioning.",
                estimationOnly: true,
                min: 0,
                max: 1000000000
            }
        ],
    },
    {
        id: "aws-lambda-function",
        name: "AWS Lambda Function",
        description: "Provision a serverless Lambda function",
        category: "compute",
        provider: "aws",
        terraform_module_path: "../../modules/aws-lambda-function",
        parameters: [
            {
                name: "function_name",
                label: "Function Name",
                type: "string",
                required: true
            },
            {
                name: "environment",
                label: "Environment",
                type: "select",
                required: true,
                options: ["dev", "agile", "prod"]
            },
            {
                name: "versioning",
                label: "Enable Versioning",
                type: "boolean",
                default: true
            }
        ]
    },
    {
        id: "aws-api-gateway",
        name: "AWS API Gateway",
        description: "Provision a REST API Gateway",
        category: "network",
        provider: "aws",
        terraform_module_path: "../../modules/aws-api-gateway",
        parameters: [
            {
                name: "api_name",
                label: "API Name",
                type: "string",
                required: true
            },
            {
                name: "environment",
                label: "Environment",
                type: "select",
                required: true,
                options: ["dev", "agile", "prod"]
            },
            {
                name: "cors",
                label: "Enable CORS",
                type: "boolean",
                default: true
            }
        ]
    },
    {
        id: "aws-api-lambda-function",
        name: "AWS Lambda Function",
        description: "Provision a serverless Lambda function",
        category: "compute",
        provider: "aws",
        terraform_module_path: "../../modules/aws-lambda-function",
        parameters: [
            {
                name: "function_name",
                label: "Function Name",
                type: "string",
                required: true
            },
            {
                name: "environment",
                label: "Environment",
                type: "select",
                required: true,
                options: ["dev", "agile", "prod"]
            },
            {
                name: "versioning",
                label: "Enable Versioning",
                type: "boolean",
                default: true
            },
            {
                name: "cors",
                label: "Enable CORS",
                type: "boolean",
                default: true
            }
        ]
    },
    {
        id: "aws-ec2-instance",
        name: "AWS EC2 Instance",
        description: "Provision an EC2 instance",
        category: "compute",
        provider: "aws",
        terraform_module_path: "../../modules/aws-ec2-instance",
        parameters: [
            {
                name: "instance_name",
                label: "Instance Name",
                type: "string",
                required: true
            },
            {
                name: "instance_type",
                label: "Instance Type",
                type: "select",
                required: true,
                options: ["t3.small", "t3.medium", "t3.large"]
            },
            {
                name: "ebs_size",
                label: "EBS Size (GB)",
                type: "number",
                required: true,
                default: 20
            }
        ]
    },
    {
        id: "azure-storage-account",
        provider: "azure",
        name: "Azure Storage Account",
        description: "Provision an Azure Storage Account",
        category: "storage",
        terraform_module_path: "../../modules/azure-storage-bucket",
        parameters: [
            {
                name: "account_name",
                label: "Account Name",
                type: "string",
                required: true
            },
            {
                name: "location",
                label: "Location",
                type: "select",
                required: true,
                options: ["eastus", "westus", "centralus"]
            },
            {
                name: "sku",
                label: "SKU",
                type: "select",
                required: true,
                options: ["Standard_LRS", "Standard_GRS", "Premium_LRS"]
            }
        ]
    }
];
