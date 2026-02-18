// src/pages/Calendar.tsx
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useDailyReports } from '@hooks/useDailyReports';
import type { DailyReport } from '@app-types/dailyReport';
import type { AgendaEvent } from '@app-types/agenda';
import { session } from '@stores/session';

/** Generate mock events across multiple days */
function generateMockEvents(): AgendaEvent[] {
    return [];
}

/** Calendar page with grid, filters, day details, and agenda */
export function Calendar(): React.JSX.Element {
    const theme = useTheme();
    const navigate = useNavigate();
    const { list } = useDailyReports();
    const { id: athleteId } = session();

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
    const isXL = useMediaQuery(theme.breakpoints.up('xl'));

    const [reports, setReports] = React.useState<DailyReport[]>([]);

    const fetchReports = React.useCallback(async () => {
        try {
            const result = await list({ limit: 100, athleteId: athleteId ?? undefined });
            if (result?.items) {
                setReports(result.items);
            }
        } catch (error) {
            console.error('Failed to fetch daily reports', error);
        }
    }, [list, athleteId]);

    React.useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const mockEvents = React.useMemo(() => generateMockEvents(), []);

    const healthEvents = React.useMemo<AgendaEvent[]>(() => {
        return reports.map((report) => ({
            id: report.id,
            type: 'health',
            title: 'Rapport Journalier',
            startAt: report.reportDate,
        }));
    }, [reports]);

    const allEvents = React.useMemo(() => [...mockEvents, ...healthEvents], [mockEvents, healthEvents]);

    const {
        cursorMonth,
        selectedDate,
        visibleTypes,
        eventsByDay,
        setSelectedDate,
        goToToday,
        goToPrevMonth,
        goToNextMonth,
    } = useCalendar({ events: allEvents });

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
            const event = allEvents.find((e) => e.id === id);
            if (event) {
                if (event.type === 'health') {
                    navigate(`/agenda/daily-report/view/${event.id}`);
                } else {
                    setSelectedDate(new Date(event.startAt));
                    if (isMobile) {
                        setDrawerContent('details');
                    }
                }
            }
        },
        [allEvents, setSelectedDate, isMobile, navigate]
    );

    const handleCreate = React.useCallback(() => {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        navigate(`/agenda/daily-report?date=${dateStr}`);
    }, [navigate, selectedDate]);

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
                            events={allEvents}
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
