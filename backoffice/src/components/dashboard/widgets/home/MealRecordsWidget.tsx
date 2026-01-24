import React from 'react';
import { useTheme } from '@mui/material';
import { RestaurantMenu } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { StatCard } from '@components/dashboard/widgets/StatCard';

interface RecordRatingDataPoint {
    name: string;
    value: number;
}

interface MealRecordsWidgetProps {
    totalRecords: number;
    ratingData: RecordRatingDataPoint[];
}

// Dashboard widget for meal plan record satisfaction ratings.
export const MealRecordsWidget: React.FC<MealRecordsWidgetProps> = ({
    totalRecords,
    ratingData,
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <React.Fragment>
            {/* General information */}
            <StatCard
                title={t('home.widgets.meal_records')}
                tooltip={t('home.widgets.meal_records_tooltip')}
                value={totalRecords}
                icon={RestaurantMenu}
                colSpan={1}
                color={theme.palette.warning.main}
            >
                <div style={{ width: '100%', height: 140 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ratingData} margin={{ top: 8, right: 12, left: 0, bottom: 24 }}>
                            <XAxis
                                dataKey="name"
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                tick={{ fontSize: 10 }}
                                height={60}
                                tickMargin={8}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 8,
                                }}
                                cursor={{ fill: theme.palette.action.hover }}
                            />
                            <Bar dataKey="value" fill={theme.palette.warning.main} radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </StatCard>
        </React.Fragment>
    );
};
