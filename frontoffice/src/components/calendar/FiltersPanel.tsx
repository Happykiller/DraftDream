// src/components/calendar/FiltersPanel.tsx
import * as React from 'react';
import {
    Paper,
    Stack,
    Typography,
    Chip,
} from '@mui/material';
import type { AgendaEventType } from '@app-types/agenda';

export interface FiltersPanelProps {
    visibleTypes: Set<AgendaEventType>;
    onToggle: (type: AgendaEventType) => void;
}

const TYPE_LABELS: Record<AgendaEventType, string> = {
    workout: 'Séances',
    meal: 'Repas',
    health: 'Santé',
};

const TYPE_COLORS: Record<AgendaEventType, 'primary' | 'success' | 'warning'> = {
    workout: 'primary',
    meal: 'success',
    health: 'warning',
};

/** Filter panel for event types */
export const FiltersPanel = React.memo<FiltersPanelProps>(
    ({ visibleTypes, onToggle }) => {
        const types: AgendaEventType[] = ['workout', 'meal', 'health'];

        return (
            <Paper
                variant="outlined"
                sx={{
                    borderRadius: 3,
                    borderColor: 'divider',
                    p: 3,
                }}
            >
                <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={600}>
                        Filtres
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {types.map((type) => {
                            const isSelected = visibleTypes.has(type);
                            return (
                                <Chip
                                    key={type}
                                    label={TYPE_LABELS[type]}
                                    color={TYPE_COLORS[type]}
                                    variant={isSelected ? 'filled' : 'outlined'}
                                    onClick={() => onToggle(type)}
                                    sx={{
                                        fontWeight: isSelected ? 600 : 400,
                                        cursor: 'pointer',
                                    }}
                                />
                            );
                        })}
                    </Stack>
                </Stack>
            </Paper>
        );
    }
);

FiltersPanel.displayName = 'FiltersPanel';
