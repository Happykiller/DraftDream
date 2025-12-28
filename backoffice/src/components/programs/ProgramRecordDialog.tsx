// src/components/programs/ProgramRecordDialog.tsx
import * as React from 'react';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

const DEFAULT_VALUES: ProgramRecordDialogValues = {
  userId: '',
  programId: '',
  sessionId: '',
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
  const [values, setValues] = React.useState<ProgramRecordDialogValues>(DEFAULT_VALUES);
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

  const sessionOptions = React.useMemo<SessionOption[]>(() => {
    if (!selectedProgramId) return [];
    const program = programs.find((p) => p.id === selectedProgramId);
    return program?.sessions.map((s) => ({ id: s.id, label: s.label })) ?? [];
  }, [programs, selectedProgramId]);

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

  React.useEffect(() => {
    if (!open) return;
    if (isEdit && initial) {
      setValues({
        userId: initial.userId,
        programId: initial.programId,
        sessionId: initial.sessionId,
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
      { value: 'IDLE' as const, label: t('programs.records.states.idle') },
      { value: 'SAVE' as const, label: t('programs.records.states.save') },
    ],
    [t],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
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
          <Autocomplete
            options={programOptions}
            value={selectedProgramOption}
            onChange={handleProgramChange}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={isEdit}
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
            disabled={isEdit || !selectedProgramId}
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
            disabled={isEdit}
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
