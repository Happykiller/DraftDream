import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Chip, IconButton, Paper, Stack, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';

import type { BuilderCopy, SessionTemplate } from './programBuilderTypes';
import { logWithTimestamp } from './programBuilderUtils';

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

  const handleAddClick = React.useCallback(() => {
    logWithTimestamp('log', '[ProgramBuilder][SessionLibraryItem] add session clicked', {
      templateId: template.id,
      label: template.label,
    });
    onAdd();
  }, [onAdd, template.id, template.label]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: 'default',
        transition: 'border-color 150ms ease, background-color 150ms ease',
        '&:hover': {
          borderColor: theme.palette.secondary.main,
          boxShadow: theme.shadows[2],
        },
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {template.label}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`${template.duration} ${builderCopy.structure.duration_unit}`}
              size="small"
              color="secondary"
              variant="outlined"
            />
            <IconButton size="small" onClick={handleAddClick} aria-label="add-session-template">
              <Add fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {template.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {template.exercises.length} exercices
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
});
