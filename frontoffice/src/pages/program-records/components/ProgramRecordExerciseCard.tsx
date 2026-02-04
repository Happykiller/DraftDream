import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Checkbox,
    Grid,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
    Button,
    alpha,
    Box,
} from '@mui/material';
import { PlayCircleOutline } from '@mui/icons-material';
import type { ProgramRecordExerciseSnapshot, ProgramRecordExerciseSet } from '@hooks/program-records/useProgramRecords';
import { ProgramExerciseBadgeGroup } from '@src/components/programs/ProgramExerciseBadgeGroup';

interface ProgramRecordExerciseCardProps {
    exercise: ProgramRecordExerciseSnapshot;
    exerciseIndex: number;
    sets: ProgramRecordExerciseSet[];
    exerciseNotes: string;
    restLabel: string | null;
    onSeriesFieldChange: (
        exerciseId: string,
        setIndex: number,
        field: 'repetitions' | 'charge',
    ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSeriesRpeChange: (exerciseId: string, setIndex: number) => (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => void;
    onSeriesDoneChange: (exerciseId: string, setIndex: number) => (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => void;
    onExerciseNotesChange: (exerciseId: string) => (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => void;
}

export function ProgramRecordExerciseCard({
    exercise,
    exerciseIndex,
    sets,
    exerciseNotes,
    restLabel,
    onSeriesFieldChange,
    onSeriesRpeChange,
    onSeriesDoneChange,
    onExerciseNotesChange,
}: ProgramRecordExerciseCardProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
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

                {exercise.videoUrl ? (
                    <Box sx={{ mt: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            component="a"
                            href={exercise.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<PlayCircleOutline />}
                            sx={(theme) => ({
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                color: theme.palette.primary.main,
                                borderColor: alpha(theme.palette.primary.main, 0.32),
                                '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                                },
                            })}
                        >
                            {t('programs-coatch.view.exercises.watch_video')}
                        </Button>
                    </Box>
                ) : null}

                {exercise.instructions ? (
                    <Box
                        sx={(theme) => ({
                            borderRadius: 2,
                            p: 1.5,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                        })}
                    >
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                            {t('programs-coatch.view.exercises.instructions')}
                        </Typography>
                        <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                            {exercise.instructions}
                        </Typography>
                    </Box>
                ) : null}

                <Stack spacing={0.75}>
                    {restLabel ? (
                        <Typography variant="body2">
                            {t('programs-coatch.view.exercises.rest')}: {restLabel}
                        </Typography>
                    ) : null}
                </Stack>

                <Stack spacing={1.5}>
                    <ProgramExerciseBadgeGroup
                        title={t('programs-coatch.view.exercises.equipment')}
                        items={exercise.equipments}
                        paletteKey="warning"
                    />
                </Stack>
                {sets.length > 0 ? (
                    <Stack spacing={1.5}>
                        {sets.map((set) => (
                            <Stack spacing={1} key={`${exercise.id}-set-${set.index}`}>
                                <Typography variant="body2" fontWeight={600}>
                                    {t('program_record.form.series_label', { index: set.index })}
                                </Typography>
                                <Grid container spacing={1.5}>
                                    <Grid size={{ xs: 3 }}>
                                        <TextField
                                            label={t('program_record.form.repetitions_label')}
                                            value={set.repetitions ?? ''}
                                            onChange={onSeriesFieldChange(
                                                exercise.id,
                                                set.index,
                                                'repetitions',
                                            )}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 3 }}>
                                        <TextField
                                            label={t('program_record.form.charge_label')}
                                            value={set.charge ?? ''}
                                            onChange={onSeriesFieldChange(
                                                exercise.id,
                                                set.index,
                                                'charge',
                                            )}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 3 }}>
                                        <TextField
                                            label={t('program_record.form.rpe_label')}
                                            value={set.rpe ?? ''}
                                            onChange={onSeriesRpeChange(
                                                exercise.id,
                                                set.index,
                                            )}
                                            type="number"
                                            inputProps={{ min: 1, max: 10, step: 0.5 }}
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 3 }} display="flex" alignItems="center">
                                        <Tooltip title={t('program_record.form.done_label')}>
                                            <Checkbox
                                                checked={Boolean(set.done)}
                                                onChange={onSeriesDoneChange(
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
                    onChange={onExerciseNotesChange(exercise.id)}
                    multiline
                    minRows={2}
                    fullWidth
                />
            </Stack>
        </Paper>
    );
}
