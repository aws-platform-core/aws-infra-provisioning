import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getTemplates } from "../api/templates";
import type { Template } from "../types/template";

type TemplateCatalogContextType = {
  templates: Template[];
  loading: boolean;
  error: string;
  groupedTemplates: Record<string, Template[]>;
};

const TemplateCatalogContext = createContext<TemplateCatalogContextType | undefined>(undefined);

export function TemplateCatalogProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTemplates()
      .then((data) => setTemplates(data))
      .catch(() => setError("Failed to load template catalog"))
      .finally(() => setLoading(false));
  }, []);

  const groupedTemplates = useMemo(() => {
    return templates.reduce<Record<string, Template[]>>((acc, template) => {
      const category = template.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    }, {});
  }, [templates]);

  return (
    <TemplateCatalogContext.Provider
      value={{ templates, loading, error, groupedTemplates }}
    >
      {children}
    </TemplateCatalogContext.Provider>
  );
}

export function useTemplateCatalog() {
  const context = useContext(TemplateCatalogContext);
  if (!context) {
    throw new Error("useTemplateCatalog must be used within TemplateCatalogProvider");
  }
  return context;
}