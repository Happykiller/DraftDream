import React from 'react';
import { useTheme } from '@mui/material';
import { People } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { DistributionChartWidget } from '@components/dashboard/widgets/DistributionChartWidget';

interface TotalUsersWidgetProps {
    totalCoaches: number;
    totalAthletes: number;
}

// Dashboard widget for total users split by role.
export const TotalUsersWidget: React.FC<TotalUsersWidgetProps> = ({
    totalCoaches,
    totalAthletes,
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const userDistribution = [
        { name: t('users.types.coach'), value: totalCoaches, color: theme.palette.secondary.main },
        { name: t('users.types.athlete'), value: totalAthletes, color: theme.palette.primary.main },
    ];

    return (
        <React.Fragment>
            {/* General information */}
            <DistributionChartWidget
                title={t('home.widgets.total_users')}
                tooltip={t('home.widgets.total_users_tooltip')}
                value={totalCoaches + totalAthletes}
                icon={People}
                colSpan={1}
                color={theme.palette.info.main}
                data={userDistribution}
                height={150}
            />
        </React.Fragment>
    );
};
