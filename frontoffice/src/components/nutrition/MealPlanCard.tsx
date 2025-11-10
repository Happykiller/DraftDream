// src/components/nutrition/MealPlanCard.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  ExpandMoreOutlined,
  HistoryOutlined,
  ModeStandby as ModeStandbyIcon,
  PersonOutline,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';

import type { MealPlan, MealPlanDaySnapshot, MealPlanMealSnapshot } from '@hooks/nutrition/useMealPlans';

interface MealPlanCardProps {
  mealPlan: MealPlan;
  dayCountFormatter: (count: number) => string;
  macroLabels: {
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
  };
  onSelect?: (mealPlan: MealPlan) => void;
}

const COLLAPSED_CONTENT_MAX_HEIGHT = 480;

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

function buildUserLabel(
  user: MealPlan['athlete'] | MealPlan['creator'],
): string | null {
  if (!user) {
    return null;
  }

  const { first_name: firstName, last_name: lastName, email } = user;
  const displayName = [firstName, lastName]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(' ')
    .trim();

  return displayName || email || null;
}

function getMealKey(meal: MealPlanMealSnapshot, index: number): string {
  return meal.id || meal.templateMealId || `${index}`;
}

function getDayKey(day: MealPlanDaySnapshot, index: number): string {
  return day.id || day.templateMealDayId || `${index}`;
}

/**
 * Displays a nutrition meal plan preview with macro highlights, plan structure and metadata.
 */
