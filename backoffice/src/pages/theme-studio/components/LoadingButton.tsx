// src/pages/theme-studio/components/LoadingButton.tsx
import { Button, CircularProgress } from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';

type LoadingButtonProps = ButtonProps & {
  loading?: boolean;
};

/** Lightweight replacement for MUI LoadingButton to avoid extra dependency. */
export function LoadingButton({ loading = false, children, startIcon, disabled, ...rest }: LoadingButtonProps) {
  const finalDisabled = disabled ?? loading;
  return (
    <Button
      {...rest}
      disabled={finalDisabled}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      sx={{ pointerEvents: 'none' }}
    >
      {children}
    </Button>
  );
}
