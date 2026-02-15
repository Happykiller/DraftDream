// src/components/agenda/AgendaSection.tsx
import * as React from 'react';
import {
    Paper,
    Stack,
    Typography,
    List,
    Divider,
    Button,
    Drawer,
    Fab,
    Chip,
    Box,
    IconButton,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    Add as AddIcon,
    CalendarMonth as CalendarIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { AgendaItem } from './AgendaItem';
import { useAgenda } from '@hooks/useAgenda';
import type { AgendaEvent, AgendaEventType } from '@app-types/agenda';

export interface AgendaSectionProps {
    events: AgendaEvent[];
    onEventClick?: (id: string) => void;
    onCreate?: () => void;
    maxItems?: number;
}

const EVENT_TYPE_LABELS: Record<AgendaEventType, string> = {
    workout: 'Séances',
    meal: 'Repas',
    health: 'Santé',
};

/** Responsive Agenda Section with 3 distinct layouts */
export const AgendaSection = React.memo<AgendaSectionProps>(
    ({ events, onEventClick, onCreate, maxItems = 10 }) => {
        const theme = useTheme();
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
        const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
        const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

        // Mobile drawer state
        const [drawerOpen, setDrawerOpen] = React.useState(false);

        // Desktop filter state
        const [selectedTypes, setSelectedTypes] = React.useState<AgendaEventType[]>([]);

        const { upcomingEvents } = useAgenda({
            events,
            maxItems,
            selectedTypes: isDesktop ? selectedTypes : undefined,
        });

        const handleDrawerOpen = React.useCallback(() => {
            setDrawerOpen(true);
        }, []);

        const handleDrawerClose = React.useCallback(() => {
            setDrawerOpen(false);
        }, []);

        const handleTypeToggle = React.useCallback((type: AgendaEventType) => {
            setSelectedTypes((prev) =>
                prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
            );
        }, []);

        const handleCreate = React.useCallback(() => {
            onCreate?.();
            if (isMobile) {
                setDrawerOpen(false);
            }
        }, [onCreate, isMobile]);

        const hasEvents = upcomingEvents.length > 0;

        // Common header component
        const Header = React.useMemo(
            () => (
                <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={600}>
                            Agenda
                        </Typography>
                        {isMobile && (
                            <IconButton
                                size="small"
                                onClick={handleDrawerClose}
                                aria-label="Fermer l'agenda"
                            >
                                <CloseIcon />
                            </IconButton>
                        )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        Prochains événements
                    </Typography>
                </Stack>
            ),
            [isMobile, handleDrawerClose]
        );

        // Common event list component
        const EventList = React.useMemo(
            () =>
                hasEvents ? (
                    <List disablePadding sx={{ '& > :not(:last-child)': { mb: 1 } }}>
                        {upcomingEvents.map((event, index) => (
                            <React.Fragment key={event.id}>
                                <AgendaItem event={event} onClick={onEventClick} />
                                {index < upcomingEvents.length - 1 && <Divider sx={{ my: 1 }} />}
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Stack alignItems="center" justifyContent="center" py={4}>
                        <Typography variant="body2" color="text.secondary">
                            Aucun événement à venir
                        </Typography>
                    </Stack>
                ),
            [hasEvents, upcomingEvents, onEventClick]
        );

        // MOBILE LAYOUT: FAB + Bottom Drawer
        if (isMobile) {
            return (
                <>
                    <Fab
                        color="primary"
                        aria-label="Ouvrir l'agenda"
                        onClick={handleDrawerOpen}
                        sx={{
                            position: 'fixed',
                            bottom: 16,
                            right: 16,
                            zIndex: 1000,
                        }}
                    >
                        <CalendarIcon />
                    </Fab>

                    <Drawer
                        anchor="bottom"
                        open={drawerOpen}
                        onClose={handleDrawerClose}
                        PaperProps={{
                            sx: {
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                                maxHeight: '80vh',
                                p: 3,
                            },
                        }}
                    >
                        <Stack spacing={3}>
                            {Header}

                            {onCreate && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="medium"
                                    startIcon={<AddIcon />}
                                    onClick={handleCreate}
                                    fullWidth
                                >
                                    Créer un événement
                                </Button>
                            )}

                            <Box sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
                                {EventList}
                            </Box>
                        </Stack>
                    </Drawer>
                </>
            );
        }

        // TABLET LAYOUT: Card below calendar
        if (isTablet) {
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
                        {Header}

                        {onCreate && (
                            <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={handleCreate}
                                sx={{ alignSelf: 'flex-start' }}
                            >
                                Créer
                            </Button>
                        )}

                        {EventList}
                    </Stack>
                </Paper>
            );
        }

        // DESKTOP LAYOUT: Sticky sidebar with filters
        if (isDesktop) {
            return (
                <Paper
                    variant="outlined"
                    sx={{
                        borderRadius: 3,
                        borderColor: 'divider',
                        p: 3,
                        position: 'sticky',
                        top: 96,
                        maxHeight: 'calc(100vh - 120px)',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Stack spacing={3} sx={{ flex: 1, overflow: 'hidden' }}>
                        {Header}

                        {/* Filter chips */}
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {(['workout', 'meal', 'health'] as AgendaEventType[]).map((type) => (
                                <Chip
                                    key={type}
                                    label={EVENT_TYPE_LABELS[type]}
                                    onClick={() => handleTypeToggle(type)}
                                    color={selectedTypes.includes(type) ? 'primary' : 'default'}
                                    variant={selectedTypes.includes(type) ? 'filled' : 'outlined'}
                                    size="small"
                                    sx={{
                                        fontWeight: selectedTypes.includes(type) ? 600 : 400,
                                    }}
                                />
                            ))}
                        </Stack>

                        {onCreate && (
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={handleCreate}
                                fullWidth
                            >
                                Créer
                            </Button>
                        )}

                        <Divider />

                        <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                            {EventList}
                        </Box>
                    </Stack>
                </Paper>
            );
        }

        return null;
    }
);

AgendaSection.displayName = 'AgendaSection';
