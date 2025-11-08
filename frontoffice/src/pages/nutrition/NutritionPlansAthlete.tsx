// src/pages/nutrition/NutritionPlansAthlete.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { MealPlanList } from '@components/nutrition/MealPlanList';
import { useMealPlans, type MealPlan } from '@hooks/nutrition/useMealPlans';
import { session } from '@stores/session';

interface EmptyStateCopy {
  title: string;
  description?: string;
  helper?: string;
}

interface MacroCopy {
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
}

/** Athlete portal listing assigned nutrition meal plans. */
export function NutritionPlansAthlete(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const athleteId = session((state) => state.id);

  const emptyState = t('nutrition-athlete.empty_state', {
    returnObjects: true,
  }) as EmptyStateCopy;

  const macroCopy = t('nutrition-athlete.macros', {
    returnObjects: true,
  }) as MacroCopy;

  const { items: mealPlans, loading } = useMealPlans({
    page: 1,
    limit: 12,
    q: '',
    userId: athleteId ?? undefined,
  });

  const handleOpenMealPlan = React.useCallback(
    (plan: MealPlan) => {
      navigate(`/nutrition-athlete/view/${plan.id}`);
    },
    [navigate],
  );

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack spacing={1}>
        <Typography variant="h5">{t('nutrition-athlete.subtitle')}</Typography>
        <Typography color="text.secondary" variant="body2">
          {t('nutrition-athlete.helper')}
        </Typography>
      </Stack>

      <MealPlanList
        mealPlans={mealPlans}
        loading={loading}
        placeholderTitle={emptyState.title}
        placeholderSubtitle={emptyState.description}
        placeholderHelper={emptyState.helper}
        onSelect={handleOpenMealPlan}
        dayCountFormatter={(count) =>
          t('nutrition-athlete.list.day_count', {
            count,
          })
        }
        macroLabels={macroCopy}
      />
    </Stack>
  );
}
