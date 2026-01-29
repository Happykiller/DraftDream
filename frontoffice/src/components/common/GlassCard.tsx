import React from 'react';
import { Paper } from '@mui/material';
import type { SxProps, Theme, PaperProps } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

interface GlassCardProps extends PaperProps {
    children: React.ReactNode;
    colSpan?: 1 | 2 | 3 | 4;
    rowSpan?: 1 | 2 | 3 | 4;
    className?: string;
    accentColor?: string;
    sx?: SxProps<Theme>;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    colSpan = 1,
    rowSpan = 1,
    className,
    sx,
    accentColor,
    onClick,
    ...other
}) => {
    const theme = useTheme();
    const accent = accentColor ?? theme.palette.primary.main;

    return (
        <Paper
            elevation={3}
            className={className}
            onClick={onClick}
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
                cursor: onClick ? 'pointer' : 'default',
                ...(onClick && {
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                    },
                }),
                background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${alpha(accent, 0.18)} 0%, ${alpha(accent, 0.04)} 100%)`
                    : `linear-gradient(135deg, ${alpha(accent, 0.12)} 0%, ${alpha(accent, 0.02)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(accent, theme.palette.mode === 'dark' ? 0.4 : 0.3)}`,
                ...sx
            }}
            {...other}
        >
            {children}
        </Paper>
    );
};
