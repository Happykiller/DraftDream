import React from 'react';
import { useTheme } from '@mui/material';
import { Timer } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { DistributionChartWidget } from '@components/dashboard/widgets/DistributionChartWidget';

interface SessionsWidgetProps {
    totalSessions: number;
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

// Dashboard widget for session metrics and visibility split.
export const SessionsWidget: React.FC<SessionsWidgetProps> = ({
    totalSessions,
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
                title={t('home.widgets.sessions')}
                tooltip={t('home.widgets.sessions_tooltip')}
                value={totalSessions}
                icon={Timer}
                colSpan={1}
                color={theme.palette.error.main}
                data={distributionData}
                height={150}
            />
        </React.Fragment>
    );
};
