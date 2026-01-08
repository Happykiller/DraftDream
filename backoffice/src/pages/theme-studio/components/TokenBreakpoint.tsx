// src/pages/theme-studio/components/TokenBreakpoint.tsx
import { Stack, Typography } from '@mui/material';

import { CopyTokenButton } from '@pages/theme-studio/components/CopyTokenButton';

type TokenBreakpointProps = {
  label: string;
  value: number;
  pxToRem: (px: number) => string;
};

/** Display breakpoint tokens with converted rem values. */
export function TokenBreakpoint({ label, value, pxToRem }: TokenBreakpointProps) {
  const remValue = pxToRem(value);
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="space-between">
      {/* General information */}
      <Stack spacing={0.5} sx={{ minWidth: 200 }}>
        <Typography variant="subtitle2">{label}</Typography>
        <Typography variant="body2">
          {value}px ({remValue})
        </Typography>
      </Stack>
      <CopyTokenButton token={label} />
    </Stack>
  );
}
