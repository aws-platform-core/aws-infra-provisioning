import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CircularProgress, Box, Alert, Typography, Link } from "@mui/material";
import AppLayout from "../components/AppLayout";
import DynamicForm from "../components/DynamicForm";
import { getTemplateById } from "../api/templates";
import { submitRequest } from "../api/requests";
import type { Template } from "../types/template";
import type { CreateRequestResponse } from "../types/request";

export default function TemplateRequestPage() {
  const { id } = useParams();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitResult, setSubmitResult] = useState<CreateRequestResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    getTemplateById(id)
      .then((data) => setTemplate(data))
      .catch(() => setError("Failed to load template"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (!template) return;

    const result = await submitRequest({
      template_id: template.id,
      parameters: values,
    });

    setSubmitResult(result);
    setError("");
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
        <>
          {submitResult && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Request submitted successfully
              </Typography>
              <Typography variant="body2">
                Request ID: {submitResult.request_id}
              </Typography>
              <Typography variant="body2">
                Branch: {submitResult.branch_name}
              </Typography>
              <Typography variant="body2">
                PR:{" "}
                <Link href={submitResult.pr_url} target="_blank" rel="noreferrer">
                  {submitResult.pr_url}
                </Link>
              </Typography>
            </Alert>
          )}

          <DynamicForm template={template} onSubmit={handleSubmit} />
        </>
      ) : (
        <Alert severity="error">Template not found</Alert>
      )}
    </AppLayout>
  );
}