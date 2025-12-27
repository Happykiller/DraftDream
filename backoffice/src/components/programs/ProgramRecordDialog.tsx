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

import { useDebouncedValue } from '@hooks/useDebouncedValue';
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
  const [selectedProgram, setSelectedProgram] = React.useState<ProgramOption | null>(null);
  const [selectedAthlete, setSelectedAthlete] = React.useState<AthleteOption | null>(null);
  const [programSearch, setProgramSearch] = React.useState('');
  const [athleteSearch, setAthleteSearch] = React.useState('');
  const isEdit = mode === 'edit';
  const { t } = useTranslation();
  const formatDate = useDateFormatter();
  const debouncedProgramSearch = useDebouncedValue(programSearch, 300);
  const debouncedAthleteSearch = useDebouncedValue(athleteSearch, 300);
  const { items: programItems } = usePrograms({ page: 1, limit: 10, q: debouncedProgramSearch });
  const { items: athleteItems } = useUsers({
    page: 1,
    limit: 10,
    q: debouncedAthleteSearch,
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

  React.useEffect(() => {
    if (isEdit && initial) {
      setValues({
        userId: initial.userId,
        programId: initial.programId,
        state: initial.state,
      });
      setSelectedProgram({
        id: initial.programId,
        label: programOptions.find((option) => option.id === initial.programId)?.label ?? initial.programId,
      });
      setSelectedAthlete({
        id: initial.userId,
        label: athleteOptions.find((option) => option.id === initial.userId)?.label ?? initial.userId,
      });
    } else {
      setValues(DEFAULT_VALUES);
      setSelectedProgram(null);
      setSelectedAthlete(null);
    }
  }, [athleteOptions, initial, isEdit, open, programOptions]);

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
    setSelectedProgram(option);
    setValues((prev) => ({ ...prev, programId: option?.id ?? '' }));
  };

  const handleAthleteChange = (_: unknown, option: AthleteOption | null) => {
    setSelectedAthlete(option);
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
            value={selectedProgram}
            onChange={handleProgramChange}
            inputValue={programSearch}
            onInputChange={(_, value) => setProgramSearch(value)}
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
            value={selectedAthlete}
            onChange={handleAthleteChange}
            inputValue={athleteSearch}
            onInputChange={(_, value) => setAthleteSearch(value)}
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
