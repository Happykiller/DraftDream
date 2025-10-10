// src/pages/Home.tsx
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { session } from '@stores/session';

export function Home(): React.JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    // Reset the persisted session
    session.getState().reset?.();
    // Navigate back to login
    navigate('/login', { replace: true });
  };

  return (
    <Stack spacing={3} alignItems="center" sx={{ mt: 6 }}>
      <Typography variant="h3">{t('home.title')}</Typography>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleLogout}
        aria-label={t('header.logout')}
      >
        {t('header.logout')}
      </Button>
    </Stack>
  );
}
