import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Alert,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { Template, TemplateField } from "../types/template";
import DynamicField from "./DynamicField";
import type { CostEstimate } from "../api/templates";

type Props = {
  template: Template;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  onEstimateCost?: (values: Record<string, unknown>) => Promise<CostEstimate>;
};

const ESTIMATE_DEBOUNCE_MS = 800;

export default function DynamicForm({
  template,
  onSubmit,
  onEstimateCost,
}: Props) {
  const theme = useTheme();

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

  const [estimating, setEstimating] = useState(false);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const estimateTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
    setFormError("");
    setCostEstimate(null);

    if (estimateTimerRef.current) {
      window.clearTimeout(estimateTimerRef.current);
      estimateTimerRef.current = null;
    }
  }, [initialValues]);

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
  
    if (
      field.type === "number" &&
      value !== "" &&
      value !== null &&
      value !== undefined
    ) {
      if (typeof value !== "number" || Number.isNaN(value)) {
        return `${field.label} must be a valid number`;
      }
  
      if (field.min !== undefined && value < field.min) {
        return `${field.label} must be at least ${field.min}`;
      }
  
      if (field.max !== undefined && value > field.max) {
        return `${field.label} must be at most ${field.max}`;
      }
    }
  
    return "";
  };

  const validateAll = (currentValues: Record<string, unknown>) => {
    const newErrors: Record<string, string> = {};

    for (const field of template.parameters) {
      const error = validateField(field, currentValues[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const shouldAutoEstimate = (currentValues: Record<string, unknown>) => {
    if (!onEstimateCost) return false;

    for (const field of template.parameters) {
      if (field.estimationOnly) continue;

      if (field.required) {
        const value = currentValues[field.name];
        const error = validateField(field, value);

        if (error) {
          return false;
        }
      }
    }

    return true;
  };

  const triggerAutoEstimate = (currentValues: Record<string, unknown>) => {
    if (!onEstimateCost) return;

    if (estimateTimerRef.current) {
      window.clearTimeout(estimateTimerRef.current);
    }

    if (!shouldAutoEstimate(currentValues)) {
      setCostEstimate(null);
      return;
    }

    estimateTimerRef.current = window.setTimeout(async () => {
      try {
        setEstimating(true);
        const result = await onEstimateCost(currentValues);
        setCostEstimate(result);
      } catch {
        setCostEstimate(null);
      } finally {
        setEstimating(false);
      }
    }, ESTIMATE_DEBOUNCE_MS);
  };

  const handleChange = (name: string, value: unknown) => {
    const nextValues = {
      ...values,
      [name]: value,
    };

    setValues(nextValues);

    const field = template.parameters.find((f) => f.name === name);
    if (!field) return;

    const error = validateField(field, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    setFormError("");
    triggerAutoEstimate(nextValues);
  };

  const handleSubmit = async () => {
    const isValid = validateAll(values);

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

  const provisioningFields = template.parameters.filter(
    (field) => !field.estimationOnly
  );
  const estimationFields = template.parameters.filter(
    (field) => field.estimationOnly
  );

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

      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Provisioning Configuration
        </Typography>

        <Grid container spacing={2}>
          {provisioningFields.map((field) => (
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
      </Box>

      {estimationFields.length > 0 && (
        <Paper
          variant="outlined"
          sx={{
            mt: 4,
            p: 2.5,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.45),
            borderColor: alpha(theme.palette.primary.main, 0.12),
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Cost Estimation Inputs
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These optional values do not affect provisioning. They are used only to calculate an approximate monthly cost.
          </Typography>

          <Grid container spacing={2}>
            {estimationFields.map((field) => (
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
        </Paper>
      )}

      {(estimating || costEstimate) && (
        <Paper
          variant="outlined"
          sx={{
            mt: 3,
            p: 2.5,
            borderRadius: 2,
            borderColor: alpha(theme.palette.primary.main, 0.18),
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.05
            )}, ${alpha(theme.palette.secondary.main, 0.05)})`,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            mb={2}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.secondary",
                }}
              >
                <TrendingUpIcon fontSize="small" />
                Estimated Monthly Cost
              </Typography>

              {estimating && !costEstimate ? (
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Calculating estimate...
                  </Typography>
                </Box>
              ) : costEstimate ? (
                <Typography variant="h4" color="primary" sx={{ mt: 0.5 }}>
                  {costEstimate.currency} {costEstimate.monthly_estimate.toFixed(2)}
                </Typography>
              ) : null}
            </Box>

            <Chip
              icon={<InfoOutlinedIcon />}
              label="Estimate only"
              variant="outlined"
            />
          </Stack>

          {costEstimate && (
            <>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Breakdown
                  </Typography>
                  <List dense sx={{ pt: 0 }}>
                    {costEstimate.breakdown.map((item) => (
                      <ListItem
                        key={item.name}
                        disableGutters
                        sx={{
                          py: 0.5,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <ListItemText
                          primary={item.name}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                        <Typography variant="body2" sx={{ ml: 2 }}>
                          {costEstimate.currency} {item.monthly_cost.toFixed(2)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Assumptions
                  </Typography>
                  <List dense sx={{ pt: 0 }}>
                    {costEstimate.assumptions.map((item, idx) => (
                      <ListItem key={idx} disableGutters sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={item}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </>
          )}
        </Paper>
      )}

      <Box mt={3}>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Request"}
        </Button>
      </Box>
    </Paper>
  );
}