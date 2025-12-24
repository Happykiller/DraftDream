// src/pages/Login.tsx
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Alert,
  Box,
  Button,
  Stack,
  Typography,
  useMediaQuery,
  Container,
} from '@mui/material';
import { GlassCard } from '@components/common/GlassCard';
import {
  Done,
  Visibility,
  VisibilityOff,
  Info as InfoIcon,
  Person,
  Lock,
} from '@mui/icons-material';

import { gradients } from '@src/theme';
import { Input } from '@components/Input';
import { CODES } from '@src/commons/CODES';
import { REGEX } from '@src/commons/REGEX';
import { useAuthReq } from '@hooks/useAuthReq';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';

type Entity = { value: string; valid: boolean };

export function Login(): React.JSX.Element {
  // Stores / services
  const theme = useTheme();
  const flashError = useFlashStore((state) => state.error);
  const flashSuccess = useFlashStore((state) => state.success);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { execute: auth } = useAuthReq();
  const { execute: runTask } = useAsyncTask();
  const { t } = useTranslation();
  const version = import.meta.env.VITE_APP_VERSION ?? '';

  const redirectReason = searchParams.get('reason');
  const unauthorizedMessage =
    redirectReason === 'unauthorized' ? t('login.redirect_reason.unauthorized') : null;

  // Local state
  const [formEntities, setFormEntities] = React.useState<{
    email: Entity;
    password: Entity;
  }>({
    email: { value: '', valid: false },
    password: { value: '', valid: false },
  });
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Submit
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result: any = await runTask(() =>
      auth({
        email: formEntities.email.value,
        password: formEntities.password.value,
      }),
    );
    if (!result) {
      flashError(t('common.alerts.unexpected_error'));
      return;
    }
    if (result.message === CODES.SUCCESS && result.data) {
      flashSuccess(t('login.success', { name: result.data.name_first }));
      navigate('/', { replace: true });
    } else {
      flashError(t(`ERRORS.${result.error}`));
    }
  };

  const canSubmit = formEntities.email.valid && formEntities.password.valid;

  // Shared form content (desktop & mobile)
  const FormContent = (
    <Stack spacing={2.25}>
      {/* Email */}
      <Input
        label={<Trans>login.email</Trans>}
        tooltip={<Trans>REGEX.LOGIN.EMAIL</Trans>}
        startIcon={<Person fontSize="small" />}
        icons={{
          visibility: <Visibility fontSize="small" />,
          visibilityOff: <VisibilityOff fontSize="small" />,
          help: <InfoIcon fontSize="small" />,
        }}
        regex={REGEX.LOGIN.EMAIL}
        entity={formEntities.email}
        onChange={(entity: Entity) =>
          setFormEntities((prev) => ({ ...prev, email: entity }))
        }
        require
        virgin
      />

      {/* Password */}
      <Input
        label={<Trans>login.password</Trans>}
        tooltip={<Trans>REGEX.LOGIN.PASSWORD</Trans>}
        startIcon={<Lock fontSize="small" />}
        icons={{
          visibility: <Visibility fontSize="small" />,
          visibilityOff: <VisibilityOff fontSize="small" />,
          help: <InfoIcon fontSize="small" />,
        }}
        regex={REGEX.LOGIN.PASSWORD}
        type="password"
        entity={formEntities.password}
        onChange={(entity: Entity) =>
          setFormEntities((prev) => ({ ...prev, password: entity }))
        }
        require
        virgin
      />

      {/* Submit */}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        startIcon={<Done fontSize="small" />}
        disabled={!canSubmit}
        aria-disabled={!canSubmit}
        sx={{
          textTransform: 'uppercase',
          py: 1.2,
          fontWeight: 700,
          letterSpacing: 0.6,
        }}
      >
        <Trans>login.button</Trans>
      </Button>
    </Stack>
  );

  const versionLabel = version
    ? t('common.brand.version_label', { version })
    : '';

  return (
    <Box
      // Full viewport background:
      // - mobile: theme default background (no black)
      // - desktop: gradient background for focus
      sx={{
        minHeight: '100vh',
        bgcolor: isMobile ? 'background.default' : undefined,
        background: isMobile ? undefined : gradients.logo,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* MOBILE LAYOUT (no card) */}
        {isMobile ? (
          <Container maxWidth="sm" component="section" role="form" aria-labelledby="login-title">
            {/* Header */}
            <Box textAlign="center" mb={2}>
              {/* Logo */}
              <Box
                component="img"
                src="/logo.png"
                alt={t('common.brand.logo_alt')}
                sx={{ width: 64, height: 64, mb: 1.25, objectFit: 'contain' }}
              />
              <Typography
                id="login-title"
                variant="h5"
                sx={{ fontWeight: 800, letterSpacing: 0.5, lineHeight: 1.1 }}
              >
                {t('common.brand.full')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                <Trans>login.connect_space</Trans>
              </Typography>
            </Box>

            {/* Form (full-width, no Paper) */}
            <Box component="form" onSubmit={onSubmit} noValidate>
              {unauthorizedMessage ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {unauthorizedMessage}
                </Alert>
              ) : null}
              {FormContent}
            </Box>
          </Container>
        ) : (
          // DESKTOP/TABLET LAYOUT (card + gradient bg)
          <GlassCard
            sx={{
              width: '100%',
              maxWidth: 400,
              borderRadius: 2.5,
              px: { sm: 4 },
              py: { sm: 4 },
            }}
            role="dialog"
            aria-labelledby="login-title"
          >
            {/* Header */}
            <Box textAlign="center" mb={2}>
              <Box
                component="img"
                src="/logo.png"
                alt={t('common.brand.logo_alt')}
                sx={{ width: 80, height: 80, mb: 1.5, objectFit: 'contain' }}
              />
              <Typography
                id="login-title"
                variant="h4"
                sx={{ fontWeight: 800, letterSpacing: 0.5, lineHeight: 1.1 }}
              >
                {t('common.brand.full')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                <Trans>login.connect_space</Trans>
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={onSubmit} noValidate>
              {unauthorizedMessage ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {unauthorizedMessage}
                </Alert>
              ) : null}
              {FormContent}
            </Box>
          </GlassCard>
        )}
      </Box>

      {versionLabel ? (
        <Typography
          variant="caption"
          sx={{
            mt: 3,
            textAlign: 'center',
            color: isMobile ? 'text.secondary' : 'rgba(255,255,255,0.72)',
          }}
        >
          {versionLabel}
        </Typography>
      ) : null}
    </Box>
  );
}
