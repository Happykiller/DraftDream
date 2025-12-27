// src/components/programs/ProgramRecordDialog.tsx
import * as React from 'react';
import {
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

import type { ProgramRecord, ProgramRecordState } from '@hooks/useProgramRecords';
import { useDateFormatter } from '@hooks/useDateFormatter';

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

  React.useEffect(() => {
    if (isEdit && initial) {
      setValues({
        userId: initial.userId,
        programId: initial.programId,
        state: initial.state,
      });
    } else {
      setValues(DEFAULT_VALUES);
    }
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
    <Dialog open={open} onClose={onClose} aria-labelledby="program-record-dialog-title">
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
            label={t('common.labels.user')}
            name="userId"
            value={values.userId}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'program-record-user' }}
            required
            fullWidth
            disabled={isEdit}
          />
          <TextField
            label={t('common.labels.program')}
            name="programId"
            value={values.programId}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'program-record-program' }}
            required
            fullWidth
            disabled={isEdit}
          />
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
