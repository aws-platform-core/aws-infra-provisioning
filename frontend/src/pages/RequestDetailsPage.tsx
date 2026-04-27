import { useEffect, useState, useCallback } from "react";
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
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AppLayout from "../components/AppLayout";
import RequestStatusTimeline from "../components/RequestStatusTimeline";
import { getRequestById } from "../api/requests";
import type { RequestRecord } from "../types/request";
import {
  getRequestStatusColor,
  getRequestStatusLabel,
  getRelativeTime,
} from "../utils/requestStatus";

const POLL_INTERVAL_MS = 5000;

function isTerminalStatus(status: string) {
  return ["COMPLETED", "FAILED", "PLAN_FAILED", "DESTROYED", "DESTROY_FAILED"].includes(status);
}

export default function RequestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState<RequestRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [error, setError] = useState("");

  const fetchRequest = useCallback(
    async (isPolling = false) => {
      if (!id) return;

      try {
        if (isPolling) {
          setPolling(true);
        }

        const data = await getRequestById(id);
        setRequest(data);
        setError("");
        setLastRefreshedAt(new Date());
      } catch {
        setError("Failed to load request details");
      } finally {
        setLoading(false);
        if (isPolling) {
          setPolling(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    fetchRequest(false);
  }, [fetchRequest]);

  useEffect(() => {
    if (!request || isTerminalStatus(request.status)) {
      return;
    }

    const interval = setInterval(() => {
      fetchRequest(true);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [request, fetchRequest]);

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
          <Typography variant="h4">Request Details</Typography>

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
            {!isTerminalStatus(request.status) && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {polling && <CircularProgress size={16} />}
                    <Typography variant="body2">
                      Status is being updated automatically every{" "}
                      {POLL_INTERVAL_MS / 1000} seconds.
                    </Typography>
                  </Box>

                  {request.updated_at && (
                    <Typography variant="caption" color="text.secondary">
                      Last updated: {getRelativeTime(request.updated_at)}
                    </Typography>
                  )}
                </Stack>
              </Alert>
            )}

            {isTerminalStatus(request.status) && lastRefreshedAt && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Last updated: {getRelativeTime(lastRefreshedAt)}
                </Typography>
              </Box>
            )}

            <RequestStatusTimeline status={request.status} />

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
                  Provider
                </Typography>
                <Typography variant="body1">
                  {request.provider?.toUpperCase()}
                </Typography>
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
                <Chip
                  label={getRequestStatusLabel(request.status)}
                  color={getRequestStatusColor(request.status)}
                  size="small"
                />
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

              {/* <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  PR Number
                </Typography>
                <Typography variant="body1">
                  {request.pr_number ? `#${request.pr_number}` : "-"}
                </Typography>
              </Grid> */}

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