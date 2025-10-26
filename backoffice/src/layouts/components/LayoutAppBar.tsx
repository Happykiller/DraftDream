// src/layouts/components/LayoutAppBar.tsx
import * as React from 'react';
import {
  AppBar,
  Box,
  ButtonBase,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { Menu as MenuIcon, Logout } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import { useUser } from '@hooks/useUser';

import { RAIL_WIDTH, DRAWER_WIDTH } from '../tokens';

/** Props strictly typed for clarity */
export type LayoutAppBarProps = {
  pageTitle: string;
  userName?: string;
  userRole?: string;
  onMenuClick: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
};

export function LayoutAppBar({
  pageTitle,
  userName,
  userRole,
  onMenuClick,
  onLogout,
  onProfileClick,
}: LayoutAppBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();
  const { user, loading } = useUser();

  const fallbackName = React.useMemo(() => userName?.trim() ?? '', [userName]);

  const displayName = React.useMemo(() => {
    const fallbackDisplay =
      fallbackName.length > 0 ? fallbackName : t('header.unknown_user');

    if (user) {
      const first = user.first_name?.trim() ?? '';
      const last = user.last_name?.trim() ?? '';
      const combined = `${first} ${last}`.trim();
      return combined.length > 0 ? combined : fallbackDisplay;
    }

    if (loading) {
      return fallbackName.length > 0 ? fallbackName : t('header.loading_user');
    }

    return fallbackDisplay;
  }, [fallbackName, loading, t, user]);

  const displayRole = React.useMemo(() => user?.type ?? userRole ?? null, [user?.type, userRole]);

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={1}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        width: {
          sm: `calc(100% - ${RAIL_WIDTH}px)`,
          md: `calc(100% - ${DRAWER_WIDTH}px)`,
        },
        ml: {
          sm: `${RAIL_WIDTH}px`,
          md: `${DRAWER_WIDTH}px`,
        },
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
            aria-label={t('sidebar.open_navigation')}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {pageTitle}
        </Typography>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title={t('header.open_profile')}>
            <ButtonBase
              onClick={onProfileClick}
              sx={{
                textAlign: 'right',
                borderRadius: 1,
                px: 1,
                py: 0.5,
                '&:hover': { bgcolor: 'action.hover' },
              }}
              aria-label={t('header.open_profile')}
            >
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ lineHeight: 1 }}>
                  {displayName}
                </Typography>
                {displayRole && (
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                    {displayRole}
                  </Typography>
                )}
              </Box>
            </ButtonBase>
          </Tooltip>
          <Tooltip title={t('header.logout')}>
            <IconButton aria-label="logout" onClick={onLogout}>
              <Logout />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
