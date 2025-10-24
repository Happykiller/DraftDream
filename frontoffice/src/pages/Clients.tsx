// src/pages/Clients.tsx
import * as React from 'react';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';

/** Placeholder clients page awaiting functional implementation. */
export function Clients(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {/* General information */}
      <Grid>{t('clients.placeholder')}</Grid>
    </Grid>
  );
}
