// src/pages/theme-studio/components/TokenSpacing.tsx
import { Box, Stack, Typography } from '@mui/material';

import { CopyTokenButton } from '@pages/theme-studio/components/CopyTokenButton';

type TokenSpacingProps = {
  label: string;
  pxValue: number;
  pxToRem: (value: number) => string;
  visualRadius?: boolean;
};

/** Display spacing or radius tokens with px and rem units. */
export function TokenSpacing({ label, pxValue, pxToRem, visualRadius = false }: TokenSpacingProps) {
  const remValue = pxToRem(pxValue);
  return (
    <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between">
      <Stack spacing={0.5} sx={{ minWidth: 200 }}>
        <Typography variant="subtitle2">{label}</Typography>
        <Typography variant="body2">
          {pxValue.toFixed(2).replace(/\.00$/, '')} px ({remValue})
        </Typography>
      </Stack>
      <Box
        sx={{
          width: visualRadius ? 64 : `${pxValue}px`,
          height: visualRadius ? 64 : 12,
          borderRadius: visualRadius ? pxValue : 1,
          bgcolor: 'primary.main',
          opacity: 0.3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      />
      <CopyTokenButton token={label} />
    </Stack>
  );
}
