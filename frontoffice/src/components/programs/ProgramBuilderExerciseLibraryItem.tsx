import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

import type { ExerciseLibraryItem } from './programBuilderTypes';
import { DragIndicator } from '@mui/icons-material';

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
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
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
