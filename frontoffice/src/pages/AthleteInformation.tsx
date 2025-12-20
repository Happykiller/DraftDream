// src/pages/AthleteInformation.tsx
import * as React from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAthleteInfo } from '@hooks/athletes/useAthleteInfo';
import { useProspectMetadataOptions } from '@hooks/prospects/useProspectMetadataOptions';
import { useFlashStore } from '@hooks/useFlashStore';
import { useUser } from '@hooks/useUser';
import { session } from '@stores/session';

/** Dedicated athlete information page for self-service updates. */
export function AthleteInformation(): React.JSX.Element {
  const { t } = useTranslation();
  const flashSuccess = useFlashStore((state) => state.success);
  const snapshot = session();
  const { loading: userLoading, error: userError } = useUser();
  const {
    athleteInfo,
    loading: athleteInfoLoading,
    error: athleteInfoError,
    update: updateAthleteInfo,
  } = useAthleteInfo({ userId: snapshot.id });
  const metadata = useProspectMetadataOptions();
  const [values, setValues] = React.useState({
    levelId: null as string | null,
    objectiveIds: [] as string[],
    activityPreferenceIds: [] as string[],
    medicalConditions: '',
    allergies: '',
  });

  const selectedObjectives = React.useMemo(
    () => metadata.objectives.filter((item) => values.objectiveIds.includes(item.id)),
    [metadata.objectives, values.objectiveIds],
  );
  const selectedActivityPreferences = React.useMemo(
    () => metadata.activityPreferences.filter((item) => values.activityPreferenceIds.includes(item.id)),
    [metadata.activityPreferences, values.activityPreferenceIds],
  );

  React.useEffect(() => {
    if (!athleteInfo) return;
    setValues((prev) => ({
      ...prev,
      levelId: athleteInfo.levelId ?? null,
      objectiveIds: athleteInfo.objectiveIds ?? [],
      activityPreferenceIds: athleteInfo.activityPreferenceIds ?? [],
      medicalConditions: athleteInfo.medicalConditions ?? '',
      allergies: athleteInfo.allergies ?? '',
    }));
  }, [athleteInfo]);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      setValues((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      try {
        if (athleteInfo) {
          await updateAthleteInfo({
            id: athleteInfo.id,
            levelId: values.levelId,
            objectiveIds: values.objectiveIds,
            activityPreferenceIds: values.activityPreferenceIds,
            medicalConditions: values.medicalConditions.trim() || null,
            allergies: values.allergies.trim() || null,
          });
        }

        flashSuccess(t('athlete_information.notifications.update_success'));
      } catch {
        return;
      }
    },
    [
      athleteInfo,
      flashSuccess,
      t,
      updateAthleteInfo,
      values,
    ],
  );

  const athleteFieldsDisabled = !athleteInfo || athleteInfoLoading;
  const isSubmitting = athleteInfoLoading || userLoading;

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="md">
        {/* General information */}
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              {t('athlete_information.subtitle')}
            </Typography>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              backgroundColor: 'background.paper',
            }}
          >
            <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
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
                  {t('athlete_information.empty')}
                </Alert>
              ) : null}

              {/* General information */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    label={t('athlete_information.fields.level')}
                    name="levelId"
                    value={values.levelId ?? ''}
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        levelId: event.target.value ? String(event.target.value) : null,
                      }))
                    }
                    disabled={athleteFieldsDisabled}
                    fullWidth
                  >
                    <MenuItem value="">{t('athlete_information.placeholders.select')}</MenuItem>
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
                      setValues((prev) => ({
                        ...prev,
                        objectiveIds: data.map((item) => item.id),
                      }))
                    }
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('athlete_information.fields.objectives')}
                        placeholder={t('athlete_information.placeholders.select')}
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
                      setValues((prev) => ({
                        ...prev,
                        activityPreferenceIds: data.map((item) => item.id),
                      }))
                    }
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('athlete_information.fields.activity_preferences')}
                        placeholder={t('athlete_information.placeholders.select')}
                      />
                    )}
                    disabled={athleteFieldsDisabled}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label={t('athlete_information.fields.medical_conditions')}
                    name="medicalConditions"
                    value={values.medicalConditions}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    minRows={2}
                    disabled={athleteFieldsDisabled}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label={t('athlete_information.fields.allergies')}
                    name="allergies"
                    value={values.allergies}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    minRows={2}
                    disabled={athleteFieldsDisabled}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" justifyContent="flex-end">
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {t('athlete_information.actions.save')}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
