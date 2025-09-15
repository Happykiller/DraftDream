// src/pages/NotFoundPage.tsx
// ⚠️ Comment in English: 404 fallback.
import * as React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage(): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <Stack spacing={2} alignItems="flex-start" sx={{ py: 6 }}>
      <Typography variant="h4" role="heading" aria-level={1}>404 — Not found</Typography>
      <Button onClick={() => navigate('/')}>Go home</Button>
    </Stack>
  );
}
