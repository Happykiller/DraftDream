import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Divider, IconButton, Stack, Typography } from '@mui/material';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import CircleIcon from '@mui/icons-material/Circle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';

import { usePrograms } from '@hooks/programs/usePrograms';
import { useProgramRecords, ProgramRecordState, type ProgramRecord } from '@hooks/program-records/useProgramRecords';
import { GlassCard } from '../../../common/GlassCard';
import { TextWithTooltip } from '../../../common/TextWithTooltip';
import Tooltip from '@mui/material/Tooltip';

export function AthleteProgramsWidget(): React.JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { create: createRecord, list: listRecords } = useProgramRecords();

    const { items: programs, loading: programsLoading } = usePrograms({
        page: 1,
        limit: 5,
        q: '',
    });

    const [activeRecords, setActiveRecords] = React.useState<Map<string, ProgramRecord>>(new Map());
    const [recordsLoading, setRecordsLoading] = React.useState(true);

    // Fetch active records
    React.useEffect(() => {
        let mounted = true;
        const fetchRecords = async () => {
            const { items: createdItems } = await listRecords({ limit: 50, state: ProgramRecordState.CREATE });
            const { items: draftItems } = await listRecords({ limit: 50, state: ProgramRecordState.DRAFT });

            if (!mounted) return;

            const activeMap = new Map<string, ProgramRecord>();
            [...createdItems, ...draftItems].forEach(record => {
                // Key: programId_sessionId
                const key = `${record.programId}_${record.sessionId}`;
                activeMap.set(key, record);
            });
            setActiveRecords(activeMap);
            setRecordsLoading(false);
        };
        fetchRecords();
        return () => { mounted = false; };
    }, [listRecords]);

    const handlePlayOrResume = React.useCallback(async (e: React.MouseEvent, programId: string, sessionId: string) => {
        e.stopPropagation(); // Prevent card navigation

        const key = `${programId}_${sessionId}`;
        const existingRecord = activeRecords.get(key);

        if (existingRecord) {
            // Resume
            navigate(`/program-record/${existingRecord.id}`);
        } else {
            // Create (Play)
            try {
                const record = await createRecord(programId, sessionId);
                navigate(`/program-record/${record.id}`);
            } catch (err) {
                // Error handled in hook
            }
        }
    }, [createRecord, navigate, activeRecords]);

    const loading = programsLoading || recordsLoading;

    return (
        <GlassCard onClick={() => navigate('/programs-athlete')}>
            <Stack spacing={2}>
                {/* Header */}
                <Stack direction="row" alignItems="center" spacing={2}>
                    <FitnessCenterOutlinedIcon sx={{ color: 'warning.main', fontSize: 40 }} />
                    <Typography variant="h6" fontWeight="bold" color="text.secondary">
                        {t('dashboard.summary.programs')}
                    </Typography>
                </Stack>

                {loading ? (
                    <Box display="flex" justifyContent="center" p={2}>
                        <CircularProgress size={24} color="warning" />
                    </Box>
                ) : programs.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center">
                        -
                    </Typography>
                ) : (
                    <Stack spacing={2} divider={<Divider flexItem sx={{ opacity: 0.5 }} />}>
                        {programs.map((program) => (
                            <Stack key={program.id} spacing={1}>
                                {/* Program Label */}
                                <TextWithTooltip
                                    tooltipTitle={program.label}
                                    maxLines={1}
                                    variant="subtitle1"
                                    fontWeight="bold"
                                />

                                {/* Sessions List */}
                                {program.sessions && program.sessions.length > 0 ? (
                                    <Stack spacing={0.5} pl={2}>
                                        {program.sessions.map((session) => {
                                            const isActive = activeRecords.has(`${program.id}_${session.id}`);
                                            const tooltipText = isActive ? t('common.resume', 'Resume') : t('common.play', 'Start');

                                            return (
                                                <Stack
                                                    key={session.id}
                                                    direction="row"
                                                    alignItems="center"
                                                    spacing={1}
                                                >
                                                    <Tooltip title={tooltipText}>
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={(e) => handlePlayOrResume(e, program.id, session.id)}
                                                            sx={{ p: 0.5 }}
                                                        >
                                                            {isActive ? (
                                                                <PlayCircleIcon fontSize="small" />
                                                            ) : (
                                                                <PlayArrowIcon fontSize="small" />
                                                            )}
                                                        </IconButton>
                                                    </Tooltip>
                                                    <CircleIcon sx={{ fontSize: 6, color: 'text.disabled' }} />
                                                    <TextWithTooltip
                                                        tooltipTitle={session.label}
                                                        maxLines={1}
                                                        variant="body2"
                                                        color="text.secondary"
                                                    />
                                                </Stack>
                                            );
                                        })}
                                    </Stack>
                                ) : (
                                    <Typography variant="caption" color="text.disabled" pl={2}>
                                        {t('common.no_sessions', 'No sessions')}
                                    </Typography>
                                )}
                            </Stack>
                        ))}
                    </Stack>
                )}
            </Stack>
        </GlassCard>
    );
}
