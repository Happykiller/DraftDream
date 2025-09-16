// src/pages/LoginPage.tsx
// ⚠️ Comment in English: Auth page using useAsyncTask to wrap useAuthReq, with flash feedback.

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Stack, Typography } from '@mui/material';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useAuthReq } from '@hooks/useAuthReq';
import { useLoaderStore } from '@stores/loader';
import { useFlashStore } from '@hooks/useFlashStore';
import { CODES } from '@app/commons/CODES';

export function LoginPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { execute: runTask } = useAsyncTask();
  const { execute: auth } = useAuthReq();
  const loading = useLoaderStore((s) => s.loading);
  const flash = useFlashStore();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') ?? '');
    const password = String(fd.get('password') ?? '');

    // Defensive: empty fields (should be prevented by required attrs)
    if (!email || !password) {
      flash.warning('Please fill email and password');
      return;
    }

    const result:any = await runTask(() => auth({ email, password }));
    // runTask returns T | null (null when task throws)
    if (!result) {
      flash.error('Unexpected error, please try again.');
      return;
    }

    console.log('Auth result:', result);

    if (result.message === CODES.SUCCESS && result.data) {
      const { name_first, name_last } = result.data;
      flash.success(`Welcome ${name_first} ${name_last}`);
      navigate('/', { replace: true });
    } else {
      // Prefer server message if present
      flash.error(result.error || 'Invalid credentials');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      aria-labelledby="login-title"
      sx={{ mt: 6 }}
    >
      <Stack spacing={2}>
        <Typography id="login-title" variant="h4">
          Login
        </Typography>
        {/* Note: names must match FormData keys */}
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          fullWidth
          required
          inputProps={{ 'aria-required': true }}
        />
        <TextField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          fullWidth
          required
          inputProps={{ 'aria-required': true }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </Stack>
    </Box>
  );
}
