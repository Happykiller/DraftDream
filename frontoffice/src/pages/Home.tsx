// src/pages/Home.tsx
import * as React from 'react';
import { Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { AthleteDashboardSummaryCards } from '@components/dashboard/AthleteDashboardSummaryCards';
import { CoachDashboardSummaryCards } from '@components/dashboard/CoachDashboardSummaryCards';
import { CoachTasksNotesCard } from '@components/dashboard/CoachTasksNotesCard';
import { UserType } from '@src/commons/enums';
import { session } from '@stores/session';

/** Placeholder home view displayed after authentication. */
export function Home(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = session((state) => state.role);

  const isCoachView = role === UserType.Admin || role === UserType.Coach;

  const handleCreateDailyReport = React.useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    navigate(`/agenda/daily-report?date=${today}`);
  }, [navigate]);

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {!isCoachView && (
        <Stack direction="row" justifyContent="flex-end">
          <Button variant="contained" onClick={handleCreateDailyReport}>
            {t('dashboard.athlete.actions.create_daily_report')}
          </Button>
        </Stack>
      )}

      {isCoachView ? (
        <Stack spacing={3}>
          {/* General information */}
          <CoachDashboardSummaryCards />
          <CoachTasksNotesCard />
        </Stack>
      ) : (
        <AthleteDashboardSummaryCards />
      )}
    </Stack>
  );
}
