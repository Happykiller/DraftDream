// src/components/programs/ProgramRecordDialog.tsx
import * as React from 'react';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useDateFormatter } from '@hooks/useDateFormatter';
import type { Program } from '@hooks/usePrograms';
import type { User } from '@hooks/useUsers';
import type { ProgramRecord, ProgramRecordState } from '@hooks/useProgramRecords';

interface ProgramOption {
  id: string;
  label: string;
}

interface AthleteOption {
  id: string;
  label: string;
}

interface SessionOption {
  id: string;
  label: string;
}

export interface ProgramRecordDialogValues {
  userId: string;
  programId: string;
  sessionId: string;
  comment?: string;
  satisfactionRating?: number;
  state: ProgramRecordState;
}

interface ProgramRecordDialogFormValues {
  userId: string;
  programId: string;
  sessionId: string;
  comment: string;
  satisfactionRating: string;
  state: ProgramRecordState;
}

export interface ProgramRecordDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: ProgramRecord | null;
  programs: Program[];
  users: User[];
  onClose: () => void;
  onSubmit: (values: ProgramRecordDialogValues) => Promise<void> | void;
}

const DEFAULT_VALUES: ProgramRecordDialogFormValues = {
  userId: '',
  programId: '',
  sessionId: '',
  comment: '',
  satisfactionRating: '',
  state: 'CREATE',
};

