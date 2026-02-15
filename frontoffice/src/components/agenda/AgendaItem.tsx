// src/components/agenda/AgendaItem.tsx
import * as React from 'react';
import {
    ListItem,
    ListItemButton,
    Stack,
    Typography,
    Chip,
    useTheme,
} from '@mui/material';
import {
    FitnessCenter,
    Restaurant,
    MonitorHeart,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { AgendaEvent, AgendaEventType } from '@app-types/agenda';

export interface AgendaItemProps {
    event: AgendaEvent;
    onClick?: (id: string) => void;
}

/** Icon mapping for event types */
const EVENT_ICONS: Record<AgendaEventType, React.ReactElement> = {
    workout: <FitnessCenter fontSize="small" />,
    meal: <Restaurant fontSize="small" />,
    health: <MonitorHeart fontSize="small" />,
};

/** Color mapping for event types */
const EVENT_COLORS: Record<AgendaEventType, 'primary' | 'success' | 'warning'> = {
    workout: 'primary',
    meal: 'success',
    health: 'warning',
};

/** Format time in HH:mm format using French locale */
function formatTime(isoString: string): string {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

/** Individual agenda event item */
export const AgendaItem = React.memo<AgendaItemProps>(({ event, onClick }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    const handleClick = React.useCallback(() => {
        onClick?.(event.id);
    }, [onClick, event.id]);

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(event.id);
            }
        },
        [onClick, event.id]
    );

    const icon = EVENT_ICONS[event.type];
    const chipColor = EVENT_COLORS[event.type];
    const formattedTime = formatTime(event.startAt);

    // Get translated label for event type
    const typeLabel = t(`agenda.eventType.${event.type}`);

    return (
        <ListItem disablePadding>
            <ListItemButton
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
                aria-label={`${event.title} à ${formattedTime}`}
                sx={{
                    borderRadius: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                    },
                    '&:focus-visible': {
                        outline: `2px solid ${theme.palette.primary.main}`,
                        outlineOffset: 2,
                    },
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center" width="100%">
                    <Stack
                        sx={{
                            color: theme.palette.text.secondary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {icon}
                    </Stack>

                    <Stack flex={1} spacing={0.5}>
                        <Typography variant="body2" fontWeight={500}>
                            {event.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {formattedTime}
                        </Typography>
                    </Stack>

                    <Chip
                        label={typeLabel}
                        color={chipColor}
                        size="small"
                        sx={{
                            fontWeight: 500,
                        }}
                    />
                </Stack>
            </ListItemButton>
        </ListItem>
    );
});

AgendaItem.displayName = 'AgendaItem';
