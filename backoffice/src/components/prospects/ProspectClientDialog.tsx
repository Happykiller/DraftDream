// src/components/prospects/ProspectClientDialog.tsx
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
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { ProspectStatus } from '@commons/prospects/status';
import type { Prospect } from '@hooks/useProspects';
import type { ProspectMetadataOption } from '@hooks/useProspectMetadataOptions';

export interface ProspectClientDialogValues {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: ProspectStatus | '';
  levelId?: string | null;
  sourceId?: string | null;
  objectiveIds: string[];
  activityPreferenceIds: string[];
  medicalConditions?: string;
  allergies?: string;
  notes?: string;
  budget?: string;
  dealDescription?: string;
  desiredStartDate?: string;
}

const DEFAULT_VALUES: ProspectClientDialogValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  status: '',
  levelId: null,
  sourceId: null,
  objectiveIds: [],
  activityPreferenceIds: [],
  medicalConditions: '',
  allergies: '',
  notes: '',
  budget: '',
  dealDescription: '',
  desiredStartDate: '',
};

export interface ProspectClientDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Prospect | null;
  statuses: Array<{ value: ProspectStatus; label: string }>;

  levels: ProspectMetadataOption[];
  sources: ProspectMetadataOption[];
  objectives: ProspectMetadataOption[];
  activityPreferences: ProspectMetadataOption[];
  loadingOptions: boolean;
  onClose: () => void;
  onSubmit: (values: ProspectClientDialogValues) => Promise<void> | void;
}

export function ProspectClientDialog({
  open,
  mode,
  initial,
  statuses,
  levels,
  sources,
  objectives,
  activityPreferences,
  loadingOptions,
  onClose,
  onSubmit,
}: ProspectClientDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const [values, setValues] = React.useState<ProspectClientDialogValues>(DEFAULT_VALUES);
  const isEdit = mode === 'edit';
  const creatorEmail = React.useMemo(
    () => initial?.creator?.email ?? initial?.createdBy ?? '',
    [initial?.createdBy, initial?.creator?.email],
  );
  const formattedCreatedAt = React.useMemo(() => {
    if (!initial?.createdAt) return '';
    return new Date(initial.createdAt).toLocaleString();
  }, [initial?.createdAt]);
  const formattedUpdatedAt = React.useMemo(() => {
    if (!initial?.updatedAt) return '';
    return new Date(initial.updatedAt).toLocaleString();
  }, [initial?.updatedAt]);

  React.useEffect(() => {
    if (isEdit && initial) {
      setValues({
        firstName: initial.firstName,
        lastName: initial.lastName,
        email: initial.email,
        phone: initial.phone ?? '',
        status: initial.status ?? '',
        levelId: initial.levelId ?? null,
        sourceId: initial.sourceId ?? null,
        objectiveIds: initial.objectiveIds ?? [],
        activityPreferenceIds: initial.activityPreferenceIds ?? [],
        medicalConditions: initial.medicalConditions ?? '',
        allergies: initial.allergies ?? '',
        notes: initial.notes ?? '',
        budget: initial.budget != null ? String(initial.budget) : '',
        dealDescription: initial.dealDescription ?? '',
        desiredStartDate: initial.desiredStartDate ? initial.desiredStartDate.slice(0, 10) : '',
      });
    } else {
      setValues(DEFAULT_VALUES);
    }
  }, [initial, isEdit]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(values);
    onClose();
  };

  const optionByIds = React.useMemo(
    () => ({
      objectives: objectives.filter((item) => values.objectiveIds.includes(item.id)),
      activityPreferences: activityPreferences.filter((item) => values.activityPreferenceIds.includes(item.id)),
    }),
    [activityPreferences, objectives, values.activityPreferenceIds, values.objectiveIds],
  );

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="prospect-client-dialog" maxWidth="md" fullWidth>
      {/* General information */}
      <DialogTitle id="prospect-client-dialog">
        {isEdit ? t('prospects.list.dialog.edit_title') : t('prospects.list.dialog.create_title')}
      </DialogTitle>
      <DialogContent dividers>
        {isEdit && initial ? (
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common.labels.id')}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {initial.id || '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common.labels.creator')}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {creatorEmail || '-'}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common.labels.created')}
                </Typography>
                <Typography variant="body2">{formattedCreatedAt || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common.labels.updated')}
                </Typography>
                <Typography variant="body2">{formattedUpdatedAt || '-'}</Typography>
              </Grid>
            </Grid>
          </Stack>
        ) : null}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t('common.labels.first_name')}
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t('common.labels.last_name')}
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t('common.labels.email')}
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t('common.labels.phone')}
                name="phone"
                value={values.phone}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label={t('common.labels.status')}
                name="status"
                value={values.status ?? ''}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="">{t('common.placeholders.select')}</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
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
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label={t('common.labels.source')}
                name="sourceId"
                value={values.sourceId ?? ''}
                onChange={(event) => setValues((prev) => ({ ...prev, sourceId: event.target.value || null }))}
                fullWidth
              >
                <MenuItem value="">{t('common.placeholders.select')}</MenuItem>
                {sources.map((source) => (
                  <MenuItem key={source.id} value={source.id}>
                    {source.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t('common.labels.budget')}
                name="budget"
                type="number"
                value={values.budget}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t('common.labels.desired_start_date')}
                name="desiredStartDate"
                type="date"
                value={values.desiredStartDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label={t('common.labels.deal_description')}
                name="dealDescription"
                value={values.dealDescription}
                onChange={handleChange}
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
              {isEdit ? t('common.buttons.save') : t('common.buttons.create')}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
