import React from 'react';
import { Paper, useTheme } from '@mui/material';
import type { SxProps, Theme, PaperProps } from '@mui/material';

interface GlassCardProps extends PaperProps {
    children: React.ReactNode;
    colSpan?: 1 | 2 | 3 | 4;
    rowSpan?: 1 | 2 | 3 | 4;
    className?: string;
    sx?: SxProps<Theme>;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    colSpan = 1,
    rowSpan = 1,
    className,
    sx,
    ...other
}) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={3}
            className={className}
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
                ...sx
            }}
            {...other}
        >
            {/* General information */}
            {children}
        </Paper>
    );
};
