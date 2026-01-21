import React from 'react';
import { Typography, useTheme } from '@mui/material';
import { EventNote } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { StatCard } from '@components/dashboard/widgets/StatCard';

// Dashboard widget for system completion and health.
export const CompletionWidget: React.FC = () => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <React.Fragment>
            {/* General information */}
            <StatCard
                title={t('home.widgets.completion')}
                tooltip={t('home.widgets.completion_tooltip')}
                value="98%"
                icon={EventNote}
                colSpan={1}
                color={theme.palette.success.light}
            >
                <Typography variant="caption" color="text.secondary">
                    {t('home.widgets.system_health')}
                </Typography>
            </StatCard>
        </React.Fragment>
    );
};
