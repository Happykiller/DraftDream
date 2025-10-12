import * as React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

type ProgramBuilderExerciseDropZoneProps = {
  label: string;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
};

export function ProgramBuilderExerciseDropZone({
  label,
  onDrop,
}: ProgramBuilderExerciseDropZoneProps): React.JSX.Element {
  const theme = useTheme();
  const [isActive, setIsActive] = React.useState(false);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    if (!isActive) {
      setIsActive(true);
    }
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
        borderRadius: 1.25,
        border: `2px dashed ${
          isActive
            ? theme.palette.primary.main
            : alpha(theme.palette.primary.main, 0.45)
        }`,
        bgcolor: isActive
          ? alpha(theme.palette.primary.light, 0.18)
          : alpha(theme.palette.primary.light, 0.08),
        color: theme.palette.text.secondary,
        py: 0.75,
        px: 1,
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
