// src/hooks/useCalendar.ts
import * as React from 'react';
import type { AgendaEvent, AgendaEventType } from '@app-types/agenda';

export interface UseCalendarParams {
    events: AgendaEvent[];
    initialDate?: Date;
}

export interface UseCalendarResult {
    cursorMonth: Date;
    selectedDate: Date;
    visibleTypes: Set<AgendaEventType>;
    eventsByDay: Map<string, AgendaEvent[]>;

    setSelectedDate: (date: Date) => void;
    setCursorMonth: (date: Date) => void;
    toggleType: (type: AgendaEventType) => void;
    goToToday: () => void;
    goToPrevMonth: () => void;
    goToNextMonth: () => void;
}

/** Format date as YYYY-MM-DD for indexing */
function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/** Calendar state management and event indexing */
export function useCalendar({ events, initialDate }: UseCalendarParams): UseCalendarResult {
    const [cursorMonth, setCursorMonth] = React.useState<Date>(initialDate || new Date());
    const [selectedDate, setSelectedDate] = React.useState<Date>(initialDate || new Date());
    const [visibleTypes, setVisibleTypes] = React.useState<Set<AgendaEventType>>(
        new Set(['workout', 'meal', 'health'])
    );

    // Index events by day for fast lookup
    const eventsByDay = React.useMemo(() => {
        const map = new Map<string, AgendaEvent[]>();

        events.forEach((event) => {
            const key = formatDateKey(new Date(event.startAt));
            const existing = map.get(key) || [];
            map.set(key, [...existing, event]);
        });

        // Sort events within each day by time
        map.forEach((dayEvents) => {
            dayEvents.sort((a, b) =>
                new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
            );
        });

        return map;
    }, [events]);

    const toggleType = React.useCallback((type: AgendaEventType) => {
        setVisibleTypes((prev) => {
            const next = new Set(prev);
            if (next.has(type)) {
                next.delete(type);
            } else {
                next.add(type);
            }
            return next;
        });
    }, []);

    const goToToday = React.useCallback(() => {
        const today = new Date();
        setSelectedDate(today);
        setCursorMonth(today);
    }, []);

    const goToPrevMonth = React.useCallback(() => {
        setCursorMonth((prev) => {
            const next = new Date(prev);
            next.setMonth(next.getMonth() - 1);
            return next;
        });
    }, []);

    const goToNextMonth = React.useCallback(() => {
        setCursorMonth((prev) => {
            const next = new Date(prev);
            next.setMonth(next.getMonth() + 1);
            return next;
        });
    }, []);

    return {
        cursorMonth,
        selectedDate,
        visibleTypes,
        eventsByDay,
        setSelectedDate,
        setCursorMonth,
        toggleType,
        goToToday,
        goToPrevMonth,
        goToNextMonth,
    };
}

/** Get events for a specific day, filtered by visible types */
export function getEventsForDay(
    eventsByDay: Map<string, AgendaEvent[]>,
    date: Date,
    visibleTypes: Set<AgendaEventType>
): AgendaEvent[] {
    const key = formatDateKey(date);
    const events = eventsByDay.get(key) || [];
    return events.filter((event) => visibleTypes.has(event.type));
}

/** Check if two dates are the same day */
export function isSameDay(date1: Date, date2: Date): boolean {
    return formatDateKey(date1) === formatDateKey(date2);
}

/** Check if date is today */
export function isToday(date: Date): boolean {
    return isSameDay(date, new Date());
}

/** Get calendar grid cells (42 days: 6 weeks) */
export function getCalendarCells(cursorMonth: Date): Date[] {
    const year = cursorMonth.getFullYear();
    const month = cursorMonth.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);

    // Find the Monday before or on the first day
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    // Generate 42 cells (6 weeks)
    const cells: Date[] = [];
    for (let i = 0; i < 42; i++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(cellDate.getDate() + i);
        cells.push(cellDate);
    }

    return cells;
}
