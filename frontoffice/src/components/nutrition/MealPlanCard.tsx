// src/components/nutrition/MealPlanCard.tsx
import * as React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import type { MealPlan } from '@hooks/nutrition/useMealPlans';

interface MealPlanCardProps {
  mealPlan: MealPlan;
  dayCountFormatter: (count: number) => string;
  macroLabels: {
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
  };
  onSelect?: (mealPlan: MealPlan) => void;
}

/**
 * Displays a nutrition meal plan preview with macro highlights and athlete context.
 */
export function MealPlanCard({
  mealPlan,
  dayCountFormatter,
  macroLabels,
  onSelect,
}: MealPlanCardProps): React.JSX.Element {
  const theme = useTheme();
  const dayCount = mealPlan.days.length;

  const athleteLabel = React.useMemo(() => {
    const athlete = mealPlan.athlete;

    if (!athlete) {
      return null;
    }

    const { first_name: firstName, last_name: lastName, email } = athlete;
    const displayName = [firstName, lastName]
      .filter((value): value is string => Boolean(value && value.trim()))
      .join(' ')
      .trim();

    return displayName || email;
  }, [mealPlan.athlete]);

  const macros = React.useMemo(
    () => [
      { key: 'calories', label: macroLabels.calories, value: `${mealPlan.calories}` },
      { key: 'protein', label: macroLabels.protein, value: `${mealPlan.proteinGrams}g` },
      { key: 'carbs', label: macroLabels.carbs, value: `${mealPlan.carbGrams}g` },
      { key: 'fats', label: macroLabels.fats, value: `${mealPlan.fatGrams}g` },
    ],
    [macroLabels, mealPlan.calories, mealPlan.carbGrams, mealPlan.fatGrams, mealPlan.proteinGrams],
  );

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardActionArea
        onClick={onSelect ? () => onSelect(mealPlan) : undefined}
        disabled={!onSelect}
        sx={{ height: '100%' }}
      >
        <CardContent sx={{ height: '100%' }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            {/* General information */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
                  {mealPlan.label}
                </Typography>
                {athleteLabel ? (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {athleteLabel}
                  </Typography>
                ) : null}
              </Stack>
              <Chip
                label={dayCountFormatter(dayCount)}
                color="primary"
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.light, 0.18),
                  color: theme.palette.primary.dark,
                  fontWeight: 600,
                }}
              />
            </Stack>

            {mealPlan.description ? (
              <Typography variant="body2" color="text.secondary">
                {mealPlan.description}
              </Typography>
            ) : null}

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {macros.map((macro) => (
                <Chip
                  key={macro.key}
                  label={`${macro.label}: ${macro.value}`}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.info.light, 0.16),
                    color: theme.palette.info.dark,
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
