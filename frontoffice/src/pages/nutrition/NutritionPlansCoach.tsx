// src/pages/nutrition/NutritionPlansCoach.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Add, Refresh } from '@mui/icons-material';
import {
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { MealPlanList } from '@components/nutrition/MealPlanList';
import { useMealPlans, type MealPlan } from '@hooks/nutrition/useMealPlans';

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

/** Coach dashboard showing owned nutrition meal plans. */
export function NutritionPlansCoach(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const emptyState = t('nutrition-coach.empty_state', {
    returnObjects: true,
  }) as EmptyStateCopy;

  const macroCopy = t('nutrition-coach.macros', {
    returnObjects: true,
  }) as MacroCopy;

  const { items: mealPlans, loading, reload, remove } = useMealPlans({
    page: 1,
    limit: 12,
    q: '',
  });

  const handleOpenMealPlan = React.useCallback(
    (plan: MealPlan) => {
      navigate(`/nutrition-coach/view/${plan.id}`);
    },
    [navigate],
  );

  const handleRefresh = React.useCallback(() => {
    void reload();
  }, [reload]);

  const handleDeleteMealPlan = React.useCallback(
    async (plan: MealPlan) => {
      await remove(plan.id);
    },
    [remove],
  );

  const handleCreate = React.useCallback(() => {
    navigate('/nutrition-coach/create');
  }, [navigate]);

  const handleEditMealPlan = React.useCallback(
    (plan: MealPlan) => {
      navigate(`/nutrition-coach/edit/${plan.id}`);
    },
    [navigate],
  );

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack spacing={1}>
        <Stack
          alignItems="center"
          direction="row"
          flexWrap="wrap"
          justifyContent="space-between"
          spacing={2}
        >
          <Typography variant="h5">{t('nutrition-coach.subtitle')}</Typography>
          <Stack alignItems="center" direction="row" spacing={1} sx={{ ml: 'auto' }}>
            <Tooltip title={t('nutrition-coach.actions.refresh')}>
              <IconButton
                aria-label={t('nutrition-coach.actions.refresh')}
                color="primary"
                onClick={handleRefresh}
                size="small"
              >
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              color="warning"
              onClick={handleCreate}
              startIcon={<Add />}
              variant="contained"
            >
              {t('nutrition-coach.actions.create')}
            </Button>
          </Stack>
        </Stack>
        <Typography color="text.secondary" variant="body2">
          {t('nutrition-coach.helper')}
        </Typography>
      </Stack>

      <MealPlanList
        mealPlans={mealPlans}
        loading={loading}
        placeholderTitle={emptyState.title}
        placeholderSubtitle={emptyState.description}
        placeholderHelper={emptyState.helper}
        onView={handleOpenMealPlan}
        onEdit={handleEditMealPlan}
        onDelete={handleDeleteMealPlan}
        dayCountFormatter={(count) =>
          t('nutrition-coach.list.day_count', {
            count,
          })
        }
        macroLabels={macroCopy}
      />
    </Stack>
  );
}
