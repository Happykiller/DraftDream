import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    CircularProgress,
    Grid,
    Paper,
    Rating,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

import {
    useProgramRecords,
    type ProgramRecord,
    type ProgramRecordData,
    ProgramRecordState
} from '@hooks/program-records/useProgramRecords';
import { useProgram } from '@hooks/programs/useProgram';
import { FixedPageLayout } from '@src/components/common/FixedPageLayout';

export function ProgramRecordDetails(): React.JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { recordId } = useParams<{ recordId: string }>();

    const { get: getRecord, updateState } = useProgramRecords();
    const [record, setRecord] = React.useState<ProgramRecord | null>(null);
    const [recordLoading, setRecordLoading] = React.useState(true);
    const [comment, setComment] = React.useState('');
    const [satisfactionRating, setSatisfactionRating] = React.useState<number | null>(null);
    const [durationMinutes, setDurationMinutes] = React.useState('');
    const [difficultyRating, setDifficultyRating] = React.useState<number | null>(null);
    const [recordData, setRecordData] = React.useState<ProgramRecordData | null>(null);

    const fetchRecord = React.useCallback(() => {
        if (!recordId) return;
        setRecordLoading(true);
        getRecord(recordId)
            .then(setRecord)
            .finally(() => setRecordLoading(false));
    }, [recordId, getRecord]);

    // Fetch Record on mount
    React.useEffect(() => {
        fetchRecord();
    }, [fetchRecord]);

    React.useEffect(() => {
        setComment(record?.comment ?? '');
        setSatisfactionRating(record?.satisfactionRating ?? null);
        setDurationMinutes(record?.durationMinutes ? String(record.durationMinutes) : '');
        setDifficultyRating(record?.difficultyRating ?? null);
    }, [record]);

    // Fetch Program once we have the record
    const { program, loading: programLoading } = useProgram({
        programId: record?.programId ?? null
    });

    const loading = recordLoading || programLoading;

    // Derive Labels
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

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleUpdateState = async (newState: ProgramRecordState) => {
        if (!record) return;
        try {
            await updateState(record.id, newState, {
                comment: comment.trim() || undefined,
                satisfactionRating: satisfactionRating ?? undefined,
                durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
                difficultyRating: difficultyRating ?? undefined,
                recordData: recordData ?? undefined,
            });
            navigate('/');
        } catch (error) {
            console.error('Failed to update state', error);
        }
    };

    const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setComment(event.target.value);
    };

    const handleRatingChange = (_event: React.SyntheticEvent, value: number | null) => {
        setSatisfactionRating(value);
    };

    const handleDifficultyChange = (_event: React.SyntheticEvent, value: number | null) => {
        setDifficultyRating(value);
    };

    const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDurationMinutes(event.target.value);
    };

    const sessionSnapshot = record?.sessionSnapshot ?? null;
    const recordDataExercises = recordData?.exercises ?? [];
    const { donePercentage, completedExercisesCount } = React.useMemo(() => {
        const allSets = recordDataExercises.flatMap((exercise) => exercise.sets ?? []);
        const totalSets = allSets.length;
        const doneSets = allSets.filter((set) => set.done).length;
        const percentage = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;
        const completedCount = recordDataExercises.filter(
            (exercise) => exercise.sets.length > 0 && exercise.sets.every((set) => set.done),
        ).length;
        return { donePercentage: percentage, completedExercisesCount: completedCount };
    }, [recordDataExercises]);

    const getSeriesCount = React.useCallback((series?: string | null): number => {
        if (!series) {
            return 0;
        }

        const match = series.match(/\d+/);
        return match ? Number(match[0]) : 0;
    }, []);

    const buildRecordData = React.useCallback(
        (snapshot: ProgramRecord['sessionSnapshot'], existingRecordData?: ProgramRecordData | null): ProgramRecordData => ({
            exercises: (snapshot?.exercises ?? []).map((exercise) => {
                const existingExercise = existingRecordData?.exercises.find(
                    (candidate) => candidate.exerciseId === exercise.id
                );
                const seriesCount = getSeriesCount(exercise.series);
                const fallbackCount = existingExercise?.sets.length ?? 0;
                const setsCount = seriesCount > 0 ? seriesCount : fallbackCount;
                const sets = Array.from({ length: setsCount }, (_value, index) => {
                    const setIndex = index + 1;
                    const existingSet = existingExercise?.sets.find((candidate) => candidate.index === setIndex);
                    return {
                        index: setIndex,
                        repetitions: existingSet?.repetitions ?? exercise.repetitions ?? '',
                        charge: existingSet?.charge ?? exercise.charge ?? '',
                        done: existingSet?.done ?? false,
                    };
                });

                return {
                    exerciseId: exercise.id,
                    notes: existingExercise?.notes ?? '',
                    sets,
                };
            }),
        }),
        [getSeriesCount],
    );

    React.useEffect(() => {
        if (!sessionSnapshot) {
            setRecordData(null);
            return;
        }
        setRecordData(buildRecordData(sessionSnapshot, record?.recordData ?? null));
    }, [buildRecordData, record?.recordData, sessionSnapshot]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // If loading finished but no record found
    if (!record) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography>{t('common.not_found', 'Record not found')}</Typography>
            </Box>
        );
    }

    const renderFooter = () => {
        const progressLabel = t('program_record.form.completed_exercises', {
            count: completedExercisesCount,
        });
        if (record.state === ProgramRecordState.CREATE || record.state === ProgramRecordState.DRAFT) {
            return (
                <Box sx={{ width: '100%' }}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                            {progressLabel}
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={handleBackToHome}
                            >
                                {t('common.actions.cancel', 'Cancel')}
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => handleUpdateState(ProgramRecordState.DRAFT)}
                            >
                                {t('common.actions.save', 'Save')}
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleUpdateState(ProgramRecordState.FINISH)}
                            >
                                {t('common.actions.complete', 'Complete')}
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            );
        }

        return (
            <Box sx={{ width: '100%' }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                        {progressLabel}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleBackToHome}
                    >
                        {t('common.back_to_home', 'Back to Home')}
                    </Button>
                </Stack>
            </Box>
        );
    };

    return (
        <FixedPageLayout
            title={sessionLabel}
            subtitle={programLabel}
            icon={<PlayCircleOutlineIcon fontSize="medium" />}
            headerRight={(
                <Typography variant="subtitle1" fontWeight={700}>
                    {donePercentage}%
                </Typography>
            )}
            footer={renderFooter()}
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
                        <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    label={t('program_record.form.duration_label')}
                                    value={durationMinutes}
                                    onChange={handleDurationChange}
                                    type="number"
                                    inputProps={{ min: 0 }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Stack spacing={1}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {t('program_record.form.difficulty_label')}
                                    </Typography>
                                    <Rating
                                        value={difficultyRating}
                                        onChange={handleDifficultyChange}
                                        max={5}
                                        size="large"
                                    />
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Stack spacing={1}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {t('program_record.form.satisfaction_label')}
                                    </Typography>
                                    <Rating
                                        value={satisfactionRating}
                                        onChange={handleRatingChange}
                                        max={5}
                                        size="large"
                                    />
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>
                    {sessionSnapshot ? null : (
                        <Typography variant="body2" color="text.secondary">
                            {t('programs-coatch.list.no_sessions')}
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
                        <TextField
                            label={t('program_record.form.comment_label')}
                            placeholder={t('program_record.form.comment_placeholder')}
                            value={comment}
                            onChange={handleCommentChange}
                            multiline
                            minRows={4}
                            fullWidth
                        />
                    </Paper>
                </Stack>
            </Box>
        </FixedPageLayout>
    );
}
