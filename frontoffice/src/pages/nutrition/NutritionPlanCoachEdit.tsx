// src/pages/nutrition/NutritionPlanCoachEdit.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Stack } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import { MealPlanBuilderPanel } from '@components/nutrition/MealPlanBuilderPanel';

import type { MealPlanBuilderCopy } from '@components/nutrition/mealPlanBuilderTypes';
import type { MealPlan } from '@hooks/nutrition/useMealPlans';
import { useMealPlan } from '@hooks/nutrition/useMealPlan';

/** Nutrition plan edition flow for coaches. */
export function NutritionPlanCoachEdit(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mealPlanId } = useParams<{ mealPlanId: string }>();
  const { mealPlan, loading, error } = useMealPlan({ mealPlanId });

  const builderCopy = React.useMemo(
    () =>
      t('nutrition-coach.builder', {
        returnObjects: true,
      }) as unknown as MealPlanBuilderCopy,
    [t],
  );

  const handleCancel = React.useCallback(() => {
    navigate('/nutrition-coach');
  }, [navigate]);

  const handleUpdated = React.useCallback(
    (_plan: MealPlan) => {
      navigate('/nutrition-coach');
    },
    [navigate],
  );

  if (loading) {
    return <></>; // Global loader overlay will show
  }

  if (!mealPlan || error) {
    return (
      <Stack spacing={2} sx={{ p: 3 }}>
        {/* General information */}
        <Alert severity="error">{error || t('nutrition-details.errors.load_failed')}</Alert>
      </Stack>
    );
  }

  return (
    <>
      {/* General information */}
      <MealPlanBuilderPanel
        builderCopy={builderCopy}
        mealPlan={mealPlan}
        onCancel={handleCancel}
        onUpdated={handleUpdated}
      />
    </>
  );
}
