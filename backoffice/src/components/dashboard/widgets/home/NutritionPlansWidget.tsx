import React from 'react';
import { useTheme } from '@mui/material';
import { RestaurantMenu } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { DistributionChartWidget } from '@components/dashboard/widgets/DistributionChartWidget';

interface NutritionPlansWidgetProps {
    totalMealPlans: number;
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

// Dashboard widget for nutrition plan metrics and visibility split.
export const NutritionPlansWidget: React.FC<NutritionPlansWidgetProps> = ({
    totalMealPlans,
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
                title={t('home.widgets.nutrition_plans')}
                tooltip={t('home.widgets.nutrition_plans_tooltip')}
                value={totalMealPlans}
                icon={RestaurantMenu}
                colSpan={1}
                color={theme.palette.secondary.main}
                data={distributionData}
                height={150}
            />
        </React.Fragment>
    );
};
