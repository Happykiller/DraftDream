// src/pages/Home.tsx
import * as React from 'react';
import { Stack } from '@mui/material';

import { AthleteDashboardSummaryCards } from '@components/dashboard/AthleteDashboardSummaryCards';
import { CoachDashboardSummaryCards } from '@components/dashboard/CoachDashboardSummaryCards';
import { CoachTasksNotesCard } from '@components/dashboard/CoachTasksNotesCard';
import { UserType } from '@src/commons/enums';
import { session } from '@stores/session';

/** Placeholder home view displayed after authentication. */
export function Home(): React.JSX.Element {
  const role = session((state) => state.role);

  const isCoachView = role === UserType.Admin || role === UserType.Coach;

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>

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
