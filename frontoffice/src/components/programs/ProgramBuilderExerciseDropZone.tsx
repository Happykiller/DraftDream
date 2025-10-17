import * as React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

import { logWithTimestamp } from './programBuilderUtils';

type ProgramBuilderExerciseDropZoneProps = {
  label: string;
  dropEffect?: 'copy' | 'move';
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  isVisible?: boolean;
};

export function ProgramBuilderExerciseDropZone({
  label,
  dropEffect = 'copy',
  onDrop,
  isVisible = true,
}: ProgramBuilderExerciseDropZoneProps): React.JSX.Element {
  const theme = useTheme();
  const [isActive, setIsActive] = React.useState(false);
  const shouldDisplay = isVisible || isActive;

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = dropEffect;
    if (!isActive) {
      logWithTimestamp('log', '[ProgramBuilder][ExerciseDropZone] drag over enter', {
        label,
        dropEffect,
        dataTypes: Array.from(event.dataTransfer.types ?? []),
      });
      setIsActive(true);
    }
  };

  const handleDragLeave = () => {
    logWithTimestamp('log', '[ProgramBuilder][ExerciseDropZone] drag leave', { label });
    setIsActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    logWithTimestamp('log', '[ProgramBuilder][ExerciseDropZone] drop detected', {
      label,
      dropEffect,
      dataTypes: Array.from(event.dataTransfer.types ?? []),
    });
    setIsActive(false);
    onDrop(event);
  };

  return (
    <Box
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        borderRadius: 1.25,
        border: shouldDisplay
          ? `2px dashed ${
              isActive
                ? theme.palette.primary.main
                : alpha(theme.palette.primary.main, 0.45)
            }`
          : '2px dashed transparent',
        bgcolor: shouldDisplay
          ? isActive
            ? alpha(theme.palette.primary.light, 0.18)
            : alpha(theme.palette.primary.light, 0.08)
          : 'transparent',
        color: theme.palette.text.secondary,
        py: shouldDisplay ? 0.75 : 0,
        px: shouldDisplay ? 1 : 0,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'uppercase',
        transition: 'all 120ms ease',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        height: shouldDisplay ? 'auto' : 0,
        overflow: 'hidden',
        visibility: shouldDisplay ? 'visible' : 'hidden',
        my: shouldDisplay ? 0 : 0,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );
}
