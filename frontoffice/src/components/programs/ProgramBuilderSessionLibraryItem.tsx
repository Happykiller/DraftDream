import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Edit } from '@mui/icons-material';

import { LibraryCard } from '../common/LibraryCard';
import type { BuilderCopy, SessionTemplate } from './programBuilderTypes';
import { TextWithTooltip } from '../common/TextWithTooltip';

type ProgramBuilderSessionTemplateItemProps = {
  template: SessionTemplate;
  builderCopy: BuilderCopy;
  onAdd: () => void | Promise<void>;
  onEdit?: () => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
};

export const ProgramBuilderSessionLibraryItem = React.memo(function ProgramBuilderSessionLibraryItem({
  template,
  builderCopy,
  onAdd,
  onEdit,
  onDelete,
}: ProgramBuilderSessionTemplateItemProps): React.JSX.Element {
  const theme = useTheme();

  const exercisesLabel = React.useMemo(() => {
    const count = template.exercises.length;
    const raw =
      count === 1
        ? builderCopy.structure.exercise_counter_one
        : builderCopy.structure.exercise_counter_other;
    return raw.replace('{{count}}', String(count));
  }, [
    builderCopy.structure.exercise_counter_one,
    builderCopy.structure.exercise_counter_other,
    template.exercises.length,
  ]);

  const visibleExercises = React.useMemo(
    () => template.exercises.slice(0, 3),
    [template.exercises],
  );

  const handleAddClick = React.useCallback(() => {
    onAdd();
  }, [onAdd]);

  const handleDeleteClick = React.useCallback(() => {
    onDelete?.();
  }, [onDelete]);

  const handleEditClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onEdit?.();
    },
    [onEdit],
  );

  const isPrivateTemplate = template.visibility === 'PRIVATE';
  const canEdit = isPrivateTemplate && Boolean(onEdit);
  const canDelete = isPrivateTemplate && Boolean(onDelete);

  return (
    <LibraryCard
      hoverColor="success"
      onAdd={handleAddClick}
      addTooltip={builderCopy.library.tooltips.add_session_template}
      addAriaLabel="add-session-template"
      isPublic={!isPrivateTemplate}
      deleteTooltip={builderCopy.library.tooltips.delete_session_template}
      onDelete={canDelete ? handleDeleteClick : undefined}
    >
      {/* Title with edit icon */}
      <Stack direction="row" spacing={0.5} alignItems="center">
        {canEdit ? (
          <Tooltip title={builderCopy.library.tooltips.edit_session_template} arrow>
            <span style={{ display: 'inline-flex' }}>
              <IconButton
                size="small"
                onClick={handleEditClick}
                aria-label={builderCopy.library.tooltips.edit_session_template}
                sx={{ p: 0.25 }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        ) : null}
        <TextWithTooltip tooltipTitle={template.label} variant="subtitle2" sx={{ fontWeight: 600 }} />
      </Stack>

      {/* Description */}
      {template.description ? (
        <TextWithTooltip
          tooltipTitle={template.description}
          variant="caption"
          color="text.secondary"
        />
      ) : null}

      {/* Duration chip */}
      <Stack direction="row" spacing={0.5} flexWrap="wrap">
        <Chip
          label={`${template.duration} ${builderCopy.structure.duration_unit}`}
          size="small"
          color="success"
          variant="outlined"
        />
      </Stack>

      {/* Session tags */}
      {template.tags.length > 0 ? (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ rowGap: 0.5 }}>
          {template.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>
      ) : null}

      {/* Exercise chips */}
      {template.exercises.length > 0 ? (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ rowGap: 0.5 }}>
          {visibleExercises.map((exercise) => (
            <Chip
              key={`${template.id}-${exercise.exerciseId}`}
              label={exercise.label}
              size="small"
              variant="outlined"
            />
          ))}
          {template.exercises.length > 3 ? (
            <Chip
              label={`+${template.exercises.length - 3}`}
              size="small"
              variant="outlined"
              sx={{ borderColor: theme.palette.divider }}
            />
          ) : null}
        </Stack>
      ) : (
        <Typography variant="caption" color="text.secondary">
          {exercisesLabel}
        </Typography>
      )}
    </LibraryCard>
  );
});
