import { useMemo, useState } from "react";
import { Box, Button, Grid, Typography, Alert, Paper } from "@mui/material";
import type { Template, TemplateField } from "../types/template";
import DynamicField from "./DynamicField";

type Props = {
  template: Template;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
};

export default function DynamicForm({ template, onSubmit }: Props) {
  const initialValues = useMemo(() => {
    const values: Record<string, unknown> = {};
    template.parameters.forEach((field) => {
      values[field.name] =
        field.default ?? (field.type === "boolean" ? false : "");
    });
    return values;
  }, [template]);

  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validateField = (field: TemplateField, value: unknown): string => {
    if (field.required) {
      if (value === "" || value === null || value === undefined) {
        return `${field.label} is required`;
      }
    }

    if (
      field.type === "string" &&
      field.pattern &&
      typeof value === "string" &&
      value.trim() !== ""
    ) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(value)) {
        return field.patternErrorMessage || `${field.label} format is invalid`;
      }
    }

    return "";
  };

  const validateAll = () => {
    const newErrors: Record<string, string> = {};

    for (const field of template.parameters) {
      const error = validateField(field, values[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: string, value: unknown) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    const field = template.parameters.find((f) => f.name === name);
    if (!field) return;

    const error = validateField(field, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    setFormError("");
  };

  const handleSubmit = async () => {
    const isValid = validateAll();

    if (!isValid) {
      setFormError("Please correct the highlighted fields.");
      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      await onSubmit(values);
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h5" gutterBottom>
        Request: {template.name}
      </Typography>

      {formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}

      <Grid container spacing={2}>
        {template.parameters.map((field) => (
          <Grid item xs={12} md={6} key={field.name}>
            <DynamicField
              field={field}
              value={values[field.name]}
              error={errors[field.name]}
              onChange={handleChange}
            />
          </Grid>
        ))}
      </Grid>

      <Box mt={3}>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Request"}
        </Button>
      </Box>
    </Paper>
  );
}