import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Chip, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Add, DeleteOutline, Edit, Public } from '@mui/icons-material';

import type { BuilderCopy, ExerciseLibraryItem } from './programBuilderTypes';
import { TextWithTooltip } from '../common/TextWithTooltip';

type ProgramBuilderExerciseLibraryItemProps = {
  exercise: ExerciseLibraryItem;
  onAdd: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  onEdit?: (exerciseId: string) => void;
  onDelete?: (exerciseId: string) => void;
};

export const ProgramBuilderExerciseLibraryItem = React.memo(function ProgramBuilderExerciseLibraryItem({
  exercise,
  onAdd,
  disabled = false,
  onEdit,
  onDelete,
}: ProgramBuilderExerciseLibraryItemProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation();
  const setsLabel = t('programs-coatch.builder.library.sets_label');
  const repsLabel = t('programs-coatch.builder.library.reps_label');
  const restLabel = t('programs-coatch.builder.library.rest_label');
  const tooltips = React.useMemo(
    () =>
      t('programs-coatch.builder.library.tooltips', {
        returnObjects: true,
      }) as BuilderCopy['library']['tooltips'],
    [t],
  );
  const isPublic = exercise.visibility === 'PUBLIC';
  const canEdit = exercise.canEdit !== false;
  const showEditAction = Boolean(onEdit) && canEdit;
  const canDelete = canEdit && Boolean(onDelete);

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

  const handleDeleteClick = React.useCallback(() => {
    if (!onDelete) {
      return;
    }
    onDelete(exercise.id);
  }, [exercise.id, onDelete]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: 'default',
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[1],
        },
      }}
    >
      {/* Exercise summary */}
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="flex-start"
        flexWrap="wrap"
        columnGap={1}
        rowGap={1}
      >
        <Stack spacing={1} flex={1} minWidth={0}>
          <Stack spacing={0.25}>
            <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" columnGap={0.5}>
              {showEditAction ? (
                <Tooltip title={tooltips.edit_exercise} arrow>
                  <span style={{ display: 'inline-flex' }}>
                    <IconButton
                      size="small"
                      onClick={handleEditClick}
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
              <TextWithTooltip
                tooltipTitle={exercise.label}
                variant="subtitle1"
                sx={{ fontWeight: 600, pr: 4 }}
              />
            </Stack>
            {exercise.categoryLabels.length ? (
              <Typography variant="body2" color="text.secondary">
                {exercise.categoryLabels.join(', ')}
              </Typography>
            ) : null}
            {exercise.description ? (
              <TextWithTooltip
                tooltipTitle={exercise.description}
                variant="body2"
                color="text.secondary"
                maxLines={2}
              />
            ) : null}
          </Stack>
          {/* Exercise metrics */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              {exercise.series}{setsLabel}
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
            /* Exercise chips */
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {[
                ...exercise.muscles.map((muscle) => ({
                  key: `muscle-${muscle.id}`,
                  label: muscle.label,
                  color: 'primary' as const,
                  variant: 'filled' as const,
                  tooltip: tooltips.muscle_chip.replace('{{label}}', muscle.label),
                })),
                ...exercise.tags.map((tag) => ({
                  key: `tag-${tag.id}`,
                  label: tag.label,
                  color: 'secondary' as const,
                  variant: 'outlined' as const,
                  tooltip: tooltips.tag_chip.replace('{{label}}', tag.label),
                })),
                ...exercise.equipment.map((eq) => ({
                  key: `equipment-${eq.id}`,
                  label: eq.label,
                  color: undefined,
                  variant: 'outlined' as const,
                  tooltip: tooltips.equipment_chip.replace('{{label}}', eq.label),
                })),
              ]
                .slice(0, 3)
                .map((chip) => (
                  <Tooltip key={chip.key} title={chip.tooltip} arrow>
                    <Chip
                      label={chip.label}
                      size="small"
                      color={chip.color}
                      variant={chip.variant}
                    />
                  </Tooltip>
                ))}
              {exercise.muscles.length +
                exercise.tags.length +
                exercise.equipment.length >
                3 ? (
                <Chip
                  label={`+${exercise.muscles.length +
                    exercise.tags.length +
                    exercise.equipment.length -
                    3
                    }`}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: theme.palette.divider }}
                />
              ) : null}
            </Stack>
          ) : null}
          {isPublic ? (
            /* Public badge */
            <Tooltip title={tooltips.public_exercise} arrow placement="left">
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
          ) : canDelete ? (
            /* Delete action */
            <Tooltip title={tooltips.delete_exercise} arrow placement="left">
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
                <IconButton
                  size="small"
                  onClick={handleDeleteClick}
                  aria-label="delete-exercise-template"
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Box>
            </Tooltip>
          ) : null}
        </Stack>

      </Stack>
      <Box
        sx={{
          position: 'absolute',
          top: (theme) => theme.spacing(1),
          right: (theme) => theme.spacing(1),
        }}
      >
        <Tooltip title={tooltips.add_exercise} arrow placement="left">
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
      </Box>
    </Paper>
  );
});
