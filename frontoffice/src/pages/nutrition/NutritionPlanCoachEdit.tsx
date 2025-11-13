// src/pages/nutrition/NutritionPlanCoachEdit.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Stack } from '@mui/material';
import { useNavigate, useParams, useRouteLoaderData } from 'react-router-dom';

import { MealPlanBuilderPanel } from '@components/nutrition/MealPlanBuilderPanel';

import type { MealPlanBuilderCopy } from '@components/nutrition/mealPlanBuilderTypes';
import type { MealPlan } from '@hooks/nutrition/useMealPlans';
import type { NutritionPlanCoachEditLoaderResult } from './NutritionPlanCoachEdit.loader';

/** Nutrition plan edition flow for coaches. */
export function NutritionPlanCoachEdit(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mealPlanId } = useParams<{ mealPlanId: string }>();
  const loaderData = useRouteLoaderData('nutrition-plan-edit') as NutritionPlanCoachEditLoaderResult | undefined;

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

  if (!mealPlanId) {
    return (
      <Stack spacing={2} sx={{ p: 3 }}>
        {/* General information */}
        <Alert severity="error">{t('nutrition-details.errors.not_found')}</Alert>
      </Stack>
    );
  }

  if (!loaderData) {
    return (
      <Stack spacing={2} sx={{ p: 3 }}>
        {/* General information */}
        <Alert severity="error">{t('nutrition-details.errors.load_failed')}</Alert>
      </Stack>
    );
  }

  if (loaderData.error) {
    const message = loaderData.error === 'not_found'
      ? t('nutrition-details.errors.not_found')
      : t('nutrition-details.errors.load_failed');
    return (
      <Stack spacing={2} sx={{ p: 3 }}>
        {/* General information */}
        <Alert severity="error">{message}</Alert>
      </Stack>
    );
  }

  return (
    <>
      {/* General information */}
      <MealPlanBuilderPanel
        builderCopy={builderCopy}
        mealPlan={loaderData.mealPlan ?? undefined}
        onCancel={handleCancel}
        onUpdated={handleUpdated}
      />
    </>
  );
}
