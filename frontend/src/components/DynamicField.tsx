import {
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from "@mui/material";
import type { TemplateField } from "../types/template";

type Props = {
  field: TemplateField;
  value: unknown;
  error?: string;
  onChange: (name: string, value: unknown) => void;
};

export default function DynamicField({ field, value, error, onChange }: Props) {
  switch (field.type) {
    case "boolean":
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={Boolean(value)}
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
          value={(value as string) ?? ""}
          required={field.required}
          error={!!error}
          helperText={error || field.helperText}
          onChange={(e) => onChange(field.name, e.target.value)}
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
          value={(value as number | string) ?? ""}
          required={field.required}
          error={!!error}
          helperText={error || field.helperText}
          onChange={(e) => onChange(field.name, Number(e.target.value))}
        />
      );

    case "string":
    default:
      return (
        <TextField
          fullWidth
          label={field.label}
          value={(value as string) ?? ""}
          required={field.required}
          error={!!error}
          helperText={error || field.helperText}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      );
  }
}