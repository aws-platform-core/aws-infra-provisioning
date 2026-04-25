import { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, loading, login } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      login();
    }
  }, [loading, user, login]);

  if (loading || !user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return children;
}