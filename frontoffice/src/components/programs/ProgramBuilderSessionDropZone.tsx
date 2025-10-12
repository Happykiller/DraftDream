import * as React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

type ProgramBuilderSessionDropZoneProps = {
  label: string;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
};

export function ProgramBuilderSessionDropZone({
  label,
  onDrop,
}: ProgramBuilderSessionDropZoneProps): React.JSX.Element {
  const theme = useTheme();
  const [isActive, setIsActive] = React.useState(false);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsActive(true);
  };

  const handleDragLeave = () => {
    setIsActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
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
        border: `2px dashed ${
          isActive
            ? theme.palette.secondary.main
            : alpha(theme.palette.secondary.main, 0.5)
        }`,
        bgcolor: isActive
          ? alpha(theme.palette.secondary.light, 0.2)
          : alpha(theme.palette.secondary.light, 0.1),
        color: theme.palette.text.secondary,
        py: 1,
        px: 1.5,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'uppercase',
        transition: 'all 120ms ease',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );
}
