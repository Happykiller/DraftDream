// src/components/programs/ProgramDialog.tsx
import * as React from 'react';
import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { Program, ProgramVisibility } from '@hooks/usePrograms';

export interface ProgramSessionOption {
  id: string;
  slug: string;
  label: string;
  locale?: string;
  durationMin?: number;
}

export interface ProgramDialogValues {
  locale: string;
  label: string;
  duration: number;
  frequency: number;
  description: string;
  sessions: ProgramSessionOption[];
  user: ProgramUserOption | null;
  visibility: ProgramVisibility;
}

export interface ProgramDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Program | null;
  sessionOptions: ProgramSessionOption[];
  userOptions: ProgramUserOption[];
  onClose: () => void;
  onSubmit: (values: ProgramDialogValues) => Promise<void> | void;
}

const DEFAULT_VALUES: ProgramDialogValues = {
  locale: 'en',
  label: '',
  duration: 4,
  frequency: 3,
  description: '',
  sessions: [],
  user: null,
  visibility: 'PRIVATE',
};

function mergeSessionOptions(
  snapshots: Program['sessions'] | undefined,
  options: ProgramSessionOption[],
): ProgramSessionOption[] {
  if (!snapshots || snapshots.length === 0) return [];

  const byId = new Map(options.map((option) => [option.id, option]));

  return snapshots
    .map((session) => {
      const templateId = session.templateSessionId ?? session.id;
      if (!byId.has(templateId)) {
        byId.set(templateId, {
          id: templateId,
          slug: session.slug ?? '',
          label: session.label,
          locale: session.locale ?? undefined,
          durationMin: session.durationMin,
        });
      }

      return byId.get(templateId) ?? null;
    })
    .filter((option): option is ProgramSessionOption => Boolean(option));
}

export function ProgramDialog({
  open,
  mode,
  initial,
  sessionOptions,
  userOptions,
  onClose,
  onSubmit,
}: ProgramDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<ProgramDialogValues>(DEFAULT_VALUES);
  const isEdit = mode === 'edit';
  const { t } = useTranslation();
  const filteredSessionOptions = React.useMemo(
    () => sessionOptions.filter((session) => session.locale === values.locale),
    [sessionOptions, values.locale],
  );

  React.useEffect(() => {
    if (isEdit && initial) {
      setValues({
        locale: initial.locale,
        label: initial.label,
        duration: initial.duration,
        frequency: initial.frequency,
        description: initial.description ?? '',
        sessions: mergeSessionOptions(initial.sessions, sessionOptions),
        user: ((): ProgramUserOption | null => {
          if (initial.athlete) {
            const match = userOptions.find((user) => user.id === initial.athlete?.id);
            return match ?? { ...initial.athlete };
          }
          if (!initial.userId) return null;
          const match = userOptions.find((user) => user.id === initial.userId);
          return match ?? { id: initial.userId, email: initial.userId };
        })(),
        visibility: initial.visibility ?? 'PRIVATE',
      });
    } else {
      setValues(DEFAULT_VALUES);
    }
  }, [isEdit, initial, sessionOptions, userOptions, open]);

  React.useEffect(() => {
    // In edit mode, preserve initial sessions even if they don't match the locale filter
    // Only filter out sessions that were added after opening the dialog
    if (isEdit && initial && initial.sessions) {
      const initialSessionIds = new Set(
        initial.sessions.map((s) => s.templateSessionId ?? s.id)
      );

      setValues((prev) => {
        const allowedIds = new Set(filteredSessionOptions.map((option) => option.id));
        const filteredSessions = prev.sessions.filter(
          (session) => allowedIds.has(session.id) || initialSessionIds.has(session.id)
        );
        if (filteredSessions.length === prev.sessions.length) {
          return prev;
        }
        return { ...prev, sessions: filteredSessions };
      });
    } else {
      // In create mode, strictly filter by locale
      setValues((prev) => {
        const allowedIds = new Set(filteredSessionOptions.map((option) => option.id));
        const filteredSessions = prev.sessions.filter((session) => allowedIds.has(session.id));
        if (filteredSessions.length === prev.sessions.length) {
          return prev;
        }
        return { ...prev, sessions: filteredSessions };
      });
    }
  }, [filteredSessionOptions, isEdit, initial]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: name === 'duration' || name === 'frequency' ? Number(value) : value,
    }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedLabel = values.label.trim();
    if (!trimmedLabel) return;
    if (values.duration <= 0 || values.frequency <= 0) return;
    if (values.sessions.length === 0) return;
    await onSubmit({
      ...values,
      label: trimmedLabel,
      description: values.description.trim(),
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="program-dialog-title" fullWidth maxWidth="sm">
      <DialogTitle id="program-dialog-title">
        {isEdit ? t('programs.dialog.edit_title') : t('programs.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}>
          {/* General information */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {/* Locale is stored per program because content differs between regions. */}
            <TextField
              select
              label={t('common.labels.locale')}
              name="locale"
              value={values.locale}
              onChange={handleChange}
              required
              fullWidth
            >
              {['en', 'fr', 'es', 'de', 'it'].map((loc) => (
                <MenuItem key={loc} value={loc}>
                  {loc.toUpperCase()}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={t('common.labels.visibility')}
              name="visibility"
              value={values.visibility}
              onChange={handleChange}
              required
              fullWidth
            >
              <MenuItem value="PRIVATE">{t('common.visibility.private')}</MenuItem>
              <MenuItem value="PUBLIC">{t('common.visibility.public')}</MenuItem>
            </TextField>
          </Stack>

          <TextField
            label={t('common.labels.label')}
            name="label"
            value={values.label}
            onChange={handleChange}
            required
            fullWidth
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label={t('common.labels.duration_weeks')}
              name="duration"
              type="number"
              value={values.duration}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ min: 1 }}
            />
            <TextField
              label={t('common.labels.frequency_per_week')}
              name="frequency"
              type="number"
              value={values.frequency}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Stack>

          <TextField
            label={t('common.labels.description')}
            name="description"
            value={values.description}
            onChange={handleChange}
            multiline
            minRows={3}
            fullWidth
          />

          {/* Sessions selection is mandatory to guarantee programs deliver real workouts. */}
          <Autocomplete
            multiple
            options={filteredSessionOptions}
            getOptionLabel={(option) => option.label || option.slug}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={values.sessions}
            onChange={(_, newValue) => setValues((prev) => ({ ...prev, sessions: newValue }))}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option.id} label={option.label || option.slug} />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('common.labels.sessions')}
                placeholder={t('common.placeholders.select_sessions')}
              />
            )}
          />

          {/* Athlete assignment remains optional since some programs are templates. */}
          <Autocomplete
            options={userOptions}
            value={values.user}
            onChange={(_, newValue) => setValues(prev => ({ ...prev, user: newValue }))}
            getOptionLabel={(opt) => opt?.email || ''}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('common.labels.athlete_optional')}
                placeholder={t('common.placeholders.select_athlete')}
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

export interface ProgramUserOption {
  id: string;
  email: string;
}
