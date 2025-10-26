// src/pages/Login.tsx
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  CheckCircleRounded,
  Done,
  Info as InfoIcon,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

import { Input } from '@components/Input';
import { CODES } from '@src/commons/CODES';
import { REGEX } from '@src/commons/REGEX';
import { useAuthReq } from '@hooks/useAuthReq';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';

type Entity = { value: string; valid: boolean };

/** Authentication screen displayed to unauthenticated visitors. */
export function Login(): React.JSX.Element {
  // Stores / services
  const flash = useFlashStore();
  const navigate = useNavigate();
  const { execute: auth } = useAuthReq();
  const { execute: runTask } = useAsyncTask();
  const { t, i18n } = useTranslation();
  const version = import.meta.env.VITE_APP_VERSION ?? '';

  // Local state
  const [formEntities, setFormEntities] = React.useState<{
    email: Entity;
    password: Entity;
  }>({
    email: { value: '', valid: false },
    password: { value: '', valid: false },
  });
  const [selectedLanguage, setSelectedLanguage] = React.useState(
    () => (i18n.language ?? 'fr').split('-')[0],
  );

  React.useEffect(() => {
    const handleLanguageChanged = (language: string) => {
      setSelectedLanguage(language.split('-')[0]);
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const languages = React.useMemo(
    () => [
      { code: 'fr', label: t('languages.fr') },
      { code: 'en', label: t('languages.en') },
    ],
    [t],
  );

  const highlightItems = React.useMemo(
    () => [
      t('login.highlights.programs'),
      t('login.highlights.followup'),
      t('login.highlights.collaboration'),
    ],
    [t],
  );

  const handleLanguageChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextLanguage = event.target.value;

      if (nextLanguage && nextLanguage !== i18n.language) {
        void i18n.changeLanguage(nextLanguage);
      }
    },
    [i18n],
  );

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
      flash.error(t('common.unexpected_error'));
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

  // Shared form content
  const FormContent = (
    <Stack spacing={2.5}>
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
          minHeight: 48,
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: 0.8,
          borderRadius: 2,
          boxShadow: '0 12px 24px rgba(59, 130, 246, 0.25)',
        }}
      >
        <Trans>login.button</Trans>
      </Button>
    </Stack>
  );

  const versionLabel = version ? t('footer.version_label', { version }) : '';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: { xs: 'background.default', md: '#05070f' },
        backgroundImage: {
          md: 'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.18) 0%, transparent 55%), linear-gradient(140deg, #05070f 0%, #0b0f1c 50%, #090c18 100%)',
        },
        color: { md: 'rgba(255,255,255,0.9)' },
      }}
    >
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          flexGrow: 1,
          py: { xs: 8, md: 12 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* General information */}
        <Stack spacing={{ xs: 6, md: 10 }}>
          <Box display="flex" justifyContent={{ xs: 'center', md: 'flex-end' }}>
            <TextField
              select
              size="small"
              label={t('login.language_label')}
              value={selectedLanguage}
              onChange={handleLanguageChange}
              helperText={t('login.language_placeholder')}
              slotProps={{
                select: {
                  'aria-label': t('login.language_placeholder'),
                },
                inputLabel: {
                  sx: { color: { md: 'rgba(255,255,255,0.82)' } },
                },
                formHelperText: {
                  sx: {
                    color: { xs: 'text.secondary', md: 'rgba(255,255,255,0.65)' },
                    textAlign: { xs: 'left', md: 'right' },
                    mt: 0.75,
                    display: { xs: 'block', md: 'none' },
                  },
                },
              }}
              sx={{
                minWidth: { xs: 200, md: 220 },
                bgcolor: { xs: 'background.paper', md: 'rgba(10, 13, 23, 0.65)' },
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: { xs: 'divider', md: 'rgba(255,255,255,0.32)' },
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: { md: 'primary.light' },
                },
                '& .MuiOutlinedInput-input': {
                  color: { md: 'rgba(255,255,255,0.92)' },
                  fontWeight: 600,
                },
                '& .MuiSvgIcon-root': {
                  color: { md: 'rgba(255,255,255,0.92)' },
                },
              }}
            >
              {languages.map((language) => (
                <MenuItem key={language.code} value={language.code}>
                  {language.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Stack
            direction={{ xs: 'column-reverse', md: 'row' }}
            spacing={{ xs: 6, md: 12 }}
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            <Paper
              component="section"
              elevation={16}
              role="form"
              aria-labelledby="login-title"
              sx={{
                flexBasis: { xs: 'auto', md: 420 },
                flexShrink: 0,
                width: '100%',
                maxWidth: 440,
                mx: { xs: 'auto', md: 0 },
                p: { xs: 3, sm: 4 },
                borderRadius: 3,
                boxShadow: '0 25px 40px rgba(5, 7, 15, 0.25)',
                backgroundColor: 'background.paper',
              }}
            >
              <Stack spacing={3}>
                <Stack spacing={1.5} textAlign="center">
                  <Box
                    component="img"
                    src="/logo.png"
                    alt={t('app.logo_alt')}
                    sx={{ width: 72, height: 72, mx: 'auto', objectFit: 'contain' }}
                  />
                  <Typography
                    id="login-title"
                    variant="h5"
                    sx={{ fontWeight: 800, letterSpacing: 0.6, lineHeight: 1.1 }}
                  >
                    {t('app.name')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <Trans>login.connect_space</Trans>
                  </Typography>
                </Stack>

                <Box component="form" onSubmit={onSubmit} noValidate>
                  {FormContent}
                </Box>
              </Stack>
            </Paper>

            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              <Stack
                spacing={3}
                sx={{
                  maxWidth: 460,
                  textAlign: { xs: 'center', md: 'left' },
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    letterSpacing: 2,
                    fontWeight: 700,
                    color: { xs: 'primary.main', md: 'primary.light' },
                  }}
                >
                  {t('app.product')}
                </Typography>
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.08,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  }}
                >
                  {t('login.hero.title')}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: { xs: 'text.secondary', md: 'rgba(255,255,255,0.72)' },
                    fontSize: { xs: '1rem', md: '1.05rem' },
                  }}
                >
                  {t('login.hero.subtitle')}
                </Typography>

                <Stack spacing={1.5}>
                  {highlightItems.map((item) => (
                    <Stack
                      key={item}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      justifyContent={{ xs: 'center', md: 'flex-start' }}
                    >
                      <CheckCircleRounded
                        sx={{
                          color: { xs: 'primary.main', md: '#7da2ff' },
                          fontSize: 22,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          color: { xs: 'text.primary', md: 'rgba(255,255,255,0.85)' },
                          fontWeight: 500,
                        }}
                      >
                        {item}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Container>

      {versionLabel ? (
        <Typography
          variant="caption"
          sx={{
            py: 4,
            textAlign: 'center',
            color: { xs: 'text.secondary', md: 'rgba(255,255,255,0.68)' },
          }}
        >
          {versionLabel}
        </Typography>
      ) : null}
    </Box>
  );
}
