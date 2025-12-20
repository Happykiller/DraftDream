// src/pages/Profile.tsx
import * as React from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useTranslation } from 'react-i18next';

import { useAthleteInfo } from '@hooks/athletes/useAthleteInfo';
import { useProspectMetadataOptions } from '@hooks/prospects/useProspectMetadataOptions';
import { useFlashStore } from '@hooks/useFlashStore';
import { useUser } from '@hooks/useUser';
import { useUserProfileUpdate } from '@hooks/useUserProfileUpdate';
import type { SessionStoreModel } from '@stores/session';
import { session } from '@stores/session';

const HIGHLIGHT_KEYS = ['identity', 'security', 'support'] as const;

/**
 * Profile page presenting the session snapshot with clear identity details and live language switching.
 */
export function Profile(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const snapshot = session();
  const flashSuccess = useFlashStore((state) => state.success);

  const normalizeLanguage = React.useCallback((value: string | undefined) => value?.split('-')[0] ?? 'fr', []);

  const sessionData = React.useMemo<Omit<SessionStoreModel, 'reset'>>(() => {
    const { reset, ...rest } = snapshot;

    return rest;
  }, [snapshot]);

  const languagesDictionary = React.useMemo(() => {
    const dictionary = t('languages', { returnObjects: true }) as Record<string, string> | string;

    return typeof dictionary === 'string' ? {} : dictionary;
  }, [t]);

  const [language, setLanguage] = React.useState<string>(() => normalizeLanguage(i18n.language));

  React.useEffect(() => {
    setLanguage(normalizeLanguage(i18n.language));
  }, [i18n.language, normalizeLanguage]);

  const handleLanguageChange = React.useCallback(
    (event: SelectChangeEvent<string>) => {
      const nextLanguage = event.target.value;

      if (!nextLanguage || nextLanguage === language) {
        return;
      }

      setLanguage(nextLanguage);
      void i18n.changeLanguage(nextLanguage);
    },
    [i18n, language],
  );

  const hasSessionData = React.useMemo(
    () => Object.values(sessionData).some((value) => value !== null && value !== undefined && value !== ''),
    [sessionData],
  );

  const formattedSnapshot = React.useMemo(() => JSON.stringify(sessionData, null, 2), [sessionData]);

  const maskedAccessToken = React.useMemo(() => {
    if (!sessionData.access_token) {
      return t('profile.summary.emptyValue');
    }

    if (sessionData.access_token.length <= 12) {
      return sessionData.access_token;
    }

    return `${sessionData.access_token.slice(0, 6)}…${sessionData.access_token.slice(-4)}`;
  }, [sessionData.access_token, t]);

  const roleLabel = React.useMemo(() => {
    if (!sessionData.role) {
      return null;
    }

    return sessionData.role.replace(/_/g, ' ');
  }, [sessionData.role]);
  const isAthlete = sessionData.role === 'athlete';
  const metadata = useProspectMetadataOptions();
  const { user, loading: userLoading, error: userError, reload: reloadUser } = useUser({ skip: !isAthlete });
  const {
    athleteInfo,
    loading: athleteInfoLoading,
    error: athleteInfoError,
    update: updateAthleteInfo,
  } = useAthleteInfo({
    userId: isAthlete ? sessionData.id : null,
  });
  const { update: updateUserProfile, loading: profileUpdating } = useUserProfileUpdate();
  const [informationValues, setInformationValues] = React.useState({
    email: '',
    phone: '',
    levelId: null as string | null,
    objectiveIds: [] as string[],
    activityPreferenceIds: [] as string[],
    medicalConditions: '',
    allergies: '',
  });
  const selectedObjectives = React.useMemo(
    () => metadata.objectives.filter((item) => informationValues.objectiveIds.includes(item.id)),
    [informationValues.objectiveIds, metadata.objectives],
  );
  const selectedActivityPreferences = React.useMemo(
    () => metadata.activityPreferences.filter((item) => informationValues.activityPreferenceIds.includes(item.id)),
    [informationValues.activityPreferenceIds, metadata.activityPreferences],
  );

  const fullName = React.useMemo(() => {
    const nameParts = [sessionData.name_first, sessionData.name_last].filter(Boolean);

    if (nameParts.length === 0) {
      return null;
    }

    return nameParts.join(' ');
  }, [sessionData.name_first, sessionData.name_last]);

  const summaryFields = React.useMemo(
    () => [
      {
        key: 'name',
        label: t('profile.summary.fields.name'),
        value: fullName ?? t('profile.summary.emptyValue'),
      },
      {
        key: 'id',
        label: t('profile.summary.fields.id'),
        value: sessionData.id ?? t('profile.summary.emptyValue'),
      },
      {
        key: 'role',
        label: t('profile.summary.fields.role'),
        value: roleLabel ?? t('profile.summary.emptyValue'),
      },
      {
        key: 'access_token',
        label: t('profile.summary.fields.accessToken'),
        value: maskedAccessToken,
      },
    ],
    [fullName, maskedAccessToken, roleLabel, sessionData.id, t],
  );

  const highlightItems = React.useMemo(
    () =>
      HIGHLIGHT_KEYS.map((highlightKey) => ({
        key: highlightKey,
        label: t(`profile.hero.highlights.${highlightKey}`),
      })),
    [t],
  );

  const languageOptions = React.useMemo(() => Object.entries(languagesDictionary), [languagesDictionary]);

  const activeLanguage = React.useMemo(() => {
    if (languageOptions.length === 0) {
      return '';
    }

    return languageOptions.some(([value]) => value === language)
      ? language
      : languageOptions[0][0];
  }, [language, languageOptions]);
  const athleteFieldsDisabled = !athleteInfo || athleteInfoLoading;
  const isInformationSubmitting = profileUpdating || athleteInfoLoading || userLoading;

  React.useEffect(() => {
    if (!user) return;
    setInformationValues((prev) => ({
      ...prev,
      email: user.email ?? '',
      phone: user.phone ?? '',
    }));
  }, [user]);

  React.useEffect(() => {
    if (!athleteInfo) return;
    setInformationValues((prev) => ({
      ...prev,
      levelId: athleteInfo.levelId ?? null,
      objectiveIds: athleteInfo.objectiveIds ?? [],
      activityPreferenceIds: athleteInfo.activityPreferenceIds ?? [],
      medicalConditions: athleteInfo.medicalConditions ?? '',
      allergies: athleteInfo.allergies ?? '',
    }));
  }, [athleteInfo]);

  const handleInformationChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      setInformationValues((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleInformationSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!user) return;

      try {
        await updateUserProfile({
          id: user.id,
          email: informationValues.email.trim(),
          phone: informationValues.phone?.trim() || null,
        });

        if (athleteInfo) {
          await updateAthleteInfo({
            id: athleteInfo.id,
            levelId: informationValues.levelId,
            objectiveIds: informationValues.objectiveIds,
            activityPreferenceIds: informationValues.activityPreferenceIds,
            medicalConditions: informationValues.medicalConditions.trim() || null,
            allergies: informationValues.allergies.trim() || null,
          });
        }

        await reloadUser();
        flashSuccess(t('profile.information.notifications.update_success'));
      } catch (error) {
        return;
      }
    },
    [
      athleteInfo,
      flashSuccess,
      informationValues,
      reloadUser,
      t,
      updateAthleteInfo,
      updateUserProfile,
      user,
    ],
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
      <Container maxWidth="lg">
        {/* General information */}
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
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  backgroundColor: 'background.paper',
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
              </Paper>

              {isAthlete ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    backgroundColor: 'background.paper',
                  }}
                >
                  <Stack spacing={2.5} component="form" onSubmit={handleInformationSubmit}>
                    <Stack spacing={0.5}>
                      <Typography variant="h6">{t('profile.information.title')}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('profile.information.subtitle')}
                      </Typography>
                    </Stack>

                    {userError ? (
                      <Alert severity="warning" variant="outlined">
                        {userError}
                      </Alert>
                    ) : null}

                    {athleteInfoError ? (
                      <Alert severity="warning" variant="outlined">
                        {athleteInfoError}
                      </Alert>
                    ) : null}

                    {!athleteInfo && !athleteInfoLoading ? (
                      <Alert severity="info" variant="outlined">
                        {t('profile.information.empty')}
                      </Alert>
                    ) : null}

                    {/* General information */}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label={t('profile.information.fields.email')}
                          name="email"
                          value={informationValues.email}
                          onChange={handleInformationChange}
                          required
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          label={t('profile.information.fields.phone')}
                          name="phone"
                          value={informationValues.phone}
                          onChange={handleInformationChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          select
                          label={t('profile.information.fields.level')}
                          name="levelId"
                          value={informationValues.levelId ?? ''}
                          onChange={(event) =>
                            setInformationValues((prev) => ({
                              ...prev,
                              levelId: event.target.value ? String(event.target.value) : null,
                            }))
                          }
                          disabled={athleteFieldsDisabled}
                          fullWidth
                        >
                          <MenuItem value="">{t('profile.information.placeholders.select')}</MenuItem>
                          {metadata.levels.map((level) => (
                            <MenuItem key={level.id} value={level.id}>
                              {level.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Autocomplete
                          multiple
                          loading={metadata.loading}
                          options={metadata.objectives}
                          value={selectedObjectives}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          onChange={(_, data) =>
                            setInformationValues((prev) => ({
                              ...prev,
                              objectiveIds: data.map((item) => item.id),
                            }))
                          }
                          getOptionLabel={(option) => option.label}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={t('profile.information.fields.objectives')}
                              placeholder={t('profile.information.placeholders.select')}
                            />
                          )}
                          disabled={athleteFieldsDisabled}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Autocomplete
                          multiple
                          loading={metadata.loading}
                          options={metadata.activityPreferences}
                          value={selectedActivityPreferences}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          onChange={(_, data) =>
                            setInformationValues((prev) => ({
                              ...prev,
                              activityPreferenceIds: data.map((item) => item.id),
                            }))
                          }
                          getOptionLabel={(option) => option.label}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={t('profile.information.fields.activity_preferences')}
                              placeholder={t('profile.information.placeholders.select')}
                            />
                          )}
                          disabled={athleteFieldsDisabled}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label={t('profile.information.fields.medical_conditions')}
                          name="medicalConditions"
                          value={informationValues.medicalConditions}
                          onChange={handleInformationChange}
                          fullWidth
                          multiline
                          minRows={2}
                          disabled={athleteFieldsDisabled}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          label={t('profile.information.fields.allergies')}
                          name="allergies"
                          value={informationValues.allergies}
                          onChange={handleInformationChange}
                          fullWidth
                          multiline
                          minRows={2}
                          disabled={athleteFieldsDisabled}
                        />
                      </Grid>
                    </Grid>

                    <Stack direction="row" justifyContent="flex-end">
                      <Button type="submit" variant="contained" disabled={isInformationSubmitting}>
                        {t('profile.information.actions.save')}
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ) : null}

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  backgroundColor: 'background.paper',
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
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
