import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';

import { useMealPlans, type MealPlan, type MealPlanDaySnapshot, type MealPlanMealSnapshot } from '@hooks/nutrition/useMealPlans';
import { GlassCard } from '../../../common/GlassCard';
import { TextWithTooltip } from '../../../common/TextWithTooltip';

export function AthleteNutritionWidget(): React.JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { items: mealPlans, loading } = useMealPlans({
        page: 1,
        limit: 3,
        q: '',
    });

    const dayPrefix = t('nutrition-coach.builder.structure.day_prefix');
    const mealPrefix = t('nutrition-coach.builder.structure.meal_prefix');

    const getDayLabel = React.useCallback((day: MealPlanDaySnapshot, index: number): string => {
        const trimmedLabel = day.label?.trim();

        if (trimmedLabel) {
            return trimmedLabel;
        }

        return `${dayPrefix} ${index + 1}`;
    }, [dayPrefix]);

    const getMealLabel = React.useCallback((meal: MealPlanMealSnapshot, index: number): string => {
        const trimmedLabel = meal.label?.trim();

        if (trimmedLabel) {
            return trimmedLabel;
        }

        return `${mealPrefix} ${index + 1}`;
    }, [mealPrefix]);

    const getDayKey = React.useCallback((day: MealPlanDaySnapshot, index: number): string => {
        return day.id || day.templateMealDayId || `${index}`;
    }, []);

    const getMealKey = React.useCallback((meal: MealPlanMealSnapshot, index: number): string => {
        return meal.id || meal.templateMealId || `${index}`;
    }, []);

    const getPlanKey = React.useCallback((mealPlan: MealPlan, index: number): string => {
        return mealPlan.id || `${index}`;
    }, []);

    return (
        <GlassCard onClick={() => navigate('/nutrition-athlete')}>
            <Stack spacing={2}>
                {/* General information */}
                <Stack direction="row" alignItems="center" spacing={2}>
                    <RestaurantMenuOutlinedIcon sx={{ color: 'success.main', fontSize: 40 }} />
                    <Typography variant="h6" fontWeight="bold" color="text.secondary">
                        {t('dashboard.summary.nutrition')}
                    </Typography>
                </Stack>

                {loading ? (
                    <Box display="flex" justifyContent="center" p={2}>
                        <CircularProgress size={24} color="success" />
                    </Box>
                ) : mealPlans.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center">
                        -
                    </Typography>
                ) : (
                    <Stack spacing={2} divider={<Divider flexItem sx={{ opacity: 0.5 }} />}>
                        {mealPlans.map((mealPlan, planIndex) => (
                            <Stack key={getPlanKey(mealPlan, planIndex)} spacing={1}>
                                <TextWithTooltip
                                    tooltipTitle={mealPlan.label}
                                    maxLines={1}
                                    variant="subtitle1"
                                    fontWeight="bold"
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {t('nutrition-coach.list.plan_length')}: {mealPlan.days.length}
                                </Typography>

                                {mealPlan.days.length === 0 ? (
                                    <Typography variant="caption" color="text.disabled" pl={2}>
                                        {t('nutrition-coach.list.no_days')}
                                    </Typography>
                                ) : (
                                    <Stack spacing={1} pl={2}>
                                        {mealPlan.days.map((day, dayIndex) => (
                                            <Stack key={getDayKey(day, dayIndex)} spacing={0.5}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <CircleIcon sx={{ fontSize: 6, color: 'text.disabled' }} />
                                                    <TextWithTooltip
                                                        tooltipTitle={getDayLabel(day, dayIndex)}
                                                        maxLines={1}
                                                        variant="body2"
                                                        fontWeight="bold"
                                                        color="text.primary"
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {t('nutrition-coach.list.day_meal_count', { count: day.meals.length })}
                                                    </Typography>
                                                </Stack>

                                                {day.meals.length === 0 ? (
                                                    <Typography variant="caption" color="text.disabled" pl={3}>
                                                        {t('nutrition-coach.list.no_meals')}
                                                    </Typography>
                                                ) : (
                                                    <Stack spacing={0.5} pl={3}>
                                                        {day.meals.map((meal, mealIndex) => (
                                                            <Stack
                                                                key={getMealKey(meal, mealIndex)}
                                                                direction="row"
                                                                alignItems="center"
                                                                spacing={1}
                                                            >
                                                                <CircleIcon sx={{ fontSize: 5, color: 'text.disabled' }} />
                                                                <TextWithTooltip
                                                                    tooltipTitle={getMealLabel(meal, mealIndex)}
                                                                    maxLines={1}
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                />
                                                            </Stack>
                                                        ))}
                                                    </Stack>
                                                )}
                                            </Stack>
                                        ))}
                                    </Stack>
                                )}
                            </Stack>
                        ))}
                    </Stack>
                )}
            </Stack>
        </GlassCard>
    );
}
