import * as React from 'react';
import { Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface ProgramExerciseBadgeGroupProps {
    title: string;
    items?: ReadonlyArray<{ id: string; label: string }> | null;
    paletteKey: 'primary' | 'secondary' | 'success' | 'warning';
}

export function ProgramExerciseBadgeGroup({
    title,
    items,
    paletteKey,
}: ProgramExerciseBadgeGroupProps): React.JSX.Element | null {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <Stack spacing={0.75}>
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}
            >
                {title}
            </Typography>
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                {items.map((item) => (
                    <Chip
                        key={item.id}
                        size="small"
                        label={item.label}
                        sx={(theme) => ({
                            bgcolor: alpha(theme.palette[paletteKey].main, 0.16),
                            color: theme.palette[paletteKey].main,
                            fontWeight: 600,
                        })}
                    />
                ))}
            </Stack>
        </Stack>
    );
}
