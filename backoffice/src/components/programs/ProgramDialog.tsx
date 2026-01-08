// src/components/programs/ProgramDialog.tsx
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

import type { Program, ProgramVisibility } from '@hooks/usePrograms';
import { VISIBILITY_OPTIONS } from '@src/commons/visibility';

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
  startDate: string;
  endDate: string;
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
  startDate: '',
  endDate: '',
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

function formatDateInput(value?: string | null): string {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().slice(0, 10);
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
  const [selectedSession, setSelectedSession] = React.useState<ProgramSessionOption | null>(null);
  const isEdit = mode === 'edit';
  const { t } = useTranslation();
  const filteredSessionOptions = React.useMemo(
    () => sessionOptions.filter((session) => session.locale === values.locale),
    [sessionOptions, values.locale],
  );
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
        locale: initial.locale,
        label: initial.label,
        duration: initial.duration,
        frequency: initial.frequency,
        startDate: formatDateInput(initial.startDate),
        endDate: formatDateInput(initial.endDate),
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

  React.useEffect(() => {
    setSelectedSession((prev) => (prev?.locale === values.locale ? prev : null));
  }, [values.locale]);

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

  const handleAddSession = () => {
    if (!selectedSession) return;

    setValues((prev) => ({
      ...prev,
      sessions: [...prev.sessions, selectedSession],
    }));
    setSelectedSession(null);
  };

  const handleRemoveSession = (index: number) => {
    setValues((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((_, idx) => idx !== index),
    }));
  };

  const handleMoveSession = (index: number, direction: 'up' | 'down') => {
    setValues((prev) => {
      const nextSessions = [...prev.sessions];
      if (direction === 'up' && index > 0) {
        [nextSessions[index - 1], nextSessions[index]] = [nextSessions[index], nextSessions[index - 1]];
      }
      if (direction === 'down' && index < nextSessions.length - 1) {
        [nextSessions[index + 1], nextSessions[index]] = [nextSessions[index], nextSessions[index + 1]];
      }
      return { ...prev, sessions: nextSessions };
    });
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="program-dialog-title" fullWidth maxWidth="sm">
      {/* General information */}
      <DialogTitle id="program-dialog-title">
        {isEdit ? t('programs.dialog.edit_title') : t('programs.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}>
          {isEdit && initial ? (
            <Stack spacing={1.5}>
              {/* Signature ensures editors know who created the program and when it was last touched. */}
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
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {creatorEmail || '-'}
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Stack flex={1} spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {t('common.labels.created')}
                  </Typography>
                  <Typography variant="body2">{formattedCreatedAt || '-'}</Typography>
                </Stack>
                <Stack flex={1} spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {t('common.labels.updated')}
                  </Typography>
                  <Typography variant="body2">{formattedUpdatedAt || '-'}</Typography>
                </Stack>
              </Stack>
            </Stack>
          ) : null}

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
              {VISIBILITY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {t(option.label)}
                </MenuItem>
              ))}
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label={t('common.labels.start_date')}
              name="startDate"
              type="date"
              value={values.startDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label={t('common.labels.end_date')}
              name="endDate"
              type="date"
              value={values.endDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
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
          <Stack spacing={1.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
              <Autocomplete
                options={filteredSessionOptions}
                getOptionLabel={(option) => option.label || option.slug}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedSession}
                onChange={(_, newValue) => setSelectedSession(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('common.labels.sessions')}
                    placeholder={t('common.placeholders.select_sessions')}
                  />
                )}
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={handleAddSession}
                disabled={!selectedSession}
                sx={{ alignSelf: { xs: 'stretch', sm: 'center' }, whiteSpace: 'nowrap' }}
              >
                {t('common.buttons.add')}
              </Button>
            </Stack>

            {values.sessions.length === 0 ? (
              <Chip label={t('common.messages.no_value')} variant="outlined" size="small" />
            ) : (
              <List dense sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {values.sessions.map((session, index) => (
                  <ListItem
                    key={`${session.id}-${index}`}
                    secondaryAction={
                      <Stack direction="row" spacing={0.5}>
                        <Button
                          size="small"
                          onClick={() => handleMoveSession(index, 'up')}
                          aria-label={`move-session-up-${session.id}`}
                          startIcon={<ArrowUpwardIcon fontSize="inherit" />}
                          disabled={index === 0}
                        >
                          {t('common.labels.up')}
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleMoveSession(index, 'down')}
                          aria-label={`move-session-down-${session.id}`}
                          startIcon={<ArrowDownwardIcon fontSize="inherit" />}
                          disabled={index === values.sessions.length - 1}
                        >
                          {t('common.labels.down')}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRemoveSession(index)}
                          aria-label={`remove-session-${session.id}`}
                          startIcon={<DeleteIcon fontSize="inherit" />}
                        >
                          {t('common.buttons.delete')}
                        </Button>
                      </Stack>
                    }
                  >
                    <ListItemText primary={session.label || session.slug} secondary={session.locale ?? values.locale} />
                  </ListItem>
                ))}
              </List>
            )}
          </Stack>

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
