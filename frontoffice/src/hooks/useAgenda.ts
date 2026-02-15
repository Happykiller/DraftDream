// src/hooks/useAgenda.ts

import * as React from 'react';
import type { AgendaEvent, AgendaEventType } from '@app-types/agenda';

export interface UseAgendaParams {
    events: AgendaEvent[];
    maxItems?: number;
    selectedTypes?: AgendaEventType[];
}

export interface UseAgendaResult {
    upcomingEvents: AgendaEvent[];
}

/**
 * Hook to filter and sort agenda events
 * - Filters only future events (startAt >= now)
 * - Optionally filters by selected types
 * - Sorts by startAt ascending
 * - Limits to maxItems
 */
export function useAgenda({ events, maxItems = 10, selectedTypes }: UseAgendaParams): UseAgendaResult {
    const upcomingEvents = React.useMemo(() => {
        const now = new Date();

        return events
            .filter((event) => new Date(event.startAt) >= now)
            .filter((event) => !selectedTypes || selectedTypes.length === 0 || selectedTypes.includes(event.type))
            .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
            .slice(0, maxItems);
    }, [events, maxItems, selectedTypes]);

    return { upcomingEvents };
}
