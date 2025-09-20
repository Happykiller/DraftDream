
import * as React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  Home,
  Settings,
} from '@mui/icons-material';

import { t } from 'i18next';
import { session } from '@stores/session';

const DRAWER_WIDTH = 240;

type NavItem = { label: string; icon: React.ReactNode; path: string };

const NAV_ITEMS: NavItem[] = [
  { label: t('home.title'), icon: <Home />, path: '/' },
  { label: t('sandbox.title'), icon: <Settings />, path: '/sandbox' },
];

export function ProtectedLayout(): React.JSX.Element {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => setMobileOpen(v => !v);
  const currentNav = NAV_ITEMS.find((item) => item.path === location.pathname);
  const pageTitle = currentNav?.label ?? 'home';

  const handleLogout = () => {
    // Reset the persisted session
    session.getState().reset?.();
    // Navigate back to login
    navigate('/login', { replace: true });
  };

  // --- Sidebar content
  const drawer = (
    <Box
      role="navigation"
      aria-label="primary"
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Header/logo area */}
      <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* Placeholder logo */}
        <Box
          component="img"
          src="/logo.png"
          alt="FitDesk Logo"
          sx={{ width: 36, height: 36, borderRadius: 1.5, objectFit: 'contain' }}
        />
        <Box>
          <Typography variant="subtitle1" sx={{ lineHeight: 1, fontWeight: 800 }}>
            FitDesk
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            CRM
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Menu */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {NAV_ITEMS.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                selected={selected}
                aria-current={selected ? 'page' : undefined}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    // Selected item gradient
                    background:
                      'linear-gradient(135deg, #DC0023 0%, #0D00FF 100%)',
                    color: '#fff',
                    '& .MuiListItemIcon-root': { color: '#fff' },
                    '& .NavIconShape': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderColor: 'rgba(255,255,255,0.35)',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box
                    className="NavIconShape"
                    aria-hidden
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      display: 'grid',
                      placeItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'grey.300',
                    }}
                  >
                    {item.icon}
                  </Box>
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Footer */}
      <Box sx={{ mt: 'auto' }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ px: 2, py: 1.5, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
            FitDesk CRM v{import.meta.env.VITE_APP_VERSION}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.5, display: 'block' }}>
            © 2025 - Tous droits réservé
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Light AppBar, shifted right on desktop so it doesn't overlap the drawer */}
      <AppBar
        position="fixed"
        color="default"
        elevation={1}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
              aria-label="open navigation"
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {pageTitle}
          </Typography>

          {/* Profile zone */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ lineHeight: 1 }}>{session.getState().name_first} {session.getState().name_last}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                {session.getState().role}
              </Typography>
            </Box>
            <IconButton
              aria-label="logout"
              onClick={handleLogout}
            >
              <Logout />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Navigation drawers */}
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        {/* Mobile overlay drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} // better mobile perf
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              bgcolor: 'grey.900',
              color: 'grey.100',
              backgroundImage: 'linear-gradient(180deg,#0f172a 0%, #111827 100%)',
            },
          }}
          sx={{ display: { xs: 'block', sm: 'none' } }}
        >
          {drawer}
        </Drawer>

        {/* Desktop permanent drawer */}
        <Drawer
          variant="permanent"
          open
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              bgcolor: 'grey.900',
              color: 'grey.100',
              backgroundImage: 'linear-gradient(180deg,#0f172a 0%, #111827 100%)',
              borderRight: '1px solid',
              borderColor: 'rgba(255,255,255,0.08)',
            },
          }}
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content; top spacer prevents content under the AppBar */}
      <Box
        component="main"
        role="main"
        tabIndex={-1}
        sx={{
          flexGrow: 1,
          px: { xs: 1, sm: 2 },
          bgcolor: '#F9FAFB', // background light gray
          minHeight: '100vh', // ensure full viewport height
        }}
      >
        <Toolbar />{/* spacer == AppBar height */}
        <Outlet />
      </Box>
    </Box>
  );
}
