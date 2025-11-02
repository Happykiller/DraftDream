// src/pages/Meals.tsx
import * as React from 'react';
import { Stack, Tab, Tabs } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { MealDaysPanel } from '@pages/meals/MealDaysPanel';
import { MealsPanel } from '@pages/meals/MealsPanel';
import { MealTypesPanel } from '@pages/meals/MealTypesPanel';

export function Meals(): React.JSX.Element {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') || 'meals') as string;

  const setTab = (val: string) =>
    setParams(
      (prev) => {
        const sp = new URLSearchParams(prev);
        sp.set('tab', val);
        return sp;
      },
      { replace: true },
    );

  return (
    <Stack spacing={3} sx={{ mt: 3, width: '100%' }}>
      {/* General information */}
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        aria-label={t('meals.tabs.aria_label')}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab value="meal-days" label={t('meals.tabs.mealDays')} />
        <Tab value="meals" label={t('meals.tabs.meals')} />
        <Tab value="meal-types" label={t('meals.tabs.mealTypes')} />
      </Tabs>

      {tab === 'meals' && <MealsPanel />}
      {tab === 'meal-days' && <MealDaysPanel />}
      {tab === 'meal-types' && <MealTypesPanel />}
    </Stack>
  );
}
