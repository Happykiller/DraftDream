// src/components/nutrition/MealPlanList.tsx
import * as React from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import type { MealPlan } from '@hooks/nutrition/useMealPlans';

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
 * Displays nutrition meal plans with macro highlights and simple placeholder states.
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
  const hasItems = mealPlans.length > 0;

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      {/* General information */}
      {actionSlot ? <Box>{actionSlot}</Box> : null}

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
          <CircularProgress size={32} />
        </Stack>
      ) : hasItems ? (
        <Stack spacing={2}>
          {mealPlans.map((plan) => {
            const dayCount = plan.days.length;
            return (
              <Card key={plan.id} variant="outlined">
                <CardActionArea
                  onClick={onSelect ? () => onSelect(plan) : undefined}
                  disabled={!onSelect}
                >
                  <CardContent>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{plan.label}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {dayCountFormatter(dayCount)}
                        </Typography>
                      </Stack>

                      {plan.description ? (
                        <Typography color="text.secondary" variant="body2">
                          {plan.description}
                        </Typography>
                      ) : null}

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip label={`${macroLabels.calories}: ${plan.calories}`} size="small" />
                        <Chip label={`${macroLabels.protein}: ${plan.proteinGrams}g`} size="small" />
                        <Chip label={`${macroLabels.carbs}: ${plan.carbGrams}g`} size="small" />
                        <Chip label={`${macroLabels.fats}: ${plan.fatGrams}g`} size="small" />
                      </Stack>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack spacing={1}>
            <Typography variant="h6">{placeholderTitle}</Typography>
            {placeholderSubtitle ? (
              <Typography color="text.secondary" variant="body2">
                {placeholderSubtitle}
              </Typography>
            ) : null}
            {placeholderHelper ? (
              <Typography color="text.secondary" variant="body2">
                {placeholderHelper}
              </Typography>
            ) : null}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
