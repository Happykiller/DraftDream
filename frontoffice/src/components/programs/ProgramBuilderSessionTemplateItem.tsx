import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Chip, Paper, Stack, Typography } from '@mui/material';

import type { BuilderCopy, SessionTemplate } from './ProgramBuilderPanel';
import { DragIndicator } from '@mui/icons-material';

type ProgramBuilderSessionTemplateItemProps = {
  template: SessionTemplate;
  builderCopy: BuilderCopy;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
};

export function ProgramBuilderSessionTemplateItem({
  template,
  builderCopy,
  onDragStart,
  onDragEnd,
}: ProgramBuilderSessionTemplateItemProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: 'grab',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[2],
        },
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <DragIndicator fontSize="small" color="disabled" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {template.label}
          </Typography>
          <Chip
            label={`${template.duration} ${builderCopy.structure.duration_unit}`}
            size="small"
            color="secondary"
            variant="outlined"
          />
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
}
