import React from 'react';
import { useTheme } from '@mui/material';
import { Timer } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { StatCard } from '@components/dashboard/widgets/StatCard';

interface SessionsPrivateWidgetProps {
    totalSessions: number;
}

// Dashboard widget for private training sessions.
export const SessionsPrivateWidget: React.FC<SessionsPrivateWidgetProps> = ({ totalSessions }) => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <React.Fragment>
            {/* General information */}
            <StatCard
                title={t('home.widgets.sessions_private')}
                tooltip={t('home.widgets.sessions_private_tooltip')}
                value={totalSessions}
                icon={Timer}
                colSpan={1}
                color={theme.palette.error.main}
            />
        </React.Fragment>
    );
};
