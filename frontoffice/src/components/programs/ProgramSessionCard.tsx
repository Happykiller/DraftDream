import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Divider, Grid, Paper, Stack, Typography } from '@mui/material';

import type { ProgramSession } from '@hooks/programs/usePrograms';

import { ProgramExerciseCard } from './ProgramExerciseCard';

interface ProgramSessionCardProps {
    session: ProgramSession;
    sessionIndex: number;
    formatRestDuration: (restSeconds?: number | null) => string | null;
}

export function ProgramSessionCard({
    session,
    sessionIndex,
    formatRestDuration,
}: ProgramSessionCardProps): React.JSX.Element {
    const { t } = useTranslation();

    const sessionDurationLabel = t('programs-coatch.view.session_duration', { duration: session.durationMin });
    const exercisesCountLabel = t('programs-coatch.view.stats.exercises_value', {
        count: session.exercises.length,
    });

    return (
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
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Chip
                            label={t('programs-coatch.view.sessions.session_label', { index: sessionIndex + 1 })}
                            color="success"
                            variant="filled"
                            sx={{ fontWeight: 700 }}
                        />
                        <Stack spacing={0.5}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {session.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {sessionDurationLabel} • {exercisesCountLabel}
                            </Typography>
                        </Stack>
                    </Stack>
                    {session.description ? (
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: { md: '45%', lg: '40%' } }}>
                            {session.description}
                        </Typography>
                    ) : null}
                </Stack>

                <Divider flexItem />

                {session.exercises.length > 0 ? (
                    <Grid container spacing={{ xs: 2, md: 2.5 }}>
                        {session.exercises.map((exercise, exerciseIndex) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={exercise.id}>
                                <ProgramExerciseCard
                                    exercise={exercise}
                                    exerciseIndex={exerciseIndex}
                                    formatRestDuration={formatRestDuration}
                                />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        {t('programs-coatch.view.session_no_exercises')}
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
}
