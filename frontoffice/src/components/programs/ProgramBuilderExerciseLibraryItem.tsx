import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

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
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
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
            }}
          >
            <DragIndicator fontSize="small" color="disabled" />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {exercise.label}
          </Typography>
          <Chip
            label={`${exercise.sets} x ${exercise.reps}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {exercise.level} - {exercise.rest}
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {exercise.tags.map((tag) => (
            <Chip key={`${exercise.id}-${tag}`} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
});
