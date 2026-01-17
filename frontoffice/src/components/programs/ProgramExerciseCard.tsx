import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { PlayCircleOutline } from '@mui/icons-material';

import type { ProgramSessionExercise } from '@hooks/programs/usePrograms';

import { summarizeExerciseEffort } from './programViewUtils';
import { ProgramExerciseBadgeGroup } from './ProgramExerciseBadgeGroup';

interface ProgramExerciseCardProps {
    exercise: ProgramSessionExercise;
    exerciseIndex: number;
    formatRestDuration: (restSeconds?: number | null) => string | null;
}

export function ProgramExerciseCard({
    exercise,
    exerciseIndex,
    formatRestDuration,
}: ProgramExerciseCardProps): React.JSX.Element {
    const { t } = useTranslation();

    const metrics = React.useMemo(
        () =>
            [
                {
                    key: 'series',
                    label: t('programs-coatch.view.exercises.series'),
                    value: exercise.series,
                },
                {
                    key: 'repetitions',
                    label: t('programs-coatch.view.exercises.repetitions'),
                    value: exercise.repetitions,
                },
                {
                    key: 'rest',
                    label: t('programs-coatch.view.exercises.rest'),
                    value: formatRestDuration(exercise.restSeconds),
                },
                {
                    key: 'charge',
                    label: t('programs-coatch.view.exercises.charge'),
                    value: exercise.charge,
                },
            ].filter((metric) => Boolean(metric.value && String(metric.value).trim().length > 0)),
        [exercise.charge, exercise.repetitions, exercise.restSeconds, exercise.series, formatRestDuration, t],
    );

    const effortSummary = summarizeExerciseEffort(exercise);

    const badgeGroups = React.useMemo(
        () =>
            [
                {
                    key: 'categories',
                    title: t('programs-coatch.view.exercises.categories'),
                    items: exercise.categories,
                    paletteKey: 'primary' as const,
                },
                {
                    key: 'muscles',
                    title: t('programs-coatch.view.exercises.muscles'),
                    items: exercise.muscles,
                    paletteKey: 'success' as const,
                },
                {
                    key: 'equipment',
                    title: t('programs-coatch.view.exercises.equipment'),
                    items: exercise.equipments,
                    paletteKey: 'warning' as const,
                },
                {
                    key: 'tags',
                    title: t('programs-coatch.view.exercises.tags'),
                    items: exercise.tags,
                    paletteKey: 'secondary' as const,
                },
            ].filter((group) => Boolean(group.items && group.items.length > 0)),
        [exercise.categories, exercise.equipments, exercise.muscles, exercise.tags, t],
    );

    return (
        <Paper
            sx={(theme) => ({
                height: '100%',
                borderRadius: 2,
                p: 2.5,
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${theme.palette.background.paper} 45%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                boxShadow: '0 18px 36px rgba(15, 23, 42, 0.08)',
                transition: 'transform 200ms ease, box-shadow 200ms ease',
                display: 'flex',
                '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 24px 48px rgba(15, 23, 42, 0.16)',
                },
            })}
        >
            <Stack spacing={2} sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                    <Box
                        sx={(theme) => ({
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: theme.palette.common.white,
                            backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                            boxShadow: '0 8px 18px rgba(25, 118, 210, 0.28)',
                        })}
                    >
                        {exerciseIndex + 1}
                    </Box>
                    <Stack spacing={0.5} sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {exercise.label}
                        </Typography>
                        {effortSummary ? (
                            <Typography variant="body2" color="text.secondary">
                                {effortSummary}
                            </Typography>
                        ) : null}
                    </Stack>
                </Stack>

                {exercise.description ? (
                    <Typography variant="body2" color="text.primary">
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

                {metrics.length > 0 ? (
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {metrics.map((metric) => (
                            <Chip
                                key={metric.key}
                                size="small"
                                label={`${metric.label}: ${metric.value}`}
                                sx={(theme) => ({
                                    bgcolor: alpha(theme.palette.grey[500], 0.12),
                                    color: theme.palette.text.primary,
                                    fontWeight: 500,
                                })}
                            />
                        ))}
                    </Stack>
                ) : null}

                {badgeGroups.length > 0 ? (
                    <Stack spacing={1.5}>
                        {badgeGroups.map((group) => (
                            <ProgramExerciseBadgeGroup
                                key={group.key}
                                title={group.title}
                                items={group.items}
                                paletteKey={group.paletteKey}
                            />
                        ))}
                    </Stack>
                ) : null}
            </Stack>
        </Paper>
    );
}
