export type TemplateField = {
  name: string;
  label: string;
  type: "string" | "number" | "boolean" | "select";
  required?: boolean;
  default?: unknown;
  options?: string[];
  placeholder?: string;
  helperText?: string;
  pattern?: string;
  patternErrorMessage?: string;
  estimationOnly?: boolean; // To indicate if this parameter is only for cost estimation
  min?: number;
  max?: number;
  showWhen?: {
    field: string;
    equals: unknown;
  };
};

export type Template = {
  id: string;
  provider: string;
  name: string;
  description: string;
  category: string;
  parameters: TemplateField[];
};