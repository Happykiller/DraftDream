import React from 'react';
import { useTheme } from '@mui/material';
import { FitnessCenter } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { DistributionChartWidget } from '@components/dashboard/widgets/DistributionChartWidget';

interface ProgramsWidgetProps {
    totalPrograms: number;
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

// Dashboard widget for program metrics and visibility split.
export const ProgramsWidget: React.FC<ProgramsWidgetProps> = ({
    totalPrograms,
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
                title={t('home.widgets.programs')}
                tooltip={t('home.widgets.programs_tooltip')}
                value={totalPrograms}
                icon={FitnessCenter}
                colSpan={1}
                color={theme.palette.primary.main}
                data={distributionData}
                height={150}
            />
        </React.Fragment>
    );
};
