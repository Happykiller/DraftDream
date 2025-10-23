// src/layouts/components/Sidebar.tsx
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  ButtonBase,
  Typography,
} from '@mui/material';
import { keyframes } from '@mui/system';
import { useTranslation } from 'react-i18next';

import { dividerSx, gradientActive } from '../tokens';
import type { NavItem } from '../hooks/useNavItems';

const pulse = keyframes`
  0%   { transform: scale(1); opacity: .85; }
  50%  { transform: scale(1.25); opacity: 1; }
  100% { transform: scale(1); opacity: .85; }
`;

export type SidebarProps = {
  items: NavItem[];
  currentPath: string;
  onSelectPath: (path: string, external?: boolean) => void;
  onGoHome: () => void;
};

/** Sidebar (content only), agnostic of Drawer container. */
export function Sidebar({ items, currentPath, onSelectPath, onGoHome }: SidebarProps) {
  const { t } = useTranslation();
  const appName = t('app.name');
  const productName = t('app.product');
  const logoAlt = t('app.logo_alt');
  const version = import.meta.env.VITE_APP_VERSION;
  const year = new Date().getFullYear();
  const footerTooltip = t('app.version_tooltip', { product: productName, version, year });
  const versionLabel = t('footer.version_label', { version });
  const yearShort = t('footer.year_short', { year });
  const yearFull = t('footer.year_full', { year });

  return (
    <Box role="navigation" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header/logo */}
      <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Tooltip title={t('sidebar.go_home')} arrow>
          <ButtonBase
            onClick={onGoHome}
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
              justifyContent: { xs: 'center', sm: 'center', md: 'flex-start' },
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt={logoAlt}
              sx={{ width: 36, height: 36, borderRadius: 1.5, objectFit: 'contain' }}
            />
            <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'none', md: 'block' } }}>
              <Typography variant="subtitle1" sx={{ lineHeight: 1, fontWeight: 800 }}>
                {appName}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {t('sidebar.tagline')}
              </Typography>
            </Box>
          </ButtonBase>
        </Tooltip>
      </Box>

      <Divider sx={dividerSx} />

      {/* Menu */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {items.map((item) => {
          const selected =
            currentPath === item.path ||
            (currentPath.startsWith(item.path) && item.path !== '/'); // light nested support

          return (
            <ListItem key={item.path} disablePadding>
              <Tooltip title={item.label} placement="right" arrow>
                <Box sx={{ width: '100%' }}>
                  <ListItemButton
                    onClick={() => onSelectPath(item.path, item.external)}
                    selected={selected}
                    aria-current={selected ? 'page' : undefined}
                    aria-label={`${item.label}${selected ? ' (selected)' : ''}`}
                    sx={{
                      mx: 1,
                      my: 0.5,
                      borderRadius: 2,
                      transition: 'transform 200ms ease, background-color 200ms ease',
                      justifyContent: { xs: 'center', sm: 'center', md: 'flex-start' },
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
                    <ListItemIcon sx={{ minWidth: { xs: 'auto', sm: 'auto', md: 40 } }}>
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

                    <ListItemText
                      primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                      primary={item.label}
                      sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }}
                    />

                    {selected && (
                      <Box
                        sx={{
                          display: { xs: 'none', sm: 'none', md: 'block' },
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

      <Divider sx={dividerSx} />

      {/* Footer */}
      <Box sx={{ mt: 'auto' }}>
        <Divider sx={dividerSx} />
        <Tooltip title={footerTooltip} arrow placement="right">
          <Box sx={{ px: 2, py: 1.5, textAlign: 'center', cursor: 'default' }}>
            <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
              {versionLabel}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.5, display: { xs: 'block', md: 'none' } }}>
              {yearShort}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.5, display: { xs: 'none', md: 'block' } }}>
              {yearFull}
            </Typography>
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
}
