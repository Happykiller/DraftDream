import * as React from 'react';
import { Stack } from '@mui/material';

import { NotesPanel } from '@pages/notes/NotesPanel';

/** Entry page for backoffice notes. */
export function Notes(): React.JSX.Element {
  return (
    <Stack spacing={2} sx={{ mt: 3, width: '100%' }}>
      {/* General information */}
      <NotesPanel />
    </Stack>
  );
}