export function ProgramRecordDialog({
  open,
  mode,
  initial,
  programs,
  users,
  onClose,
  onSubmit,
}: ProgramRecordDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<ProgramRecordDialogFormValues>(DEFAULT_VALUES);
  const [selectedProgramId, setSelectedProgramId] = React.useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(null);
  const [selectedAthleteId, setSelectedAthleteId] = React.useState<string | null>(null);
  const isEdit = mode === 'edit';
  const { t } = useTranslation();
  const formatDate = useDateFormatter();

  const formattedCreatedAt = React.useMemo(
    () => (initial?.createdAt ? formatDate(initial.createdAt) : '-'),
    [formatDate, initial?.createdAt],
  );
  const formattedUpdatedAt = React.useMemo(
    () => (initial?.updatedAt ? formatDate(initial.updatedAt) : '-'),
    [formatDate, initial?.updatedAt],
  );
  const programOptions = React.useMemo<ProgramOption[]>(
    () => programs.map((program) => ({ id: program.id, label: program.label })),
    [programs],
  );
  const athleteOptions = React.useMemo<AthleteOption[]>(
    () =>
      users.map((athlete) => ({
        id: athlete.id,
        label: `${athlete.first_name} ${athlete.last_name} (${athlete.email})`,
      })),
    [users],
  );
  const selectedProgramOption = React.useMemo<ProgramOption | null>(() => {
    if (!selectedProgramId) return null;
    return programOptions.find((option) => option.id === selectedProgramId)
      ?? { id: selectedProgramId, label: selectedProgramId };
  }, [programOptions, selectedProgramId]);
  const selectedProgram = React.useMemo(
    () => programs.find((program) => program.id === selectedProgramId) ?? null,
    [programs, selectedProgramId],
  );

  const sessionOptions = React.useMemo<SessionOption[]>(() => {
    if (!selectedProgramId) return [];
    return selectedProgram?.sessions.map((s) => ({ id: s.id, label: s.label })) ?? [];
  }, [selectedProgram, selectedProgramId]);

  const selectedSessionOption = React.useMemo<SessionOption | null>(() => {
    if (!selectedSessionId) return null;
    return sessionOptions.find((option) => option.id === selectedSessionId)
      ?? { id: selectedSessionId, label: selectedSessionId }; // Fallback to ID if not found (e.g. if searching not fully loaded, though sessions are inside program)
  }, [sessionOptions, selectedSessionId]);
  const selectedAthleteOption = React.useMemo<AthleteOption | null>(() => {
    if (!selectedAthleteId) return null;
    return athleteOptions.find((option) => option.id === selectedAthleteId)
      ?? { id: selectedAthleteId, label: selectedAthleteId };
  }, [athleteOptions, selectedAthleteId]);
  const recordExercises = initial?.recordData?.exercises ?? [];
  const hasRecordData = recordExercises.length > 0;

  React.useEffect(() => {
    if (!open) return;
    if (isEdit && initial) {
      setValues({
        userId: initial.userId,
        programId: initial.programId,
        sessionId: initial.sessionId,
        comment: initial.comment ?? '',
        satisfactionRating: initial.satisfactionRating !== null && initial.satisfactionRating !== undefined
          ? String(initial.satisfactionRating)
          : '',
        state: initial.state,
      });
      setSelectedProgramId(initial.programId);
      setSelectedSessionId(initial.sessionId);
      setSelectedAthleteId(initial.userId);
      return;
    }
    setValues(DEFAULT_VALUES);
    setSelectedProgramId(null);
    setSelectedSessionId(null);
    setSelectedAthleteId(null);
  }, [initial, isEdit, open]);

  const stateOptions = React.useMemo(
    () => [
      { value: 'CREATE' as const, label: t('programs.records.states.create') },
      { value: 'DRAFT' as const, label: t('programs.records.states.draft') },
      { value: 'FINISH' as const, label: t('programs.records.states.finish') },
    ],
    [t],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const normalized = value.replace(/[^\d]/g, '');
    setValues((prev) => ({ ...prev, satisfactionRating: normalized }));
  };

  const handleProgramChange = (_: unknown, option: ProgramOption | null) => {
    setSelectedProgramId(option?.id ?? null);
    setSelectedSessionId(null); // Reset session when program changes
    setValues((prev) => ({ ...prev, programId: option?.id ?? '', sessionId: '' }));
  };

  const handleSessionChange = (_: unknown, option: SessionOption | null) => {
    setSelectedSessionId(option?.id ?? null);
    setValues((prev) => ({ ...prev, sessionId: option?.id ?? '' }));
  };

  const handleAthleteChange = (_: unknown, option: AthleteOption | null) => {
    setSelectedAthleteId(option?.id ?? null);
    setValues((prev) => ({ ...prev, userId: option?.id ?? '' }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!values.userId.trim() || !values.programId.trim() || !values.sessionId.trim()) return;
    await onSubmit({
      ...values,
      userId: values.userId.trim(),
      programId: values.programId.trim(),
      sessionId: values.sessionId.trim(),
      comment: values.comment.trim() || undefined,
      satisfactionRating: values.satisfactionRating.trim()
        ? Number(values.satisfactionRating.trim())
        : undefined,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="program-record-dialog-title"
      fullWidth
      maxWidth="md"
    >
      <DialogTitle id="program-record-dialog-title">
        {isEdit
          ? t('programs.records.dialog.edit_title')
          : t('programs.records.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>
          {isEdit && initial ? (
            <Stack spacing={1.5}>
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
            select
            label={t('programs.records.labels.state')}
            name="state"
            value={values.state}
            onChange={handleChange}
            required
            fullWidth
          >
            {stateOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {isEdit ? (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common.labels.program')}
                </Typography>
                <Typography variant="body2">
                  {selectedProgramOption?.label ?? initial?.programId ?? '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common.labels.session')}
                </Typography>
                <Typography variant="body2">
                  {selectedSessionOption?.label ?? initial?.sessionId ?? '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('common.labels.athlete')}
                </Typography>
                <Typography variant="body2">
                  {selectedAthleteOption?.label ?? initial?.userId ?? '-'}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <>
              <Autocomplete
                options={programOptions}
                value={selectedProgramOption}
                onChange={handleProgramChange}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.label}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('common.labels.program')}
                    placeholder={t('programs.records.placeholders.program')}
                    inputProps={{ ...params.inputProps, 'aria-label': 'program-record-program' }}
                    required
                    fullWidth
                  />
                )}
              />
              <Autocomplete
                options={sessionOptions}
                value={selectedSessionOption}
                onChange={handleSessionChange}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disabled={!selectedProgramId}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.label}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('common.labels.session')}
                    placeholder={t('programs.records.placeholders.session')}
                    inputProps={{ ...params.inputProps, 'aria-label': 'program-record-session' }}
                    required
                    fullWidth
                  />
                )}
              />
              <Autocomplete
                options={athleteOptions}
                value={selectedAthleteOption}
                onChange={handleAthleteChange}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.label}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('common.labels.athlete')}
                    placeholder={t('programs.records.placeholders.athlete')}
                    inputProps={{ ...params.inputProps, 'aria-label': 'program-record-user' }}
                    required
                    fullWidth
                  />
                )}
              />
            </>
          )}
          <TextField
            label={t('programs.records.labels.satisfaction_rating')}
            name="satisfactionRating"
            value={values.satisfactionRating}
            onChange={handleRatingChange}
            placeholder={t('programs.records.placeholders.satisfaction_rating')}
            type="number"
            inputProps={{ min: 0, max: 10, 'aria-label': 'program-record-satisfaction-rating' }}
            fullWidth
          />
          {isEdit && initial ? (
            <TextField
              label={t('programs.records.labels.difficulty_rating')}
              value={initial.difficultyRating ?? ''}
              placeholder="-"
              InputProps={{ readOnly: true }}
              fullWidth
            />
          ) : null}
          <TextField
            label={t('programs.records.labels.comment')}
            name="comment"
            value={values.comment}
            onChange={handleChange}
            placeholder={t('programs.records.placeholders.comment')}
            multiline
            minRows={3}
            fullWidth
          />
          {isEdit && initial ? (
            <Stack spacing={2}>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('programs.records.labels.metrics')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t('programs.records.labels.duration_minutes')}
                    </Typography>
                    <Typography variant="body2">
                      {initial.durationMinutes ?? '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('programs.records.labels.record_data')}
                </Typography>
                {hasRecordData ? (
                  <Stack spacing={1.5}>
                    {recordExercises.map((exercise) => {
                      const exerciseLabel = exercise.exerciseId;
                      return (
                        <Stack key={exercise.exerciseId} spacing={1}>
                          <Typography variant="body2" fontWeight={600}>
                            {exerciseLabel}
                          </Typography>
                          {exercise.notes ? (
                            <Typography variant="caption" color="text.secondary">
                              {exercise.notes}
                            </Typography>
                          ) : null}
                          <Stack spacing={1}>
                            {exercise.sets.map((set) => (
                              <Grid container spacing={1} key={`${exercise.exerciseId}-${set.index}`}>
                                <Grid size={{ xs: 12, sm: 2 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {t('programs.records.labels.series', { index: set.index })}
                                  </Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 2 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {t('programs.records.labels.repetitions')}
                                  </Typography>
                                  <Typography variant="body2">{set.repetitions ?? '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 2 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {t('programs.records.labels.charge')}
                                  </Typography>
                                  <Typography variant="body2">{set.charge ?? '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 2 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {t('programs.records.labels.rpe')}
                                  </Typography>
                                  <Typography variant="body2">{set.rpe ?? '-'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 2 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    {t('programs.records.labels.done')}
                                  </Typography>
                                  <Typography variant="body2">
                                    {set.done ? t('common.labels.yes') : t('common.labels.no')}
                                  </Typography>
                                </Grid>
                              </Grid>
                            ))}
                          </Stack>
                        </Stack>
                      );
                    })}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t('programs.records.labels.record_data_empty')}
                  </Typography>
                )}
              </Stack>
            </Stack>
          ) : null}
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
