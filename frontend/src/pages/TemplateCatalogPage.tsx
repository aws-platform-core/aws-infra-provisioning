import { useMemo, useState } from "react";
import {
  Grid,
  Typography,
  CircularProgress,
  Box,
  Alert,
  TextField,
  InputAdornment,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { alpha, useTheme } from "@mui/material/styles";
import AppLayout from "../components/AppLayout";
import TemplateCard from "../components/TemplateCard";
import { useTemplateCatalog } from "../context/TemplateCatalogContext";

export default function TemplateCatalogPage() {
  const { templates, loading, error } = useTemplateCatalog();
  const [search, setSearch] = useState("");
  const theme = useTheme();

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return templates;

    return templates.filter((template) => {
      return (
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query)
      );
    });
  }, [templates, search]);

  return (
    <AppLayout>
      <Paper
        sx={{
          width: "100%",
          height: "calc(100vh - 68px - 64px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            pt: { xs: 2, sm: 3 },
            pb: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.94),
            backdropFilter: "blur(12px)",
            flexShrink: 0,
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontSize: { xs: "2rem", sm: "2.5rem" } }}
          >
            Infrastructure Templates
          </Typography>

          <Box sx={{ maxWidth: 500 }}>
            <TextField
              fullWidth
              placeholder="Search templates by name, description, or category"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            p: { xs: 2, sm: 3 },
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : filteredTemplates.length === 0 ? (
            <Alert severity="info">No templates match your search.</Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredTemplates.map((template) => (
                <Grid item xs={12} sm={6} lg={4} key={template.id}>
                  <TemplateCard template={template} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>
    </AppLayout>
  );
}