// src/pages/nutrition/NutritionPlanDetails.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
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
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  CalendarMonth,
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
  MealPlanDaySnapshot,
  MealPlanMealSnapshot,
} from '@hooks/nutrition/useMealPlans';
import { useMealTypeIcon } from '@hooks/nutrition/useMealTypeIcon';
import { computeDayNutritionSummary } from '@components/nutrition/mealPlanBuilderUtils';
import { TextWithTooltip } from '@components/common/TextWithTooltip';

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
              backgroundColor: alpha(theme.palette.warning.main, 0.12),
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
                  bgcolor: 'warning.main',
                  color: 'warning.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 10px 20px ${alpha(theme.palette.warning.main, 0.24)}`,
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
                          textColor="inherit"
                          TabIndicatorProps={{
                            sx: { backgroundColor: theme.palette.warning.main },
                          }}
                          sx={{
                            '& .MuiTab-root': {
                              color: theme.palette.warning.main,
                              fontWeight: 600,
                            },
                            '& .MuiTab-root .MuiTab-iconWrapper': {
                              color: 'inherit',
                            },
                          }}
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
                          <Stack spacing={3}>
                            {mealPlan.days.length === 0 ? (
                              <Typography color="text.secondary" variant="body2">
                                {t('nutrition-details.meals.empty')}
                              </Typography>
                            ) : (
                              <Stack spacing={3}>
                                {mealPlan.days.map((day) => (
                                  <NutritionPlanDayCard
                                    key={day.id ?? day.label}
                                    day={day}
                                    locale={i18n.language}
                                    t={t}
                                  />
                                ))}
                              </Stack>
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
                color="warning"
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

interface NutritionPlanDayCardProps {
  day: MealPlanDaySnapshot;
  locale: string;
  t: TFunction<'translation'>;
}

/**
 * Renders a day card containing the daily header and the list of meal cards.
 */
function NutritionPlanDayCard({ day, locale, t }: NutritionPlanDayCardProps): React.JSX.Element {
  const theme = useTheme();
  const mealCount = day.meals.length;
  const daySummary = React.useMemo(
    () => computeDayNutritionSummary(day),
    [day],
  );
  const daySummaryItems = React.useMemo(
    () => [
      {
        key: 'calories' as const,
        label: t('nutrition-details.meals.day_summary.calories_label'),
        value: t('nutrition-details.meals.day_summary.calories_value', {
          value: formatNumber(daySummary.calories, locale),
        }),
        color: theme.palette.primary.main,
      },
      {
        key: 'protein' as const,
        label: t('nutrition-details.meals.day_summary.protein_label'),
        value: t('nutrition-details.meals.day_summary.protein_value', {
          value: formatNumber(daySummary.proteinGrams, locale),
        }),
        color: theme.palette.info.main,
      },
      {
        key: 'carbs' as const,
        label: t('nutrition-details.meals.day_summary.carbs_label'),
        value: t('nutrition-details.meals.day_summary.carbs_value', {
          value: formatNumber(daySummary.carbGrams, locale),
        }),
        color: theme.palette.success.main,
      },
      {
        key: 'fats' as const,
        label: t('nutrition-details.meals.day_summary.fats_label'),
        value: t('nutrition-details.meals.day_summary.fats_value', {
          value: formatNumber(daySummary.fatGrams, locale),
        }),
        color: theme.palette.warning.main,
      },
    ],
    [
      daySummary.calories,
      daySummary.carbGrams,
      daySummary.fatGrams,
      daySummary.proteinGrams,
      locale,
      t,
      theme.palette.info.main,
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
    ],
  );

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: alpha(theme.palette.grey[500], 0.16),
        boxShadow: `0 12px 32px ${alpha(theme.palette.grey[500], 0.1)}`,
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: { xs: 2, md: 2.5 },
          '&:last-child': {
            pb: { xs: 2, md: 2.5 },
          },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            aria-hidden
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.secondary.main, 0.12),
              color: theme.palette.secondary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CalendarMonth fontSize="medium" />
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <TextWithTooltip
              tooltipTitle={day.label}
              variant="h6"
              sx={{ fontWeight: 700 }}
              noWrap
            />
            <Typography color="text.secondary" variant="body2">
              {t('nutrition-details.meals.day_header.meal_count', {
                count: mealCount,
              })}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.25, sm: 1.5 },
          }}
        >
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {t('nutrition-details.meals.day_summary.title')}
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.25, sm: 3 }}
              useFlexGap
              flexWrap="wrap"
            >
              {daySummaryItems.map((item) => (
                <Stack key={item.key} spacing={0.25} sx={{ minWidth: { sm: 100 } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: item.color }}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Box>

        {mealCount === 0 ? (
          <Typography color="text.secondary" variant="body2">
            {t('nutrition-details.meals.day_empty')}
          </Typography>
        ) : (
          <Stack spacing={2}>
            {day.meals.map((meal) => (
              <NutritionPlanMealCard
                key={meal.id ?? meal.label}
                meal={meal}
                locale={locale}
                t={t}
              />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

interface NutritionPlanMealCardProps {
  meal: MealPlanMealSnapshot;
  locale: string;
  t: TFunction<'translation'>;
}

/** Displays a single meal card with contextual icon, macros, and foods. */
const NutritionPlanMealCard = React.memo(function NutritionPlanMealCard({
  meal,
  locale,
  t,
}: NutritionPlanMealCardProps): React.JSX.Element {
  const theme = useTheme();
  const MealIcon = useMealTypeIcon(meal.type?.icon);
  const macroItems = React.useMemo(
    () => [
      {
        key: 'protein' as const,
        label: t('nutrition-details.meals.meal_card.macros.protein.label'),
        value: t('nutrition-details.meals.meal_card.macros.protein.value', {
          value: formatNumber(meal.proteinGrams, locale),
        }),
        background: alpha(theme.palette.info.main, 0.12),
        valueColor: theme.palette.info.main,
        labelColor: alpha(theme.palette.info.main, 0.9),
      },
      {
        key: 'carbs' as const,
        label: t('nutrition-details.meals.meal_card.macros.carbs.label'),
        value: t('nutrition-details.meals.meal_card.macros.carbs.value', {
          value: formatNumber(meal.carbGrams, locale),
        }),
        background: alpha(theme.palette.success.main, 0.12),
        valueColor: theme.palette.success.main,
        labelColor: alpha(theme.palette.success.main, 0.9),
      },
      {
        key: 'fats' as const,
        label: t('nutrition-details.meals.meal_card.macros.fats.label'),
        value: t('nutrition-details.meals.meal_card.macros.fats.value', {
          value: formatNumber(meal.fatGrams, locale),
        }),
        background: alpha(theme.palette.warning.main, 0.16),
        valueColor: theme.palette.warning.main,
        labelColor: alpha(theme.palette.warning.main, 0.9),
      },
    ],
    [
      locale,
      meal.carbGrams,
      meal.fatGrams,
      meal.proteinGrams,
      t,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
    ],
  );

  const tooltipLabel = meal.type?.label ?? t('nutrition-details.meals.meal_card.type_fallback');

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: alpha(theme.palette.grey[500], 0.2),
        boxShadow: `0 12px 32px ${alpha(theme.palette.grey[500], 0.1)}`,
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          '&:last-child': { pb: 2 },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexGrow: 1, minWidth: 0 }}>
            <Tooltip title={tooltipLabel} placement="top" arrow>
              <Box
                aria-hidden
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MealIcon fontSize="small" />
              </Box>
            </Tooltip>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <TextWithTooltip
                tooltipTitle={meal.label}
                variant="subtitle1"
                sx={{ fontWeight: 700 }}
                noWrap
              />
              {meal.type?.label ? (
                <Typography color="text.secondary" variant="body2">
                  {meal.type.label}
                </Typography>
              ) : null}
            </Box>
          </Stack>

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: 'text.primary', whiteSpace: 'nowrap' }}
          >
            {t('nutrition-details.meals.meal_card.calories', {
              value: formatNumber(meal.calories, locale),
            })}
          </Typography>
        </Stack>

        {meal.description ? (
          <Typography color="text.secondary" variant="body2">
            {meal.description}
          </Typography>
        ) : null}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          {macroItems.map((macro) => (
            <Box
              key={macro.key}
              sx={{
                flex: 1,
                minWidth: { xs: '100%', sm: 160 },
                borderRadius: 2,
                bgcolor: macro.background,
                px: { xs: 1.5, sm: 2 },
                py: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: macro.valueColor }}>
                {macro.value}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: macro.labelColor }}>
                {macro.label}
              </Typography>
            </Box>
          ))}
        </Stack>

        {meal.foods ? (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
              {t('nutrition-details.meals.meal_card.foods_label')}
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-line' }}>
              {meal.foods}
            </Typography>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
});
