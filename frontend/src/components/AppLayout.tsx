import React, { useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
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
  Cloud as CloudIcon,
  Dns as DnsIcon,
} from "@mui/icons-material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useTemplateCatalog } from "../context/TemplateCatalogContext";
import { useThemeMode } from "../context/ThemeModeContext";

const drawerWidth = 280;
const collapsedDrawerWidth = 76;

function getProviderIcon(provider: string) {
  const normalized = provider.toLowerCase();

  if (normalized === "aws") return <CloudQueueIcon />;
  if (normalized === "azure") return <CloudIcon />;
  return <DnsIcon />;
}

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
  disableContentScroll = false,
}: {
  children: React.ReactNode;
  disableContentScroll?: boolean;
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
  const [openProviders, setOpenProviders] = useState<Record<string, boolean>>({});
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const currentDrawerWidth = drawerCollapsed ? collapsedDrawerWidth : drawerWidth;
  const providerNames = useMemo(() => Object.keys(groupedTemplates), [groupedTemplates]);

  const handleToggleProvider = (provider: string) => {
    setOpenProviders((prev) => ({
      ...prev,
      [provider]: !(prev[provider] ?? true),
    }));
  };

  const handleToggleCategory = (provider: string, category: string) => {
    const key = `${provider}::${category}`;
    setOpenCategories((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? true),
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
        pl: nested ? (drawerCollapsed ? 2 : 7) : 2,
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

      <Box
        sx={{
          overflowY: "auto",
          flexGrow: 1,
          py: 1,
          minHeight: 0,
        }}
      >
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
                providerNames.map((provider) => {
                  const providerOpen = openProviders[provider] ?? true;
                  const categories = groupedTemplates[provider] || {};
                  const categoryNames = Object.keys(categories);

                  return (
                    <React.Fragment key={provider}>
                      <ListItemButton
                        onClick={() => handleToggleProvider(provider)}
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
                          {getProviderIcon(provider)}
                        </ListItemIcon>

                        {!drawerCollapsed && (
                          <>
                            <ListItemText primary={provider.toUpperCase()} />
                            {providerOpen ? <ExpandLess /> : <ExpandMore />}
                          </>
                        )}
                      </ListItemButton>

                      <Collapse
                        in={providerOpen || drawerCollapsed}
                        timeout="auto"
                        unmountOnExit={false}
                      >
                        <List component="div" disablePadding>
                          {categoryNames.map((category) => {
                            const categoryKey = `${provider}::${category}`;
                            const categoryOpen = openCategories[categoryKey] ?? true;
                            const templates = categories[category] || [];

                            return (
                              <React.Fragment key={categoryKey}>
                                <ListItemButton
                                  onClick={() => handleToggleCategory(provider, category)}
                                  sx={{
                                    mx: 1,
                                    pl: drawerCollapsed ? 2 : 5,
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
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        color: "text.primary",
      }}
    >
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ minHeight: "68px !important" }}>
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
                fontSize: { xs: "1.1rem", md: "1.5rem" },
                fontWeight: 700,
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                letterSpacing: "0.01em",
                m: 0,
                color: "text.primary",
                textShadow: "0 1px 2px rgba(255,255,255,0.16), 0 2px 8px rgba(0,0,0,0.06)",
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
              Hello, {user.displayName}
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
              top: "68px",
              height: "calc(100vh - 68px)",
              overflow: "hidden",
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
              top: "68px",
              height: "calc(100vh - 68px)",
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.standard,
              }),
              overflow: "hidden",
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
          minWidth: 0,
          mt: "68px",
          height: "calc(100vh - 68px)",
          overflowY: disableContentScroll ? "hidden" : "auto",
          overflowX: "hidden",
          px: { xs: 2, md: 4 },
          py: { xs: 2, md: 4 },
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
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