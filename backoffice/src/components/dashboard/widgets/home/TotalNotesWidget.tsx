import React from 'react';
import { useTheme } from '@mui/material';
import { StickyNote2 } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { StatCard } from '@components/dashboard/widgets/StatCard';

interface TotalNotesWidgetProps {
    totalNotes: number;
}

// Dashboard widget for total notes count.
export const TotalNotesWidget: React.FC<TotalNotesWidgetProps> = ({
    totalNotes,
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <React.Fragment>
            {/* General information */}
            <StatCard
                title={t('home.widgets.total_notes')}
                tooltip={t('home.widgets.total_notes_tooltip')}
                value={totalNotes}
                icon={StickyNote2}
                colSpan={1}
                color={theme.palette.info.main}
            />
        </React.Fragment>
    );
};
