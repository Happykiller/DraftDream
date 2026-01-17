import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    CircularProgress,
    Card,
    CardContent,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';

import { FixedPageLayout } from '@components/common/FixedPageLayout';
import { ResponsiveButton } from '@components/common/ResponsiveButton';
import { useMealPlan } from '@hooks/nutrition/useMealPlan';
import { useMealTypeIcon } from '@hooks/nutrition/useMealTypeIcon';
import { useMealRecords, type MealRecord } from '@hooks/nutrition/useMealRecords';

function formatNumber(value: number, locale: string): string {
    try {
        return new Intl.NumberFormat(locale).format(value);
    } catch (_error) {
        return value.toString();
    }
}

/**
 * Read-only meal record detail view for coaches and admins.
 */
export function MealRecordDetailsCoach(): React.JSX.Element {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { recordId } = useParams<{ recordId: string }>();
    const theme = useTheme();
    const headerBackground = React.useMemo(
        () => alpha(theme.palette.warning.main, 0.12),
        [theme.palette.warning.main],
    );
    const iconBoxShadow = React.useMemo(
        () => `0 10px 20px ${alpha(theme.palette.warning.main, 0.24)}`,
        [theme.palette.warning.main],
    );

    const { get: getRecord } = useMealRecords();
    const [record, setRecord] = React.useState<MealRecord | null>(null);
    const [recordLoading, setRecordLoading] = React.useState(true);

    const fetchRecord = React.useCallback(() => {
        if (!recordId) return;
        setRecordLoading(true);
        getRecord(recordId)
            .then(setRecord)
            .finally(() => setRecordLoading(false));
    }, [getRecord, recordId]);

    React.useEffect(() => {
        fetchRecord();
    }, [fetchRecord]);

    const { mealPlan, loading: mealPlanLoading } = useMealPlan({
        mealPlanId: record?.mealPlanId ?? null,
    });

    const loading = recordLoading || mealPlanLoading;

    const dayPrefix = t('nutrition-coach.builder.structure.day_prefix');
    const mealPrefix = t('nutrition-coach.builder.structure.meal_prefix');
    const mealPlanLabel = mealPlan?.label ?? '-';
    const mealSnapshotLabel = record?.mealSnapshot?.label?.trim();

    const dayLabel = React.useMemo(() => {
        if (!mealPlan || !record) return '-';
        const dayIndex = mealPlan.days.findIndex(
            (candidate) => candidate.id === record.mealDayId || candidate.templateMealDayId === record.mealDayId,
        );
        const day = dayIndex >= 0 ? mealPlan.days[dayIndex] : null;
        const label = day?.label?.trim();
        return label || `${dayPrefix} ${Math.max(dayIndex + 1, 1)}`;
    }, [dayPrefix, mealPlan, record]);

    const mealLabel = React.useMemo(() => {
        if (mealSnapshotLabel) return mealSnapshotLabel;
        if (!mealPlan || !record) return '-';
        const dayIndex = mealPlan.days.findIndex(
            (candidate) => candidate.id === record.mealDayId || candidate.templateMealDayId === record.mealDayId,
        );
        const day = dayIndex >= 0 ? mealPlan.days[dayIndex] : null;
        const mealIndex = day?.meals.findIndex(
            (candidate) => candidate.id === record.mealId || candidate.templateMealId === record.mealId,
        ) ?? -1;
        const meal = day && mealIndex >= 0 ? day.meals[mealIndex] : null;
        const label = meal?.label?.trim();
        return label || `${mealPrefix} ${Math.max(mealIndex + 1, 1)}`;
    }, [mealPrefix, mealPlan, mealSnapshotLabel, record]);

    const mealSnapshot = record?.mealSnapshot ?? null;
    const mealTypeLabel = mealSnapshot?.type?.label ?? t('nutrition-details.meals.meal_card.type_fallback');
    const MealTypeIcon = useMealTypeIcon(mealSnapshot?.type?.icon);
    const macroItems = React.useMemo(() => {
        if (!mealSnapshot) return [];

        return [
            {
                key: 'protein' as const,
                label: t('nutrition-details.meals.meal_card.macros.protein.label'),
                value: t('nutrition-details.meals.meal_card.macros.protein.value', {
                    value: formatNumber(mealSnapshot.proteinGrams, i18n.language),
                }),
            },
            {
                key: 'carbs' as const,
                label: t('nutrition-details.meals.meal_card.macros.carbs.label'),
                value: t('nutrition-details.meals.meal_card.macros.carbs.value', {
                    value: formatNumber(mealSnapshot.carbGrams, i18n.language),
                }),
            },
            {
                key: 'fats' as const,
                label: t('nutrition-details.meals.meal_card.macros.fats.label'),
                value: t('nutrition-details.meals.meal_card.macros.fats.value', {
                    value: formatNumber(mealSnapshot.fatGrams, i18n.language),
                }),
            },
        ];
    }, [i18n.language, mealSnapshot, t]);
    const mealCaloriesLabel = React.useMemo(() => {
        if (!mealSnapshot) return '-';
        return t('nutrition-details.meals.meal_card.calories', {
            value: formatNumber(mealSnapshot.calories, i18n.language),
        });
    }, [i18n.language, mealSnapshot, t]);

    const handleBackToHome = React.useCallback(() => {
        navigate('/');
    }, [navigate]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!record) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography>{t('common.not_found')}</Typography>
            </Box>
        );
    }

    return (
        <FixedPageLayout
            title={mealLabel}
            subtitle={mealPlanLabel}
            icon={<RestaurantMenuOutlinedIcon fontSize="medium" />}
            footer={(
                <Stack direction="row" justifyContent="flex-end">
                    <ResponsiveButton
                        variant="contained"
                        color="warning"
                        onClick={handleBackToHome}
                        aria-label={t('common.back_to_home')}
                    >
                        {t('common.back_to_home')}
                    </ResponsiveButton>
                </Stack>
            )}
        >
            {/* General information */}
            <Box sx={{ p: 3 }}>
                <Card
                    variant="outlined"
                    sx={{
                        borderRadius: 2.5,
                        bgcolor: theme.palette.background.paper,
                        borderColor: theme.palette.divider,
                        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.06)',
                    }}
                >
                    <Box
                        sx={{
                            px: { xs: 2.5, md: 3 },
                            py: { xs: 2, md: 2.5 },
                            backgroundColor: headerBackground,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                bgcolor: theme.palette.warning.main,
                                color: theme.palette.warning.contrastText,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: iconBoxShadow,
                            }}
                        >
                            <RestaurantMenuOutlinedIcon fontSize="small" />
                        </Box>
                        <Stack>
                            <Typography variant="subtitle1" fontWeight={700}>
                                {mealLabel}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {dayLabel}
                            </Typography>
                        </Stack>
                    </Box>
                    <CardContent sx={{ pt: 3 }}>
                        <Stack spacing={2.5}>
                            <Stack spacing={0.5}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    {t('nutrition-details.meals.meal_card.type')}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    {MealTypeIcon ? <MealTypeIcon fontSize="small" /> : null}
                                    <Typography variant="body2">{mealTypeLabel}</Typography>
                                </Stack>
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                {macroItems.map((macro) => (
                                    <Stack key={macro.key} spacing={0.5}>
                                        <Typography variant="caption" color="text.secondary">
                                            {macro.label}
                                        </Typography>
                                        <Typography variant="body2">{macro.value}</Typography>
                                    </Stack>
                                ))}
                            </Stack>
                            <Stack spacing={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                    {t('nutrition-details.meals.meal_card.calories_label')}
                                </Typography>
                                <Typography variant="body2">{mealCaloriesLabel}</Typography>
                            </Stack>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Stack spacing={0.5}>
                                    <Typography variant="caption" color="text.secondary">
                                        {t('meal_record.form.satisfaction_label')}
                                    </Typography>
                                    <Typography variant="body2">
                                        {record.satisfactionRating ?? '-'}
                                    </Typography>
                                </Stack>
                                <Stack spacing={0.5}>
                                    <Typography variant="caption" color="text.secondary">
                                        {t('meal_record.form.comment_label')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {record.comment?.trim() || '-'}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </FixedPageLayout>
    );
}
