import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { ResponsiveButton } from '@components/common/ResponsiveButton';
import { useNotes, type Note } from '@hooks/useNotes';
import { NoteCard } from './NoteCard';
import { NoteForm } from './NoteForm';

export function NoteList(): React.JSX.Element {
  const { t } = useTranslation();
  const [showForm, setShowForm] = React.useState(false);
  const [pendingNoteId, setPendingNoteId] = React.useState<string | null>(null);
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);

  const noteQuery = React.useMemo(
    () => ({
      page: 1,
      limit: 10,
    }),
    [],
  );

  const { items, loading, create, update, remove } = useNotes(noteQuery);

  const handleFormSubmit = async (data: { label: string; description: string }) => {
    if (editingNote) {
      await update({ id: editingNote.id, ...data });
    } else {
      await create(data);
    }
    setEditingNote(null);
    setShowForm(false);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setShowForm(true);
  };

  const handleDelete = async (note: Note) => {
    setPendingNoteId(note.id);
    try {
      await remove(note.id);
    } finally {
      setPendingNoteId(null);
    }
  };

  const handleCancel = () => {
    setEditingNote(null);
    setShowForm(false);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: 'divider',
        p: { xs: 2, sm: 3 },
        height: '100%',
      }}
    >
      {/* General information */}
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
          <Typography variant="subtitle1" fontWeight={600}>
            {t('dashboard.tasksNotes.notes.title')}
          </Typography>
          <ResponsiveButton
            variant="outlined"
            color="primary"
            size="small"
            label={t('dashboard.tasksNotes.notes.actions.newNote')}
            onClick={() => {
              setEditingNote(null);
              setShowForm(true);
            }}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
          />
        </Stack>

        {showForm && (
          <NoteForm
            initialValues={
              editingNote
                ? { label: editingNote.label, description: editingNote.description }
                : undefined
            }
            isEditing={Boolean(editingNote)}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        )}

        <Stack spacing={2}>
          {items.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isPending={pendingNoteId === note.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          {!items.length && !loading && (
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
                textAlign: 'center',
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {t('dashboard.tasksNotes.notes.empty.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.tasksNotes.notes.empty.subtitle')}
              </Typography>
            </Paper>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
