// src/pages/theme-studio/components/TokenSwatch.tsx
import { Box, Stack, Typography } from '@mui/material';

import { CopyTokenButton } from '@pages/theme-studio/components/CopyTokenButton';

type TokenSwatchProps = {
  label: string;
  value: string;
  contrastText?: string;
  inverted?: boolean;
};

/** Display a palette token with swatch, value and contrast information. */
export function TokenSwatch({ label, value, contrastText, inverted = false }: TokenSwatchProps) {
  const backgroundColor = inverted ? 'background.paper' : value;
  const foreground = inverted ? value : contrastText ?? '#000';

  return (
    <Stack spacing={1}>
      {/* General information */}
      <Box
        role="img"
        aria-label={`${label} ${value}`}
        sx={{
          bgcolor: backgroundColor,
          color: foreground,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          p: 2,
          minHeight: 96,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="subtitle2">{label}</Typography>
      </Box>
      <Typography variant="body2">Value: {value}</Typography>
      {contrastText && <Typography variant="caption">Contrast text: {contrastText}</Typography>}
      <CopyTokenButton token={label} />
    </Stack>
  );
}
