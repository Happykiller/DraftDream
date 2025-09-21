// src/layouts/components/LayoutAppBar.tsx
import { AppBar, Toolbar, Typography, IconButton, Stack, Box, useMediaQuery, Tooltip } from '@mui/material';
import { Menu as MenuIcon, Logout } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { t } from 'i18next';
import { RAIL_WIDTH, DRAWER_WIDTH } from '../tokens';

/** Props strictly typed for clarity */
export type LayoutAppBarProps = {
  pageTitle: string;
  userName: string;
  userRole?: string;
  onMenuClick: () => void;
  onLogout: () => void;
};

export function LayoutAppBar({ pageTitle, userName, userRole, onMenuClick, onLogout }: LayoutAppBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            aria-label={t('sidebar.openNavigation') ?? 'Open navigation'}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {pageTitle}
        </Typography>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ lineHeight: 1 }}>
              {userName}
            </Typography>
            {userRole && (
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                {userRole}
              </Typography>
            )}
          </Box>
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
