import React, { useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  CloudQueue as CloudQueueIcon,
  Memory as MemoryIcon,
  Router as RouterIcon,
  Assignment as AssignmentIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Category as CategoryIcon,
  SettingsEthernet as SettingsEthernetIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useTemplateCatalog } from "../context/TemplateCatalogContext";
import { useThemeMode } from "../context/ThemeModeContext";

const drawerWidth = 280;
const collapsedDrawerWidth = 76;

function getCategoryIcon(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes("storage")) return <StorageIcon />;
  if (normalized.includes("compute")) return <MemoryIcon />;
  if (normalized.includes("network")) return <RouterIcon />;
  if (normalized.includes("api")) return <CloudQueueIcon />;
  return <SettingsEthernetIcon />;
}

function getTemplateIcon(category: string) {
  const normalized = category.toLowerCase();

  if (normalized.includes("storage")) return <StorageIcon />;
  if (normalized.includes("compute")) return <MemoryIcon />;
  if (normalized.includes("network")) return <RouterIcon />;
  if (normalized.includes("api")) return <CloudQueueIcon />;
  return <DashboardIcon />;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const { groupedTemplates, loading: templatesLoading } = useTemplateCatalog();
  const { mode, toggleTheme } = useThemeMode();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(true);
  const [requestsOpen, setRequestsOpen] = useState(true);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const currentDrawerWidth = drawerCollapsed ? collapsedDrawerWidth : drawerWidth;
  const categoryNames = useMemo(() => Object.keys(groupedTemplates), [groupedTemplates]);

  const handleToggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !(prev[category] ?? true),
    }));
  };

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleMobileNavClick = () => {
    if (isMobile) setMobileOpen(false);
  };

  const isSelected = (path: string) => location.pathname === path;

  const renderNavItem = (
    label: string,
    path: string,
    icon: React.ReactNode,
    nested = false
  ) => (
    <ListItemButton
      component={RouterLink}
      to={path}
      selected={isSelected(path)}
      onClick={handleMobileNavClick}
      sx={{
        pl: nested ? (drawerCollapsed ? 2 : 4) : 2,
        pr: 2,
        minHeight: 44,
        mx: 1,
        my: 0.5,
        color: "text.primary",
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.10),
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: drawerCollapsed ? 0 : 40,
          mr: drawerCollapsed ? 0 : 1,
          justifyContent: "center",
          color: "inherit",
        }}
      >
        {icon}
      </ListItemIcon>

      {!drawerCollapsed && <ListItemText primary={label} />}
    </ListItemButton>
  );

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {!isMobile && (
        <Box
          sx={{
            display: "flex",
            justifyContent: drawerCollapsed ? "center" : "flex-end",
            alignItems: "center",
            px: 1,
            py: 1,
          }}
        >
          <IconButton onClick={() => setDrawerCollapsed((prev) => !prev)} color="inherit">
            <ChevronLeftIcon
              sx={{
                transform: drawerCollapsed ? "rotate(180deg)" : "none",
                transition: "transform 0.2s ease",
              }}
            />
          </IconButton>
        </Box>
      )}

      <Divider />

      <Box sx={{ overflowY: "auto", flexGrow: 1, py: 1 }}>
        <List component="nav">
          <ListItemButton onClick={() => setTemplatesOpen((prev) => !prev)} sx={{ mx: 1 }}>
            <ListItemIcon
              sx={{
                minWidth: drawerCollapsed ? 0 : 40,
                mr: drawerCollapsed ? 0 : 1,
                justifyContent: "center",
                color: "text.primary",
              }}
            >
              <CategoryIcon />
            </ListItemIcon>

            {!drawerCollapsed && (
              <>
                <ListItemText primary="Templates" />
                {templatesOpen ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItemButton>

          <Collapse in={templatesOpen || drawerCollapsed} timeout="auto" unmountOnExit={false}>
            <List component="div" disablePadding>
              {renderNavItem("Browse Templates", "/", <DashboardIcon />, true)}

              {templatesLoading && !drawerCollapsed && (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={22} />
                </Box>
              )}

              {!templatesLoading &&
                categoryNames.map((category) => {
                  const categoryOpen = openCategories[category] ?? true;
                  const templates = groupedTemplates[category] || [];

                  return (
                    <React.Fragment key={category}>
                      <ListItemButton
                        onClick={() => handleToggleCategory(category)}
                        sx={{
                          mx: 1,
                          pl: drawerCollapsed ? 2 : 3,
                          color: "text.primary",
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: drawerCollapsed ? 0 : 40,
                            mr: drawerCollapsed ? 0 : 1,
                            justifyContent: "center",
                            color: "inherit",
                          }}
                        >
                          {getCategoryIcon(category)}
                        </ListItemIcon>

                        {!drawerCollapsed && (
                          <>
                            <ListItemText primary={category} />
                            {categoryOpen ? <ExpandLess /> : <ExpandMore />}
                          </>
                        )}
                      </ListItemButton>

                      <Collapse
                        in={categoryOpen || drawerCollapsed}
                        timeout="auto"
                        unmountOnExit={false}
                      >
                        <List component="div" disablePadding>
                          {templates.map((template) =>
                            renderNavItem(
                              template.name,
                              `/templates/${template.id}`,
                              getTemplateIcon(template.category),
                              true
                            )
                          )}
                        </List>
                      </Collapse>
                    </React.Fragment>
                  );
                })}
            </List>
          </Collapse>

          <Divider sx={{ my: 1 }} />

          <ListItemButton onClick={() => setRequestsOpen((prev) => !prev)} sx={{ mx: 1 }}>
            <ListItemIcon
              sx={{
                minWidth: drawerCollapsed ? 0 : 40,
                mr: drawerCollapsed ? 0 : 1,
                justifyContent: "center",
                color: "text.primary",
              }}
            >
              <AssignmentIcon />
            </ListItemIcon>

            {!drawerCollapsed && (
              <>
                <ListItemText primary="Requests" />
                {requestsOpen ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItemButton>

          <Collapse in={requestsOpen || drawerCollapsed} timeout="auto" unmountOnExit={false}>
            <List component="div" disablePadding>
              {renderNavItem("My Requests", "/requests", <AssignmentIcon />, true)}
            </List>
          </Collapse>
        </List>
      </Box>

      <Divider />

      <Box sx={{ p: 1 }}>
        <ListItemButton
          onClick={logout}
          sx={{
            mx: 1,
            color: "text.primary",
            "&:hover": {
              backgroundColor: alpha(theme.palette.error.main, 0.12),
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: drawerCollapsed ? 0 : 40,
              mr: drawerCollapsed ? 0 : 1,
              justifyContent: "center",
              color: "inherit",
            }}
          >
            <LogoutIcon />
          </ListItemIcon>
          {!drawerCollapsed && <ListItemText primary="Logout" />}
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", color: "text.primary" }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              minHeight: 56,
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Brand Logo"
              sx={{
                display: "block",
                height: 42,
                width: "auto",
                objectFit: "contain",
                borderRadius: 0,
                mr: 3,
                position: "relative",
                top: "8px",
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontSize: { xs: "1.15rem", md: "1.5rem" },
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: "0.02em",
                display: "flex",
                alignItems: "center",
                m: 0,
                color: "text.primary",
                textShadow: "0 1px 2px rgba(255,255,255,0.18), 0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              Automated Infra Provisioning
            </Typography>
          </Box>

          <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {user && !isMobile && (
            <Typography variant="body2" color="inherit">
              Hello, <u>{user.displayName}</u>
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              mt: "64px",
              height: "calc(100% - 64px)",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: currentDrawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: currentDrawerWidth,
              boxSizing: "border-box",
              mt: "64px",
              height: "calc(100% - 64px)",
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }),
              overflowX: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

<Box
  component="main"
  sx={{
    flexGrow: 1,
    mt: "64px",
    minWidth: 0,
    px: { xs: 2, md: 4 },
    py: { xs: 2, md: 4 },
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    transition: theme.transitions.create(["padding"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.standard,
    }),
  }}
>
  <Box
    sx={{
      width: "100%",
      maxWidth: "1200px",
    }}
  >
    {children}
  </Box>
</Box>
    </Box>
  );
}