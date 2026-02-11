import * as React from 'react';
import { Stack } from '@mui/material';

import { CoachPanel } from '@pages/coach/CoachPanel';

export function Coach(): React.JSX.Element {
  return (
    <Stack spacing={2} sx={{ mt: 3, width: '100%' }}>
      {/* General information */}
      <CoachPanel />
    </Stack>
  );
}
