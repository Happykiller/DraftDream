import React from 'react';
import { useTheme, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DataPoint {
    name: string;
    value: number;
    color?: string;
    [key: string]: any;
}

interface DistributionChartWidgetProps {
    data: DataPoint[];
    height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const DistributionChartWidget: React.FC<DistributionChartWidgetProps> = ({
    data,
    height = 200,
}) => {
    const theme = useTheme();

    return (
        <Box sx={{ width: '100%', height: height, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
// ...
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="80%"
                        paddingAngle={5}
                        dataKey="value"
                    >
// ...
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color || COLORS[index % COLORS.length]}
                                stroke={theme.palette.background.paper}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: 8,
                            border: 'none',
                            boxShadow: theme.shadows[3]
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>
            {/* Center Text (Total or similar could go here, for now keeping it clean) */}
        </Box>
    );
};
