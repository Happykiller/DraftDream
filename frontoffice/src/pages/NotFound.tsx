// src/pages/NotFound.tsx
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';

export function NotFound(): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <Stack spacing={2} alignItems="flex-start" sx={{ py: 6 }}>
      <Typography variant="h4" role="heading" aria-level={1}>404 — Not found</Typography>
      <Button onClick={() => navigate('/')}>Go home</Button>
    </Stack>
  );
}
