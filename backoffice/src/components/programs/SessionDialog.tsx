// src/components/programs/SessionDialog.tsx
import * as React from 'react';
import {
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useDateFormatter } from '@hooks/useDateFormatter';
import type { SessionWithExercises } from '@hooks/useSessions';
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
  initial?: SessionWithExercises;
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

// Preserve existing exercise ordering when hydrating edit forms.
// Prioritize exercise data from session.exercises (resolver field) over exerciseOptions (paginated cache)
function mergeExercises(
  session: SessionWithExercises | undefined,
  options: ExerciseOption[],
): ExerciseOption[] {
  if (!session?.exerciseIds?.length) return [];

  // Build lookup maps
  const optionsById = new Map(options.map((option) => [option.id, option]));
  const sessionExercisesById = new Map(
    session.exercises?.map((ex) => [ex.id, ex]) ?? []
  );

  // Map exerciseIds to ExerciseOption, prioritizing session.exercises data
  return session.exerciseIds
    .map((id) => {
      // First try to get from session.exercises (has complete data)
      const sessionExercise = sessionExercisesById.get(id);
      if (sessionExercise) {
        return {
          id: sessionExercise.id,
          slug: id, // Use ID as slug fallback
          label: sessionExercise.label,
          locale: session.locale,
        };
      }
      // Fallback to exerciseOptions (paginated cache)
      const option = optionsById.get(id);
      if (option) {
        return option;
      }
      // Last resort: create placeholder (shouldn't happen with new approach)
      return {
        id,
        slug: id,
        label: id,
        locale: session.locale,
      };
    })
    .filter((option): option is ExerciseOption => Boolean(option));
}

export function SessionDialog({
  open,
  mode,
  initial,
  exerciseOptions,
  onClose,
  onSubmit,
}: SessionDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<SessionDialogValues>(DEFAULTS);
  const [selectedExercise, setSelectedExercise] = React.useState<ExerciseOption | null>(null);
  const isEdit = mode === 'edit';
  const { t } = useTranslation();
  const formatDate = useDateFormatter();

  const creatorEmail = React.useMemo(() => initial?.creator?.email || '-', [initial?.creator?.email]);
  const formattedCreatedAt = React.useMemo(
    () => (initial?.createdAt ? formatDate(initial.createdAt) : '-'),
    [initial?.createdAt, formatDate],
  );
  const formattedUpdatedAt = React.useMemo(
    () => (initial?.updatedAt ? formatDate(initial.updatedAt) : '-'),
    [initial?.updatedAt, formatDate],
  );

  React.useEffect(() => {
    if (isEdit && initial) {
      setValues({
        locale: initial.locale,
        label: initial.label,
        durationMin: initial.durationMin,
        description: initial.description ?? '',
        exercises: mergeExercises(initial, exerciseOptions),
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
    setSelectedExercise((prev) => (prev?.locale === values.locale ? prev : null));
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

  const handleAddExercise = () => {
    if (!selectedExercise) return;

    // Allow the same exercise to appear multiple times so coaches can repeat it within a session.
    setValues((prev) => ({
      ...prev,
      exercises: [...prev.exercises, selectedExercise],
    }));
    setSelectedExercise(null);
  };

  const handleRemoveExercise = (index: number) => {
    setValues((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, idx) => idx !== index),
    }));
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    setValues((prev) => {
      const nextExercises = [...prev.exercises];
      if (direction === 'up' && index > 0) {
        [nextExercises[index - 1], nextExercises[index]] = [nextExercises[index], nextExercises[index - 1]];
      }
      if (direction === 'down' && index < nextExercises.length - 1) {
        [nextExercises[index + 1], nextExercises[index]] = [nextExercises[index], nextExercises[index + 1]];
      }
      return { ...prev, exercises: nextExercises };
    });
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
      {/* General information */}
      <DialogTitle id="session-dialog-title">
        {isEdit ? t('programs.sessions.dialog.edit_title') : t('programs.sessions.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}>
          {isEdit && initial ? (
            <Stack spacing={1.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Stack flex={1} spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {t('common.labels.slug')}
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {initial.slug || '-'}
                  </Typography>
                </Stack>
                <Stack flex={1} spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {t('common.labels.creator')}
                  </Typography>
                  <Typography variant="body2">{creatorEmail}</Typography>
                </Stack>
              </Stack>
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
            </Stack>
          ) : null}

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
          <Stack spacing={1.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
              <Autocomplete
                options={filteredExerciseOptions}
                getOptionLabel={(option) => option.label || option.slug}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                value={selectedExercise}
                onChange={(_, newValue) => setSelectedExercise(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('common.labels.exercises')}
                    placeholder={t('common.placeholders.select_exercises')}
                  />
                )}
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={handleAddExercise}
                disabled={!selectedExercise}
                sx={{ alignSelf: { xs: 'stretch', sm: 'center' }, whiteSpace: 'nowrap' }}
              >
                {t('common.buttons.add')}
              </Button>
            </Stack>

            {values.exercises.length === 0 ? (
              <Chip label={t('common.messages.no_value')} variant="outlined" size="small" />
            ) : (
              <List dense sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {values.exercises.map((exercise, index) => (
                  <ListItem
                    key={`${exercise.id}-${index}`}
                    secondaryAction={
                      <Stack direction="row" spacing={0.5}>
                        <Button
                          size="small"
                          onClick={() => handleMoveExercise(index, 'up')}
                          aria-label={`move-exercise-up-${exercise.id}`}
                          startIcon={<ArrowUpwardIcon fontSize="inherit" />}
                          disabled={index === 0}
                        >
                          {t('common.labels.up')}
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleMoveExercise(index, 'down')}
                          aria-label={`move-exercise-down-${exercise.id}`}
                          startIcon={<ArrowDownwardIcon fontSize="inherit" />}
                          disabled={index === values.exercises.length - 1}
                        >
                          {t('common.labels.down')}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRemoveExercise(index)}
                          aria-label={`remove-exercise-${exercise.id}`}
                          startIcon={<DeleteIcon fontSize="inherit" />}
                        >
                          {t('common.buttons.delete')}
                        </Button>
                      </Stack>
                    }
                  >
                    <ListItemText primary={exercise.label || exercise.slug} secondary={exercise.locale} />
                  </ListItem>
                ))}
              </List>
            )}
          </Stack>

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
