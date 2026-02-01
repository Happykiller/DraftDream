import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Edit } from '@mui/icons-material';

import { LibraryCard } from '../common/LibraryCard';
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
    (event?: React.MouseEvent<HTMLButtonElement>) => {
      if (event) {
        onAdd(event);
      }
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
    <LibraryCard
      hoverColor="success"
      onAdd={handleAddClick}
      addTooltip={tooltips.add_exercise}
      addDisabled={disabled}
      addAriaLabel="add-exercise-to-session"
      isPublic={isPublic}
      publicTooltip={tooltips.public_exercise}
      deleteTooltip={tooltips.delete_exercise}
      onDelete={canDelete ? handleDeleteClick : undefined}
    >
      {/* Title with edit icon */}
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
            variant="subtitle2"
            sx={{ fontWeight: 600 }}
          />
        </Stack>

        {/* Categories */}
        {exercise.categoryLabels.length ? (
          <Typography variant="caption" color="text.secondary">
            {exercise.categoryLabels.join(', ')}
          </Typography>
        ) : null}

        {/* Description */}
        {exercise.description ? (
          <TextWithTooltip
            tooltipTitle={exercise.description}
            variant="caption"
            color="text.secondary"
          />
        ) : null}
      </Stack>

      {/* Exercise metrics */}
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Typography variant="caption" color="text.secondary">
          {exercise.series}{setsLabel}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {exercise.reps}{repsLabel}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {restLabel}{exercise.rest}
        </Typography>
      </Stack>

      {/* Exercise chips */}
      {exercise.muscles.length > 0 ||
        exercise.tags.length > 0 ||
        exercise.equipment.length > 0 ? (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ rowGap: 0.5 }}>
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
    </LibraryCard>
  );
});
