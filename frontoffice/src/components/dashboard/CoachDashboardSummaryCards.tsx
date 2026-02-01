import * as React from 'react';
import { Box } from '@mui/material';

import { CoachAthletesWidget } from './widgets/coach/CoachAthletesWidget';
import { CoachClientsWidget } from './widgets/coach/CoachClientsWidget';
import { CoachProspectsWidget } from './widgets/coach/CoachProspectsWidget';
import { CoachProgramsWidget } from './widgets/coach/CoachProgramsWidget';
import { CoachNutritionWidget } from './widgets/coach/CoachNutritionWidget';

/** Summary cards tailored for coaches and admins. */
export function CoachDashboardSummaryCards(): React.JSX.Element {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{
        xs: '1fr',
        sm: '1fr 1fr',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(5, 1fr)',
      }}
      gap={3}
    >
      <CoachAthletesWidget />
      <CoachClientsWidget />
      <CoachProspectsWidget />
      <CoachProgramsWidget />
      <CoachNutritionWidget />
    </Box>
  );
}
