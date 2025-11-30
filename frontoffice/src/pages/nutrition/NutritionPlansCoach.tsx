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
import { slugify } from '@src/utils/slugify';

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
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = React.useState('');

  const emptyState = t('nutrition-coach.empty_state', {
    returnObjects: true,
  }) as EmptyStateCopy;

  const macroCopy = t('nutrition-coach.macros', {
    returnObjects: true,
  }) as MacroCopy;

  const { items: mealPlans, loading, reload, remove, create } = useMealPlans({
    page: 1,
    limit: 12,
    q: searchQuery,
  });

  const searchPlaceholder = t('nutrition-coach.list.search_placeholder');
  const searchAriaLabel = t('nutrition-coach.list.search_aria_label');

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

  const handleCloneMealPlan = React.useCallback(
    async (
      basePlan: MealPlan,
      payload: { label: string; athleteId: string | null; openBuilder: boolean },
    ) => {
      const locale = basePlan.locale || i18n.language;
      const daySnapshots = basePlan.days.map((day) => ({
        id: day.id ?? undefined,
        templateMealDayId: day.templateMealDayId ?? undefined,
        slug: day.slug ?? undefined,
        locale: day.locale ?? locale,
        label: day.label,
        description: day.description ?? undefined,
        meals: day.meals.map((meal) => ({
          id: meal.id ?? undefined,
          templateMealId: meal.templateMealId ?? undefined,
          slug: meal.slug ?? undefined,
          locale: meal.locale ?? locale,
          label: meal.label,
          description: meal.description ?? undefined,
          foods: meal.foods,
          calories: meal.calories,
          proteinGrams: meal.proteinGrams,
          carbGrams: meal.carbGrams,
          fatGrams: meal.fatGrams,
          type: {
            id: meal.type.id ?? undefined,
            templateMealTypeId: meal.type.templateMealTypeId ?? undefined,
            slug: meal.type.slug ?? undefined,
            locale: meal.type.locale ?? locale,
            label: meal.type.label,
            visibility: meal.type.visibility ?? undefined,
            icon: meal.type.icon ?? undefined,
          },
        })),
      }));
      const dayIds = basePlan.days
        .map((day) => day.id)
        .filter((identifier): identifier is string => Boolean(identifier));

      const cloned = await create({
        slug: slugify(payload.label, String(Date.now()).slice(-5)),
        locale,
        label: payload.label,
        description: basePlan.description ?? '',
        calories: basePlan.calories,
        proteinGrams: basePlan.proteinGrams,
        carbGrams: basePlan.carbGrams,
        fatGrams: basePlan.fatGrams,
        days: daySnapshots,
        dayIds,
        userId: payload.athleteId,
      });

      if (payload.openBuilder) {
        navigate(`/nutrition-coach/edit/${cloned.id}`);
        return;
      }

      void reload();
    },
    [create, i18n.language, navigate, reload],
  );

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handlePrefetch = React.useCallback((action: 'view' | 'edit') => {
    if (action === 'edit') {
      void import('@src/pages/nutrition/NutritionPlanCoachEdit');
      void import('@src/pages/nutrition/NutritionPlanCoachEdit.loader');
    } else if (action === 'view') {
      void import('@src/pages/nutrition/NutritionPlanDetails');
      void import('@src/pages/nutrition/NutritionPlanDetails.loader');
    }
  }, []);

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
        onViewMealPlan={handleOpenMealPlan}
        onEditMealPlan={handleEditMealPlan}
        onDeleteMealPlan={handleDeleteMealPlan}
        onCloneMealPlan={handleCloneMealPlan}
        onPrefetch={handlePrefetch}
        dayCountFormatter={(count) =>
          t('nutrition-coach.list.day_count', {
            count,
          })
        }
        macroLabels={macroCopy}
        onSearchChange={handleSearchChange}
        searchPlaceholder={searchPlaceholder}
        searchAriaLabel={searchAriaLabel}
        searchQuery={searchQuery}
      />
    </Stack>
  );
}
