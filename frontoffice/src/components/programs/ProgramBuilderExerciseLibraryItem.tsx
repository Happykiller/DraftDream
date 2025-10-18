import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Add } from '@mui/icons-material';

import type { ExerciseLibraryItem } from './programBuilderTypes';
import { logWithTimestamp } from './programBuilderUtils';

type ProgramBuilderExerciseLibraryItemProps = {
  exercise: ExerciseLibraryItem;
  onAdd: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
};

export const ProgramBuilderExerciseLibraryItem = React.memo(function ProgramBuilderExerciseLibraryItem({
  exercise,
  onAdd,
  disabled = false,
}: ProgramBuilderExerciseLibraryItemProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation();
  const setsLabel = t('programs-coatch.builder.library.sets_label', { defaultValue: 'sets' });
  const repsLabel = t('programs-coatch.builder.library.reps_label', { defaultValue: 'reps' });
  const restLabel = t('programs-coatch.builder.library.rest_label', { defaultValue: 'rest' });

  const handleAddClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      logWithTimestamp('log', '[ProgramBuilder][ExerciseLibraryItem] add exercise clicked', {
        exerciseId: exercise.id,
        label: exercise.label,
      });
      onAdd(event);
    },
    [exercise.id, exercise.label, onAdd],
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
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              {exercise.sets}{setsLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {exercise.reps}{repsLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {restLabel}{exercise.rest}
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
        <IconButton
          size="small"
          onClick={handleAddClick}
          disabled={disabled}
          aria-label="add-exercise-to-session"
        >
          <Add fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
});
