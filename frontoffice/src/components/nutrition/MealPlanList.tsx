// src/components/nutrition/MealPlanList.tsx
import * as React from 'react';
import { CircularProgress, Grid, Paper, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import type { MealPlan } from '@hooks/nutrition/useMealPlans';

import { MealPlanCard } from './MealPlanCard';

export interface MealPlanListProps {
  mealPlans: MealPlan[];
  loading: boolean;
  placeholderTitle: string;
  placeholderSubtitle?: string;
  placeholderHelper?: string;
  actionSlot?: React.ReactNode;
  onSelect?: (mealPlan: MealPlan) => void;
  dayCountFormatter: (dayCount: number) => string;
  macroLabels: {
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
  };
}

/**
 * Displays nutrition meal plans with macro highlights using a grid layout similar to program cards.
 */
export function MealPlanList({
  mealPlans,
  loading,
  placeholderTitle,
  placeholderSubtitle,
  placeholderHelper,
  actionSlot,
  onSelect,
  dayCountFormatter,
  macroLabels,
}: MealPlanListProps): React.JSX.Element {
  const theme = useTheme();
  const showPlaceholder = !loading && mealPlans.length === 0;

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      {/* General information */}
      {actionSlot ? (
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" spacing={1} sx={{ width: '100%' }}>
          {actionSlot}
        </Stack>
      ) : null}

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
          <CircularProgress size={32} />
        </Stack>
      ) : mealPlans.length > 0 ? (
        <Grid container spacing={3}>
          {mealPlans.map((plan) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={plan.id}>
              <MealPlanCard
                mealPlan={plan}
                dayCountFormatter={dayCountFormatter}
                macroLabels={macroLabels}
                onSelect={onSelect}
              />
            </Grid>
          ))}
        </Grid>
      ) : null}

      {showPlaceholder ? (
        <Paper
          sx={{
            borderRadius: 3,
            p: { xs: 3, md: 5 },
            textAlign: 'center',
            bgcolor: alpha(theme.palette.primary.light, 0.08),
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {placeholderTitle}
          </Typography>
          {placeholderSubtitle ? (
            <Typography variant="body2" color="text.secondary">
              {placeholderSubtitle}
            </Typography>
          ) : null}
          {placeholderHelper ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {placeholderHelper}
            </Typography>
          ) : null}
        </Paper>
      ) : null}
    </Stack>
  );
}
