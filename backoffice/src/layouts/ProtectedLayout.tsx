// src/layouts/ProtectedLayout.tsx
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Box, CssBaseline, Drawer, Toolbar, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { session } from '@stores/session';
import { isSelectedPath } from '@layouts/navMatch';
import { Sidebar } from '@layouts/components/Sidebar';
import { useNavItems, type NavItem } from '@layouts/hooks/useNavItems';
import { DRAWER_WIDTH, RAIL_WIDTH } from '@layouts/tokens';
import { LayoutAppBar } from '@layouts/components/LayoutAppBar';
import { useMobileDrawer } from '@layouts/hooks/useMobileDrawer';

export function ProtectedLayout(): React.JSX.Element {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  // Session snapshot once per render (no live subscription => 0 regression)
  const snap = React.useMemo(() => session.getState(), []);
  const role = snap.role ?? 'guest';

  const items = useNavItems(role);
  const flatItems = React.useMemo<NavItem[]>(() => {
    const expand = (entries: NavItem[]): NavItem[] =>
      entries.flatMap((item) => [item, ...(item.children ? expand(item.children) : [])]);
    return expand(items);
  }, [items]);
  const { open: mobileOpen, toggle, close } = useMobileDrawer();

  const current = React.useMemo(
    () => flatItems.find((item) => isSelectedPath(location.pathname, item.path)),
    [flatItems, location.pathname]
  );
  const defaultTitle = t('home.title');
  const profileTitle = t('profile.title');
  const pageTitle = current?.label ?? (location.pathname === '/profile' ? profileTitle : defaultTitle);

  const handleSelectPath = React.useCallback(
    (path: string, external?: boolean) => {
      if (external) {
        window.open(path, '_blank', 'noopener,noreferrer');
      } else {
        navigate(path);
      }
      if (isMobile) close();
    },
    [navigate, isMobile, close]
  );

  const handleLogout = React.useCallback(() => {
    snap.reset?.();
    navigate('/login', { replace: true });
  }, [navigate, snap]);

  const goHome = React.useCallback(() => {
    navigate('/');
    if (isMobile) close();
  }, [navigate, isMobile, close]);

  const openProfile = React.useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  React.useEffect(() => {
    document.title = `${pageTitle} - ${t('common.brand.full')}`;
  }, [pageTitle, t]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar width compensation is applied on main container instead of AppBar for simplicity */}
      <LayoutAppBar
        pageTitle={pageTitle}
        userName={`${snap.name_first} ${snap.name_last}`}
        userRole={snap.role ?? undefined}
        onMenuClick={toggle}
        onLogout={handleLogout}
        onProfileClick={openProfile}
      />

      {/* Side drawers */}
      <Box component="nav" sx={{ width: { sm: RAIL_WIDTH, lg: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        {/* Mobile temporary */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={toggle}
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
          <Sidebar
            items={items}
            currentPath={location.pathname}
            onSelectPath={handleSelectPath}
            onGoHome={goHome}
          />
        </Drawer>

        {/* Permanent */}
        <Drawer
          variant="permanent"
          open
          PaperProps={{
            sx: {
              width: { sm: RAIL_WIDTH, lg: DRAWER_WIDTH },
              bgcolor: 'grey.900',
              color: 'grey.100',
              backgroundImage: 'linear-gradient(180deg,#0f172a 0%, #111827 100%)',
              borderRight: '1px solid',
              borderColor: 'rgba(255,255,255,0.08)',
            },
          }}
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          <Sidebar
            items={items}
            currentPath={location.pathname}
            onSelectPath={handleSelectPath}
            onGoHome={goHome}
          />
        </Drawer>
      </Box>

      {/* Main */}
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
        <Toolbar /> {/* spacer for AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
}
