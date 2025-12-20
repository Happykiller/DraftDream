// src/pages/Home.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';

import { AthleteDashboardSummaryCards } from '@components/dashboard/AthleteDashboardSummaryCards';
import { CoachDashboardSummaryCards } from '@components/dashboard/CoachDashboardSummaryCards';
import { UserType } from '@src/commons/enums';
import { session } from '@stores/session';

/** Placeholder home view displayed after authentication. */
export function Home(): React.JSX.Element {
  const { t } = useTranslation();
  const role = session((state) => state.role);

  const isCoachView = role === UserType.Admin || role === UserType.Coach;
  const title = isCoachView
    ? t('dashboard.coach.title', 'Dashboard Coach')
    : t('dashboard.athlete.title', 'Dashboard Athlete');
  const subtitle = isCoachView
    ? t('dashboard.coach.subtitle', "Gérez vos clients et programmes d'entraînement")
    : t('dashboard.athlete.subtitle', 'Consultez vos programmes et vos plans nutritionnels.');

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack spacing={0.5}>
        <Typography color="text.secondary" variant="body2">
          {subtitle}
        </Typography>
      </Stack>

      {isCoachView ? <CoachDashboardSummaryCards /> : <AthleteDashboardSummaryCards />}
    </Stack>
  );
}
