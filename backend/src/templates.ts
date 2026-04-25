export type TemplateField = {
    name: string;
    label: string;
    type: "string" | "number" | "boolean" | "select";
    required?: boolean;
    default?: unknown;
    options?: string[];
  };
  
  export type Template = {
    id: string;
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
          options: ["dev", "qa", "prod"]
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
      id: "aws-ec2-instance",
      name: "AWS EC2 Instance",
      description: "Provision an EC2 instance",
      category: "compute",
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
    }
  ];