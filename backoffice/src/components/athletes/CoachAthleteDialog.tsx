// src/components/athletes/CoachAthleteDialog.tsx
import * as React from 'react';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDateFormatter } from '@src/hooks/useDateFormatter';

import type { CoachAthlete } from '@hooks/useCoachAthletes';

export type CoachAthleteDialogMode = 'create' | 'edit';

export interface CoachAthleteUserOption {
  id: string;
  email: string;
  fullName: string;
}

export interface CoachAthleteDialogValues {
  coach: CoachAthleteUserOption | null;
  athlete: CoachAthleteUserOption | null;
  startDate: string;
  endDate: string;
  note: string;
  is_active: boolean;
}

export interface CoachAthleteDialogProps {
  open: boolean;
  mode: CoachAthleteDialogMode;
  initial?: CoachAthlete | null;
  coachOptions: CoachAthleteUserOption[];
  athleteOptions: CoachAthleteUserOption[];
  onClose: () => void;
  onSubmit: (values: CoachAthleteDialogValues) => Promise<void> | void;
}

const buildDefaultValues = (): CoachAthleteDialogValues => ({
  coach: null,
  athlete: null,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  note: '',
  is_active: true,
});

const toOption = (user?: CoachAthlete['coach'] | CoachAthlete['athlete'] | null): CoachAthleteUserOption | null => {
  if (!user) return null;
  const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  return { id: user.id, email: user.email, fullName: fullName || user.email };
};

const toDateInput = (value?: string | null): string => (value ? value.slice(0, 10) : '');

export function CoachAthleteDialog(props: CoachAthleteDialogProps): React.JSX.Element {
  const { open, mode, initial, coachOptions, athleteOptions, onClose, onSubmit } = props;
  const isEdit = mode === 'edit';
  const { t } = useTranslation();
  const [values, setValues] = React.useState<CoachAthleteDialogValues>(buildDefaultValues);
  const formatDate = useDateFormatter();

  const formattedCreatedAt = React.useMemo(
    () => (initial?.createdAt ? formatDate(initial.createdAt) : '-'),
    [initial?.createdAt, formatDate],
  );
  const formattedUpdatedAt = React.useMemo(
    () => (initial?.updatedAt ? formatDate(initial.updatedAt) : '-'),
    [initial?.updatedAt, formatDate],
  );

  React.useEffect(() => {
    if (open && isEdit && initial) {
      setValues({
        coach: toOption(initial.coach) || coachOptions.find((opt) => opt.id === initial.coachId) || null,
        athlete: toOption(initial.athlete) || athleteOptions.find((opt) => opt.id === initial.athleteId) || null,
        startDate: toDateInput(initial.startDate) || new Date().toISOString().slice(0, 10),
        endDate: toDateInput(initial.endDate),
        note: initial.note ?? '',
        is_active: initial.is_active,
      });
    } else if (open && !isEdit) {
      setValues(buildDefaultValues());
    }
  }, [athleteOptions, coachOptions, initial, isEdit, open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      // Keep the dialog open so the user can fix the issue after the toast feedback.
      console.error('CoachAthleteDialog submission failed', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="coach-athlete-dialog-title">
      <form onSubmit={handleSubmit}>
        <DialogTitle id="coach-athlete-dialog-title">
          {isEdit ? t('athletes.dialog.edit_title') : t('athletes.dialog.create_title')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {isEdit && initial ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Stack flex={1} spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {t('common.labels.created')}
                  </Typography>
                  <Typography variant="body2">{formattedCreatedAt}</Typography>
                </Stack>
                <Stack flex={1} spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {t('common.labels.updated')}
                  </Typography>
                  <Typography variant="body2">{formattedUpdatedAt}</Typography>
                </Stack>
              </Stack>
            ) : null}

            {/* General information */}
            <Autocomplete
              value={values.coach}
              onChange={(_, value) => setValues((prev) => ({ ...prev, coach: value }))}
              options={coachOptions}
              getOptionLabel={(option) => option?.fullName || option?.email || ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('athletes.dialog.coach_label')}
                  placeholder={t('athletes.dialog.coach_placeholder')}
                  required
                />
              )}
            />

            <Autocomplete
              value={values.athlete}
              onChange={(_, value) => setValues((prev) => ({ ...prev, athlete: value }))}
              options={athleteOptions}
              getOptionLabel={(option) => option?.fullName || option?.email || ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('athletes.dialog.athlete_label')}
                  placeholder={t('athletes.dialog.athlete_placeholder')}
                  required
                />
              )}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                type="date"
                label={t('athletes.dialog.start_date_label')}
                value={values.startDate}
                onChange={(event) => setValues((prev) => ({ ...prev, startDate: event.target.value }))}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                label={t('athletes.dialog.end_date_label')}
                value={values.endDate}
                onChange={(event) => setValues((prev) => ({ ...prev, endDate: event.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <TextField
              label={t('athletes.dialog.note_label')}
              value={values.note}
              onChange={(event) => setValues((prev) => ({ ...prev, note: event.target.value }))}
              multiline
              minRows={3}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={values.is_active}
                  onChange={(_, checked) => setValues((prev) => ({ ...prev, is_active: checked }))}
                />
              }
              label={t('athletes.dialog.is_active_label')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.buttons.cancel')}</Button>
          <Button type="submit" variant="contained">
            {isEdit ? t('common.buttons.save') : t('common.buttons.create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
