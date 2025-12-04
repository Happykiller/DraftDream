// src/components/programs/SessionDialog.tsx
import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Autocomplete,
  Chip,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Session } from '@hooks/useSessions';
import { VISIBILITY_OPTIONS, type Visibility } from '@src/commons/visibility';

export interface ExerciseOption {
  id: string;
  slug: string;
  label: string;
  locale: string;
}

export interface SessionDialogValues {
  locale: string;
  label: string;
  durationMin: number;
  description?: string;
  exercises: ExerciseOption[];
  visibility: Visibility;
}

export interface SessionDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Session;
  exerciseOptions: ExerciseOption[];
  onClose: () => void;
  onSubmit: (values: SessionDialogValues) => Promise<void> | void;
}

const DEFAULTS: SessionDialogValues = {
  locale: 'en',
  label: '',
  durationMin: 30,
  description: '',
  exercises: [],
  visibility: 'PUBLIC',
};

export function SessionDialog({
  open,
  mode,
  initial,
  exerciseOptions,
  onClose,
  onSubmit,
}: SessionDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<SessionDialogValues>(DEFAULTS);
  const isEdit = mode === 'edit';
  const { t } = useTranslation();

  React.useEffect(() => {
    if (isEdit && initial) {
      setValues({
        locale: initial.locale,
        label: initial.label,
        durationMin: initial.durationMin,
        description: initial.description ?? '',
        exercises: exerciseOptions.filter(
          (opt) => opt.locale === initial.locale && initial.exerciseIds.includes(opt.id),
        ),
        visibility: initial.visibility,
      });
    } else {
      setValues(DEFAULTS);
    }
  }, [isEdit, initial, exerciseOptions]);

  React.useEffect(() => {
    setValues((prev) => {
      const allowedIds = new Set(
        exerciseOptions
          .filter((option) => option.locale === prev.locale)
          .map((option) => option.id),
      );
      const filteredExercises = prev.exercises.filter((exercise) => allowedIds.has(exercise.id));
      if (filteredExercises.length === prev.exercises.length) {
        return prev;
      }
      return {
        ...prev,
        exercises: filteredExercises,
      };
    });
  }, [exerciseOptions, values.locale]);

  const filteredExerciseOptions = React.useMemo(
    () => exerciseOptions.filter((option) => option.locale === values.locale),
    [exerciseOptions, values.locale],
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: name === 'durationMin' ? Number(value) : value,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedLabel = values.label.trim();
    if (!trimmedLabel) return;
    if (!isEdit && values.exercises.length === 0) return;
    await onSubmit({
      ...values,
      label: trimmedLabel,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="session-dialog-title" fullWidth maxWidth="sm">
      <DialogTitle id="session-dialog-title">
        {isEdit ? t('programs.sessions.dialog.edit_title') : t('programs.sessions.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}>
          <TextField
            label={t('common.labels.label')}
            name="label"
            value={values.label}
            onChange={onChange}
            required
            fullWidth
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label={t('common.labels.locale')}
              name="locale"
              value={values.locale}
              onChange={onChange}
              required
              fullWidth
            >
              {['en', 'fr', 'es', 'de', 'it'].map((loc) => (
                <MenuItem key={loc} value={loc}>
                  {loc}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label={t('common.labels.visibility')}
              name="visibility"
              value={values.visibility}
              onChange={onChange}
              required
              fullWidth
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {t(option.label)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="number"
              label={t('common.labels.duration_minutes')}
              name="durationMin"
              value={values.durationMin}
              onChange={onChange}
              required
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Stack>

          <TextField
            label={t('common.labels.description')}
            name="description"
            value={values.description ?? ''}
            onChange={onChange}
            multiline
            minRows={3}
            fullWidth
          />

          {/* Exercises are mandatory on creation to prevent empty sessions from surfacing. */}
          <Autocomplete
            multiple
            options={filteredExerciseOptions}
            getOptionLabel={(option) => option.label || option.slug}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            value={values.exercises}
            onChange={(_, newValue) => setValues((prev) => ({ ...prev, exercises: newValue }))}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option.id} label={option.label || option.slug} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('common.labels.exercises')}
                placeholder={t('common.placeholders.select_exercises')}
              />
            )}
          />

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} color="inherit">
              {t('common.buttons.cancel')}
            </Button>
            <Button type="submit" variant="contained">
              {isEdit ? t('common.buttons.save') : t('common.buttons.create')}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
