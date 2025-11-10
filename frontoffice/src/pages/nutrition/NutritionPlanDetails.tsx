// src/pages/nutrition/NutritionPlanDetails.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import {
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { useMealPlan } from '@hooks/nutrition/useMealPlan';

import type {
  NutritionPlanDetailsLoaderResult,
} from './NutritionPlanDetails.loader';

/** Detailed view of a nutrition meal plan including day and meal breakdowns. */
export function NutritionPlanDetails(): React.JSX.Element {
  const { t } = useTranslation();
  const loaderData = useLoaderData() as NutritionPlanDetailsLoaderResult;
  const navigate = useNavigate();
  const location = useLocation();
  const { mealPlanId } = useParams<{ mealPlanId: string }>();

  const loaderError = React.useMemo(() => {
    if (loaderData.status === 'not_found') {
      return t('nutrition-details.errors.not_found');
    }
    if (loaderData.status === 'error') {
      return t('nutrition-details.errors.load_failed');
    }
    return null;
  }, [loaderData.status, t]);

  const { mealPlan, loading, error } = useMealPlan({
    mealPlanId,
    initialMealPlan: loaderData.mealPlan,
    initialError: loaderError,
  });

  const finalError = error ?? loaderError;
  const isCoachView = location.pathname.includes('/nutrition-coach/');

  const handleBack = React.useCallback(() => {
    navigate(isCoachView ? '/nutrition-coach' : '/nutrition-athlete');
  }, [isCoachView, navigate]);

  if (loading && !mealPlan) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ width: '100%', mt: 6 }}>
        {/* General information */}
        <CircularProgress size={32} />
      </Stack>
    );
  }

  if (finalError) {
    return (
      <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
        {/* General information */}
        <Stack spacing={1}>
          <Typography variant="h5">{t('nutrition-details.title')}</Typography>
          <Typography color="text.secondary" variant="body2">
            {finalError}
          </Typography>
        </Stack>
        <Button onClick={handleBack} variant="outlined">
          {isCoachView
            ? t('nutrition-details.actions.back_to_list_coach')
            : t('nutrition-details.actions.back_to_list_athlete')}
        </Button>
      </Stack>
    );
  }

  if (!mealPlan) {
    return (
      <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
        {/* General information */}
        <Typography variant="body1">{t('nutrition-details.errors.not_found')}</Typography>
        <Button onClick={handleBack} variant="outlined">
          {isCoachView
            ? t('nutrition-details.actions.back_to_list_coach')
            : t('nutrition-details.actions.back_to_list_athlete')}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack spacing={1}>
        <Typography variant="h4">{mealPlan.label}</Typography>
        {mealPlan.description ? (
          <Typography color="text.secondary" variant="body2">
            {mealPlan.description}
          </Typography>
        ) : null}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Typography variant="body2">
            {t('nutrition-details.labels.macros.calories', { value: mealPlan.calories })}
          </Typography>
          <Divider orientation="vertical" flexItem />
          <Typography variant="body2">
            {t('nutrition-details.labels.macros.protein', {
              value: mealPlan.proteinGrams,
            })}
          </Typography>
          <Divider orientation="vertical" flexItem />
          <Typography variant="body2">
            {t('nutrition-details.labels.macros.carbs', {
              value: mealPlan.carbGrams,
            })}
          </Typography>
          <Divider orientation="vertical" flexItem />
          <Typography variant="body2">
            {t('nutrition-details.labels.macros.fats', { value: mealPlan.fatGrams })}
          </Typography>
        </Stack>
      </Stack>

      <Button onClick={handleBack} variant="outlined" sx={{ alignSelf: 'flex-start' }}>
        {isCoachView
          ? t('nutrition-details.actions.back_to_list_coach')
          : t('nutrition-details.actions.back_to_list_athlete')}
      </Button>

      <Stack spacing={2}>
        {mealPlan.days.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            {t('nutrition-details.empty_days')}
          </Typography>
        ) : (
          mealPlan.days.map((day) => (
            <Card key={day.id ?? day.label} variant="outlined">
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h6">{day.label}</Typography>
                  {day.description ? (
                    <Typography color="text.secondary" variant="body2">
                      {day.description}
                    </Typography>
                  ) : null}
                  <Stack spacing={1}>
                    {day.meals.map((meal) => (
                      <Card key={meal.id ?? meal.label} variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                        <CardContent>
                          <Stack spacing={0.5}>
                            <Typography variant="subtitle1">{meal.label}</Typography>
                            {meal.description ? (
                              <Typography color="text.secondary" variant="body2">
                                {meal.description}
                              </Typography>
                            ) : null}
                            <Typography color="text.secondary" variant="body2">
                              {meal.foods}
                            </Typography>
                            <Typography variant="body2">
                              {t('nutrition-details.labels.meal_macros', {
                                calories: meal.calories,
                                protein: meal.proteinGrams,
                                carbs: meal.carbGrams,
                                fats: meal.fatGrams,
                              })}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Stack>
  );
}
