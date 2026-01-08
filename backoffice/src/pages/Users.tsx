// src/pages/Users.tsx
import * as React from 'react';
import { Stack } from '@mui/material';
import { UsersPanel } from '@src/pages/users/UsersPanel';

export function Users(): React.JSX.Element {
  return (
    <Stack spacing={2} sx={{ mt: 3, width: '100%' }}>
      {/* General information */}
      <UsersPanel />
    </Stack>
  );
}
