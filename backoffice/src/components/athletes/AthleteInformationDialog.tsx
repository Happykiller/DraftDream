// src/components/athletes/AthleteInformationDialog.tsx
import * as React from 'react';

import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';

import type { AthleteInfo } from '@hooks/useAthleteInfos';
import { useDateFormatter } from '@hooks/useDateFormatter';
import type { ProspectMetadataOption } from '@hooks/useProspectMetadataOptions';

export interface AthleteInformationDialogValues {
  levelId?: string | null;
  objectiveIds: string[];
  activityPreferenceIds: string[];
  medicalConditions?: string;
  allergies?: string;
  notes?: string;
}

const DEFAULT_VALUES: AthleteInformationDialogValues = {
  levelId: null,
  objectiveIds: [],
  activityPreferenceIds: [],
  medicalConditions: '',
  allergies: '',
  notes: '',
};

export interface AthleteInformationDialogProps {
  open: boolean;
  initial?: AthleteInfo | null;
  levels: ProspectMetadataOption[];
  objectives: ProspectMetadataOption[];
  activityPreferences: ProspectMetadataOption[];
  loadingOptions: boolean;
  onClose: () => void;
  onSubmit: (values: AthleteInformationDialogValues) => Promise<void> | void;
}

/** Dialog for editing athlete information fields shared with prospects. */
export function AthleteInformationDialog({
  open,
  initial,
  levels,
  objectives,
  activityPreferences,
  loadingOptions,
  onClose,
  onSubmit,
}: AthleteInformationDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const fmtDate = useDateFormatter();
  const [values, setValues] = React.useState<AthleteInformationDialogValues>(DEFAULT_VALUES);

  const athleteName = React.useMemo(() => {
    const first = initial?.athlete?.first_name ?? '';
    const last = initial?.athlete?.last_name ?? '';
    return `${first} ${last}`.trim();
  }, [initial?.athlete?.first_name, initial?.athlete?.last_name]);
  const createdAtLabel = React.useMemo(
    () => (initial?.createdAt ? fmtDate(initial.createdAt) : ''),
    [fmtDate, initial?.createdAt],
  );
  const updatedAtLabel = React.useMemo(
    () => (initial?.updatedAt ? fmtDate(initial.updatedAt) : ''),
    [fmtDate, initial?.updatedAt],
  );

  React.useEffect(() => {
    if (open && initial) {
      setValues({
        levelId: initial.levelId ?? null,
        objectiveIds: initial.objectiveIds ?? [],
        activityPreferenceIds: initial.activityPreferenceIds ?? [],
        medicalConditions: initial.medicalConditions ?? '',
        allergies: initial.allergies ?? '',
        notes: initial.notes ?? '',
      });
    } else {
      setValues(DEFAULT_VALUES);
    }
  }, [initial, open]);

  const optionByIds = React.useMemo(
    () => ({
      objectives: objectives.filter((item) => values.objectiveIds.includes(item.id)),
      activityPreferences: activityPreferences.filter((item) => values.activityPreferenceIds.includes(item.id)),
    }),
    [activityPreferences, objectives, values.activityPreferenceIds, values.objectiveIds],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth aria-labelledby="athlete-information-dialog">
      {/* General information */}
      <DialogTitle id="athlete-information-dialog">
        {t('athletes.information.dialog.edit_title')}
      </DialogTitle>
      <DialogContent dividers>
        {initial ? (
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common.labels.athlete')}
                </Typography>
                <Typography variant="body2">
                  {athleteName || initial.athlete?.email || t('common.messages.no_value')}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common.labels.email')}
                </Typography>
                <Typography variant="body2">
                  {initial.athlete?.email || t('common.messages.no_value')}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common.labels.created')}
                </Typography>
                <Typography variant="body2">
                  {createdAtLabel || t('common.messages.no_value')}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common.labels.updated')}
                </Typography>
                <Typography variant="body2">
                  {updatedAtLabel || t('common.messages.no_value')}
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        ) : null}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label={t('common.labels.level')}
                name="levelId"
                value={values.levelId ?? ''}
                onChange={(event) => setValues((prev) => ({ ...prev, levelId: event.target.value || null }))}
                fullWidth
              >
                <MenuItem value="">{t('common.placeholders.select')}</MenuItem>
                {levels.map((level) => (
                  <MenuItem key={level.id} value={level.id}>
                    {level.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                multiple
                loading={loadingOptions}
                options={objectives}
                value={optionByIds.objectives}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, data) =>
                  setValues((prev) => ({ ...prev, objectiveIds: data.map((item) => item.id) }))
                }
                getOptionLabel={(option) => option.label}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option.id} label={option.label} />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label={t('common.labels.objectives')} placeholder={t('common.placeholders.select')} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                multiple
                loading={loadingOptions}
                options={activityPreferences}
                value={optionByIds.activityPreferences}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, data) =>
                  setValues((prev) => ({ ...prev, activityPreferenceIds: data.map((item) => item.id) }))
                }
                getOptionLabel={(option) => option.label}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option.id} label={option.label} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('common.labels.activity_preferences')}
                    placeholder={t('common.placeholders.select')}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label={t('common.labels.medical_conditions')}
                name="medicalConditions"
                value={values.medicalConditions}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, medicalConditions: event.target.value }))
                }
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label={t('common.labels.allergies')}
                name="allergies"
                value={values.allergies}
                onChange={(event) => setValues((prev) => ({ ...prev, allergies: event.target.value }))}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label={t('common.labels.notes')}
                name="notes"
                value={values.notes}
                onChange={(event) => setValues((prev) => ({ ...prev, notes: event.target.value }))}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
          </Grid>
          <DialogActions sx={{ mt: 2, px: 0 }}>
            <Button color="inherit" onClick={onClose}>
              {t('common.buttons.cancel')}
            </Button>
            <Button type="submit" variant="contained">
              {t('common.buttons.save')}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
