import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";
import TemplateCatalogPage from "./pages/TemplateCatalogPage";
import TemplateRequestPage from "./pages/TemplateRequestPage";
import MyRequestsPage from "./pages/MyRequestsPage";
import RequestDetailsPage from "./pages/RequestDetailsPage";
import { TemplateCatalogProvider } from "./context/TemplateCatalogContext";

export default function App() {
  return (
    <AuthProvider>
      <TemplateCatalogProvider>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TemplateCatalogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates/:id"
            element={
              <ProtectedRoute>
                <TemplateRequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <MyRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests/:id"
            element={
              <ProtectedRoute>
                <RequestDetailsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </TemplateCatalogProvider>
    </AuthProvider>
  );
}