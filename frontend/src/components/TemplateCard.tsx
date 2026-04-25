import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { Template } from "../types/template";

export default function TemplateCard({ template }: { template: Template }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{template.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {template.description}
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 2, color: "text.secondary" }}>
          Category: {template.category}
        </Typography>
      </CardContent>
      <CardActions>
        <Button component={RouterLink} to={`/templates/${template.id}`}>
          Request
        </Button>
      </CardActions>
    </Card>
  );
}