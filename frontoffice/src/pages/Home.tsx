// src/pages/Home.tsx
import * as React from 'react';
import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { DashboardSummaryCards } from '@components/dashboard/DashboardSummaryCards';

/** Placeholder home view displayed after authentication. */
export function Home(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      <Stack spacing={0.5}>
        <Typography variant="h5">{t('dashboard.title', 'Dashboard Coach')}</Typography>
        <Typography color="text.secondary" variant="body2">
          {t('dashboard.subtitle', "Gérez vos clients et programmes d'entraînement")}
        </Typography>
      </Stack>

      <DashboardSummaryCards />
    </Stack>
  );
}
