// src/components/calendar/CalendarGrid.tsx
import * as React from 'react';
import {
    Paper,
    Stack,
    Typography,
    Box,
    IconButton,
    Button,
    useTheme,
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
} from '@mui/icons-material';
import type { AgendaEvent, AgendaEventType } from '@app-types/agenda';
import { getCalendarCells, isSameDay, isToday } from '@hooks/useCalendar';

export interface CalendarGridProps {
    cursorMonth: Date;
    selectedDate: Date;
    eventsByDay: Map<string, AgendaEvent[]>;
    visibleTypes: Set<AgendaEventType>;
    onDateSelect: (date: Date) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
}

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const EVENT_COLORS: Record<AgendaEventType, string> = {
    workout: '#1976d2', // primary
    meal: '#2e7d32', // success
    health: '#ed6c02', // warning
};

/** Format date as YYYY-MM-DD */
function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/** Get event type counts for a day */
function getEventTypeCounts(
    eventsByDay: Map<string, AgendaEvent[]>,
    date: Date,
    visibleTypes: Set<AgendaEventType>
): Record<AgendaEventType, number> {
    const key = formatDateKey(date);
    const events = eventsByDay.get(key) || [];
    const filteredEvents = events.filter((e) => visibleTypes.has(e.type));

    const counts: Record<AgendaEventType, number> = {
        workout: 0,
        meal: 0,
        health: 0,
    };

    filteredEvents.forEach((event) => {
        counts[event.type]++;
    });

    return counts;
}

/** Calendar day cell */
interface DayCellProps {
    date: Date;
    isCurrentMonth: boolean;
    isSelected: boolean;
    isToday: boolean;
    eventCounts: Record<AgendaEventType, number>;
    onClick: () => void;
}

const DayCell = React.memo<DayCellProps>(
    ({ date, isCurrentMonth, isSelected, isToday: isTodayCell, eventCounts, onClick }) => {
        const theme = useTheme();
        const dayNumber = date.getDate();

        const totalEvents = eventCounts.workout + eventCounts.meal + eventCounts.health;
        const hasEvents = totalEvents > 0;

        // Event type dots
        const eventTypes: AgendaEventType[] = [];
        if (eventCounts.workout > 0) eventTypes.push('workout');
        if (eventCounts.meal > 0) eventTypes.push('meal');
        if (eventCounts.health > 0) eventTypes.push('health');

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
            }
        };

        return (
            <Box
                role="button"
                tabIndex={0}
                onClick={onClick}
                onKeyDown={handleKeyDown}
                aria-label={`${dayNumber} ${date.toLocaleDateString('fr-FR', { month: 'long' })}`}
                aria-selected={isSelected}
                sx={{
                    aspectRatio: '1',
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    p: 1,
                    cursor: 'pointer',
                    position: 'relative',
                    backgroundColor: isSelected
                        ? 'action.selected'
                        : isTodayCell
                            ? 'action.hover'
                            : 'background.paper',
                    opacity: isCurrentMonth ? 1 : 0.4,
                    transition: 'all 0.2s',
                    '&:hover': {
                        backgroundColor: isSelected ? 'action.selected' : 'action.hover',
                        borderColor: isSelected ? 'primary.main' : 'primary.light',
                    },
                    '&:focus-visible': {
                        outline: `2px solid ${theme.palette.primary.main}`,
                        outlineOffset: 2,
                    },
                }}
            >
                <Stack spacing={0.5} height="100%">
                    {/* Day number */}
                    <Typography
                        variant="body2"
                        fontWeight={isTodayCell ? 700 : isSelected ? 600 : 400}
                        color={isTodayCell ? 'primary.main' : 'text.primary'}
                    >
                        {dayNumber}
                    </Typography>

                    {/* Event indicators */}
                    {hasEvents && (
                        <Stack spacing={0.5} flex={1} justifyContent="flex-end">
                            {/* Event type dots */}
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                {eventTypes.slice(0, 3).map((type) => (
                                    <Box
                                        key={type}
                                        sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            backgroundColor: EVENT_COLORS[type],
                                        }}
                                    />
                                ))}
                            </Stack>

                            {/* Total count */}
                            {totalEvents > 0 && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '0.65rem',
                                        color: 'text.secondary',
                                        fontWeight: 500,
                                    }}
                                >
                                    {totalEvents}
                                </Typography>
                            )}
                        </Stack>
                    )}
                </Stack>
            </Box>
        );
    }
);

DayCell.displayName = 'DayCell';

/** Calendar grid component */
export const CalendarGrid = React.memo<CalendarGridProps>(
    ({
        cursorMonth,
        selectedDate,
        eventsByDay,
        visibleTypes,
        onDateSelect,
        onPrevMonth,
        onNextMonth,
        onToday,
    }) => {
        const cells = React.useMemo(() => getCalendarCells(cursorMonth), [cursorMonth]);

        const monthYear = React.useMemo(
            () =>
                cursorMonth.toLocaleDateString('fr-FR', {
                    month: 'long',
                    year: 'numeric',
                }),
            [cursorMonth]
        );

        const currentMonthValue = cursorMonth.getMonth();

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
                    {/* Header: Month navigation */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h5" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                            {monthYear}
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Button size="small" variant="outlined" onClick={onToday}>
                                Aujourd'hui
                            </Button>
                            <IconButton
                                size="small"
                                onClick={onPrevMonth}
                                aria-label="Mois précédent"
                            >
                                <ChevronLeft />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={onNextMonth}
                                aria-label="Mois suivant"
                            >
                                <ChevronRight />
                            </IconButton>
                        </Stack>
                    </Stack>

                    {/* Weekday headers */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: 1,
                        }}
                    >
                        {WEEKDAY_LABELS.map((label) => (
                            <Typography
                                key={label}
                                variant="caption"
                                fontWeight={600}
                                color="text.secondary"
                                textAlign="center"
                            >
                                {label}
                            </Typography>
                        ))}
                    </Box>

                    {/* Calendar grid */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: 1,
                        }}
                    >
                        {cells.map((date) => {
                            const isCurrentMonth = date.getMonth() === currentMonthValue;
                            const isSelectedDay = isSameDay(date, selectedDate);
                            const isTodayDay = isToday(date);
                            const eventCounts = getEventTypeCounts(eventsByDay, date, visibleTypes);

                            return (
                                <DayCell
                                    key={date.toISOString()}
                                    date={date}
                                    isCurrentMonth={isCurrentMonth}
                                    isSelected={isSelectedDay}
                                    isToday={isTodayDay}
                                    eventCounts={eventCounts}
                                    onClick={() => onDateSelect(date)}
                                />
                            );
                        })}
                    </Box>
                </Stack>
            </Paper>
        );
    }
);

CalendarGrid.displayName = 'CalendarGrid';
