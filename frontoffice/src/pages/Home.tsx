// src/pages/Home.tsx
import * as React from 'react';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

export function Home(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      <Grid>{t('home.placeholder')}</Grid>
    </Grid>
  );
}
