// src/layouts/ProtectedLayout.tsx
import { t } from 'i18next';
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
  Tooltip,
  ButtonBase,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  Home,
  Settings,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';

import { session } from '@stores/session';

/**
 * Constants
 */
const DRAWER_WIDTH = 240;
const RAIL_WIDTH = 72;

type NavItem = { label: string; icon: React.ReactNode; path: string; external?: boolean };

const NAV_ITEMS: NavItem[] = [
  { label: t('home.title'), icon: <Home />, path: '/' },
  { label: t('sandbox.title'), icon: <Settings />, path: '/sandbox' },
];

const pulse = keyframes`
  0%   { transform: scale(1); opacity: .85; }
  50%  { transform: scale(1.25); opacity: 1; }
  100% { transform: scale(1); opacity: .85; }
`;

const gradientActive =
  'linear-gradient(135deg, #DC0023 0%, #0D00FF 100%)';

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
    session.getState().reset?.();
    navigate('/login', { replace: true });
  };

  /**
   * Sidebar content
   */
  const drawer = (
    <Box
      role="navigation"
      sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Header/logo area */}
      <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Tooltip title={t('sidebar.go_home')} arrow>
          <ButtonBase
            onClick={() => {
              navigate('/');
              if (isMobile) setMobileOpen(false);
            }}
            aria-label={t('sidebar.go_home')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              borderRadius: 2,
              p: 0.5,
              transition: 'transform 150ms ease',
              '&:hover': { transform: 'scale(1.03)' },
              width: '100%',
              justifyContent: { xs: 'center', md: 'flex-start' },
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="FitDesk Logo"
              sx={{ width: 36, height: 36, borderRadius: 1.5, objectFit: 'contain' }}
            />
            {/* Hide brand texts below md */}
            <Box sx={{ textAlign: 'left', display: { xs: 'none', md: 'block' } }}>
              <Typography variant="subtitle1" sx={{ lineHeight: 1, fontWeight: 800 }}>
                FitDesk
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                CRM
              </Typography>
            </Box>
          </ButtonBase>
        </Tooltip>
      </Box>


      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Menu */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {NAV_ITEMS.map((item) => {
          const selected = location.pathname === item.path;
          const isExternal = Boolean(item.external);

          const onClick = () => {
            if (isExternal) window.open(item.path, '_blank', 'noopener,noreferrer');
            else navigate(item.path);
            if (isMobile) setMobileOpen(false);
          };

          return (
            <ListItem key={item.path} disablePadding>
              <Tooltip title={item.label} placement="right" arrow>
                <Box sx={{ width: '100%' }}>
                  <ListItemButton
                    onClick={onClick}
                    selected={selected}
                    aria-current={selected ? 'page' : undefined}
                    aria-label={`${item.label}${selected ? ' (selected)' : ''}`}
                    sx={{
                      mx: 1,
                      my: 0.5,
                      borderRadius: 2,
                      transition: 'transform 200ms ease, background-color 200ms ease',
                      justifyContent: { xs: 'center', md: 'flex-start' },
                      '&:hover': {
                        transform: 'scale(1.02)',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                      },
                      '&.Mui-selected': {
                        background: gradientActive,
                        color: '#fff',
                        '& .MuiListItemIcon-root': { color: '#fff' },
                        '& .NavIconShape': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          borderColor: 'rgba(255,255,255,0.35)',
                        },
                        boxShadow: '0 6px 20px rgba(220, 0, 35, 0.25)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: { xs: 'auto', md: 40 },
                      }}
                    >
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
                          color: selected ? '#fff' : 'grey.300',
                          transition: 'background-color 200ms ease, color 200ms ease, border-color 200ms ease',
                        }}
                      >
                        {item.icon}
                      </Box>
                    </ListItemIcon>

                    {/* Hide label on rail */}
                    <ListItemText
                      primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                      primary={item.label}
                      sx={{ display: { xs: 'none', md: 'block' } }}
                    />

                    {/* Dot only when selected AND on full sidebar (>= md) */}
                    {selected && (
                      <Box
                        role="img"
                        aria-label={t('sidebar.selectedIndicator')}
                        sx={{
                          display: { xs: 'none', md: 'block' },
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          ml: 'auto',
                          mr: 1,
                          backgroundColor: '#fff',
                          animation: `${pulse} 1.8s ease-in-out infinite`,
                          ['@media (prefers-reduced-motion: reduce)']: { animation: 'none' },
                        }}
                      />
                    )}
                  </ListItemButton>
                </Box>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Footer */}
      <Box sx={{ mt: 'auto' }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <Tooltip
          title={`FitDesk CRM v${import.meta.env.VITE_APP_VERSION} — © 2025 - Tous droits réservés`}
          arrow
          placement="right"
        >
          <Box sx={{ px: 2, py: 1.5, textAlign: 'center', cursor: 'default' }}>
            {/* Version visible partout */}
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, display: 'block' }}
            >
              v{import.meta.env.VITE_APP_VERSION}
            </Typography>

            {/* Mode compact < md : juste © 2025 */}
            <Typography
              variant="caption"
              sx={{
                opacity: 0.5,
                display: { xs: 'block', md: 'none' },
              }}
            >
              ©2025
            </Typography>

            {/* Mode complet ≥ md */}
            <Typography
              variant="caption"
              sx={{
                opacity: 0.5,
                display: { xs: 'none', md: 'block' },
              }}
            >
              ©2025 - Tous droits réservés
            </Typography>
          </Box>
        </Tooltip>
      </Box>

    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        color="default"
        elevation={1}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          width: { sm: `calc(100% - ${RAIL_WIDTH}px)`, md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${RAIL_WIDTH}px`, md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
              aria-label={t('sidebar.openNavigation') ?? 'Open navigation'}
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
              <Typography variant="body2" sx={{ lineHeight: 1 }}>
                {session.getState().name_first} {session.getState().name_last}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                {session.getState().role}
              </Typography>
            </Box>
            <IconButton aria-label="logout" onClick={handleLogout}>
              <Tooltip title={t('header.logout')}>
                <Logout />
              </Tooltip>
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Navigation drawers */}
      <Box component="nav" sx={{ width: { sm: RAIL_WIDTH, md: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        {/* Mobile overlay (xs) — rail width */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: RAIL_WIDTH,
              bgcolor: 'grey.900',
              color: 'grey.100',
              backgroundImage: 'linear-gradient(180deg,#0f172a 0%, #111827 100%)',
            },
          }}
          sx={{ display: { xs: 'block', sm: 'none' } }}
        >
          {drawer}
        </Drawer>

        {/* Permanent drawer: rail on sm, full on md+ */}
        <Drawer
          variant="permanent"
          open
          PaperProps={{
            sx: {
              width: { sm: RAIL_WIDTH, md: DRAWER_WIDTH },
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

      {/* Main content */}
      <Box
        component="main"
        role="main"
        tabIndex={-1}
        sx={{
          flexGrow: 1,
          px: { xs: 1, sm: 2 },
          bgcolor: '#F9FAFB',
          minHeight: '100vh',
        }}
      >
        <Toolbar />{/* spacer == AppBar height */}
        <Outlet />
      </Box>
    </Box>
  );
}
