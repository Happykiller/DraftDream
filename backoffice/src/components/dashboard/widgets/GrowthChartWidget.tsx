import React from 'react';
import { useTheme } from '@mui/material';
import {
    AreaChart,
    Area,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

import { StatCard } from './StatCard';
import type { StatCardProps } from './StatCard';

interface DataPoint {
    name: string; // Date or Label
    value: number;
}

interface GrowthChartWidgetProps extends StatCardProps {
    data: DataPoint[];
    height?: number;
}

export const GrowthChartWidget: React.FC<GrowthChartWidgetProps> = ({
    data,
    color,
    height = 100,
    ...statCardProps
}) => {
    const theme = useTheme();
    const chartColor = color || theme.palette.primary.main;

    return (
        <StatCard color={color} {...statCardProps}>
          {/* General information */}
            <div style={{ width: '100%', height: height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`gradient-${chartColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 8,
                            }}
                            itemStyle={{ color: theme.palette.text.primary }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={chartColor}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#gradient-${chartColor.replace('#', '')})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </StatCard>
    );
};
