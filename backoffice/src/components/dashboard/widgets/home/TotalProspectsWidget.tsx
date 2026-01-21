import React from 'react';
import { useTheme } from '@mui/material';
import { People } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { GrowthChartWidget } from '@components/dashboard/widgets/GrowthChartWidget';

interface GrowthDataPoint {
    name: string;
    value: number;
}

interface TotalProspectsWidgetProps {
    totalProspects: number;
    growthData: GrowthDataPoint[];
}

// Dashboard widget for total prospect growth.
export const TotalProspectsWidget: React.FC<TotalProspectsWidgetProps> = ({
    totalProspects,
    growthData,
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <React.Fragment>
            {/* General information */}
            <GrowthChartWidget
                title={t('home.widgets.total_prospects')}
                tooltip={t('home.widgets.total_prospects_tooltip')}
                value={totalProspects}
                icon={People}
                colSpan={1}
                data={growthData}
                height={80}
                color={theme.palette.success.main}
            />
        </React.Fragment>
    );
};
