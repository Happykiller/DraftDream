// src/pages/Login.tsx
import { t } from 'i18next';
import * as React from 'react';
import { Trans } from 'react-i18next';
import {useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Stack,
  Typography,
  Paper,
} from '@mui/material';
import {
  Done,
  Visibility,
  VisibilityOff,
  Info as InfoIcon,
  Person,
  Lock,
} from '@mui/icons-material';

import { Input } from '@components/Input';
import { CODES } from '@src/commons/CODES';
import { REGEX } from '@src/commons/REGEX';
import { useAuthReq } from '@hooks/useAuthReq';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';

type Entity = { value: string; valid: boolean };

export function Login(): React.JSX.Element {
  // Stores / services
  const flash = useFlashStore();
  const navigate = useNavigate();
  const { execute: auth } = useAuthReq();
  const { execute: runTask } = useAsyncTask();

  // Local state
  const [formEntities, setFormEntities] = React.useState<{
    email: Entity;
    password: Entity;
  }>({
    email: { value: '', valid: false },
    password: { value: '', valid: false },
  });

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
      flash.error('Unexpected error, please try again.');
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

  return (
    <Box
      // Full viewport black background
      sx={{
        minHeight: '100vh',
        bgcolor: 'common.black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 2.5, // 20px
          px: { xs: 3, sm: 4 },
          py: { xs: 3, sm: 4 },
          boxShadow:
            '0 10px 30px rgba(0,0,0,0.24), 0 6px 10px rgba(0,0,0,0.18)',
        }}
        role="dialog"
        aria-labelledby="login-title"
      >
        {/* Header */}
        <Box textAlign="center" mb={2}>
          {/* Logo */}
          <Box
            component="img"
            src="/logo.png"
            alt="FitDesk Logo"
            sx={{
              width: 80,
              height: 80,
              mb: 1.5,                // espace sous le logo
              objectFit: 'contain',
            }}
          />

          {/* Brand title */}
          <Typography
            id="login-title"
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: 0.5,
              lineHeight: 1.1,
            }}
          >
            FitDesk
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', mt: 0.5 }}
          >
            <Trans>login.connect_space</Trans>
          </Typography>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={onSubmit} noValidate>
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
              <Trans>Se connecter</Trans>
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
