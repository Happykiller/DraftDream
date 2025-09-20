// src/pages/Home.tsx
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Stack } from '@mui/material';

import { session } from '@stores/session';

export function Home(): React.JSX.Element {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Reset the persisted session
    session.getState().reset?.();
    // Navigate back to login
    navigate('/login', { replace: true });
  };

  return (
    <Stack spacing={3} alignItems="center" sx={{ mt: 6 }}>
      <Typography variant="h3">Home</Typography>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleLogout}
        aria-label="Logout"
      >
        Logout
      </Button>
    </Stack>
  );
}
