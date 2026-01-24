import React from 'react';
import { useTheme } from '@mui/material';
import { Flatware } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { DistributionChartWidget } from '@components/dashboard/widgets/DistributionChartWidget';

interface MealsWidgetProps {
    totalMeals: number;
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

// Dashboard widget for meal metrics and visibility split.
export const MealsWidget: React.FC<MealsWidgetProps> = ({
    totalMeals,
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
                title={t('home.widgets.meals')}
                tooltip={t('home.widgets.meals_tooltip')}
                value={totalMeals}
                icon={Flatware}
                colSpan={1}
                color={theme.palette.warning.main}
                data={distributionData}
                height={150}
            />
        </React.Fragment>
    );
};
