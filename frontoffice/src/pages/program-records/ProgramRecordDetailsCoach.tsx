import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    CircularProgress,
    Grid,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

import { FixedPageLayout } from '@components/common/FixedPageLayout';
import { ResponsiveButton } from '@components/common/ResponsiveButton';
import { useProgram } from '@hooks/programs/useProgram';
import { useProgramRecords, type ProgramRecord } from '@hooks/program-records/useProgramRecords';
import { ProgramRecordExerciseCardReadOnly } from './components/ProgramRecordExerciseCardReadOnly';

/**
 * Read-only program record detail view for coaches and admins.
 */
export function ProgramRecordDetailsCoach(): React.JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { recordId } = useParams<{ recordId: string }>();

    const { get: getRecord } = useProgramRecords();
    const [record, setRecord] = React.useState<ProgramRecord | null>(null);
    const [recordLoading, setRecordLoading] = React.useState(true);

    const fetchRecord = React.useCallback(() => {
        if (!recordId) return;
        setRecordLoading(true);
        getRecord(recordId)
            .then(setRecord)
            .finally(() => setRecordLoading(false));
    }, [recordId, getRecord]);

    React.useEffect(() => {
        fetchRecord();
    }, [fetchRecord]);

    const { program, loading: programLoading } = useProgram({
        programId: record?.programId ?? null,
    });

    const loading = recordLoading || programLoading;
    const programLabel = program?.label ?? '-';
    const sessionLabel = React.useMemo(() => {
        if (!record) return '';
        if (record.sessionSnapshot?.label) {
            return record.sessionSnapshot.label;
        }
        if (!program) return '';
        const foundSession = program.sessions.find(s => s.id === record.sessionId);
        return foundSession?.label ?? record.sessionId;
    }, [program, record]);

    const handleBackToHome = React.useCallback(() => {
        navigate('/');
    }, [navigate]);

    const sessionSnapshot = record?.sessionSnapshot ?? null;
    const recordExercises = record?.recordData?.exercises ?? [];

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!record) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography>{t('common.not_found', 'Record not found')}</Typography>
            </Box>
        );
    }

    return (
        <FixedPageLayout
            title={sessionLabel}
            subtitle={programLabel}
            icon={<PlayCircleOutlineIcon fontSize="medium" />}
            footer={(
                <Box sx={{ width: '100%' }}>
                    <Stack direction="row" justifyContent="flex-end">
                        <ResponsiveButton
                            variant="contained"
                            color="primary"
                            onClick={handleBackToHome}
                            aria-label={t('common.back_to_home')}
                        >
                            {t('common.back_to_home')}
                        </ResponsiveButton>
                    </Stack>
                </Box>
            )}
        >
            {/* General information */}
            <Box sx={{ p: 3 }}>
                <Stack spacing={3}>
                    <Paper
                        variant="outlined"
                        sx={(theme) => ({
                            borderRadius: 2.5,
                            p: { xs: 2.5, md: 3 },
                            bgcolor: theme.palette.background.paper,
                            borderColor: theme.palette.divider,
                            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.06)',
                        })}
                    >
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    {t('program_record.form.duration_label')}
                                </Typography>
                                <Typography variant="body2">
                                    {record.durationMinutes ?? '-'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 4 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    {t('program_record.form.difficulty_label')}
                                </Typography>
                                <Typography variant="body2">
                                    {record.difficultyRating ?? '-'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 4 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    {t('program_record.form.satisfaction_label')}
                                </Typography>
                                <Typography variant="body2">
                                    {record.satisfactionRating ?? '-'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>

                    {sessionSnapshot?.description ? (
                        <Paper
                            variant="outlined"
                            sx={(theme) => ({
                                borderRadius: 2.5,
                                p: { xs: 2.5, md: 3 },
                                bgcolor: theme.palette.background.paper,
                                borderColor: theme.palette.divider,
                                boxShadow: '0 20px 40px rgba(15, 23, 42, 0.06)',
                            })}
                        >
                            <Stack spacing={1}>
                                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {t('programs-coatch.view.session_description', 'Description')}
                                </Typography>
                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {sessionSnapshot.description}
                                </Typography>
                            </Stack>
                        </Paper>
                    ) : null}

                    {recordExercises.length > 0 ? (
                        <Grid container spacing={{ xs: 2, md: 2.5 }}>
                            {recordExercises.map((exercise, exerciseIndex) => {
                                const exerciseLabel = sessionSnapshot?.exercises.find(
                                    (candidate) => candidate.id === exercise.exerciseId,
                                )?.label ?? exercise.exerciseId;
                                return (
                                    <Grid size={{ xs: 12, md: 6, xl: 3, xxl: 3 }} key={exercise.exerciseId}>
                                        <ProgramRecordExerciseCardReadOnly
                                            exerciseIndex={exerciseIndex}
                                            exerciseLabel={exerciseLabel}
                                            notes={exercise.notes ?? ''}
                                            sets={exercise.sets}
                                        />
                                    </Grid>
                                );
                            })}
                        </Grid>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            {t('program_record.form.record_data_title')}
                        </Typography>
                    )}

                    <Paper
                        variant="outlined"
                        sx={(theme) => ({
                            borderRadius: 2.5,
                            p: { xs: 2.5, md: 3 },
                            bgcolor: theme.palette.background.paper,
                            borderColor: theme.palette.divider,
                            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.06)',
                        })}
                    >
                        <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            {t('program_record.form.comment_label')}
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>
                            {record.comment?.trim() || '-'}
                        </Typography>
                    </Paper>
                </Stack>
            </Box>
        </FixedPageLayout>
    );
}
