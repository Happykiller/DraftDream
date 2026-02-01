import * as React from 'react';
import { useTranslation } from 'react-i18next';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import {
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import { GlassCard } from '@components/common/GlassCard';
import { TaskList } from './task/TaskList';
import { NoteList } from './note/NoteList';
import { useTasks } from '@hooks/useTasks';
import { useNotes } from '@hooks/useNotes';

export function CoachTasksNotesCard(): React.JSX.Element {
  const { t } = useTranslation();

  const tasksQuery = React.useMemo(() => ({ page: 1, limit: 1 }), []);
  const openTasksQuery = React.useMemo(() => ({ page: 1, limit: 1, status: 'TODO' as const }), []);
  const notesQuery = React.useMemo(() => ({ page: 1, limit: 1 }), []);

  const { total: totalTasks } = useTasks(tasksQuery);
  const { total: totalOpenTasks } = useTasks(openTasksQuery);
  const { total: totalNotes } = useNotes(notesQuery);

  return (
    <GlassCard sx={{ width: '100%' }}>
      {/* General information */}
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <AddTaskOutlinedIcon color="warning" />
            <Typography variant="h6" fontWeight={600}>
              {t('dashboard.tasksNotes.title')}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {totalOpenTasks} {t('dashboard.tasksNotes.filters.open')} / {totalTasks} {t('dashboard.tasksNotes.tasks.title').toLowerCase()} · {totalNotes} {t('dashboard.tasksNotes.notes.title').toLowerCase()}
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, xl: 6 }}>
            <TaskList />
          </Grid>

          <Grid size={{ xs: 12, xl: 6 }}>
            <NoteList />
          </Grid>
        </Grid>
      </Stack>
    </GlassCard>
  );
}
