// src/pages/NotFound.tsx
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { ResponsiveButton } from '@components/common/ResponsiveButton';
import { SearchOff } from '@mui/icons-material';
import { gradients } from '@src/theme';

/**
 * Stylized 404 page aligned with Login page guidelines.
 * - Desktop: centered card over gradient background
 * - Mobile: full-width layout over default background
 * - Accessible: h1 semantics, labeled region, clear CTAs
 */
export function NotFound(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleGoHome = React.useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <Box
      // Full viewport background:
      // - mobile: theme default background (no black)
      // - desktop: gradient background for focus (reuses theme gradient)
      sx={{
        minHeight: '100vh',
        bgcolor: isMobile ? 'background.default' : undefined,
        background: isMobile ? undefined : gradients.logo,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* General information */}
      {isMobile ? (
        // MOBILE: container without Paper (lighter)
        <Container
          maxWidth="sm"
          component="section"
          role="region"
          aria-labelledby="notfound-title"
        >
          <Content onGoHome={handleGoHome} isMobile />
        </Container>
      ) : (
        // DESKTOP/TABLET: elevated card
        <Paper
          elevation={8}
          sx={{
            width: '100%',
            maxWidth: 520,
            borderRadius: 2.5,
            px: { sm: 4 },
            py: { sm: 4 },
            boxShadow:
              '0 10px 30px rgba(0,0,0,0.24), 0 6px 10px rgba(0,0,0,0.18)',
          }}
          role="dialog"
          aria-labelledby="notfound-title"
        >
          <Content onGoHome={handleGoHome} />
        </Paper>
      )}
    </Box>
  );
}

/** Internal props kept explicit for strict typing */
type ContentProps = {
  onGoHome: () => void;
  isMobile?: boolean;
};

/** Extracted inner content for clarity and testability */
function Content({ onGoHome, isMobile = false }: ContentProps): React.JSX.Element {
  return (
    <Stack spacing={2.5} alignItems="center" textAlign="center">
      {/* Illustration */}
      <Box
        aria-hidden
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: isMobile ? 72 : 88,
          height: isMobile ? 72 : 88,
          borderRadius: '50%',
          bgcolor: 'action.hover',
        }}
      >
        <SearchOff sx={{ fontSize: isMobile ? 36 : 44, color: 'text.secondary' }} />
      </Box>

      {/* Headings */}
      <Box>
        <Typography
          id="notfound-title"
          variant={isMobile ? 'h5' : 'h4'}
          role="heading"
          aria-level={1}
          sx={{ fontWeight: 800, letterSpacing: 0.4, lineHeight: 1.1 }}
        >
          404 — <Trans>not_found.page.title</Trans>
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }}>
          <Trans>sidebar.go_home</Trans>
        </Typography>
      </Box>

      {/* CTA */}
      <ResponsiveButton
        variant="contained"
        onClick={onGoHome}
        autoFocus
        sx={{ textTransform: 'uppercase', py: 1.1, fontWeight: 700, letterSpacing: 0.6 }}
        label={t('sidebar.go_home')}
      >
      </ResponsiveButton>
    </Stack>
  );
}
