import { useEffect, useMemo, useState } from "react";
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
  TablePagination,
  TableContainer,
  TableSortLabel,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Link as RouterLink } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { getMyRequests } from "../api/requests";
import type { RequestRecord } from "../types/request";

type Order = "asc" | "desc";

type SortField =
  | "request_id"
  | "template_id"
  | "status"
  | "branch_name"
  | "created_at";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [orderBy, setOrderBy] = useState<SortField>("created_at");
  const [order, setOrder] = useState<Order>("desc");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    getMyRequests()
      .then(setRequests)
      .catch(() => setError("Failed to load requests"))
      .finally(() => setLoading(false));
  }, []);

  const handleRequestSort = (field: SortField) => {
    const isAsc = orderBy === field && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(field);
    setPage(0);
  };

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return requests;

    return requests.filter((request) => {
      return (
        request.request_id.toLowerCase().includes(query) ||
        request.template_id.toLowerCase().includes(query) ||
        request.branch_name.toLowerCase().includes(query)
      );
    });
  }, [requests, search]);

  const sortedRequests = useMemo(() => {
    const sorted = [...filteredRequests].sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (orderBy) {
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case "request_id":
          aValue = a.request_id;
          bValue = b.request_id;
          break;
        case "template_id":
          aValue = a.template_id;
          bValue = b.template_id;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "branch_name":
          aValue = a.branch_name;
          bValue = b.branch_name;
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return order === "asc" ? aValue - bValue : bValue - aValue;
      }

      return order === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

    return sorted;
  }, [filteredRequests, orderBy, order]);

  const paginatedRequests = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedRequests.slice(start, end);
  }, [sortedRequests, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <AppLayout>
      <Paper
        sx={{
          width: "100%",
          height: {
            xs: "calc(100vh - 68px - 48px)",
            md: "calc(100vh - 68px - 64px)",
          },
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          p: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontSize: { xs: "2rem", sm: "2.5rem" } }}
          >
            My Requests
          </Typography>

          <Box sx={{ mb: 3, maxWidth: 420 }}>
            <TextField
              fullWidth
              placeholder="Search by Request ID, Template, or Branch"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1}>
            <CircularProgress />
          </Box>
        ) : filteredRequests.length === 0 ? (
          <Box display="flex" alignItems="center" flexGrow={1}>
            <Typography variant="body1" color="text.secondary">
              No matching requests found.
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                flexGrow: 1,
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              {isMobile ? (
                <Box
                  sx={{
                    height: "100%",
                    overflowY: "auto",
                    pr: 1,
                  }}
                >
                  <Stack spacing={2}>
                    {paginatedRequests.map((request) => (
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
                            <Typography variant="body1">
                              {request.template_id}
                            </Typography>
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
                            <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
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
                </Box>
              ) : (
                <TableContainer
                  sx={{
                    height: "100%",
                    overflowY: "auto",
                    overflowX: "auto",
                    borderRadius: 2,
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sortDirection={orderBy === "request_id" ? order : false}>
                          <TableSortLabel
                            active={orderBy === "request_id"}
                            direction={orderBy === "request_id" ? order : "asc"}
                            onClick={() => handleRequestSort("request_id")}
                          >
                            Request ID
                          </TableSortLabel>
                        </TableCell>

                        <TableCell sortDirection={orderBy === "template_id" ? order : false}>
                          <TableSortLabel
                            active={orderBy === "template_id"}
                            direction={orderBy === "template_id" ? order : "asc"}
                            onClick={() => handleRequestSort("template_id")}
                          >
                            Template
                          </TableSortLabel>
                        </TableCell>

                        <TableCell sortDirection={orderBy === "status" ? order : false}>
                          <TableSortLabel
                            active={orderBy === "status"}
                            direction={orderBy === "status" ? order : "asc"}
                            onClick={() => handleRequestSort("status")}
                          >
                            Status
                          </TableSortLabel>
                        </TableCell>

                        <TableCell sortDirection={orderBy === "branch_name" ? order : false}>
                          <TableSortLabel
                            active={orderBy === "branch_name"}
                            direction={orderBy === "branch_name" ? order : "asc"}
                            onClick={() => handleRequestSort("branch_name")}
                          >
                            Branch
                          </TableSortLabel>
                        </TableCell>

                        <TableCell>PR</TableCell>

                        <TableCell sortDirection={orderBy === "created_at" ? order : false}>
                          <TableSortLabel
                            active={orderBy === "created_at"}
                            direction={orderBy === "created_at" ? order : "asc"}
                            onClick={() => handleRequestSort("created_at")}
                          >
                            Created At
                          </TableSortLabel>
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedRequests.map((request) => (
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
                </TableContainer>
              )}
            </Box>

            <Box sx={{ flexShrink: 0, pt: 1 }}>
              <TablePagination
                component="div"
                count={filteredRequests.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 20]}
              />
            </Box>
          </>
        )}
      </Paper>
    </AppLayout>
  );
}