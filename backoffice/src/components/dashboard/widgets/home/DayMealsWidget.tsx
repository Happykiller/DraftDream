import React from 'react';
import { useTheme } from '@mui/material';
import { Restaurant } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { DistributionChartWidget } from '@components/dashboard/widgets/DistributionChartWidget';

interface DayMealsWidgetProps {
    totalMealDays: number;
    publicCount: number;
    privateCount: number;
    publicLabel: string;
    privateLabel: string;
}

interface DistributionDataPoint {
    name: string;
    value: number;
    color: string;
}

// Dashboard widget for meal day metrics and visibility split.
export const DayMealsWidget: React.FC<DayMealsWidgetProps> = ({
    totalMealDays,
    publicCount,
    privateCount,
    publicLabel,
    privateLabel,
}) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const distributionData: DistributionDataPoint[] = [
        { name: publicLabel, value: publicCount, color: theme.palette.success.main },
        { name: privateLabel, value: privateCount, color: theme.palette.warning.main },
    ];

    return (
        <React.Fragment>
            {/* General information */}
            <DistributionChartWidget
                title={t('home.widgets.day_meals')}
                tooltip={t('home.widgets.day_meals_tooltip')}
                value={totalMealDays}
                icon={Restaurant}
                colSpan={1}
                color={theme.palette.secondary.main}
                data={distributionData}
                height={150}
            />
        </React.Fragment>
    );
};
