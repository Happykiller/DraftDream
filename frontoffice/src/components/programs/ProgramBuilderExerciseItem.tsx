import * as React from 'react';
import { DeleteOutline } from '@mui/icons-material';
import { Chip, IconButton, Paper, Stack, Typography } from '@mui/material';

import type { ExerciseLibraryItem, ProgramExercise } from './ProgramBuilderPanel';

type ProgramBuilderExerciseItemProps = {
  exerciseItem: ProgramExercise;
  exercise: ExerciseLibraryItem;
  index: number;
  onRemove: (exerciseId: string) => void;
};

export function ProgramBuilderExerciseItem({
  exerciseItem,
  exercise,
  index,
  onRemove,
}: ProgramBuilderExerciseItemProps): React.JSX.Element {
  const handleRemoveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove(exerciseItem.id);
  };

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.75 }}>
      <Stack
        direction="row"
        alignItems="flex-start"
        spacing={1}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1} alignItems="flex-start">
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
