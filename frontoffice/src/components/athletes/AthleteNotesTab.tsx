import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { NoteCard } from '@components/dashboard/note/NoteCard';
import { useNotes, type Note } from '@hooks/useNotes';

interface NoteFormState {
  label: string;
  description: string;
}

interface AthleteNotesTabProps {
  athleteId?: string;
}

const DEFAULT_FORM_STATE: NoteFormState = {
  label: '',
  description: '',
};

/**
 * Tab content to manage notes linked to a specific athlete.
 */
export function AthleteNotesTab({ athleteId }: AthleteNotesTabProps): React.JSX.Element {
  const { t } = useTranslation();
  const [page, setPage] = React.useState(1);
  const [searchValue, setSearchValue] = React.useState('');
  const [pendingNoteId, setPendingNoteId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);
  const [formState, setFormState] = React.useState<NoteFormState>(DEFAULT_FORM_STATE);

  const { items, total, loading, create, update, remove } = useNotes({
    page,
    limit: 6,
    athleteId,
    enabled: Boolean(athleteId),
  });

  const totalPages = Math.max(1, Math.ceil(total / 6));

  const filteredItems = React.useMemo(() => {
    const normalizedFilter = searchValue.trim().toLowerCase();
    if (!normalizedFilter) return items;

    return items.filter((note) => {
      const labelMatch = note.label.toLowerCase().includes(normalizedFilter);
      const descriptionMatch = note.description.toLowerCase().includes(normalizedFilter);
      return labelMatch || descriptionMatch;
    });
  }, [items, searchValue]);

  React.useEffect(() => {
    if (dialogOpen && editingNote) {
      setFormState({ label: editingNote.label, description: editingNote.description });
    } else if (dialogOpen) {
      setFormState(DEFAULT_FORM_STATE);
    }
  }, [dialogOpen, editingNote]);

  const handleOpenDialog = React.useCallback((note?: Note) => {
    setEditingNote(note ?? null);
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = React.useCallback(() => {
    setDialogOpen(false);
    setEditingNote(null);
    setFormState(DEFAULT_FORM_STATE);
  }, []);

  const handleSave = React.useCallback(async () => {
    if (!athleteId) return;
    const trimmedLabel = formState.label.trim();
    const trimmedDescription = formState.description.trim();
    if (!trimmedLabel || !trimmedDescription) return;

    if (editingNote) {
      await update({
        id: editingNote.id,
        label: trimmedLabel,
        description: trimmedDescription,
        athleteId,
      });
    } else {
      await create({
        label: trimmedLabel,
        description: trimmedDescription,
        athleteId,
      });
    }

    handleCloseDialog();
  }, [athleteId, create, editingNote, formState.description, formState.label, handleCloseDialog, update]);

  const handleDelete = React.useCallback(async (note: Note) => {
    setPendingNoteId(note.id);
    try {
      await remove(note.id);
    } finally {
      setPendingNoteId(null);
    }
  }, [remove]);

  const handlePageChange = React.useCallback((_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  }, []);

  const handleSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    setPage(1);
  }, []);

  const isSaveDisabled = !formState.label.trim() || !formState.description.trim();

  return (
    <Stack spacing={2} sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
      {/* General information */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" gap={2}>
        <TextField
          fullWidth
          size="small"
          value={searchValue}
          onChange={handleSearchChange}
          label={t('athletes.details.notes_tab.search.label')}
          placeholder={t('athletes.details.notes_tab.search.placeholder')}
          sx={{ maxWidth: { xs: '100%', sm: 320 }, bgcolor: 'white' }}
        />
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          {t('athletes.details.notes_tab.actions.new')}
        </Button>
      </Stack>

      {filteredItems.length ? (
        <Stack spacing={2}>
          {filteredItems.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isPending={pendingNoteId === note.id}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
            />
          ))}
        </Stack>
      ) : (
        !loading && (
          <Box
            sx={{
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              py: 4,
              px: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {t('athletes.details.notes_tab.empty.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('athletes.details.notes_tab.empty.subtitle')}
            </Typography>
          </Box>
        )
      )}

      {totalPages > 1 ? (
        <Stack direction="row" justifyContent="center">
          <Pagination
            color="primary"
            page={page}
            count={totalPages}
            onChange={handlePageChange}
          />
        </Stack>
      ) : null}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {t(
            editingNote
              ? 'athletes.details.notes_tab.dialog.edit_title'
              : 'athletes.details.notes_tab.dialog.create_title',
          )}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              required
              fullWidth
              size="small"
              label={t('athletes.details.notes_tab.form.label')}
              placeholder={t('athletes.details.notes_tab.form.placeholder')}
              value={formState.label}
              onChange={(event) => setFormState((prev) => ({ ...prev, label: event.target.value }))}
            />
            <TextField
              required
              fullWidth
              size="small"
              multiline
              minRows={4}
              label={t('athletes.details.notes_tab.form.description')}
              placeholder={t('athletes.details.notes_tab.form.description_placeholder')}
              value={formState.description}
              onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('athletes.details.notes_tab.actions.cancel')}
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={isSaveDisabled}>
            {t('athletes.details.notes_tab.actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
