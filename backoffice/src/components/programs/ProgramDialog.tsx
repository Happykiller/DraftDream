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
  Stack,
  TextField,
} from '@mui/material';

import type { Program } from '@hooks/usePrograms';

export interface ProgramSessionOption {
  id: string;
  slug: string;
  title: string;
  locale?: string;
  durationMin?: number;
}

export interface ProgramDialogValues {
  name: string;
  duration: number;
  frequency: number;
  description: string;
  sessions: ProgramSessionOption[];
}

export interface ProgramDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Program | null;
  sessionOptions: ProgramSessionOption[];
  onClose: () => void;
  onSubmit: (values: ProgramDialogValues) => Promise<void> | void;
}

const DEFAULT_VALUES: ProgramDialogValues = {
  name: '',
  duration: 4,
  frequency: 3,
  description: '',
  sessions: [],
};

function mergeSessionOptions(
  ids: string[],
  options: ProgramSessionOption[],
  fallback?: Program['sessions']
): ProgramSessionOption[] {
  const byId = new Map(options.map((option) => [option.id, option]));

  if (fallback) {
    fallback.forEach((session) => {
      if (!byId.has(session.id)) {
        byId.set(session.id, {
          id: session.id,
          slug: session.slug,
          title: session.title,
          locale: session.locale,
          durationMin: session.durationMin,
        });
      }
    });
  }

  return ids
    .map((id) => byId.get(id))
    .filter((option): option is ProgramSessionOption => Boolean(option));
}

export function ProgramDialog({
  open,
  mode,
  initial,
  sessionOptions,
  onClose,
  onSubmit,
}: ProgramDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<ProgramDialogValues>(DEFAULT_VALUES);
  const isEdit = mode === 'edit';

  React.useEffect(() => {
    if (isEdit && initial) {
      setValues({
        name: initial.name,
        duration: initial.duration,
        frequency: initial.frequency,
        description: initial.description ?? '',
        sessions: mergeSessionOptions(initial.sessionIds, sessionOptions, initial.sessions),
      });
    } else {
      setValues(DEFAULT_VALUES);
    }
  }, [isEdit, initial, sessionOptions, open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: name === 'duration' || name === 'frequency' ? Number(value) : value,
    }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.name.trim()) return;
    if (values.duration <= 0 || values.frequency <= 0) return;
    if (values.sessions.length === 0) return;
    await onSubmit({
      ...values,
      name: values.name.trim(),
      description: values.description.trim(),
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="program-dialog-title" fullWidth maxWidth="sm">
      <DialogTitle id="program-dialog-title">{isEdit ? 'Edit Program' : 'New Program'}</DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={2} sx={{ mt: 1 }} onSubmit={submit}>
          <TextField
            label="Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            required
            fullWidth
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Duration (weeks)"
              name="duration"
              type="number"
              value={values.duration}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Frequency / week"
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
            label="Description"
            name="description"
            value={values.description}
            onChange={handleChange}
            multiline
            minRows={3}
            fullWidth
          />

          <Autocomplete
            multiple
            options={sessionOptions}
            getOptionLabel={(option) => option.title || option.slug}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={values.sessions}
            onChange={(_, newValue) => setValues((prev) => ({ ...prev, sessions: newValue }))}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option.id} label={option.title || option.slug} />
              ))
            }
            renderInput={(params) => <TextField {...params} label="Sessions" placeholder="Select sessions" />}
          />

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {isEdit ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
