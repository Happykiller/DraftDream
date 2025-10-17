import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { ExerciseLibraryItem } from './programBuilderTypes';
import { DragIndicator } from '@mui/icons-material';
import { logWithTimestamp } from './programBuilderUtils';

type ProgramBuilderExerciseLibraryItemProps = {
  exercise: ExerciseLibraryItem;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
};

export const ProgramBuilderExerciseLibraryItem = React.memo(function ProgramBuilderExerciseLibraryItem({
  exercise,
  onDragStart,
  onDragEnd,
}: ProgramBuilderExerciseLibraryItemProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation();
  const setsLabel = t('programs-coatch.builder.library.sets_label', { defaultValue: 'sets' });
  const repsLabel = t('programs-coatch.builder.library.reps_label', { defaultValue: 'reps' });
  const restLabel = t('programs-coatch.builder.library.rest_label', { defaultValue: 'rest' });

  const handleDragStart = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      logWithTimestamp('log', '[ProgramBuilder][ExerciseLibraryItem] drag start', {
        exerciseId: exercise.id,
        label: exercise.label,
      });
      onDragStart(event);
    },
    [exercise.id, exercise.label, onDragStart],
  );

  const handleDragEnd = React.useCallback(() => {
    logWithTimestamp('log', '[ProgramBuilder][ExerciseLibraryItem] drag end', {
      exerciseId: exercise.id,
      label: exercise.label,
    });
    onDragEnd?.();
  }, [exercise.id, exercise.label, onDragEnd]);

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      logWithTimestamp('log', '[ProgramBuilder][ExerciseLibraryItem] mouse down on drag handle', {
        exerciseId: exercise.id,
        button: event.button,
      });
    },
    [exercise.id],
  );

  const handleMouseUp = React.useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      logWithTimestamp('log', '[ProgramBuilder][ExerciseLibraryItem] mouse up on drag handle', {
        exerciseId: exercise.id,
        button: event.button,
      });
    },
    [exercise.id],
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: 'default',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[1],
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          component="span"
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          sx={{
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            pt: 0.25,
          }}
        >
          <DragIndicator fontSize="small" color="disabled" />
        </Box>
        <Stack spacing={1} flex={1}>
          <Stack spacing={0.25}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {exercise.label}
            </Typography>
            {exercise.categoryLabel ? (
              <Typography variant="body2" color="text.secondary">
                {exercise.categoryLabel}
              </Typography>
            ) : null}
          </Stack>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              {exercise.sets} {setsLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {exercise.reps} {repsLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {restLabel}: {exercise.rest}
            </Typography>
          </Stack>
          {exercise.muscles.length > 0 ? (
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {exercise.muscles.map((muscle) => (
                <Chip
                  key={`${exercise.id}-muscle-${muscle.id}`}
                  label={muscle.label}
                  size="small"
                  color={muscle.role === 'primary' ? 'primary' : 'default'}
                  variant={muscle.role === 'primary' ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          ) : null}
          {exercise.tags.length > 0 ? (
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {exercise.tags.map((tag) => (
                <Chip
                  key={`${exercise.id}-tag-${tag.id}`}
                  label={tag.label}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Stack>
          ) : null}
          {exercise.equipment.length > 0 ? (
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {exercise.equipment.map((eq) => (
                <Chip
                  key={`${exercise.id}-equipment-${eq.id}`}
                  label={eq.label}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          ) : null}
        </Stack>
      </Stack>
    </Paper>
  );
});
