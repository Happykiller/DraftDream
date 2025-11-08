// src/pages/nutrition/NutritionPlanCoachCreate.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { MealPlanBuilderPanel } from '@components/nutrition/MealPlanBuilderPanel';

import type { MealPlanBuilderCopy } from '@components/nutrition/mealPlanBuilderTypes';
import type { MealPlan } from '@hooks/nutrition/useMealPlans';

/** Nutrition plan creation flow for coaches. */
export function NutritionPlanCoachCreate(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const handleCreated = React.useCallback(
    (_plan: MealPlan) => {
      navigate('/nutrition-coach');
    },
    [navigate],
  );

  return (
    <>
      {/* General information */}
      <MealPlanBuilderPanel
        builderCopy={builderCopy}
        onCancel={handleCancel}
        onCreated={handleCreated}
      />
    </>
  );
}
