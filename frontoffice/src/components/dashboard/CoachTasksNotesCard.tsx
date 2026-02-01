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

export function CoachTasksNotesCard(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <GlassCard sx={{ width: '100%' }}>
      {/* General information */}
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <AddTaskOutlinedIcon color="warning" />
          <Typography variant="h6" fontWeight={600}>
            {t('dashboard.tasksNotes.title')}
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
