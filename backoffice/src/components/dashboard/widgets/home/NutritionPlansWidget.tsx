import React from 'react';
import { useTheme } from '@mui/material';
import { Restaurant } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { GrowthChartWidget } from '@components/dashboard/widgets/GrowthChartWidget';

interface GrowthDataPoint {
    name: string;
    value: number;
}

interface NutritionPlansWidgetProps {
    totalMealPlans: number;
    growthData: GrowthDataPoint[];
}

// Dashboard widget for nutrition plan growth.
export const NutritionPlansWidget: React.FC<NutritionPlansWidgetProps> = ({
    totalMealPlans,
    growthData,
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <React.Fragment>
            {/* General information */}
            <GrowthChartWidget
                title={t('home.widgets.nutrition_plans')}
                tooltip={t('home.widgets.nutrition_plans_tooltip')}
                value={totalMealPlans}
                icon={Restaurant}
                colSpan={1}
                color={theme.palette.secondary.main}
                data={growthData}
                height={80}
            />
        </React.Fragment>
    );
};
