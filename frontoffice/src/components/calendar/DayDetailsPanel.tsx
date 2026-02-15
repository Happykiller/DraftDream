// src/components/calendar/DayDetailsPanel.tsx
import * as React from 'react';
import {
    Paper,
    Stack,
    Typography,
    List,
    Divider,
    Button,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { AgendaItem } from '@components/agenda/AgendaItem';
import type { AgendaEvent, AgendaEventType } from '@app-types/agenda';

export interface DayDetailsPanelProps {
    selectedDate: Date;
    events: AgendaEvent[];
    visibleTypes: Set<AgendaEventType>;
    onEventClick?: (id: string) => void;
    onCreate?: () => void;
}

/** Format date as full French date */
function formatFullDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

/** Day details panel showing events for selected day */
export const DayDetailsPanel = React.memo<DayDetailsPanelProps>(
    ({ selectedDate, events, visibleTypes, onEventClick, onCreate }) => {
        // Filter events by visible types
        const filteredEvents = React.useMemo(
            () => events.filter((event) => visibleTypes.has(event.type)),
            [events, visibleTypes]
        );

        const hasEvents = filteredEvents.length > 0;
        const formattedDate = formatFullDate(selectedDate);

        return (
            <Paper
                variant="outlined"
                sx={{
                    borderRadius: 3,
                    borderColor: 'divider',
                    p: 3,
                }}
            >
                <Stack spacing={3}>
                    {/* Header */}
                    <Stack spacing={1}>
                        <Typography variant="h6" fontWeight={600}>
                            Détails du jour
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                            {formattedDate}
                        </Typography>
                    </Stack>

                    {/* Create Button */}
                    {onCreate && (
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={onCreate}
                            fullWidth
                        >
                            Créer un rapport
                        </Button>
                    )}

                    <Divider />

                    {/* Event List */}
                    {hasEvents ? (
                        <List disablePadding sx={{ '& > :not(:last-child)': { mb: 1 } }}>
                            {filteredEvents.map((event, index) => (
                                <React.Fragment key={event.id}>
                                    <AgendaItem event={event} onClick={onEventClick} />
                                    {index < filteredEvents.length - 1 && <Divider sx={{ my: 1 }} />}
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Stack alignItems="center" justifyContent="center" py={4}>
                            <Typography variant="body2" color="text.secondary">
                                Aucun événement ce jour
                            </Typography>
                        </Stack>
                    )}
                </Stack>
            </Paper>
        );
    }
);

DayDetailsPanel.displayName = 'DayDetailsPanel';
