// src\components\layout\LoaderOverlay.tsx
import { useLoaderStore } from '@stores/loader';
import { CircularProgress, Box } from '@mui/material';

const LoaderOverlay = () => {
  const loading = useLoaderStore((s) => s.loading);

  if (!loading) return null;

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
      {/* Loading spinner */}
      <CircularProgress size={60} />
    </Box>
  );
};

export default LoaderOverlay;