export function MealPlanCard({
  mealPlan,
  dayCountFormatter,
  macroLabels,
  onSelect,
}: MealPlanCardProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const dayCount = mealPlan.days.length;
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const numberFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        maximumFractionDigits: 0,
      }),
    [i18n.language],
  );
  const summaryBackground = React.useMemo(
    () => alpha(theme.palette.primary.main, 0.08),
    [theme.palette.primary.main],
  );
  const summaryBorder = React.useMemo(
    () => alpha(theme.palette.primary.main, 0.16),
    [theme.palette.primary.main],
  );
  const coachNotesBackground = React.useMemo(
    () => alpha(theme.palette.info.main, 0.08),
    [theme.palette.info.main],
  );
  const coachNotesBorder = React.useMemo(
    () => alpha(theme.palette.info.main, 0.24),
    [theme.palette.info.main],
  );

  const macroUnits = React.useMemo(
    () => ({
      calories: t('nutrition-coach.builder.summary.calories_unit'),
      protein: t('nutrition-coach.builder.summary.protein_unit'),
      carbs: t('nutrition-coach.builder.summary.carbs_unit'),
      fats: t('nutrition-coach.builder.summary.fats_unit'),
    }),
    [t],
  );

  const macroSummaries = React.useMemo(
    () => [
      {
        key: 'protein' as const,
        label: macroLabels.protein,
        value: `${numberFormatter.format(mealPlan.proteinGrams)} ${macroUnits.protein}`,
        color: theme.palette.info.main,
      },
      {
        key: 'carbs' as const,
        label: macroLabels.carbs,
        value: `${numberFormatter.format(mealPlan.carbGrams)} ${macroUnits.carbs}`,
        color: theme.palette.success.main,
      },
      {
        key: 'fats' as const,
        label: macroLabels.fats,
        value: `${numberFormatter.format(mealPlan.fatGrams)} ${macroUnits.fats}`,
        color: theme.palette.warning.main,
      },
    ],
    [
      macroLabels.carbs,
      macroLabels.fats,
      macroLabels.protein,
      macroUnits.carbs,
      macroUnits.fats,
      macroUnits.protein,
      mealPlan.carbGrams,
      mealPlan.fatGrams,
      mealPlan.proteinGrams,
      numberFormatter,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
    ],
  );
  const caloriesPerDay = React.useMemo(
    () => `${numberFormatter.format(mealPlan.calories)} ${macroUnits.calories}`,
    [mealPlan.calories, macroUnits.calories, numberFormatter],
  );
  const caloriesPerDayLabel = React.useMemo(
    () => t('nutrition-coach.list.calories_per_day', { label: macroLabels.calories }),
    [macroLabels.calories, t],
  );
  const planLengthLabel = React.useMemo(
    () => t('nutrition-coach.list.plan_length'),
    [t],
  );

  const athleteLabel = React.useMemo(() => buildUserLabel(mealPlan.athlete), [mealPlan.athlete]);
  const creatorLabel = React.useMemo(() => buildUserLabel(mealPlan.creator), [mealPlan.creator]);
  const dayPrefix = t('nutrition-coach.builder.structure.day_prefix');
  const dayCountLabel = dayCountFormatter(dayCount);
  const createdOn = React.useMemo(
    () => formatMealPlanDate(mealPlan.createdAt, i18n.language),
    [i18n.language, mealPlan.createdAt],
  );
  const planAssignmentLabel = athleteLabel
    ? t('nutrition-coach.list.plan_for', { name: athleteLabel })
    : t('nutrition-coach.list.plan_unassigned');
  const overflowToggleLabel = isExpanded
    ? t('nutrition-coach.list.collapse_details')
    : t('nutrition-coach.list.expand_details');

  const handleSelect = React.useCallback(() => {
    onSelect?.(mealPlan);
  }, [mealPlan, onSelect]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!onSelect) {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleSelect();
      }
    },
    [handleSelect, onSelect],
  );

  const handleToggleExpand = React.useCallback(() => {
    setIsExpanded((previous) => !previous);
  }, []);

  React.useEffect(() => {
    const element = contentRef.current;

    if (!element) {
      return undefined;
    }

    const updateOverflowState = () => {
      setIsOverflowing(element.scrollHeight > COLLAPSED_CONTENT_MAX_HEIGHT + 1);
    };

    updateOverflowState();

    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(updateOverflowState);
      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateOverflowState);

      return () => {
        window.removeEventListener('resize', updateOverflowState);
      };
    }

    return undefined;
  }, [mealPlan.id]);

  React.useEffect(() => {
    if (!isOverflowing && isExpanded) {
      setIsExpanded(false);
    }
  }, [isExpanded, isOverflowing]);

  React.useEffect(() => {
    setIsExpanded(false);
  }, [mealPlan.id]);

  return (
    <Paper
      elevation={0}
      variant="dashboardSection"
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect ? handleSelect : undefined}
      onKeyDown={onSelect ? handleKeyDown : undefined}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onSelect ? 'pointer' : 'default',
        transition: theme.transitions.create(['box-shadow', 'transform'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': onSelect
          ? {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[4],
            }
          : undefined,
      }}
    >
      <Box
        ref={contentRef}
        sx={(innerTheme) => ({
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: innerTheme.spacing(2),
          flexGrow: 1,
          maxHeight: isExpanded ? 'none' : COLLAPSED_CONTENT_MAX_HEIGHT,
          overflow: 'hidden',
          ...(isOverflowing && !isExpanded
            ? {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: innerTheme.spacing(7),
                  backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, ${innerTheme.palette.background.paper} 75%)`,
                },
              }
            : {}),
        })}
      >
        {/* General information */}
        {/* Header */}
        <Stack spacing={0.75}>
          <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
            {mealPlan.label}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {planAssignmentLabel}
          </Typography>
        </Stack>

        {/* Nutrition goals */}
        <Box
          sx={{
            borderRadius: 2,
            backgroundColor: summaryBackground,
            border: `1px solid ${summaryBorder}`,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.5, sm: 2 },
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <ModeStandbyIcon fontSize="small" color="primary" />
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {t('nutrition-coach.list.sections.nutrition_goals')}
              </Typography>
            </Stack>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.25, sm: 3 }}
              useFlexGap
              flexWrap="wrap"
            >
              <Stack spacing={0.25}>
                <Typography variant="h6" component="p" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  {caloriesPerDay}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {caloriesPerDayLabel}
                </Typography>
              </Stack>
              <Stack spacing={0.25}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {dayCountLabel}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {planLengthLabel}
                </Typography>
              </Stack>
            </Stack>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.25, sm: 3 }}
              useFlexGap
              flexWrap="wrap"
            >
              {macroSummaries.map((macro) => (
                <Stack key={macro.key} spacing={0.25} sx={{ minWidth: { sm: 96 } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: macro.color }}>
                    {macro.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {macro.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Box>

        <Divider flexItem />

        {/* Plan preview */}
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <RestaurantIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t('nutrition-coach.list.sections.plan_overview')}
            </Typography>
          </Stack>
          {mealPlan.days.length > 0 ? (
            <Stack spacing={1.5}>
              {mealPlan.days.map((day, dayIndex) => {
                const dayLabel = day.label?.trim() || `${dayPrefix} ${dayIndex + 1}`;
                const mealCountLabel = t('nutrition-coach.list.day_meal_count', {
                  count: day.meals.length,
                });

                return (
                  <Stack key={getDayKey(day, dayIndex)} spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {dayLabel}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {mealCountLabel}
                      </Typography>
                    </Stack>
                    {day.meals.length > 0 ? (
                      <Stack spacing={0.5}>
                        {day.meals.slice(0, 3).map((meal, mealIndex) => (
                          <Stack
                            key={getMealKey(meal, mealIndex)}
                            direction="row"
                            justifyContent="space-between"
                            alignItems="baseline"
                            spacing={1}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {meal.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
                              {t('nutrition-details.labels.meal_macros', {
                                calories: numberFormatter.format(meal.calories),
                                protein: numberFormatter.format(meal.proteinGrams),
                                carbs: numberFormatter.format(meal.carbGrams),
                                fats: numberFormatter.format(meal.fatGrams),
                              })}
                            </Typography>
                          </Stack>
                        ))}
                        {day.meals.length > 3 ? (
                          <Typography variant="caption" color="text.secondary">
                            {t('nutrition-coach.list.more_meals', {
                              count: day.meals.length - 3,
                            })}
                          </Typography>
                        ) : null}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('nutrition-coach.list.no_meals')}
                      </Typography>
                    )}
                  </Stack>
                );
              })}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('nutrition-coach.list.no_days')}
            </Typography>
          )}
        </Stack>

        {mealPlan.description ? (
          <>
            <Divider flexItem />
            <Box
              sx={{
                borderRadius: 2,
                backgroundColor: coachNotesBackground,
                border: `1px solid ${coachNotesBorder}`,
                px: { xs: 1.5, sm: 2 },
                py: { xs: 1.5, sm: 2 },
              }}
            >
              <Stack spacing={1}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: theme.palette.info.main }}
                >
                  {t('nutrition-coach.list.sections.coach_notes')}
                </Typography>
                <Typography variant="body2">{mealPlan.description}</Typography>
              </Stack>
            </Box>
          </>
        ) : null}

        <Divider flexItem />

        {/* Metadata */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent={{ xs: 'flex-start', sm: 'space-between' }}
          spacing={{ xs: 1, sm: 3 }}
          sx={{ width: '100%' }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <HistoryOutlined fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {t('nutrition-coach.list.metadata.created_on', { date: createdOn })}
            </Typography>
          </Stack>
          {creatorLabel ? (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: { xs: 0, sm: 'auto' } }}>
              <PersonOutline fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {t('nutrition-coach.list.metadata.creator', { name: creatorLabel })}
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </Box>

      {isOverflowing ? (
        <>
          <Divider flexItem sx={{ mt: 2 }} />
          <Stack direction="row" justifyContent="center" sx={{ pt: 1 }}>
            <Tooltip title={overflowToggleLabel}>
              <IconButton
                size="small"
                aria-label={overflowToggleLabel}
                aria-expanded={isExpanded}
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggleExpand();
                }}
                sx={{
                  color: theme.palette.text.secondary,
                  transition: theme.transitions.create('transform', {
                    duration: theme.transitions.duration.shorter,
                  }),
                  transform: isExpanded ? 'rotate(180deg)' : 'none',
                }}
              >
                <ExpandMoreOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </>
      ) : null}
    </Paper>
  );
}
