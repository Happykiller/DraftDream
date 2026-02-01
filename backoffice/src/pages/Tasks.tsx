import * as React from 'react';
import { Stack } from '@mui/material';

import { TasksPanel } from '@pages/tasks/TasksPanel';

/** Entry page for moderation tasks. */
export function Tasks(): React.JSX.Element {
  return (
    <Stack spacing={2} sx={{ mt: 3, width: '100%' }}>
      {/* General information */}
      <TasksPanel />
    </Stack>
  );
}
