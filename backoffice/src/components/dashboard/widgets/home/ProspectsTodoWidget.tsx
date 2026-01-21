import React from 'react';
import { Button, useTheme } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import type { Prospect } from '@hooks/useProspects';

import { ProspectsListWidget } from '@components/dashboard/widgets/ProspectsListWidget';

interface ProspectsTodoWidgetProps {
    prospects: Prospect[];
    onViewProspects: () => void;
}

// Dashboard widget for prospects that still need action.
export const ProspectsTodoWidget: React.FC<ProspectsTodoWidgetProps> = ({
    prospects,
    onViewProspects,
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <React.Fragment>
            {/* General information */}
            <ProspectsListWidget
                title={t('home.widgets.prospects_todo')}
                tooltip={t('home.widgets.prospects_todo_tooltip')}
                value={prospects.length}
                icon={TrendingUp}
                colSpan={1}
                color={theme.palette.warning.main}
                prospects={prospects}
            >
                <Button size="small" fullWidth onClick={onViewProspects} sx={{ mt: 1 }}>
                    {t('home.widgets.view_prospects')}
                </Button>
            </ProspectsListWidget>
        </React.Fragment>
    );
};
