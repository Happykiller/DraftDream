import * as React from 'react';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ReplayIcon from '@mui/icons-material/Replay';
import CircleIcon from '@mui/icons-material/Circle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import { Box, CircularProgress, Divider, IconButton, Stack, Typography } from '@mui/material';

import { GlassCard } from '@components/common/GlassCard';
import { TextWithTooltip } from '@components/common/TextWithTooltip';
import { useMealRecords, MealRecordState, type MealRecord } from '@hooks/nutrition/useMealRecords';
import { useMealPlans, type MealPlan, type MealPlanDaySnapshot, type MealPlanMealSnapshot } from '@hooks/nutrition/useMealPlans';

export function AthleteNutritionWidget(): React.JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { create: createRecord, list: listRecords } = useMealRecords();

    const { items: mealPlans, loading } = useMealPlans({
        page: 1,
        limit: 3,
        q: '',
    });

    const [activeRecords, setActiveRecords] = React.useState<Map<string, MealRecord>>(new Map());
    const [recordsLoading, setRecordsLoading] = React.useState(true);

    // Fetch active meal records
    React.useEffect(() => {
        let mounted = true;
        const fetchRecords = async () => {
            const { items: createdItems } = await listRecords({ limit: 50, state: MealRecordState.CREATE });
            const { items: draftItems } = await listRecords({ limit: 50, state: MealRecordState.DRAFT });

            if (!mounted) return;

            const activeMap = new Map<string, MealRecord>();
            [...createdItems, ...draftItems].forEach((record) => {
                const key = `${record.mealPlanId}_${record.mealDayId}_${record.mealId}`;
                activeMap.set(key, record);
            });
            setActiveRecords(activeMap);
            setRecordsLoading(false);
        };
        fetchRecords();
        return () => { mounted = false; };
    }, [listRecords]);

    const handlePlayOrResume = React.useCallback(
        async (
            event: React.MouseEvent,
            mealPlanId: string,
            mealDayId: string | null,
            mealId: string | null,
        ) => {
            event.stopPropagation();

            if (!mealDayId || !mealId) {
                return;
            }

            const key = `${mealPlanId}_${mealDayId}_${mealId}`;
            const existingRecord = activeRecords.get(key);

            if (existingRecord) {
                navigate(`/meal-record/${existingRecord.id}`);
                return;
            }

            try {
                const record = await createRecord({ mealPlanId, mealDayId, mealId });
                navigate(`/meal-record/${record.id}`);
            } catch (error) {
                // Error handled in hook
            }
        },
        [activeRecords, createRecord, navigate],
    );

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

    const isLoading = loading || recordsLoading;

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

                {isLoading ? (
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
                                                </Stack>

                                                {day.meals.length === 0 ? (
                                                    <Typography variant="caption" color="text.disabled" pl={3}>
                                                        {t('nutrition-coach.list.no_meals')}
                                                    </Typography>
                                                ) : (
                                                    <Stack spacing={0.5} pl={3}>
                                                        {day.meals.map((meal, mealIndex) => {
                                                            const mealDayId = day.id ?? day.templateMealDayId ?? null;
                                                            const mealId = meal.id ?? meal.templateMealId ?? null;
                                                            const recordKey = mealDayId && mealId
                                                                ? `${mealPlan.id}_${mealDayId}_${mealId}`
                                                                : null;
                                                            const isActive = recordKey ? activeRecords.has(recordKey) : false;
                                                            const tooltipText = isActive
                                                                ? t('common.resume', 'Resume')
                                                                : t('common.play', 'Start');

                                                            return (
                                                                <Stack
                                                                    key={getMealKey(meal, mealIndex)}
                                                                    direction="row"
                                                                    alignItems="center"
                                                                    spacing={1}
                                                                >
                                                                    <Tooltip title={tooltipText}>
                                                                        <span>
                                                                            <IconButton
                                                                                size="small"
                                                                                color="primary"
                                                                                onClick={(event) => handlePlayOrResume(
                                                                                    event,
                                                                                    mealPlan.id,
                                                                                    mealDayId,
                                                                                    mealId,
                                                                                )}
                                                                                sx={{ p: 0.5 }}
                                                                                disabled={!mealDayId || !mealId}
                                                                            >
                                                                                {isActive ? (
                                                                                    <ReplayIcon fontSize="small" />
                                                                                ) : (
                                                                                    <PlayArrowIcon fontSize="small" />
                                                                                )}
                                                                            </IconButton>
                                                                        </span>
                                                                    </Tooltip>
                                                                    <CircleIcon sx={{ fontSize: 5, color: 'text.disabled' }} />
                                                                    <TextWithTooltip
                                                                        tooltipTitle={getMealLabel(meal, mealIndex)}
                                                                        maxLines={1}
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                    />
                                                                </Stack>
                                                            );
                                                        })}
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
