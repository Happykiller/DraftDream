// src/pages/Login.tsx
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Stack,
  Typography,
  Paper,
  useMediaQuery,
  Container,
} from '@mui/material';
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
  const flash = useFlashStore();
  const navigate = useNavigate();
  const { execute: auth } = useAuthReq();
  const { execute: runTask } = useAsyncTask();
  const { t } = useTranslation();

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
      flash.error(t('common.alerts.unexpected_error'));
      return;
    }
    if (result.message === CODES.SUCCESS && result.data) {
      flash.success(t('login.success', { name: result.data.name_first }));
      navigate('/', { replace: true });
    } else {
      flash.error(t(`ERRORS.${result.error}`));
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

  return (
    <Box
      // Full viewport background:
      // - mobile: theme default background (no black)
      // - desktop: black background for focus
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
            {FormContent}
          </Box>
        </Container>
      ) : (
        // DESKTOP/TABLET LAYOUT (card + black bg)
        <Paper
          elevation={8}
          sx={{
            width: '100%',
            maxWidth: 400,
            borderRadius: 2.5,
            px: { sm: 4 },
            py: { sm: 4 },
            boxShadow: '0 10px 30px rgba(0,0,0,0.24), 0 6px 10px rgba(0,0,0,0.18)',
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
            {FormContent}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
