import { useMemo, useState } from "react";
import { Box, Button, Grid, Typography, Alert, Paper } from "@mui/material";
import type { Template } from "../types/template";
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
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (name: string, value: unknown) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    for (const field of template.parameters) {
      if (field.required) {
        const value = values[field.name];
        if (value === "" || value === null || value === undefined) {
          return `${field.label} is required`;
        }
      }
    }
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      await onSubmit(values);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h5" gutterBottom>
        Request: {template.name}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {template.parameters.map((field) => (
          <Grid item xs={12} md={6} key={field.name}>
            <DynamicField
              field={field}
              value={values[field.name]}
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