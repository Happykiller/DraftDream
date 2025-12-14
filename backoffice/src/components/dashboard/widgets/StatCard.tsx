import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ElementType;
    colSpan?: 1 | 2 | 3 | 4;
    rowSpan?: 1 | 2 | 3 | 4;
    color?: string; // Optional custom gradient start color
    trend?: {
        value: number; // e.g., +12%
        label: string; // "vs last month"
    };
    actionIcon?: React.ReactNode;
    children?: React.ReactNode; // For charts or extra content
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    colSpan = 1,
    rowSpan = 1,
    color,
    trend,
    actionIcon,
    children,
}) => {
    const theme = useTheme();

    // Glassmorphism and Gradient effects
    // Glassmorphism and Gradient effects

    return (
        <Paper
            elevation={3}
            sx={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${rowSpan}`,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 4,
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                },
                background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)`
                    : theme.palette.background.paper,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme.palette.divider}`,
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                        {title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mt: 1 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, background: color ? `linear-gradient(45deg, ${theme.palette.text.primary}, ${color})` : 'inherit', WebkitBackgroundClip: color ? 'text' : 'none', WebkitTextFillColor: color ? 'transparent' : 'inherit' }}>
                            {value}
                        </Typography>
                        {trend && (
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, transform: 'translateY(-4px)' }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: trend.value >= 0 ? 'success.main' : 'error.main',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {trend.value > 0 ? '+' : ''}{trend.value}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {trend.label}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
                {Icon && (
                    <Box sx={{
                        p: 1.5,
                        borderRadius: '50%',
                        background: color ? `${color}22` : theme.palette.action.hover,
                        color: color || theme.palette.primary.main
                    }}>
                        <Icon fontSize="large" />
                    </Box>
                )}
            </Box>

            {/* Main Content (Charts, Lists) */}
            <Box sx={{ flexGrow: 1, position: 'relative' }}>
                {children}
            </Box>

            {/* Action Icon */}
            {actionIcon && (
                <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                    {actionIcon}
                </Box>
            )}
        </Paper>
    );
};
