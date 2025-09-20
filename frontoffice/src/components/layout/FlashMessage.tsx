// src\components\FlashMessage.tsx
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Alert, IconButton, Stack, type SnackbarOrigin, Collapse } from '@mui/material';

import { useFlashStore } from '@hooks/useFlashStore';

export interface FlashIcons {
  close?: React.ReactNode;
}

interface FlashMessageProps {
  icons?: FlashIcons;
  maxVisible?: number;
  anchorOrigin?: SnackbarOrigin;
}

export const FlashMessage: React.FC<FlashMessageProps> = ({ icons = {}, maxVisible = 5, anchorOrigin = { vertical: 'bottom', horizontal: 'right' } }) => {
  const theme = useTheme();
  const { queue, close } = useFlashStore();
  const visibleQueue = queue.slice(-maxVisible);

  return (
    <Stack spacing={1} sx={{ position: 'fixed', zIndex: 1300, ...anchorOriginToPosition(anchorOrigin) }}>
      {visibleQueue.map(({ id, msg, severity }) => (
        <Collapse in key={id}>
          <Alert
            severity={severity}
            onClose={() => close(id)}
            sx={{
              width: '100%',
              backgroundColor: theme.palette.mode === 'dark'
                ? theme.palette.grey[800]
                : theme.palette.grey[100],
              color: theme.palette.text.primary,
            }}
            action={
              <IconButton
                size="small"
                color="inherit"
                onClick={() => close(id)}
              >
                {icons.close}
              </IconButton>
            }
          >
            {msg}
          </Alert>
        </Collapse>
      ))}
    </Stack>
  );
};

function anchorOriginToPosition(anchor: SnackbarOrigin): React.CSSProperties {
  const vertical = anchor.vertical === 'top' ? { top: 16 } : { bottom: 16 };
  const horizontal = anchor.horizontal === 'left' ? { left: 16 } : anchor.horizontal === 'center' ? { left: '50%', transform: 'translateX(-50%)' } : { right: 16 };
  return { position: 'fixed', ...vertical, ...horizontal, zIndex: 1300 };
}
