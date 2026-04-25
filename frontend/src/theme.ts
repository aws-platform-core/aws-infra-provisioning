import { alpha, createTheme } from "@mui/material/styles";

export type AppThemeMode = "light" | "dark";

export function getAppTheme(mode: AppThemeMode) {
  const isDark = mode === "dark";

  const actionPrimary = "#8080FF";
  const actionPrimaryLight = "#a3a3ff";
  const actionPrimaryDark = "#6666e6";

  const brandTeal = isDark ? "#78d6d1" : "#56c7c0";
  const brandPink = isDark ? "#f0b6c1" : "#e9a9b8";
  const brandPeach = isDark ? "#ffb07c" : "#f79a56";
  const brandTextDark = "#23343b";
  const brandTextLight = "#f7fbfc";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: actionPrimary,
        light: actionPrimaryLight,
        dark: actionPrimaryDark,
        contrastText: "#ffffff",
      },
      secondary: {
        main: brandPeach,
        light: isDark ? "#ffc39f" : "#ffb07c",
        dark: isDark ? "#f2915a" : "#ef8442",
        contrastText: isDark ? "#2a160d" : "#ffffff",
      },
      background: {
        default: isDark ? "#142126" : "#f7f3f1",
        paper: isDark
          ? alpha("#1b2b30", 0.52)
          : alpha("#ffffff", 0.72),
      },
      text: {
        primary: isDark ? brandTextLight : brandTextDark,
        secondary: isDark ? "#d8e7e8" : "#667b80",
      },
      divider: isDark ? alpha("#ffffff", 0.10) : alpha("#23343b", 0.10),
      success: {
        main: "#5fcf96",
      },
      warning: {
        main: brandPeach,
      },
      error: {
        main: "#ef6c7a",
      },
      info: {
        main: brandTeal,
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 600,
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            height: "100%",
            width: "100%",
            overflow: "hidden",
          },
          body: {
            height: "100%",
            width: "100%",
            margin: 0,
            overflow: "hidden",
            backgroundImage: 'url("/background.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          },
          "#root": {
            height: "100vh",
            width: "100%",
            overflow: "hidden",
            background: isDark
              ? "rgba(15, 24, 28, 0.22)"
              : "rgba(255, 255, 255, 0.22)",
            backdropFilter: "blur(2px)",
          },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark
              ? `linear-gradient(90deg, ${alpha("#56c7c0", 0.52)}, ${alpha("#e9a9b8", 0.50)})`
              : `linear-gradient(90deg, ${alpha("#56c7c0", 0.82)}, ${alpha("#e9a9b8", 0.82)})`,
            color: isDark ? brandTextLight : brandTextDark,
            backdropFilter: "blur(12px)",
            boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
            borderBottom: "none",
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: isDark
              ? `linear-gradient(180deg, ${alpha("#6fd3cd", 0.16)}, ${alpha("#f0b6c1", 0.12)})`
              : `linear-gradient(180deg, ${alpha("#ffffff", 0.72)}, ${alpha("#f8d5dd", 0.52)})`,
            color: isDark ? brandTextLight : brandTextDark,
            backdropFilter: "blur(14px)",
            borderRight: `1px solid ${isDark ? alpha("#ffffff", 0.10) : alpha("#23343b", 0.08)}`,
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: "none",
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha("#1f3136", 0.46)
                : alpha("#ffffff", 0.74),
            backdropFilter: "blur(12px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            border: `1px solid ${alpha(theme.palette.common.white, theme.palette.mode === "dark" ? 0.08 : 0.45)}`,
          }),
        },
      },

      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: "none",
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha("#20343a", 0.46)
                : alpha("#ffffff", 0.76),
            backdropFilter: "blur(12px)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            border: `1px solid ${alpha(theme.palette.common.white, theme.palette.mode === "dark" ? 0.08 : 0.46)}`,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 14px 34px rgba(0,0,0,0.12)",
            },
          }),
        },
      },

      MuiButton: {
        defaultProps: {
          variant: "contained",
        },
        styleOverrides: {
          root: {
            borderRadius: 12,
            paddingLeft: 18,
            paddingRight: 18,
            boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
          },
          containedPrimary: {
            background: actionPrimary,
            color: "#ffffff",
            "&:hover": {
              background: actionPrimaryDark,
              boxShadow: `0 8px 20px ${alpha(actionPrimary, 0.28)}`,
            },
          },
          outlinedPrimary: {
            borderColor: alpha(actionPrimary, 0.55),
            color: actionPrimary,
            "&:hover": {
              borderColor: actionPrimary,
              backgroundColor: alpha(actionPrimary, 0.08),
            },
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 12,
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.10),
            },
            "&.Mui-selected": {
              background: alpha(theme.palette.primary.main, 0.16),
              color: theme.palette.text.primary,
            },
            "&.Mui-selected .MuiListItemIcon-root": {
              color: theme.palette.primary.main,
            },
          }),
        },
      },

      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: isDark ? "#ccefed" : "#4d7d80",
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? alpha("#ffffff", 0.10) : alpha("#23343b", 0.08),
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          fullWidth: true,
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 12,
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha("#ffffff", 0.03)
                : alpha("#ffffff", 0.72),
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(theme.palette.primary.main, 0.26),
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(theme.palette.primary.main, 0.48),
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.primary.main,
              borderWidth: 2,
            },
          }),
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.text.secondary,
            "&.Mui-focused": {
              color: theme.palette.primary.main,
            },
          }),
        },
      },

      MuiCheckbox: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: alpha(theme.palette.primary.main, 0.78),
            "&.Mui-checked": {
              color: theme.palette.primary.main,
            },
          }),
        },
      },

      MuiAlert: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 12,
            backdropFilter: "blur(8px)",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          }),
        },
      },

      MuiLink: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.primary.main,
            fontWeight: 600,
            textDecorationColor: alpha(theme.palette.primary.main, 0.45),
          }),
        },
      },
    },
  });
}