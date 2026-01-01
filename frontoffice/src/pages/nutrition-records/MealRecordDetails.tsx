import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';

import { useMealPlan } from '@hooks/nutrition/useMealPlan';
import {
    MealRecordState,
    type MealRecord,
    useMealRecords,
} from '@hooks/nutrition/useMealRecords';
import { FixedPageLayout } from '@src/components/common/FixedPageLayout';

/**
 * Shows meal record details and allows state transitions for athlete meal records.
 */
export function MealRecordDetails(): React.JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { recordId } = useParams<{ recordId: string }>();

    const { get: getRecord, updateState } = useMealRecords();
    const [record, setRecord] = React.useState<MealRecord | null>(null);
    const [recordLoading, setRecordLoading] = React.useState(true);

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

    const { mealPlan, loading: mealPlanLoading } = useMealPlan({
        mealPlanId: record?.mealPlanId ?? null,
    });

    const loading = recordLoading || mealPlanLoading;

    const dayPrefix = t('nutrition-coach.builder.structure.day_prefix');
    const mealPrefix = t('nutrition-coach.builder.structure.meal_prefix');
    const mealPlanLabel = mealPlan?.label ?? '-';

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
    }, [mealPrefix, mealPlan, record]);

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleUpdateState = async (newState: MealRecordState) => {
        if (!record) return;
        try {
            await updateState(record.id, newState);
            navigate('/');
        } catch (error) {
            console.error('Failed to update meal record state', error);
        }
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
                <Typography>{t('common.not_found', 'Record not found')}</Typography>
            </Box>
        );
    }

    const renderFooter = () => {
        if (record.state === MealRecordState.CREATE || record.state === MealRecordState.DRAFT) {
            return (
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleUpdateState(MealRecordState.DRAFT)}
                    >
                        {t('common.actions.save', 'Save')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleUpdateState(MealRecordState.FINISH)}
                    >
                        {t('common.actions.finish', 'Finish')}
                    </Button>
                </Stack>
            );
        }

        return (
            <Button
                variant="contained"
                color="primary"
                onClick={handleBackToHome}
            >
                {t('common.back_to_home', 'Back to Home')}
            </Button>
        );
    };

    return (
        <FixedPageLayout
            title={mealLabel}
            subtitle={`${mealPlanLabel} · ${dayLabel}`}
            icon={<RestaurantMenuOutlinedIcon fontSize="medium" />}
            footer={renderFooter()}
        >
            {/* General information */}
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                <Typography>
                    {t('common.no_content', 'No content available yet')}
                </Typography>
            </Box>
        </FixedPageLayout>
    );
}
