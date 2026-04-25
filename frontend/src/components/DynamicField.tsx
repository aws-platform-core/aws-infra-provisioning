import {
    TextField,
    FormControlLabel,
    Checkbox,
    MenuItem,
  } from "@mui/material";
  import { TemplateField } from "../types/template";
  
  type Props = {
    field: TemplateField;
    value: any;
    onChange: (name: string, value: any) => void;
  };
  
  export default function DynamicField({ field, value, onChange }: Props) {
    switch (field.type) {
      case "boolean":
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => onChange(field.name, e.target.checked)}
              />
            }
            label={field.label}
          />
        );
  
      case "select":
        return (
          <TextField
            select
            fullWidth
            label={field.label}
            value={value ?? ""}
            required={field.required}
            onChange={(e) => onChange(field.name, e.target.value)}
            helperText={field.helperText}
          >
            {field.options?.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        );
  
      case "number":
        return (
          <TextField
            type="number"
            fullWidth
            label={field.label}
            value={value ?? ""}
            required={field.required}
            placeholder={field.placeholder}
            helperText={field.helperText}
            onChange={(e) => onChange(field.name, Number(e.target.value))}
          />
        );
  
      case "string":
      default:
        return (
          <TextField
            fullWidth
            label={field.label}
            value={value ?? ""}
            required={field.required}
            placeholder={field.placeholder}
            helperText={field.helperText}
            onChange={(e) => onChange(field.name, e.target.value)}
          />
        );
    }
  }