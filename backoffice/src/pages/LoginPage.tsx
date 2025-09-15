// src/pages/LoginPage.tsx
// ⚠️ Comment in English: Minimal login page; replace with your actual form.
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Stack, Typography } from '@mui/material';

export function LoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Dummy login
    //await authService.login({ username: 'demo', password: 'demo' });
    navigate('/', { replace: true });
  };

  return (
    <Box component="form" onSubmit={onSubmit} aria-labelledby="login-title" sx={{ mt: 6 }}>
      <Stack spacing={2}>
        <Typography id="login-title" variant="h4">Login</Typography>
        <TextField label="Email" type="email" name="email" autoComplete="email" fullWidth required />
        <TextField label="Password" type="password" name="password" autoComplete="current-password" fullWidth required />
        <Button type="submit" variant="contained" disabled={loading} aria-busy={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </Stack>
    </Box>
  );
}
