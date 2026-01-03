import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    CircularProgress,
    Card,
    CardContent,
    Rating,
    Stack,
    Tooltip,
    TextField,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';

import { useMealPlan } from '@hooks/nutrition/useMealPlan';
import { useMealTypeIcon } from '@hooks/nutrition/useMealTypeIcon';
import {
    MealRecordState,
    type MealRecord,
    useMealRecords,
} from '@hooks/nutrition/useMealRecords';
import { FixedPageLayout } from '@src/components/common/FixedPageLayout';

function formatNumber(value: number, locale: string): string {
    try {
        return new Intl.NumberFormat(locale).format(value);
    } catch (_error) {
        return value.toString();
    }
}

/**
 * Shows meal record details and allows state transitions for athlete meal records.
 */
export function MealRecordDetails(): React.JSX.Element {
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

    const { get: getRecord, updateState } = useMealRecords();
    const [record, setRecord] = React.useState<MealRecord | null>(null);
    const [recordLoading, setRecordLoading] = React.useState(true);
    const [comment, setComment] = React.useState('');
    const [satisfactionRating, setSatisfactionRating] = React.useState<number | null>(null);

    const fetchRecord = React.useCallback(() => {
        if (!recordId) return;
        setRecordLoading(true);
        getRecord(recordId)
            .then(setRecord)
            .finally(() => setRecordLoading(false));
    }, [getRecord, recordId]);

    // Fetch record on mount
    React.useEffect(() => {
        fetchRecord();
    }, [fetchRecord]);

    React.useEffect(() => {
        setComment(record?.comment ?? '');
        setSatisfactionRating(record?.satisfactionRating ?? null);
    }, [record]);

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
                background: alpha(theme.palette.info.main, 0.12),
                valueColor: theme.palette.info.main,
                labelColor: alpha(theme.palette.info.main, 0.9),
            },
            {
                key: 'carbs' as const,
                label: t('nutrition-details.meals.meal_card.macros.carbs.label'),
                value: t('nutrition-details.meals.meal_card.macros.carbs.value', {
                    value: formatNumber(mealSnapshot.carbGrams, i18n.language),
                }),
                background: alpha(theme.palette.success.main, 0.12),
                valueColor: theme.palette.success.main,
                labelColor: alpha(theme.palette.success.main, 0.9),
            },
            {
                key: 'fats' as const,
                label: t('nutrition-details.meals.meal_card.macros.fats.label'),
                value: t('nutrition-details.meals.meal_card.macros.fats.value', {
                    value: formatNumber(mealSnapshot.fatGrams, i18n.language),
                }),
                background: alpha(theme.palette.warning.main, 0.16),
                valueColor: theme.palette.warning.main,
                labelColor: alpha(theme.palette.warning.main, 0.9),
            },
        ];
    }, [
        i18n.language,
        mealSnapshot,
        t,
        theme.palette.info.main,
        theme.palette.success.main,
        theme.palette.warning.main,
    ]);
    const mealCaloriesLabel = React.useMemo(() => {
        if (!mealSnapshot) return '-';
        return t('nutrition-details.meals.meal_card.calories', {
            value: formatNumber(mealSnapshot.calories, i18n.language),
        });
    }, [i18n.language, mealSnapshot, t]);

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleUpdateState = async (newState: MealRecordState) => {
        if (!record) return;
        try {
            await updateState(record.id, newState, {
                comment: comment.trim() || undefined,
                satisfactionRating: satisfactionRating ?? undefined,
            });
            navigate('/');
        } catch (error) {
            console.error('Failed to update meal record state', error);
        }
    };

    const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setComment(event.target.value);
    };

    const handleRatingChange = (_event: React.SyntheticEvent, value: number | null) => {
        setSatisfactionRating(value);
    };

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

    const renderFooter = () => {
        if (record.state === MealRecordState.CREATE || record.state === MealRecordState.DRAFT) {
            return (
                <Stack direction="row" spacing={2}>
                    <Button variant="text" color="inherit" onClick={handleBackToHome}>
                        {t('common.actions.cancel')}
                    </Button>
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => handleUpdateState(MealRecordState.DRAFT)}
                    >
                        {t('common.actions.save')}
                    </Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={() => handleUpdateState(MealRecordState.FINISH)}
                    >
                        {t('meal_record.actions.taken')}
                    </Button>
                </Stack>
            );
        }

        return (
            <Button
                variant="contained"
                color="warning"
                onClick={handleBackToHome}
            >
                {t('common.back_to_home')}
            </Button>
        );
    };

    return (
        <FixedPageLayout
            title={mealLabel}
            subtitle={`${mealPlanLabel} · ${dayLabel}`}
            icon={<RestaurantMenuOutlinedIcon fontSize="medium" />}
            footer={renderFooter()}
            headerProps={{
                backgroundColor: headerBackground,
                iconBackgroundColor: 'warning.main',
                iconColor: 'warning.contrastText',
                iconBoxShadow,
            }}
        >
            {/* General information */}
            <Box sx={{ p: 3 }}>
                {mealSnapshot ? (
                    <Stack spacing={3}>
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
                                    <Stack
                                        direction="row"
                                        spacing={1.5}
                                        alignItems="center"
                                        sx={{ flexGrow: 1, minWidth: 0 }}
                                    >
                                        <Tooltip title={mealTypeLabel} placement="top" arrow>
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
                                                <MealTypeIcon fontSize="small" />
                                            </Box>
                                        </Tooltip>

                                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                {mealSnapshot.label}
                                            </Typography>
                                            {mealSnapshot.type?.label ? (
                                                <Typography color="text.secondary" variant="body2">
                                                    {mealSnapshot.type.label}
                                                </Typography>
                                            ) : null}
                                        </Box>
                                    </Stack>

                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 700, color: 'text.primary', whiteSpace: 'nowrap' }}
                                    >
                                        {mealCaloriesLabel}
                                    </Typography>
                                </Stack>

                                {mealSnapshot.description ? (
                                    <Typography color="text.secondary" variant="body2">
                                        {mealSnapshot.description}
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

                                {mealSnapshot.foods ? (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                                        >
                                            {t('nutrition-details.meals.meal_card.foods_label')}
                                        </Typography>
                                        <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-line' }}>
                                            {mealSnapshot.foods}
                                        </Typography>
                                    </Box>
                                ) : null}
                            </CardContent>
                        </Card>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                borderColor: alpha(theme.palette.grey[500], 0.2),
                            }}
                        >
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Stack spacing={1}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        {t('meal_record.form.satisfaction_label')}
                                    </Typography>
                                    <Rating
                                        value={satisfactionRating}
                                        onChange={handleRatingChange}
                                        max={5}
                                        size="large"
                                    />
                                </Stack>
                            </CardContent>
                        </Card>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                borderColor: alpha(theme.palette.grey[500], 0.2),
                            }}
                        >
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Stack spacing={0.5}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        {t('meal_record.form.comment_label')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {t('meal_record.form.comment_subtitle')}
                                    </Typography>
                                </Stack>
                                <TextField
                                    label={t('meal_record.form.comment_label')}
                                    placeholder={t('meal_record.form.comment_placeholder')}
                                    value={comment}
                                    onChange={handleCommentChange}
                                    multiline
                                    minRows={4}
                                    fullWidth
                                />
                            </CardContent>
                        </Card>
                    </Stack>
                ) : (
                    <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        <Typography>
                            {t('common.no_content')}
                        </Typography>
                    </Box>
                )}
            </Box>
        </FixedPageLayout>
    );
}
