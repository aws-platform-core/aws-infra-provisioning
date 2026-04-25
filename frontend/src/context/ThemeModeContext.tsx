import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppThemeMode, getAppTheme } from "../theme";

type ThemeModeContextType = {
  mode: AppThemeMode;
  toggleTheme: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

const STORAGE_KEY = "infra-portal-theme-mode";

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AppThemeMode>("dark");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as AppThemeMode | null;
    if (saved === "light" || saved === "dark") {
      setMode(saved);
    }
  }, []);

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  }
  return context;
}