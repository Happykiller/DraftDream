import React from 'react';
import { Box, Chip, useTheme } from '@mui/material';
import { FitnessCenter } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { GrowthChartWidget } from '@components/dashboard/widgets/GrowthChartWidget';

interface GrowthDataPoint {
    name: string;
    value: number;
}

interface ProgramsWidgetProps {
    totalPrograms: number;
    growthData: GrowthDataPoint[];
    publicCount: number;
    privateCount: number;
    publicLabel: string;
    privateLabel: string;
}

// Dashboard widget for program metrics and visibility split.
export const ProgramsWidget: React.FC<ProgramsWidgetProps> = ({
    totalPrograms,
    growthData,
    publicCount,
    privateCount,
    publicLabel,
    privateLabel,
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <React.Fragment>
            {/* General information */}
            <GrowthChartWidget
                title={t('home.widgets.programs')}
                tooltip={t('home.widgets.programs_tooltip')}
                value={totalPrograms}
                icon={FitnessCenter}
                colSpan={1}
                color={theme.palette.primary.main}
                data={growthData}
                height={60}
            >
                <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1 }}>
                    <Chip
                        label={`${publicCount} ${publicLabel}`}
                        size="small"
                        variant="outlined"
                    />
                    <Chip
                        label={`${privateCount} ${privateLabel}`}
                        size="small"
                        variant="outlined"
                    />
                </Box>
            </GrowthChartWidget>
        </React.Fragment>
    );
};
