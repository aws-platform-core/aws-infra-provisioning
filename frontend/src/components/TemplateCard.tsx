import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  Chip,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import StorageIcon from "@mui/icons-material/Storage";
import MemoryIcon from "@mui/icons-material/Memory";
import BoltIcon from "@mui/icons-material/Bolt";
import ApiIcon from "@mui/icons-material/Api";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import type { Template } from "../types/template";

function getTemplateIcon(template: Template) {
  const id = template.id.toLowerCase();
  const name = template.name.toLowerCase();
  const category = template.category.toLowerCase();

  if (id.includes("s3") || name.includes("s3") || category.includes("storage")) {
    return <StorageIcon fontSize="small" />;
  }

  if (id.includes("ec2") || name.includes("ec2") || category.includes("compute")) {
    return <MemoryIcon fontSize="small" />;
  }

  if (id.includes("lambda") || name.includes("lambda")) {
    return <BoltIcon fontSize="small" />;
  }

  if (
    id.includes("api") ||
    id.includes("apigateway") ||
    name.includes("api gateway") ||
    category.includes("network")
  ) {
    return <ApiIcon fontSize="small" />;
  }

  return <CloudQueueIcon fontSize="small" />;
}

export default function TemplateCard({ template }: { template: Template }) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        minHeight: 210,
        display: "flex",
        flexDirection: "column",
        borderRadius: 1,
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.14)}`,
          borderColor: alpha(theme.palette.primary.main, 0.18),
        },
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: 2.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.14
              )}, ${alpha(theme.palette.secondary.main, 0.14)})`,
              color: theme.palette.primary.main,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.10)}`,
            }}
          >
            {getTemplateIcon(template)}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                mb: 0.75,
              }}
            >
              {template.name}
            </Typography>

            <Chip
              label={template.category}
              size="small"
              variant="outlined"
              sx={{
                height: 24,
                borderRadius: 1.5,
                borderColor: alpha(theme.palette.primary.main, 0.16),
                color: theme.palette.text.secondary,
                backgroundColor: alpha(theme.palette.background.paper, 0.28),
              }}
            />
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
            lineHeight: 1.6,
            flexGrow: 1,
          }}
        >
          {template.description}
        </Typography>
      </CardContent>

      <CardActions
        sx={{
          px: 2.5,
          pb: 2.5,
          pt: 0,
          mt: "auto",
        }}
      >
        <Button
          component={RouterLink}
          to={`/templates/${template.id}`}
          fullWidth
          sx={{
            borderRadius: 2,
          }}
        >
          Request
        </Button>
      </CardActions>
    </Card>
  );
}