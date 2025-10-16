import * as React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

import { logWithTimestamp } from './programBuilderUtils';

type ProgramBuilderSessionDropZoneProps = {
  label: string;
  dropEffect?: 'copy' | 'move';
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  isVisible?: boolean;
};

export function ProgramBuilderSessionDropZone({
  label,
  dropEffect = 'copy',
  onDrop,
  isVisible = true,
}: ProgramBuilderSessionDropZoneProps): React.JSX.Element {
  const theme = useTheme();
  const [isActive, setIsActive] = React.useState(false);
  const shouldDisplay = isVisible || isActive;

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = dropEffect;
    if (!isActive) {
      logWithTimestamp('log', '[ProgramBuilder][SessionDropZone] drag over enter', {
        label,
        dropEffect,
        dataTypes: Array.from(event.dataTransfer.types ?? []),
      });
    }
    setIsActive(true);
  };

  const handleDragLeave = () => {
    logWithTimestamp('log', '[ProgramBuilder][SessionDropZone] drag leave', { label });
    setIsActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    logWithTimestamp('log', '[ProgramBuilder][SessionDropZone] drop detected', {
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
        borderRadius: 1.5,
        border: shouldDisplay
          ? `2px dashed ${
              isActive
                ? theme.palette.secondary.main
                : alpha(theme.palette.secondary.main, 0.5)
            }`
          : '2px dashed transparent',
        bgcolor: shouldDisplay
          ? isActive
            ? alpha(theme.palette.secondary.light, 0.2)
            : alpha(theme.palette.secondary.light, 0.1)
          : 'transparent',
        color: theme.palette.text.secondary,
        py: shouldDisplay ? 1 : 0,
        px: shouldDisplay ? 1.5 : 0,
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
