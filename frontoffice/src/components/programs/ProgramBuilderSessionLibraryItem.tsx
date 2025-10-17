import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

import type { BuilderCopy, SessionTemplate } from './programBuilderTypes';
import { DragIndicator } from '@mui/icons-material';
import { logWithTimestamp } from './programBuilderUtils';

type ProgramBuilderSessionTemplateItemProps = {
  template: SessionTemplate;
  builderCopy: BuilderCopy;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
};

export const ProgramBuilderSessionLibraryItem = React.memo(function ProgramBuilderSessionLibraryItem({
  template,
  builderCopy,
  onDragStart,
  onDragEnd,
}: ProgramBuilderSessionTemplateItemProps): React.JSX.Element {
  const theme = useTheme();

  const handleDragStart = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      logWithTimestamp('log', '[ProgramBuilder][SessionLibraryItem] drag start', {
        templateId: template.id,
        label: template.label,
      });
      onDragStart(event);
    },
    [onDragStart, template.id, template.label],
  );

  const handleDragEnd = React.useCallback(() => {
    logWithTimestamp('log', '[ProgramBuilder][SessionLibraryItem] drag end', {
      templateId: template.id,
      label: template.label,
    });
    onDragEnd?.();
  }, [onDragEnd, template.id, template.label]);

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      logWithTimestamp('log', '[ProgramBuilder][SessionLibraryItem] mouse down on drag handle', {
        templateId: template.id,
        button: event.button,
      });
    },
    [template.id],
  );

  const handleMouseUp = React.useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      logWithTimestamp('log', '[ProgramBuilder][SessionLibraryItem] mouse up on drag handle', {
        templateId: template.id,
        button: event.button,
      });
    },
    [template.id],
  );

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
          <Box
            component="span"
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            sx={{
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <DragIndicator fontSize="small" color="disabled" />
          </Box>
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
});
