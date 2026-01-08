import React from 'react';
import { Typography, Box, useTheme } from '@mui/material';
import { GlassCard } from '@components/common/GlassCard';

export interface StatCardProps {
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

    // Glassmorphism and gradient effects.

    return (
        <GlassCard
            colSpan={colSpan}
            rowSpan={rowSpan}
            sx={{
                background: color ? `${color}0D` : undefined, // Very subtle tint if color provided
                borderColor: color ? `${color}40` : undefined,
            }}
        >
            {/* General information */}
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
        </GlassCard>
    );
};
