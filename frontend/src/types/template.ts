export type TemplateField = {
    name: string;
    label: string;
    type: "string" | "number" | "boolean" | "select";
    required?: boolean;
    default?: any;
    options?: string[];
    placeholder?: string;
    helperText?: string;
  };
  
  export type Template = {
    id: string;
    name: string;
    description: string;
    category: string;
    parameters: TemplateField[];
  };