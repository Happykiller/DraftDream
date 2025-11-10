// src/components/nutrition/MealPlanCard.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Chip,
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
  PersonOutline,
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

  const macroUnits = React.useMemo(
    () => ({
      calories: t('nutrition-coach.builder.summary.calories_unit'),
      protein: t('nutrition-coach.builder.summary.protein_unit'),
      carbs: t('nutrition-coach.builder.summary.carbs_unit'),
      fats: t('nutrition-coach.builder.summary.fats_unit'),
    }),
    [t],
  );

  const macros = React.useMemo(
    () => [
      {
        key: 'calories',
        label: macroLabels.calories,
        value: `${numberFormatter.format(mealPlan.calories)} ${macroUnits.calories}`,
      },
      {
        key: 'protein',
        label: macroLabels.protein,
        value: `${numberFormatter.format(mealPlan.proteinGrams)} ${macroUnits.protein}`,
      },
      {
        key: 'carbs',
        label: macroLabels.carbs,
        value: `${numberFormatter.format(mealPlan.carbGrams)} ${macroUnits.carbs}`,
      },
      {
        key: 'fats',
        label: macroLabels.fats,
        value: `${numberFormatter.format(mealPlan.fatGrams)} ${macroUnits.fats}`,
      },
    ],
    [
      macroLabels.calories,
      macroLabels.carbs,
      macroLabels.fats,
      macroLabels.protein,
      macroUnits.calories,
      macroUnits.carbs,
      macroUnits.fats,
      macroUnits.protein,
      mealPlan.calories,
      mealPlan.carbGrams,
      mealPlan.fatGrams,
      mealPlan.proteinGrams,
      numberFormatter,
    ],
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
  const statusLabel = athleteLabel
    ? t('nutrition-coach.list.status.assigned')
    : t('nutrition-coach.list.status.unassigned');
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
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Stack flex={1} minWidth={0} spacing={0.75}>
            <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
              {mealPlan.label}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {planAssignmentLabel}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end" useFlexGap>
            <Chip
              label={statusLabel}
              size="small"
              sx={(chipTheme) => ({
                bgcolor: alpha(chipTheme.palette.success.main, 0.16),
                color: chipTheme.palette.success.main,
                fontWeight: 600,
              })}
            />
            <Chip
              label={dayCountLabel}
              size="small"
              sx={(chipTheme) => ({
                bgcolor: alpha(chipTheme.palette.primary.main, 0.12),
                color: chipTheme.palette.primary.main,
                fontWeight: 600,
              })}
            />
          </Stack>
        </Stack>

        {/* Nutrition goals */}
        <Stack spacing={1.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {t('nutrition-coach.list.sections.nutrition_goals')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
            {macros.map((macro) => (
              <Box
                key={macro.key}
                sx={{
                  flex: '1 1 160px',
                  borderRadius: 2,
                  p: 1.5,
                  bgcolor: alpha(theme.palette.info.light, 0.12),
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                  {macro.label}
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {macro.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>

        <Divider flexItem />

        {/* Plan preview */}
        <Stack spacing={1.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {t('nutrition-coach.list.sections.plan_overview')}
          </Typography>
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
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {t('nutrition-coach.list.sections.coach_notes')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {mealPlan.description}
              </Typography>
            </Stack>
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
