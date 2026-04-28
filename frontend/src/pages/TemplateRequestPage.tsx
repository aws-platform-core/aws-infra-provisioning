import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CircularProgress, Box, Alert } from "@mui/material";
import AppLayout from "../components/AppLayout";
import DynamicForm from "../components/DynamicForm";
import { getTemplateById, getTemplateCostEstimate } from "../api/templates";
import { submitRequest } from "../api/requests";
import type { Template } from "../types/template";

export default function TemplateRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    getTemplateById(id)
      .then((data) => setTemplate(data))
      .catch(() => setError("Failed to load template"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEstimateCost = async (values: Record<string, unknown>) => {
    if (!template) {
      throw new Error("Template not loaded");
    }

    const allowedParameterNames = template.parameters.map((p) => p.name);

    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(([key]) => allowedParameterNames.includes(key))
    );

    return await getTemplateCostEstimate(template.id, filteredValues);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!template) return;

    const allowedParameterNames = template.parameters.map((p) => p.name);

    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(([key]) => allowedParameterNames.includes(key))
    );

    const result = await submitRequest({
      template_id: template.id,
      parameters: filteredValues,
    });

    navigate(`/requests/${result.request_id}`);
  };

  return (
    <AppLayout>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : template ? (
        <DynamicForm
          template={template}
          onSubmit={handleSubmit}
          onEstimateCost={handleEstimateCost}
        />
      ) : (
        <Alert severity="error">Template not found</Alert>
      )}
    </AppLayout>
  );
}