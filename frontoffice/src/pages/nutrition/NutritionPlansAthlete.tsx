import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { MealPlanList } from '@components/nutrition/MealPlanList';
import type { MealPlanActionKey } from '@components/nutrition/MealPlanCard';
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

  const [searchQuery, setSearchQuery] = React.useState('');

  const emptyState = t('nutrition-athlete.empty_state', {
    returnObjects: true,
  }) as EmptyStateCopy;

  const macroCopy = t('nutrition-athlete.macros', {
    returnObjects: true,
  }) as MacroCopy;

  const athleteActions = React.useMemo<MealPlanActionKey[]>(() => ['view'], []);

  const { items: mealPlans, total: totalMealPlans, loading } = useMealPlans({
    page: 1,
    limit: 12,
    q: searchQuery,
    userId: athleteId ?? undefined,
  });

  const searchPlaceholder = t('nutrition-athlete.list.search_placeholder');
  const searchAriaLabel = t('nutrition-athlete.list.search_aria_label');

  const resultCountLabel = React.useMemo(
    () =>
      loading
        ? undefined
        : t('nutrition-athlete.list.result_count', {
          count: mealPlans.length,
          total: totalMealPlans,
        }),
    [loading, mealPlans.length, t, totalMealPlans],
  );

  const handleOpenMealPlan = React.useCallback(
    (plan: MealPlan) => {
      navigate(`/nutrition-athlete/view/${plan.id}`);
    },
    [navigate],
  );

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack spacing={1}>
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
        onViewMealPlan={handleOpenMealPlan}
        dayCountFormatter={(count) =>
          t('nutrition-athlete.list.day_count', {
            count,
          })
        }
        macroLabels={macroCopy}
        allowedActions={athleteActions}
        onSearchChange={handleSearchChange}
        searchPlaceholder={searchPlaceholder}
        searchAriaLabel={searchAriaLabel}
        searchQuery={searchQuery}
        resultCountLabel={resultCountLabel}
      />
    </Stack>
  );
}
