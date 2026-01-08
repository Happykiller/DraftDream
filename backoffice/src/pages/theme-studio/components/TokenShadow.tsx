// src/pages/theme-studio/components/TokenShadow.tsx
import { Box, Paper, Stack, Typography } from '@mui/material';

import { CopyTokenButton } from '@pages/theme-studio/components/CopyTokenButton';

type TokenShadowProps = {
  label: string;
  shadow: string;
};

/** Display a shadow sample using a neutral surface. */
export function TokenShadow({ label, shadow }: TokenShadowProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      {/* General information */}
      <Stack spacing={1} alignItems="flex-start">
        <Typography variant="subtitle2">{label}</Typography>
        <Box
          role="img"
          aria-label={`${label} sample`}
          sx={{
            width: 120,
            height: 48,
            borderRadius: 2,
            bgcolor: 'background.paper',
            boxShadow: shadow,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
          }}
        >
          <Typography variant="caption">shadow</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {shadow}
        </Typography>
        <CopyTokenButton token={label} />
      </Stack>
    </Paper>
  );
}
