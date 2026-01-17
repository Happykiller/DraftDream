import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Chip, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { Add, DeleteOutline } from '@mui/icons-material';

import type { BuilderCopy, SessionTemplate } from './programBuilderTypes';
import { TextWithTooltip } from '../common/TextWithTooltip';

type ProgramBuilderSessionTemplateItemProps = {
  template: SessionTemplate;
  builderCopy: BuilderCopy;
  onAdd: () => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
};

export const ProgramBuilderSessionLibraryItem = React.memo(function ProgramBuilderSessionLibraryItem({
  template,
  builderCopy,
  onAdd,
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

  const handleDeleteClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onDelete?.();
    },
    [onDelete],
  );

  const canDelete = template.visibility === 'PRIVATE' && Boolean(onDelete);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: 'default',
        transition: 'border-color 150ms ease, background-color 150ms ease',
        width: '100%',
        maxWidth: '100%',
        '&:hover': {
          borderColor: theme.palette.success.main,
          boxShadow: theme.shadows[2],
        },
      }}
    >
      {/* Session template */}
      <Stack spacing={1.25}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="flex-start"
          columnGap={1}
          rowGap={1}
        >
          <Stack spacing={0.5} flexGrow={1} minWidth={0}>
            <TextWithTooltip tooltipTitle={template.label} variant="subtitle1" sx={{ fontWeight: 600 }} />
            {template.description ? (
              <TextWithTooltip
                tooltipTitle={template.description}
                variant="body2"
                color="text.secondary"
                maxLines={2}
              />
            ) : null}
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Chip
              label={`${template.duration} ${builderCopy.structure.duration_unit}`}
              size="small"
              color="success"
              variant="outlined"
            />
            {/* Add template */}
            <Tooltip title={builderCopy.library.tooltips.add_session_template} arrow>
              <span style={{ display: 'inline-flex' }}>
                <IconButton
                  size="small"
                  onClick={handleAddClick}
                  aria-label="add-session-template"
                >
                  <Add fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Session tags */}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ width: '100%' }}>
          {template.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>

        {template.exercises.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            {exercisesLabel}
          </Typography>
        ) : (
          /* Exercise chips */
          <Stack spacing={0.5} sx={{ width: '100%' }}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
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
          </Stack>
        )}
        {canDelete ? (
          <Stack direction="row" justifyContent="flex-end">
            <Tooltip title={builderCopy.library.tooltips.delete_session_template} arrow>
              <span style={{ display: 'inline-flex' }}>
                <IconButton
                  size="small"
                  onClick={handleDeleteClick}
                  aria-label={builderCopy.library.tooltips.delete_session_template}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
});
