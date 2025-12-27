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
import { usePrograms } from '@hooks/usePrograms';
import { useUsers } from '@hooks/useUsers';
import type { ProgramRecord, ProgramRecordState } from '@hooks/useProgramRecords';

interface ProgramOption {
  id: string;
  label: string;
}

interface AthleteOption {
  id: string;
  label: string;
}

export interface ProgramRecordDialogValues {
  userId: string;
  programId: string;
  state: ProgramRecordState;
}

export interface ProgramRecordDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: ProgramRecord | null;
  onClose: () => void;
  onSubmit: (values: ProgramRecordDialogValues) => Promise<void> | void;
}

const DEFAULT_VALUES: ProgramRecordDialogValues = {
  userId: '',
  programId: '',
  state: 'CREATE',
};

export function ProgramRecordDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
}: ProgramRecordDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<ProgramRecordDialogValues>(DEFAULT_VALUES);
  const [selectedProgramId, setSelectedProgramId] = React.useState<string | null>(null);
  const [selectedAthleteId, setSelectedAthleteId] = React.useState<string | null>(null);
  const isEdit = mode === 'edit';
  const { t } = useTranslation();
  const formatDate = useDateFormatter();
  const { items: programItems } = usePrograms({ page: 1, limit: 50, q: '' });
  const { items: athleteItems } = useUsers({
    page: 1,
    limit: 50,
    q: '',
    type: 'athlete',
  });

  const formattedCreatedAt = React.useMemo(
    () => (initial?.createdAt ? formatDate(initial.createdAt) : '-'),
    [formatDate, initial?.createdAt],
  );
  const formattedUpdatedAt = React.useMemo(
    () => (initial?.updatedAt ? formatDate(initial.updatedAt) : '-'),
    [formatDate, initial?.updatedAt],
  );
  const programOptions = React.useMemo<ProgramOption[]>(
    () => programItems.map((program) => ({ id: program.id, label: program.label })),
    [programItems],
  );
  const athleteOptions = React.useMemo<AthleteOption[]>(
    () =>
      athleteItems.map((athlete) => ({
        id: athlete.id,
        label: `${athlete.first_name} ${athlete.last_name} (${athlete.email})`,
      })),
    [athleteItems],
  );
  const selectedProgramOption = React.useMemo<ProgramOption | null>(() => {
    if (!selectedProgramId) return null;
    return programOptions.find((option) => option.id === selectedProgramId)
      ?? { id: selectedProgramId, label: selectedProgramId };
  }, [programOptions, selectedProgramId]);
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
        state: initial.state,
      });
      setSelectedProgramId(initial.programId);
      setSelectedAthleteId(initial.userId);
      return;
    }
    setValues(DEFAULT_VALUES);
    setSelectedProgramId(null);
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
    setValues((prev) => ({ ...prev, programId: option?.id ?? '' }));
  };

  const handleAthleteChange = (_: unknown, option: AthleteOption | null) => {
    setSelectedAthleteId(option?.id ?? null);
    setValues((prev) => ({ ...prev, userId: option?.id ?? '' }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!values.userId.trim() || !values.programId.trim()) return;
    await onSubmit({
      ...values,
      userId: values.userId.trim(),
      programId: values.programId.trim(),
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
      {/* General information */}
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
