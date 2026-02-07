import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Paper,
  Stack,
  TextField,
} from '@mui/material';

import { ResponsiveButton } from '@components/common/ResponsiveButton';

interface NoteFormValues {
  label: string;
  description: string;
}

interface NoteFormProps {
  initialValues?: NoteFormValues;
  isEditing?: boolean;
  onSubmit: (data: NoteFormValues) => Promise<void>;
  onCancel: () => void;
}

export function NoteForm({
  initialValues,
  isEditing = false,
  onSubmit,
  onCancel,
}: NoteFormProps): React.JSX.Element {
  const { t } = useTranslation();
  const [label, setLabel] = React.useState(initialValues?.label ?? '');
  const [description, setDescription] = React.useState(initialValues?.description ?? '');

  React.useEffect(() => {
    setLabel(initialValues?.label ?? '');
    setDescription(initialValues?.description ?? '');
  }, [initialValues]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!label.trim() || !description.trim()) {
      return;
    }
    await onSubmit({
      label: label.trim(),
      description: description.trim(),
    });
    if (!isEditing) {
      setLabel('');
      setDescription('');
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        backgroundColor: 'grey.50',
        borderRadius: 2,
        borderColor: 'divider',
        p: 2,
      }}
    >
      {/* General information */}
      <Stack spacing={2} component="form" onSubmit={handleSubmit}>
        <TextField
          required
          fullWidth
          size="small"
          label={t('dashboard.tasksNotes.notes.form.label')}
          placeholder={t('dashboard.tasksNotes.notes.form.placeholder')}
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
        <TextField
          required
          fullWidth
          multiline
          minRows={3}
          size="small"
          label={t('dashboard.tasksNotes.notes.form.description')}
          placeholder={t('dashboard.tasksNotes.notes.form.description_placeholder')}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <ResponsiveButton
            variant="text"
            color="inherit"
            size="small"
            label={t('dashboard.tasksNotes.notes.actions.cancel')}
            onClick={onCancel}
          />
          <ResponsiveButton
            variant="contained"
            color="primary"
            size="small"
            label={t(
              isEditing
                ? 'dashboard.tasksNotes.notes.actions.save'
                : 'dashboard.tasksNotes.notes.actions.addNote',
            )}
            type="submit"
            disabled={!label.trim() || !description.trim()}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}
