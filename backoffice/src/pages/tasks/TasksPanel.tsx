import * as React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ModerationTasksTable } from '@components/tasks/ModerationTasksTable';
import { useTabParams } from '@hooks/useTabParams';
import { useTasks } from '@hooks/useTasks';

/** Display moderation tasks list and helper copy. */
export function TasksPanel(): React.JSX.Element {
  const { t } = useTranslation();
  const { page, limit, setPage, setLimit } = useTabParams('tasks', { page: 1, limit: 25 });
  const { items, total, loading, reload } = useTasks({ page, limit });

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
        <ModerationTasksTable
          rows={items}
          total={total}
          page={page}
          limit={limit}
          loading={loading}
          onRefresh={() => {
            void reload();
          }}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </Stack>
    </Box>
  );
}
