// src/pages/Calendar.tsx
import * as React from 'react';
import {
    Stack,
    Box,
    Drawer,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { CalendarGrid } from '@components/calendar/CalendarGrid';
import { DayDetailsPanel } from '@components/calendar/DayDetailsPanel';
import { AgendaSection } from '@components/agenda/AgendaSection';
import { useCalendar, getEventsForDay } from '@hooks/useCalendar';
import type { AgendaEvent } from '@app-types/agenda';

/** Generate mock events across multiple days */
function generateMockEvents(): AgendaEvent[] {
    const now = Date.now();
    const oneHour = 3600000;
    const oneDay = 86400000;

    return [
        // Today
        {
            id: '1',
            type: 'workout',
            title: 'Entraînement matinal',
            startAt: new Date(now + oneHour).toISOString(),
        },
        {
            id: '2',
            type: 'meal',
            title: 'Déjeuner équilibré',
            startAt: new Date(now + 5 * oneHour).toISOString(),
        },
        {
            id: '3',
            type: 'health',
            title: 'Consultation nutritionniste',
            startAt: new Date(now + 8 * oneHour).toISOString(),
        },
        // Tomorrow
        {
            id: '4',
            type: 'workout',
            title: 'Séance cardio',
            startAt: new Date(now + oneDay + 2 * oneHour).toISOString(),
        },
        {
            id: '5',
            type: 'meal',
            title: 'Dîner protéiné',
            startAt: new Date(now + oneDay + 7 * oneHour).toISOString(),
        },
        // Day 3
        {
            id: '6',
            type: 'workout',
            title: 'Renforcement musculaire',
            startAt: new Date(now + 2 * oneDay + 3 * oneHour).toISOString(),
        },
        {
            id: '7',
            type: 'health',
            title: 'Bilan de santé',
            startAt: new Date(now + 2 * oneDay + 6 * oneHour).toISOString(),
        },
        // Day 4
        {
            id: '8',
            type: 'meal',
            title: 'Préparation repas semaine',
            startAt: new Date(now + 3 * oneDay + 4 * oneHour).toISOString(),
        },
        {
            id: '9',
            type: 'workout',
            title: 'Yoga et stretching',
            startAt: new Date(now + 3 * oneDay + 9 * oneHour).toISOString(),
        },
        // Day 5
        {
            id: '10',
            type: 'health',
            title: 'Suivi médical',
            startAt: new Date(now + 4 * oneDay + 3 * oneHour).toISOString(),
        },
        {
            id: '11',
            type: 'workout',
            title: 'Natation',
            startAt: new Date(now + 5 * oneDay + 2 * oneHour).toISOString(),
        },
        {
            id: '12',
            type: 'meal',
            title: 'Brunch santé',
            startAt: new Date(now + 6 * oneDay + 4 * oneHour).toISOString(),
        },
    ];
}

/** Calendar page with grid, filters, day details, and agenda */
export function Calendar(): React.JSX.Element {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
    const isXL = useMediaQuery(theme.breakpoints.up('xl'));

    const mockEvents = React.useMemo(() => generateMockEvents(), []);

    const {
        cursorMonth,
        selectedDate,
        visibleTypes,
        eventsByDay,
        setSelectedDate,
        goToToday,
        goToPrevMonth,
        goToNextMonth,
    } = useCalendar({ events: mockEvents });

    // Mobile drawer state
    const [drawerContent, setDrawerContent] = React.useState<'details' | 'agenda' | null>(null);

    // Get events for selected day
    const selectedDayEvents = React.useMemo(
        () => getEventsForDay(eventsByDay, selectedDate, visibleTypes),
        [eventsByDay, selectedDate, visibleTypes]
    );

    // Handlers
    const handleDateSelect = React.useCallback(
        (date: Date) => {
            setSelectedDate(date);
            if (isMobile) {
                setDrawerContent('details');
            }
        },
        [setSelectedDate, isMobile]
    );

    const handleAgendaEventClick = React.useCallback(
        (id: string) => {
            const event = mockEvents.find((e) => e.id === id);
            if (event) {
                setSelectedDate(new Date(event.startAt));
                if (isMobile) {
                    setDrawerContent('details');
                }
            }
        },
        [mockEvents, setSelectedDate, isMobile]
    );

    const handleCreate = React.useCallback(() => {
        console.log('Create event for date:', selectedDate);
    }, [selectedDate]);

    const handleCloseDrawer = React.useCallback(() => {
        setDrawerContent(null);
    }, []);

    // MOBILE LAYOUT
    if (isMobile) {
        return (
            <Stack spacing={2} sx={{ width: '100%', p: 2 }}>
                <CalendarGrid
                    cursorMonth={cursorMonth}
                    selectedDate={selectedDate}
                    eventsByDay={eventsByDay}
                    visibleTypes={visibleTypes}
                    onDateSelect={handleDateSelect}
                    onPrevMonth={goToPrevMonth}
                    onNextMonth={goToNextMonth}
                    onToday={goToToday}
                />

                <Drawer
                    anchor="bottom"
                    open={drawerContent !== null}
                    onClose={handleCloseDrawer}
                    PaperProps={{
                        sx: {
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            maxHeight: '80vh',
                            p: 3,
                        },
                    }}
                >
                    <DayDetailsPanel
                        selectedDate={selectedDate}
                        events={selectedDayEvents}
                        visibleTypes={visibleTypes}
                        onEventClick={handleAgendaEventClick}
                        onCreate={handleCreate}
                    />
                </Drawer>
            </Stack>
        );
    }

    // TABLET LAYOUT
    if (isTablet) {
        return (
            <Stack spacing={3} sx={{ width: '100%', p: 3 }}>
                <CalendarGrid
                    cursorMonth={cursorMonth}
                    selectedDate={selectedDate}
                    eventsByDay={eventsByDay}
                    visibleTypes={visibleTypes}
                    onDateSelect={handleDateSelect}
                    onPrevMonth={goToPrevMonth}
                    onNextMonth={goToNextMonth}
                    onToday={goToToday}
                />

                <DayDetailsPanel
                    selectedDate={selectedDate}
                    events={selectedDayEvents}
                    visibleTypes={visibleTypes}
                    onEventClick={handleAgendaEventClick}
                    onCreate={handleCreate}
                />
            </Stack>
        );
    }

    // DESKTOP LAYOUT
    if (isDesktop) {
        return (
            <Stack direction="row" spacing={3} sx={{ width: '100%', p: 4 }}>
                {/* Left: Agenda (XL and above) */}
                {isXL && (
                    <Box sx={{ width: 360 }}>
                        <AgendaSection
                            events={mockEvents}
                            onEventClick={handleAgendaEventClick}
                            maxItems={10}
                        />
                    </Box>
                )}

                {/* Center: Calendar Grid */}
                <Box sx={{ flex: 1 }}>
                    <CalendarGrid
                        cursorMonth={cursorMonth}
                        selectedDate={selectedDate}
                        eventsByDay={eventsByDay}
                        visibleTypes={visibleTypes}
                        onDateSelect={handleDateSelect}
                        onPrevMonth={goToPrevMonth}
                        onNextMonth={goToNextMonth}
                        onToday={goToToday}
                    />
                </Box>

                {/* Right: Details */}
                <Box sx={{ width: 360 }}>
                    <Box sx={{ position: 'sticky', top: 96 }}>
                        <DayDetailsPanel
                            selectedDate={selectedDate}
                            events={selectedDayEvents}
                            visibleTypes={visibleTypes}
                            onEventClick={handleAgendaEventClick}
                            onCreate={handleCreate}
                        />
                    </Box>
                </Box>
            </Stack>
        );
    }

    // Fallback (should not be reached)
    return (
        <Stack spacing={2} sx={{ width: '100%', p: 2 }}>
            <CalendarGrid
                cursorMonth={cursorMonth}
                selectedDate={selectedDate}
                eventsByDay={eventsByDay}
                visibleTypes={visibleTypes}
                onDateSelect={handleDateSelect}
                onPrevMonth={goToPrevMonth}
                onNextMonth={goToNextMonth}
                onToday={goToToday}
            />
        </Stack>
    );
}

// Export as Agenda for backward compatibility with routes
export { Calendar as Agenda };
