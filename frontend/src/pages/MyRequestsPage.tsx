import { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Link,
  Chip,
  useMediaQuery,
  useTheme,
  Stack,
  Divider,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { getMyRequests } from "../api/requests";
import type { RequestRecord } from "../types/request";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    getMyRequests()
      .then(setRequests)
      .catch(() => setError("Failed to load requests"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <Paper sx={{ p: { xs: 2, sm: 3 }, width: "100%" }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontSize: { xs: "2rem", sm: "2.5rem" } }}
        >
          My Requests
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : requests.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No requests found.
          </Typography>
        ) : isMobile ? (
          <Stack spacing={2}>
            {requests.map((request) => (
              <Paper
                key={request.request_id}
                variant="outlined"
                sx={{ p: 2, borderRadius: 3 }}
              >
                <Stack spacing={1.2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Request ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      <Link
                        component={RouterLink}
                        to={`/requests/${request.request_id}`}
                        underline="hover"
                      >
                        {request.request_id}
                      </Link>
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Template
                    </Typography>
                    <Typography variant="body1">{request.template_id}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Box mt={0.5}>
                      <Chip label={request.status} size="small" color="primary" />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Branch
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ wordBreak: "break-word" }}
                    >
                      {request.branch_name}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Pull Request
                    </Typography>
                    <Typography variant="body2">
                      <Link href={request.pr_url} target="_blank" rel="noreferrer">
                        Open PR
                      </Link>
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body2">
                      {new Date(request.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request ID</TableCell>
                <TableCell>Template</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>PR</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.request_id}>
                  <TableCell>
                    <Link
                      component={RouterLink}
                      to={`/requests/${request.request_id}`}
                      underline="hover"
                    >
                      {request.request_id}
                    </Link>
                  </TableCell>
                  <TableCell>{request.template_id}</TableCell>
                  <TableCell>
                    <Chip label={request.status} size="small" color="primary" />
                  </TableCell>
                  <TableCell sx={{ wordBreak: "break-word", maxWidth: 240 }}>
                    {request.branch_name}
                  </TableCell>
                  <TableCell>
                    <Link href={request.pr_url} target="_blank" rel="noreferrer">
                      Open PR
                    </Link>
                  </TableCell>
                  <TableCell>
                    {new Date(request.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </AppLayout>
  );
}