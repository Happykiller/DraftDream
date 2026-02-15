// src/pages/AgendaShowcase.tsx
import * as React from 'react';
import {
    Stack,
    Typography,
    Paper,
    Box,
    ThemeProvider,
    createTheme,
    Container,
} from '@mui/material';
import { AgendaSection } from '@components/agenda/AgendaSection';
import type { AgendaEvent } from '@app-types/agenda';

/** Generate mock events for showcase */
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

interface DeviceFrameProps {
    title: string;
    width: number;
    height?: number;
    children: React.ReactNode;
}

/** Device frame wrapper for showcase */
const DeviceFrame = React.memo<DeviceFrameProps>(
    ({ title, width, height, children }) => (
        <Stack spacing={2}>
            <Typography variant="h6" fontWeight={600}>
                {title}
            </Typography>
            <Paper
                variant="outlined"
                sx={{
                    width,
                    height,
                    overflow: 'auto',
                    borderRadius: 2,
                    boxShadow: 3,
                    position: 'relative',
                }}
            >
                {children}
            </Paper>
        </Stack>
    )
);

DeviceFrame.displayName = 'DeviceFrame';

/** Agenda Showcase Page - Displays all 3 responsive formats simultaneously */
export function AgendaShowcase(): React.JSX.Element {
    const mockEvents = React.useMemo(() => generateMockEvents(), []);

    const handleEventClick = React.useCallback((id: string) => {
        console.log('Event clicked:', id);
    }, []);

    const handleCreate = React.useCallback(() => {
        console.log('Create event');
    }, []);

    // Mobile theme (force xs breakpoint)
    const mobileTheme = React.useMemo(
        () =>
            createTheme({
                breakpoints: {
                    values: {
                        xs: 0,
                        sm: 9999,
                        md: 9999,
                        lg: 9999,
                        xl: 9999,
                        xxl: 9999,
                    },
                },
            }),
        []
    );

    // Tablet theme (force sm-md breakpoint)
    const tabletTheme = React.useMemo(
        () =>
            createTheme({
                breakpoints: {
                    values: {
                        xs: 0,
                        sm: 600,
                        md: 9999,
                        lg: 9999,
                        xl: 9999,
                        xxl: 9999,
                    },
                },
            }),
        []
    );

    // Desktop theme (force lg+ breakpoint)
    const desktopTheme = React.useMemo(
        () =>
            createTheme({
                breakpoints: {
                    values: {
                        xs: 0,
                        sm: 600,
                        md: 900,
                        lg: 1200,
                        xl: 1536,
                        xxl: 1920,
                    },
                },
            }),
        []
    );

    return (
        <Container maxWidth={false} sx={{ py: 4 }}>
            <Stack spacing={6}>
                {/* Page Header */}
                <Stack spacing={2}>
                    <Typography variant="h3" fontWeight={700}>
                        Agenda Showcase
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Visualisation des 3 formats responsives de l'Agenda : Mobile (Drawer),
                        Tablet (Card), et Desktop (Sidebar avec filtres).
                    </Typography>
                </Stack>

                {/* MOBILE FORMAT */}
                <DeviceFrame title="📱 Mobile (≤600px)" width={390} height={844}>
                    <ThemeProvider theme={mobileTheme}>
                        <Box sx={{ width: 390, minHeight: 844, p: 2, bgcolor: 'background.default' }}>
                            <Stack spacing={2}>
                                <Typography variant="h6">Calendrier</Typography>
                                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        Placeholder calendrier
                                    </Typography>
                                </Paper>
                            </Stack>

                            <AgendaSection
                                events={mockEvents}
                                onEventClick={handleEventClick}
                                onCreate={handleCreate}
                                maxItems={10}
                            />
                        </Box>
                    </ThemeProvider>
                </DeviceFrame>

                {/* TABLET FORMAT */}
                <DeviceFrame title="📱 Tablet (600-1200px)" width={820}>
                    <ThemeProvider theme={tabletTheme}>
                        <Box sx={{ width: 820, p: 3, bgcolor: 'background.default' }}>
                            <Stack spacing={3}>
                                <Typography variant="h5" fontWeight={600}>
                                    Calendrier
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        Placeholder calendrier
                                    </Typography>
                                </Paper>

                                <AgendaSection
                                    events={mockEvents}
                                    onEventClick={handleEventClick}
                                    onCreate={handleCreate}
                                    maxItems={10}
                                />
                            </Stack>
                        </Box>
                    </ThemeProvider>
                </DeviceFrame>

                {/* DESKTOP FORMAT */}
                <DeviceFrame title="🖥️ Desktop (≥1200px)" width={1440}>
                    <ThemeProvider theme={desktopTheme}>
                        <Box sx={{ width: 1440, p: 4, bgcolor: 'background.default' }}>
                            <Stack direction="row" spacing={3}>
                                {/* Left: Filters */}
                                <Paper
                                    variant="outlined"
                                    sx={{ width: 280, p: 3, borderRadius: 3 }}
                                >
                                    <Stack spacing={2}>
                                        <Typography variant="h6" fontWeight={600}>
                                            Filtres
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Les filtres sont intégrés dans l'Agenda (colonne droite)
                                        </Typography>
                                    </Stack>
                                </Paper>

                                {/* Center: Calendar */}
                                <Paper
                                    variant="outlined"
                                    sx={{ flex: 1, p: 4, borderRadius: 3 }}
                                >
                                    <Stack spacing={2}>
                                        <Typography variant="h5" fontWeight={600}>
                                            Calendrier
                                        </Typography>
                                        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Typography color="text.secondary">
                                                Placeholder calendrier
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>

                                {/* Right: Agenda Sidebar */}
                                <Box sx={{ width: 360 }}>
                                    <AgendaSection
                                        events={mockEvents}
                                        onEventClick={handleEventClick}
                                        onCreate={handleCreate}
                                        maxItems={10}
                                    />
                                </Box>
                            </Stack>
                        </Box>
                    </ThemeProvider>
                </DeviceFrame>
            </Stack>
        </Container>
    );
}
