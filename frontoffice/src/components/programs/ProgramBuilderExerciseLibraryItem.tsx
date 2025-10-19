import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Chip, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Add, Edit, Public } from '@mui/icons-material';

import type { BuilderCopy, ExerciseLibraryItem } from './programBuilderTypes';

type ProgramBuilderExerciseLibraryItemProps = {
  exercise: ExerciseLibraryItem;
  onAdd: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  onEdit?: (exerciseId: string) => void;
};

export const ProgramBuilderExerciseLibraryItem = React.memo(function ProgramBuilderExerciseLibraryItem({
  exercise,
  onAdd,
  disabled = false,
  onEdit,
}: ProgramBuilderExerciseLibraryItemProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation();
  const setsLabel = t('programs-coatch.builder.library.sets_label', { defaultValue: 'sets' });
  const repsLabel = t('programs-coatch.builder.library.reps_label', { defaultValue: 'reps' });
  const restLabel = t('programs-coatch.builder.library.rest_label', { defaultValue: 'rest' });
  const tooltips = React.useMemo(
    () =>
      t('programs-coatch.builder.library.tooltips', {
        returnObjects: true,
      }) as BuilderCopy['library']['tooltips'],
    [t],
  );
  const isPublic = exercise.visibility === 'PUBLIC';
  const canEdit = exercise.canEdit === true;

  const handleAddClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onAdd(event);
    },
    [onAdd],
  );

  const handleEditClick = React.useCallback(() => {
    if (!onEdit) {
      return;
    }
    onEdit(exercise.id);
  }, [exercise.id, onEdit]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: 'default',
        position: 'relative',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[1],
        },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Stack spacing={1} flex={1}>
          <Stack spacing={0.25}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              {canEdit ? (
                <Tooltip title={tooltips.edit_exercise} arrow>
                  <span style={{ display: 'inline-flex' }}>
                    <IconButton
                      size="small"
                      onClick={handleEditClick}
                      disabled={!onEdit}
                      aria-label="edit-exercise-template"
                      sx={{
                        p: 0.25,
                        borderRadius: 1,
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : null}
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {exercise.label}
              </Typography>
            </Stack>
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
          {exercise.muscles.length > 0 ||
          exercise.tags.length > 0 ||
          exercise.equipment.length > 0 ? (
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {exercise.muscles.map((muscle) => (
                <Tooltip
                  key={`${exercise.id}-muscle-${muscle.id}`}
                  title={
                    muscle.role === 'primary'
                      ? tooltips.primary_muscle_chip.replace('{{label}}', muscle.label)
                      : tooltips.secondary_muscle_chip.replace('{{label}}', muscle.label)
                  }
                  arrow
                >
                  <Chip
                    label={muscle.label}
                    size="small"
                    color={muscle.role === 'primary' ? 'primary' : 'default'}
                    variant={muscle.role === 'primary' ? 'filled' : 'outlined'}
                  />
                </Tooltip>
              ))}
              {exercise.tags.map((tag) => (
                <Tooltip
                  key={`${exercise.id}-tag-${tag.id}`}
                  title={tooltips.tag_chip.replace('{{label}}', tag.label)}
                  arrow
                >
                  <Chip label={tag.label} size="small" color="secondary" variant="outlined" />
                </Tooltip>
              ))}
              {exercise.equipment.map((eq) => (
                <Tooltip
                  key={`${exercise.id}-equipment-${eq.id}`}
                  title={tooltips.equipment_chip.replace('{{label}}', eq.label)}
                  arrow
                >
                  <Chip label={eq.label} size="small" variant="outlined" />
                </Tooltip>
              ))}
            </Stack>
          ) : null}
          {isPublic ? (
            <Tooltip title={tooltips.public_exercise} arrow>
              <Box
                sx={{
                  position: 'absolute',
                  right: theme.spacing(1),
                  bottom: theme.spacing(1),
                  display: 'flex',
                  alignItems: 'center',
                  color: theme.palette.text.disabled,
                }}
              >
                <Public fontSize="small" aria-hidden />
              </Box>
            </Tooltip>
          ) : null}
        </Stack>
        <Stack spacing={0.5} alignItems="flex-end">
          <Tooltip title={tooltips.add_exercise} arrow>
            <span style={{ display: 'inline-flex' }}>
              <IconButton
                size="small"
                onClick={handleAddClick}
                disabled={disabled}
                aria-label="add-exercise-to-session"
              >
                <Add fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
});
