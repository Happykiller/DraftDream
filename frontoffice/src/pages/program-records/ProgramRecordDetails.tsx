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
        if (record.state === ProgramRecordState.CREATE || record.state === ProgramRecordState.DRAFT) {
            return (
                <Stack direction="row" spacing={2}>
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
                        {t('common.actions.finish', 'Finish')}
                    </Button>
                </Stack>
            );
        }

        return (
            <Button
                variant="contained"
                color="primary"
                onClick={handleBackToHome}
            >
                {t('common.back_to_home', 'Back to Home')}
            </Button>
        );
    };

    return (
        <FixedPageLayout
            title={sessionLabel}
            subtitle={programLabel}
            icon={<PlayCircleOutlineIcon fontSize="medium" />}
            footer={renderFooter()}
        >
            {/* General information */}
            <Box sx={{ p: 3 }}>
                <Stack spacing={3}>
                    {sessionSnapshot ? (
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
                            <Stack spacing={2.5}>
                                {sessionSnapshot.exercises.length > 0 ? (
                                    <Grid container spacing={{ xs: 2, md: 2.5 }}>
                                        {sessionSnapshot.exercises.map((exercise, exerciseIndex) => {
                                            const restLabel = formatRestDuration(exercise.restSeconds);
                                            return (
                                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={exercise.id}>
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
                                                            <Stack spacing={0.25}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {t('programs-coatch.view.exercises.exercise_label', {
                                                                        index: exerciseIndex + 1,
                                                                    })}
                                                                </Typography>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                                    {exercise.label}
                                                                </Typography>
                                                            </Stack>
                                                            {exercise.description ? (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {exercise.description}
                                                                </Typography>
                                                            ) : null}
                                                            <Stack spacing={0.75}>
                                                                {exercise.series ? (
                                                                    <Typography variant="body2">
                                                                        {t('programs-coatch.view.exercises.series')}: {exercise.series}
                                                                    </Typography>
                                                                ) : null}
                                                                {exercise.repetitions ? (
                                                                    <Typography variant="body2">
                                                                        {t('programs-coatch.view.exercises.repetitions')}: {exercise.repetitions}
                                                                    </Typography>
                                                                ) : null}
                                                                {exercise.charge ? (
                                                                    <Typography variant="body2">
                                                                        {t('programs-coatch.view.exercises.charge')}: {exercise.charge}
                                                                    </Typography>
                                                                ) : null}
                                                                {restLabel ? (
                                                                    <Typography variant="body2">
                                                                        {t('programs-coatch.view.exercises.rest')}: {restLabel}
                                                                    </Typography>
                                                                ) : null}
                                                            </Stack>
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
                        </Paper>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            {t('programs-coatch.list.no_sessions')}
                        </Typography>
                    )}
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
                    <TextField
                        label={t('program_record.form.comment_label')}
                        placeholder={t('program_record.form.comment_placeholder')}
                        value={comment}
                        onChange={handleCommentChange}
                        multiline
                        minRows={4}
                        fullWidth
                    />
                </Stack>
            </Box>
        </FixedPageLayout>
    );
}
