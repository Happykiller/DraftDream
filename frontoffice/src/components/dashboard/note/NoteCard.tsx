import * as React from 'react';
import { useTranslation } from 'react-i18next';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { TextWithTooltip } from '@components/common/TextWithTooltip';
import { useDateFormatter } from '@hooks/useDateFormatter';
import type { Note } from '@hooks/useNotes';

interface NoteCardProps {
  note: Note;
  isPending: boolean;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => Promise<void>;
}

export function NoteCard({ note, isPending, onEdit, onDelete }: NoteCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const formatDate = useDateFormatter({ options: { day: '2-digit', month: '2-digit', year: 'numeric' } });

  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 3, p: 2, borderColor: 'divider' }}
    >
      {/* General information */}
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between">
          <TextWithTooltip tooltipTitle={note.label} fontWeight={600}>
            {note.label}
          </TextWithTooltip>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={t('dashboard.tasksNotes.notes.actions.edit')}>
              <span>
                <IconButton
                  size="small"
                  disabled={isPending}
                  onClick={() => onEdit(note)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('dashboard.tasksNotes.notes.actions.delete')}>
              <span>
                <IconButton
                  size="small"
                  disabled={isPending}
                  onClick={() => {
                    void onDelete(note);
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
          {note.description}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <CalendarMonthOutlinedIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {t('dashboard.tasksNotes.labels.created', { date: formatDate(note.createdAt) })}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
