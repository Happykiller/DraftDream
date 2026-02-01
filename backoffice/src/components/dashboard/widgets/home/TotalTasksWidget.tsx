import React from 'react';
import { useTheme } from '@mui/material';
import { TaskAlt } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { StatCard } from '@components/dashboard/widgets/StatCard';

interface TotalTasksWidgetProps {
    totalTasks: number;
}

// Dashboard widget for total tasks count.
export const TotalTasksWidget: React.FC<TotalTasksWidgetProps> = ({
    totalTasks,
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <React.Fragment>
            {/* General information */}
            <StatCard
                title={t('home.widgets.total_tasks')}
                tooltip={t('home.widgets.total_tasks_tooltip')}
                value={totalTasks}
                icon={TaskAlt}
                colSpan={1}
                color={theme.palette.info.main}
            />
        </React.Fragment>
    );
};
