import * as React from 'react';
import { useTranslation } from 'react-i18next';
import AddTaskOutlinedIcon from '@mui/icons-material/AddTaskOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import {
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { GlassCard } from '@components/common/GlassCard';
import { TaskList } from './task/TaskList';

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
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderColor: 'divider',
                p: { xs: 2, sm: 3 },
                height: '100%',
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <NotesOutlinedIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t('dashboard.tasksNotes.notes.title')}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {t('dashboard.tasksNotes.notes.placeholder')}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </GlassCard>
  );
}
