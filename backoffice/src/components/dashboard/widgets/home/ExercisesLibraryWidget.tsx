import React from 'react';
import { useTheme } from '@mui/material';
import { MonitorHeart } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { DistributionChartWidget } from '@components/dashboard/widgets/DistributionChartWidget';

interface ExercisesLibraryWidgetProps {
    totalExercises: number;
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

// Dashboard widget for exercise metrics and visibility split.
export const ExercisesLibraryWidget: React.FC<ExercisesLibraryWidgetProps> = ({
    totalExercises,
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
                title={t('home.widgets.exercises')}
                tooltip={t('home.widgets.exercises_tooltip')}
                value={totalExercises}
                icon={MonitorHeart}
                colSpan={1}
                color={theme.palette.success.main}
                data={distributionData}
                height={150}
            />
        </React.Fragment>
    );
};
