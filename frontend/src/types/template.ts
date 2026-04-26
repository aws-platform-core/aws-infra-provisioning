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
};

export type Template = {
  id: string;
  provider: string;
  name: string;
  description: string;
  category: string;
  parameters: TemplateField[];
};