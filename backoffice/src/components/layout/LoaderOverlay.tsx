// src\components\layout\LoaderOverlay.tsx
import { CircularProgress,
         Box } from '@mui/material';

import { useLoaderStore } from '@stores/loader';

interface LoaderOverlayProps {
  /** Forces the overlay to be visible regardless of the store state. */
  forceVisible?: boolean;
}

const LoaderOverlay = ({ forceVisible = false }: LoaderOverlayProps) => {
  const loading = useLoaderStore((state) => state.loading);
  const shouldDisplay = forceVisible || loading;

  if (!shouldDisplay) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <CircularProgress size={60} />
    </Box>
  );
};

export default LoaderOverlay;
