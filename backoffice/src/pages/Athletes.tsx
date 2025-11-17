// src/pages/Athletes.tsx
import * as React from 'react';
import { Stack } from '@mui/material';

import { AthletesPanel } from '@pages/athletes/AthletesPanel';

export function Athletes(): React.JSX.Element {
  return (
    <Stack spacing={2} sx={{ mt: 3, width: '100%' }}>
      {/* General information */}
      <AthletesPanel />
    </Stack>
  );
}
