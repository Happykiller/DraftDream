import * as React from 'react';
import { Box } from '@mui/material';

import { AthleteProgramsWidget } from './widgets/athlete/AthleteProgramsWidget';
import { AthleteNutritionWidget } from './widgets/athlete/AthleteNutritionWidget';

/** Summary cards dedicated to athletes. */
export function AthleteDashboardSummaryCards(): React.JSX.Element {
  return (
    <Box
      display="grid"
      gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
      gap={3}
    >
      <AthleteProgramsWidget />
      <AthleteNutritionWidget />
    </Box>
  );
}
