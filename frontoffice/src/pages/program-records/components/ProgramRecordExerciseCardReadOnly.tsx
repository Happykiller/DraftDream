import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Divider,
    Grid,
    Paper,
    Stack,
    Typography,
} from '@mui/material';

import type { ProgramRecordExerciseSet } from '@hooks/program-records/useProgramRecords';

interface ProgramRecordExerciseCardReadOnlyProps {
    exerciseIndex: number;
    exerciseLabel: string;
    notes: string;
    sets: ProgramRecordExerciseSet[];
}

/**
 * Read-only rendering for program record exercise sets.
 */
export function ProgramRecordExerciseCardReadOnly({
    exerciseIndex,
    exerciseLabel,
    notes,
    sets,
}: ProgramRecordExerciseCardReadOnlyProps): React.JSX.Element {
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
            {/* General information */}
            <Stack spacing={1.5}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {exerciseIndex + 1}. {exerciseLabel}
                </Typography>
                {sets.length > 0 ? (
                    <>
                        <Divider />
                        <Stack spacing={1.5}>
                            {sets.map((set) => (
                                <Stack spacing={1} key={`${exerciseLabel}-set-${set.index}`}>
                                    <Typography variant="body2" fontWeight={600}>
                                        {t('program_record.form.series_label', { index: set.index })}
                                    </Typography>
                                    <Grid container spacing={1.5}>
                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {t('program_record.form.repetitions_label')}
                                            </Typography>
                                            <Typography variant="body2">{set.repetitions ?? '-'}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {t('program_record.form.charge_label')}
                                            </Typography>
                                            <Typography variant="body2">{set.charge ?? '-'}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {t('program_record.form.rpe_label')}
                                            </Typography>
                                            <Typography variant="body2">{set.rpe ?? '-'}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 6, sm: 3 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {t('program_record.form.done_label')}
                                            </Typography>
                                            <Typography variant="body2">
                                                {set.done ? t('common.yes') : t('common.no')}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            ))}
                        </Stack>
                    </>
                ) : null}
                <Divider />
                <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight={600}>
                        {t('program_record.form.exercise_notes_label')}
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {notes.trim() || '-'}
                    </Typography>
                </Stack>
            </Stack>
        </Paper>
    );
}
