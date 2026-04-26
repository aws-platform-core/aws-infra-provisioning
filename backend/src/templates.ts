export type TemplateField = {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "select";
  required?: boolean;
  default?: unknown;
  options?: string[];
  placeholder?: string;
  helperText?: string;
};

export type Template = {
  id: string;
  provider: string;
  name: string;
  description: string;
  category: string;
  parameters: TemplateField[];
};

export const templates: Template[] = [
  {
    id: "aws-s3-bucket",
    name: "AWS S3 Bucket",
    description: "Provision a secure S3 bucket",
    category: "storage",
    provider: "aws",
    parameters: [
      {
        name: "bucket_name",
        label: "Bucket Name",
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
    id: "aws-lambda-function",
    name: "AWS Lambda Function",
    description: "Provision a serverless Lambda function",
    category: "compute",
    provider: "aws",
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