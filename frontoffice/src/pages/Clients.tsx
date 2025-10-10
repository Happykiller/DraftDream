// src/pages/Clients.tsx
import * as React from 'react';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

export function Clients(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      <Grid>{t('clients.placeholder')}</Grid>
    </Grid>
  );
}
