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