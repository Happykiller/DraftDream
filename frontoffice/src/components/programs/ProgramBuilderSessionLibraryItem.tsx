import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Chip, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';

import type { BuilderCopy, SessionTemplate } from './programBuilderTypes';

type ProgramBuilderSessionTemplateItemProps = {
  template: SessionTemplate;
  builderCopy: BuilderCopy;
  onAdd: () => void;
};

export const ProgramBuilderSessionLibraryItem = React.memo(function ProgramBuilderSessionLibraryItem({
  template,
  builderCopy,
  onAdd,
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

  const handleAddClick = React.useCallback(() => {
    onAdd();
  }, [onAdd]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: 'default',
        transition: 'border-color 150ms ease, background-color 150ms ease',
        '&:hover': {
          borderColor: theme.palette.success.main,
          boxShadow: theme.shadows[2],
        },
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack spacing={0.5} flexGrow={1} minWidth={0}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
              {template.label}
            </Typography>
            {template.description ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: 'pre-wrap' }}
              >
                {template.description}
              </Typography>
            ) : null}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`${template.duration} ${builderCopy.structure.duration_unit}`}
              size="small"
              color="success"
              variant="outlined"
            />
            <Tooltip title={builderCopy.library.tooltips.add_session_template} arrow>
              <span style={{ display: 'inline-flex' }}>
                <IconButton
                  size="small"
                  onClick={handleAddClick}
                  color="success"
                  aria-label="add-session-template"
                >
                  <Add fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {template.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>

        {template.exercises.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            {exercisesLabel}
          </Typography>
        ) : (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {template.exercises.map((exercise) => (
              <Chip
                key={`${template.id}-${exercise.exerciseId}`}
                label={exercise.label}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
});
