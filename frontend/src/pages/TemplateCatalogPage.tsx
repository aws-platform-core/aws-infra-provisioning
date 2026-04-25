import { Grid, Typography, CircularProgress, Box, Alert } from "@mui/material";
import AppLayout from "../components/AppLayout";
import TemplateCard from "../components/TemplateCard";
import { useTemplateCatalog } from "../context/TemplateCatalogContext";

export default function TemplateCatalogPage() {
  const { templates, loading, error } = useTemplateCatalog();

  return (
    <AppLayout>
      <Typography variant="h4" gutterBottom>
        Infrastructure Templates
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid item xs={12} md={6} lg={4} key={template.id}>
              <TemplateCard template={template} />
            </Grid>
          ))}
        </Grid>
      )}
    </AppLayout>
  );
}