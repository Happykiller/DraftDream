// src/pages/Profile.tsx
import * as React from 'react';
import {
  Alert,
  Box,
  Chip,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { GlassCard } from '@components/common/GlassCard';
import { useTranslation } from 'react-i18next';
import { useProfileLanguage, useSessionData } from './Profile.hooks';

const HIGHLIGHT_KEYS = ['identity', 'security', 'support'] as const;

/**
 * Profile page presenting the session snapshot with clear identity details and live language switching.
 */
export function Profile(): React.JSX.Element {
  const { t } = useTranslation();
  const {
    hasSessionData,
    formattedSnapshot,
    roleLabel,
    summaryFields
  } = useSessionData();

  const {
    activeLanguage,
    languageOptions,
    handleLanguageChange
  } = useProfileLanguage();

  const highlightItems = React.useMemo(
    () =>
      HIGHLIGHT_KEYS.map((highlightKey) => ({
        key: highlightKey,
        label: t(`profile.hero.highlights.${highlightKey}`),
      })),
    [t],
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 45%, ${theme.palette.primary.light}22 100%)`,
        py: { xs: 6, md: 10 },
      }}
    >
      {/* General information */}
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 6, md: 8 }} alignItems="stretch">
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={4} sx={{ height: '100%' }}>
              <Stack spacing={2}>
                <Typography variant="h3" sx={{ fontWeight: 600 }}>
                  {t('profile.hero.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {t('profile.hero.subtitle')}
                </Typography>
              </Stack>

              <Stack component="ul" spacing={1.5} sx={{ listStyle: 'none', m: 0, p: 0 }}>
                {highlightItems.map((item) => (
                  <Stack
                    key={item.key}
                    component="li"
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" color="text.primary">
                      {item.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <FormControl fullWidth disabled={languageOptions.length === 0}>
                <InputLabel id="profile-language-select-label">{t('profile.language.label')}</InputLabel>
                <Select
                  labelId="profile-language-select-label"
                  label={t('profile.language.label')}
                  value={activeLanguage}
                  onChange={handleLanguageChange}
                >
                  {languageOptions.map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary">
                {t('profile.language.helper')}
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3} sx={{ height: '100%' }}>
              <GlassCard
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                }}
              >
                <Stack spacing={2.5}>
                  <Stack spacing={0.5}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {t('profile.summary.title')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('profile.summary.description')}
                    </Typography>
                  </Stack>

                  {hasSessionData ? (
                    <Stack spacing={2}>
                      {summaryFields.map((field) => (
                        <Stack
                          key={field.key}
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={{ xs: 0.5, sm: 2 }}
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                        >
                          <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 140 }}>
                            {field.label}
                          </Typography>
                          {field.key === 'role' && roleLabel ? (
                            <Chip
                              label={roleLabel}
                              size="small"
                              color="primary"
                              sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                            />
                          ) : (
                            <Typography variant="body1" color="text.primary">
                              {field.value}
                            </Typography>
                          )}
                        </Stack>
                      ))}
                    </Stack>
                  ) : (
                    <Alert severity="info" variant="outlined">
                      {t('profile.summary.empty')}
                    </Alert>
                  )}
                </Stack>
              </GlassCard>

              <GlassCard
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                }}
              >
                <Stack spacing={2}>
                  <Stack spacing={0.5}>
                    <Typography variant="h6">{t('profile.snapshot.title')}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('profile.snapshot.description')}
                    </Typography>
                  </Stack>

                  {hasSessionData ? (
                    <Box
                      component="pre"
                      sx={{
                        m: 0,
                        p: 2,
                        borderRadius: 2,
                        overflowX: 'auto',
                        fontFamily: 'Roboto Mono, monospace',
                        fontSize: '0.85rem',
                        backgroundColor: (theme) => theme.palette.action.hover,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {formattedSnapshot}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {t('profile.snapshot.empty')}
                    </Typography>
                  )}
                </Stack>
              </GlassCard>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
