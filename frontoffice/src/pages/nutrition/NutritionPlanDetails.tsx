// src/pages/nutrition/NutritionPlanDetails.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  EditSquare as EditSquareIcon,
  ModeStandby,
  QueryStats,
  RestaurantMenu,
} from '@mui/icons-material';
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

function formatNumber(value: number, locale: string): string {
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch (_error) {
    return value.toString();
  }
}

type NutritionPlanTab = 'overview' | 'meals';

function formatMealPlanDate(value: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
  } catch (_error) {
    return value;
  }
}

/** Detailed view of a nutrition meal plan including day and meal breakdowns. */
export function NutritionPlanDetails(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const loaderData = useLoaderData() as NutritionPlanDetailsLoaderResult;
  const navigate = useNavigate();
  const location = useLocation();
  const { mealPlanId } = useParams<{ mealPlanId: string }>();
  const theme = useTheme();
  const [activeTab, setActiveTab] = React.useState<NutritionPlanTab>('overview');
  const coachNotesBackground = React.useMemo(
    () => alpha(theme.palette.info.main, 0.08),
    [theme.palette.info.main],
  );
  const coachNotesBorder = React.useMemo(
    () => alpha(theme.palette.info.main, 0.24),
    [theme.palette.info.main],
  );

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
  const backToListLabel = React.useMemo(
    () =>
      isCoachView
        ? t('nutrition-details.actions.back_to_list_coach')
        : t('nutrition-details.actions.back_to_list_athlete'),
    [isCoachView, t],
  );
  const headerTitle = React.useMemo(
    () => mealPlan?.label ?? t('nutrition-details.title'),
    [mealPlan?.label, t],
  );
  const nutritionGoalItems = React.useMemo(
    () =>
      mealPlan
        ? [
            {
              key: 'calories' as const,
              label: t('nutrition-details.overview.nutrition_goals.calories_per_day.label'),
              value: t('nutrition-details.overview.nutrition_goals.calories_per_day.value', {
                value: formatNumber(mealPlan.calories, i18n.language),
              }),
              color: 'text.primary',
            },
            {
              key: 'protein' as const,
              label: t('nutrition-details.overview.nutrition_goals.protein.label'),
              value: t('nutrition-details.overview.nutrition_goals.protein.value', {
                value: formatNumber(mealPlan.proteinGrams, i18n.language),
              }),
              color: 'info.main',
            },
            {
              key: 'carbs' as const,
              label: t('nutrition-details.overview.nutrition_goals.carbs.label'),
              value: t('nutrition-details.overview.nutrition_goals.carbs.value', {
                value: formatNumber(mealPlan.carbGrams, i18n.language),
              }),
              color: 'success.main',
            },
            {
              key: 'fats' as const,
              label: t('nutrition-details.overview.nutrition_goals.fats.label'),
              value: t('nutrition-details.overview.nutrition_goals.fats.value', {
                value: formatNumber(mealPlan.fatGrams, i18n.language),
              }),
              color: 'warning.main',
            },
          ]
        : [],
    [i18n.language, mealPlan, t],
  );

  const planStatistics = React.useMemo(() => {
    if (!mealPlan) {
      return null;
    }

    const dayCount = mealPlan.days.length;
    const totalMeals = mealPlan.days.reduce(
      (accumulator, day) => accumulator + day.meals.length,
      0,
    );
    const totalCalories = mealPlan.days.reduce(
      (accumulator, day) =>
        accumulator +
        day.meals.reduce((mealAccumulator, meal) => mealAccumulator + meal.calories, 0),
      0,
    );
    const averageCalories = dayCount > 0 ? Math.round(totalCalories / dayCount) : 0;

    return {
      dayCount,
      totalMeals,
      averageCalories,
    };
  }, [mealPlan]);
  const createdOnLabel = React.useMemo(() => {
    if (!mealPlan) {
      return null;
    }

    return t('nutrition-coach.list.metadata.created_on', {
      date: formatMealPlanDate(mealPlan.createdAt, i18n.language),
    });
  }, [i18n.language, mealPlan, t]);

  const handleBack = React.useCallback(() => {
    navigate(isCoachView ? '/nutrition-coach' : '/nutrition-athlete');
  }, [isCoachView, navigate]);
  const isInitialLoading = loading && !mealPlan;

  React.useEffect(() => {
    setActiveTab('overview');
  }, [mealPlanId]);

  const handleTabChange = React.useCallback(
    (_event: React.SyntheticEvent, value: NutritionPlanTab) => {
      setActiveTab(value);
    },
    [],
  );

  return (
    <Stack
      sx={{
        minHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
        maxHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
        height: '100%',
        flex: 1,
        overflow: 'hidden',
        bgcolor: theme.palette.backgroundColor,
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Card
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            bgcolor: theme.palette.backgroundColor,
          }}
        >
          {/* General information */}
          <Box
            component="header"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 2.5 },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                aria-hidden
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 10px 20px rgba(25, 118, 210, 0.24)',
                }}
              >
                <RestaurantMenu fontSize="medium" />
              </Box>
              <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}
                  noWrap
                >
                  {headerTitle}
                </Typography>
                {mealPlan?.description ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {mealPlan.description}
                  </Typography>
                ) : null}
              </Stack>
            </Stack>
          </Box>

          <Divider />

          <CardContent
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              p: 0,
              '&:last-child': {
                pb: 0,
              },
            }}
          >
            <Box sx={{ flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
              <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 3.5 } }}>
                {isInitialLoading ? (
                  <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240 }}>
                    <CircularProgress size={32} />
                  </Stack>
                ) : (
                  <Stack spacing={3}>
                    {finalError ? <Alert severity="error">{finalError}</Alert> : null}

                    {mealPlan ? (
                      <Stack spacing={3}>
                        <Tabs
                          value={activeTab}
                          onChange={handleTabChange}
                          variant="scrollable"
                          scrollButtons="auto"
                          allowScrollButtonsMobile
                        >
                          <Tab
                            value="overview"
                            icon={<QueryStats fontSize="small" />}
                            iconPosition="start"
                            label={t('nutrition-details.tabs.overview')}
                          />
                          <Tab
                            value="meals"
                            icon={<RestaurantMenu fontSize="small" />}
                            iconPosition="start"
                            label={t('nutrition-details.tabs.meals')}
                          />
                        </Tabs>

                        {activeTab === 'overview' ? (
                          <Stack spacing={3}>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                              <Paper
                                variant="outlined"
                                sx={{ flex: 1, borderRadius: 2, p: { xs: 2, md: 2.5 } }}
                              >
                                <Stack spacing={2}>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <ModeStandby fontSize="small" color="info" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                      {t('nutrition-details.overview.sections.nutrition_goals')}
                                    </Typography>
                                  </Stack>
                                  <Stack spacing={1.5}>
                                    {nutritionGoalItems.map((item) => (
                                      <Stack
                                        key={item.key}
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        spacing={1.5}
                                      >
                                        <Typography variant="body2" color="text.secondary">
                                          {item.label}
                                        </Typography>
                                        <Typography
                                          variant="subtitle1"
                                          sx={{
                                            fontWeight: 700,
                                            color: item.color,
                                            textAlign: 'right',
                                          }}
                                        >
                                          {item.value}
                                        </Typography>
                                      </Stack>
                                    ))}
                                  </Stack>
                                </Stack>
                              </Paper>

                              <Paper
                                variant="outlined"
                                sx={{ flex: 1, borderRadius: 2, p: { xs: 2, md: 2.5 } }}
                              >
                                <Stack spacing={2}>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <QueryStats fontSize="small" color="primary" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                      {t('nutrition-details.overview.sections.plan_stats')}
                                    </Typography>
                                  </Stack>
                                  <Stack spacing={1.5}>
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      justifyContent="space-between"
                                      spacing={1.5}
                                    >
                                      <Typography variant="body2" color="text.secondary">
                                        {t('nutrition-details.overview.plan_stats.days.label')}
                                      </Typography>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        {t('nutrition-details.overview.plan_stats.days.value', {
                                          count: planStatistics?.dayCount ?? 0,
                                        })}
                                      </Typography>
                                    </Stack>
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      justifyContent="space-between"
                                      spacing={1.5}
                                    >
                                      <Typography variant="body2" color="text.secondary">
                                        {t('nutrition-details.overview.plan_stats.meals.label')}
                                      </Typography>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        {t('nutrition-details.overview.plan_stats.meals.value', {
                                          count: planStatistics?.totalMeals ?? 0,
                                        })}
                                      </Typography>
                                    </Stack>
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      justifyContent="space-between"
                                      spacing={1.5}
                                    >
                                      <Typography variant="body2" color="text.secondary">
                                        {t('nutrition-details.overview.plan_stats.average_calories.label')}
                                      </Typography>
                                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        {t('nutrition-details.overview.plan_stats.average_calories.value', {
                                          value: formatNumber(
                                            planStatistics?.averageCalories ?? 0,
                                            i18n.language,
                                          ),
                                        })}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </Stack>
                              </Paper>
                            </Stack>

                            <Box
                              sx={{
                                borderRadius: 2,
                                backgroundColor: coachNotesBackground,
                                border: `1px solid ${coachNotesBorder}`,
                                px: { xs: 2, md: 2.5 },
                                py: { xs: 2, md: 2.5 },
                              }}
                            >
                              <Stack spacing={1.5}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <EditSquareIcon fontSize="small" color="info" />
                                  <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 700, color: theme.palette.info.main }}
                                  >
                                    {t('nutrition-details.overview.sections.coach_notes')}
                                  </Typography>
                                </Stack>
                                <Typography variant="body2" color="text.primary">
                                  {mealPlan.description?.trim()
                                    ? mealPlan.description
                                    : t('nutrition-details.overview.coach_notes.empty')}
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                        ) : (
                          <Stack spacing={2}>
                            {mealPlan.days.length === 0 ? (
                              <Typography color="text.secondary" variant="body2">
                                {t('nutrition-details.meals.empty')}
                              </Typography>
                            ) : (
                              mealPlan.days.map((day) => (
                                <Card key={day.id ?? day.label} variant="outlined">
                                  <CardContent>
                                    <Stack spacing={1.5}>
                                      <Stack spacing={0.5}>
                                        <Typography variant="h6">{day.label}</Typography>
                                        {day.description ? (
                                          <Typography color="text.secondary" variant="body2">
                                            {day.description}
                                          </Typography>
                                        ) : null}
                                      </Stack>
                                      <Stack spacing={1.5}>
                                        {day.meals.map((meal) => (
                                          <Card
                                            key={meal.id ?? meal.label}
                                            variant="outlined"
                                            sx={{ bgcolor: 'grey.50' }}
                                          >
                                            <CardContent>
                                              <Stack spacing={0.75}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                  {meal.label}
                                                </Typography>
                                                {meal.description ? (
                                                  <Typography color="text.secondary" variant="body2">
                                                    {meal.description}
                                                  </Typography>
                                                ) : null}
                                                {meal.foods ? (
                                                  <Typography color="text.secondary" variant="body2">
                                                    {meal.foods}
                                                  </Typography>
                                                ) : null}
                                                <Typography variant="body2" color="text.secondary">
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
                        )}
                      </Stack>
                    ) : null}
                  </Stack>
                )}
              </Box>
            </Box>
          </CardContent>

          <Divider />

          <Box
            component="footer"
            sx={{
              backgroundColor: alpha(theme.palette.grey[500], 0.08),
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 2.5 },
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              {createdOnLabel ? (
                <Typography variant="caption" color="text.secondary">
                  {createdOnLabel}
                </Typography>
              ) : (
                <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />
              )}

              <Button
                variant="contained"
                color="primary"
                onClick={handleBack}
                sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
              >
                {backToListLabel}
              </Button>
            </Stack>
          </Box>
        </Card>
      </Box>
    </Stack>
  );
}
