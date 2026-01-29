import * as React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ModerationTasksTable, type ModerationTask } from '@components/tasks/ModerationTasksTable';

const EMPTY_TASKS: ModerationTask[] = [];

/** Display moderation tasks list and helper copy. */
export function TasksPanel(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Box>
      {/* General information */}
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="h6">{t('tasks.moderation.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('tasks.moderation.subtitle')}
          </Typography>
        </Stack>
        <ModerationTasksTable rows={EMPTY_TASKS} loading={false} />
      </Stack>
    </Box>
  );
}
