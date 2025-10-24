// src/pages/Home.tsx
import * as React from 'react';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

/** Placeholder home view displayed after authentication. */
export function Home(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {/* General information */}
      <Grid>{t('home.placeholder')}</Grid>
    </Grid>
  );
}
