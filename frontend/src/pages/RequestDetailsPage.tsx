import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Box,
  Grid,
  Chip,
  Link,
  Divider,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AppLayout from "../components/AppLayout";
import { getRequestById } from "../api/requests";
import type { RequestRecord } from "../types/request";

export default function RequestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState<RequestRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    getRequestById(id)
      .then(setRequest)
      .catch(() => setError("Failed to load request details"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/requests");
    }
  };

  return (
    <AppLayout>
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 2,
          }}
        >
          <Typography variant="h4">
            Request Details
          </Typography>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !request ? (
          <Alert severity="warning">Request not found</Alert>
        ) : (
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Request ID
                </Typography>
                <Typography variant="body1">{request.request_id}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Template
                </Typography>
                <Typography variant="body1">{request.template_id}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Requested By
                </Typography>
                <Typography variant="body1">{request.requested_by}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Chip label={request.status} color="primary" size="small" />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Branch Name
                </Typography>
                <Typography variant="body1">{request.branch_name}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Pull Request
                </Typography>
                <Link href={request.pr_url} target="_blank" rel="noreferrer">
                  {request.pr_url}
                </Link>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {new Date(request.created_at).toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Updated At
                </Typography>
                <Typography variant="body1">
                  {new Date(request.updated_at).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Parameters
            </Typography>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontFamily: "monospace",
                }}
              >
                {JSON.stringify(request.parameters, null, 2)}
              </pre>
            </Paper>
          </Box>
        )}
      </Paper>
    </AppLayout>
  );
}