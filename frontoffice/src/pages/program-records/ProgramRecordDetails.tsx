import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Grid,
    Paper,
    Rating,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

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

    const handleSeriesFieldChange = (
        exerciseId: string,
        setIndex: number,
        field: 'repetitions' | 'charge',
    ) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setRecordData((previous) => {
            if (!previous) return previous;
            return {
                exercises: previous.exercises.map((exercise) => {
                    if (exercise.exerciseId !== exerciseId) {
                        return exercise;
                    }

                    return {
                        ...exercise,
                        sets: exercise.sets.map((set) => (
                            set.index === setIndex
                                ? { ...set, [field]: value }
                                : set
                        )),
                    };
                }),
            };
        });
    };

    const handleSeriesDoneChange = (exerciseId: string, setIndex: number) => (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const checked = event.target.checked;
        setRecordData((previous) => {
            if (!previous) return previous;
            return {
                exercises: previous.exercises.map((exercise) => {
                    if (exercise.exerciseId !== exerciseId) {
                        return exercise;
                    }

                    return {
                        ...exercise,
                        sets: exercise.sets.map((set) => (
                            set.index === setIndex
                                ? { ...set, done: checked }
                                : set
                        )),
                    };
                }),
            };
        });
    };

    const handleExerciseNotesChange = (exerciseId: string) => (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = event.target.value;
        setRecordData((previous) => {
            if (!previous) return previous;
            return {
                exercises: previous.exercises.map((exercise) => (
                    exercise.exerciseId === exerciseId
                        ? { ...exercise, notes: value }
                        : exercise
                )),
            };
        });
    };

    const handleDifficultyChange = (_event: React.SyntheticEvent, value: number | null) => {
        setDifficultyRating(value);
    };

    const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDurationMinutes(event.target.value);
    };

    const formatRestDuration = React.useCallback(
        (restSeconds?: number | null) => {
            if (!restSeconds || restSeconds <= 0) {
                return null;
            }

            const minutes = Math.floor(restSeconds / 60);
            const seconds = restSeconds % 60;

            if (minutes > 0 && seconds > 0) {
                return t('programs-coatch.view.exercises.rest_duration.minutes_seconds', { minutes, seconds });
            }

            if (minutes > 0) {
                return t('programs-coatch.view.exercises.rest_duration.minutes', { count: minutes });
            }

            return t('programs-coatch.view.exercises.rest_duration.seconds', { count: seconds });
        },
        [t],
    );

    const sessionSnapshot = record?.sessionSnapshot ?? null;
    const recordDataExercises = recordData?.exercises ?? [];
    const { donePercentage, completedExercisesCount, totalExercisesCount } = React.useMemo(() => {
        const allSets = recordDataExercises.flatMap((exercise) => exercise.sets ?? []);
        const totalSets = allSets.length;
        const doneSets = allSets.filter((set) => set.done).length;
        const percentage = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;
        const completedCount = recordDataExercises.filter(
            (exercise) => exercise.sets.length > 0 && exercise.sets.every((set) => set.done),
        ).length;
        return {
            donePercentage: percentage,
            completedExercisesCount: completedCount,
            totalExercisesCount: recordDataExercises.length,
        };
    }, [recordDataExercises]);
    const durationLabel = (
        <Box component="span">
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                {t('program_record.form.duration_label_short')}
            </Box>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {t('program_record.form.duration_label')}
            </Box>
        </Box>
    );
    const difficultyLabel = (
        <Box component="span">
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                {t('program_record.form.difficulty_label_short')}
            </Box>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {t('program_record.form.difficulty_label')}
            </Box>
        </Box>
    );
    const satisfactionLabel = (
        <Box component="span">
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                {t('program_record.form.satisfaction_label_short')}
            </Box>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {t('program_record.form.satisfaction_label')}
            </Box>
        </Box>
    );

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
        const progressCountLabel = `${completedExercisesCount}/${totalExercisesCount}`;
        const progressLabel = t('program_record.form.completed_exercises_label');
        if (record.state === ProgramRecordState.CREATE || record.state === ProgramRecordState.DRAFT) {
            return (
                <Box sx={{ width: '100%' }}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                        <Stack spacing={0.25}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: { xs: 'block', sm: 'none' } }}
                            >
                                {progressLabel}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {progressCountLabel}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={handleBackToHome}
                                aria-label={t('common.actions.cancel')}
                                sx={{ gap: 1 }}
                            >
                                <Box
                                    component="span"
                                    sx={{ display: { xs: 'inline-flex', lg: 'none', xl: 'inline-flex' } }}
                                >
                                    <CloseRoundedIcon fontSize="small" />
                                </Box>
                                <Box component="span" sx={{ display: { xs: 'none', lg: 'inline', xl: 'inline' } }}>
                                    {t('common.actions.cancel')}
                                </Box>
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => handleUpdateState(ProgramRecordState.DRAFT)}
                                aria-label={t('common.actions.save')}
                                sx={{ gap: 1 }}
                            >
                                <Box
                                    component="span"
                                    sx={{ display: { xs: 'inline-flex', lg: 'none', xl: 'inline-flex' } }}
                                >
                                    <SaveOutlinedIcon fontSize="small" />
                                </Box>
                                <Box component="span" sx={{ display: { xs: 'none', lg: 'inline', xl: 'inline' } }}>
                                    {t('common.actions.save')}
                                </Box>
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleUpdateState(ProgramRecordState.FINISH)}
                                aria-label={t('common.actions.complete')}
                                sx={{ gap: 1 }}
                            >
                                <Box
                                    component="span"
                                    sx={{ display: { xs: 'inline-flex', lg: 'none', xl: 'inline-flex' } }}
                                >
                                    <CheckCircleOutlineIcon fontSize="small" />
                                </Box>
                                <Box component="span" sx={{ display: { xs: 'none', lg: 'inline', xl: 'inline' } }}>
                                    {t('common.actions.complete')}
                                </Box>
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            );
        }

        return (
            <Box sx={{ width: '100%' }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <Stack spacing={0.25}>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: { xs: 'block', sm: 'none' } }}
                        >
                            {progressLabel}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {progressCountLabel}
                        </Typography>
                    </Stack>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleBackToHome}
                        aria-label={t('common.back_to_home')}
                        sx={{ gap: 1 }}
                    >
                        <Box
                            component="span"
                            sx={{ display: { xs: 'inline-flex', lg: 'none', xl: 'inline-flex' } }}
                        >
                            <HomeOutlinedIcon fontSize="small" />
                        </Box>
                        <Box component="span" sx={{ display: { xs: 'none', lg: 'inline', xl: 'inline' } }}>
                            {t('common.back_to_home')}
                        </Box>
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
                        <Grid container spacing={2} alignItems="center" wrap="nowrap">
                            <Grid size={{ xs: 4, md: 4 }}>
                                <TextField
                                    label={durationLabel}
                                    placeholder={t('program_record.form.duration_placeholder')}
                                    value={durationMinutes}
                                    onChange={handleDurationChange}
                                    type="number"
                                    inputProps={{ min: 0 }}
                                    InputLabelProps={{ sx: { whiteSpace: 'nowrap' } }}
                                    size="small"
                                    sx={{ maxWidth: { xs: 140, sm: 180 } }}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 4, md: 4 }}>
                                <Stack spacing={1}>
                                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                        {difficultyLabel}
                                    </Typography>
                                    <Rating
                                        value={difficultyRating}
                                        onChange={handleDifficultyChange}
                                        max={5}
                                        size="large"
                                    />
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 4, md: 4 }}>
                                <Stack spacing={1}>
                                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                        {satisfactionLabel}
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
                    {sessionSnapshot ? (
                        <Stack spacing={2.5}>
                            {sessionSnapshot.exercises.length > 0 ? (
                                <Grid container spacing={{ xs: 2, md: 2.5 }}>
                                    {sessionSnapshot.exercises.map((exercise, exerciseIndex) => {
                                        const restLabel = formatRestDuration(exercise.restSeconds);
                                        const exerciseRecord = recordData?.exercises.find(
                                            (candidate) => candidate.exerciseId === exercise.id
                                        );
                                        const sets = exerciseRecord?.sets ?? [];
                                        const exerciseNotes = exerciseRecord?.notes ?? '';
                                        return (
                                            <Grid size={{ xs: 12, md: 6, xxl: 3 }} key={exercise.id}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={(theme) => ({
                                                        borderRadius: 2,
                                                        p: 2,
                                                        height: '100%',
                                                        borderColor: theme.palette.divider,
                                                    })}
                                                >
                                                    <Stack spacing={1.5}>
                                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                            {exerciseIndex + 1}. {exercise.label}
                                                        </Typography>
                                                        {exercise.description ? (
                                                            <Typography variant="body2" color="text.secondary">
                                                                {exercise.description}
                                                            </Typography>
                                                        ) : null}
                                                        <Stack spacing={0.75}>
                                                            {restLabel ? (
                                                                <Typography variant="body2">
                                                                    {t('programs-coatch.view.exercises.rest')}: {restLabel}
                                                                </Typography>
                                                            ) : null}
                                                        </Stack>
                                                        {sets.length > 0 ? (
                                                            <Stack spacing={1.5}>
                                                                <Typography variant="subtitle2" fontWeight={600}>
                                                                    {t('program_record.form.record_data_title')}
                                                                </Typography>
                                                                {sets.map((set) => (
                                                                    <Stack spacing={1} key={`${exercise.id}-set-${set.index}`}>
                                                                        <Typography variant="body2" fontWeight={600}>
                                                                            {t('program_record.form.series_label', { index: set.index })}
                                                                        </Typography>
                                                                        <Grid container spacing={1.5}>
                                                                            <Grid size={{ xs: 5 }}>
                                                                                <TextField
                                                                                    label={t('program_record.form.repetitions_label')}
                                                                                    value={set.repetitions ?? ''}
                                                                                    onChange={handleSeriesFieldChange(
                                                                                        exercise.id,
                                                                                        set.index,
                                                                                        'repetitions',
                                                                                    )}
                                                                                    fullWidth
                                                                                />
                                                                            </Grid>
                                                                            <Grid size={{ xs: 5 }}>
                                                                                <TextField
                                                                                    label={t('program_record.form.charge_label')}
                                                                                    value={set.charge ?? ''}
                                                                                    onChange={handleSeriesFieldChange(
                                                                                        exercise.id,
                                                                                        set.index,
                                                                                        'charge',
                                                                                    )}
                                                                                    fullWidth
                                                                                />
                                                                            </Grid>
                                                                            <Grid size={{ xs: 2 }} display="flex" alignItems="center">
                                                                                <Tooltip title={t('program_record.form.done_label')}>
                                                                                    <Checkbox
                                                                                        checked={Boolean(set.done)}
                                                                                        onChange={handleSeriesDoneChange(
                                                                                            exercise.id,
                                                                                            set.index,
                                                                                        )}
                                                                                    />
                                                                                </Tooltip>
                                                                            </Grid>
                                                                        </Grid>
                                                                    </Stack>
                                                                ))}
                                                            </Stack>
                                                        ) : null}
                                                        <TextField
                                                            label={t('program_record.form.exercise_notes_label')}
                                                            value={exerciseNotes}
                                                            onChange={handleExerciseNotesChange(exercise.id)}
                                                            multiline
                                                            minRows={2}
                                                            fullWidth
                                                        />
                                                    </Stack>
                                                </Paper>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    {t('programs-coatch.view.session_no_exercises')}
                                </Typography>
                            )}
                        </Stack>
                    ) : (
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
