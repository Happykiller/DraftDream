import * as React from 'react';
import { DeleteOutline, DragIndicator } from '@mui/icons-material';
import { Chip, IconButton, Paper, Stack, Typography, useTheme } from '@mui/material';

import type { ExerciseLibraryItem, ProgramExercise } from './ProgramBuilderPanel';

type ProgramBuilderExerciseItemProps = {
  exerciseItem: ProgramExercise;
  exercise: ExerciseLibraryItem;
  index: number;
  onRemove: (exerciseId: string) => void;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
};

export function ProgramBuilderExerciseItem({
  exerciseItem,
  exercise,
  index,
  onRemove,
  onDragStart,
  onDragEnd,
}: ProgramBuilderExerciseItemProps): React.JSX.Element {
  const theme = useTheme();
  
  const handleRemoveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove(exerciseItem.id);
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onDragStart?.(event);
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onDragEnd?.();
  };

  return (
    <Paper
      variant="outlined"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: 'grab',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[1],
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        spacing={1}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <DragIndicator fontSize="small" color="disabled" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, minWidth: 24 }}>
            {index + 1}.
          </Typography>

          <Stack spacing={0.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {exercise.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {exerciseItem.sets} x {exerciseItem.reps} - {exerciseItem.rest}
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {exercise.tags.map((tag) => (
                <Chip
                  key={`${exercise.id}-${tag}`}
                  label={tag}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Stack>
        </Stack>

        <IconButton
          size="small"
          onClick={handleRemoveClick}
          aria-label="delete-exercise"
        >
          <DeleteOutline fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
}
