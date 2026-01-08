// src/pages/theme-studio/components/CopyTokenButton.tsx
import * as React from 'react';
import { Button, Tooltip } from '@mui/material';
import { Check, ContentCopy } from '@mui/icons-material';

type CopyTokenButtonProps = {
  token: string;
  label?: string;
  size?: 'small' | 'medium';
};

/** Button helper that copies the provided token string to the clipboard. */
export function CopyTokenButton({ token, label = 'Copy token', size = 'small' }: CopyTokenButtonProps) {
  const [status, setStatus] = React.useState<'idle' | 'copied' | 'error'>('idle');

  const resetLater = React.useCallback(() => {
    window.setTimeout(() => setStatus('idle'), 1500);
  }, []);

  const handleCopy = React.useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(token);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = token;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setStatus('copied');
      resetLater();
    } catch (error) {
      console.error('Failed to copy token', error);
      setStatus('error');
      resetLater();
    }
  }, [token, resetLater]);

  const tooltip = status === 'copied' ? 'Copied!' : status === 'error' ? 'Copy failed' : `Copy ${token}`;

  return (
    <Tooltip title={tooltip} placement="top">
      {/* General information */}
      <Button
        type="button"
        size={size}
        variant="outlined"
        startIcon={status === 'copied' ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
        color={status === 'error' ? 'error' : 'primary'}
        onClick={handleCopy}
        aria-label={`${label}: ${token}`}
      >
        {status === 'copied' ? 'Copied' : label}
      </Button>
    </Tooltip>
  );
}
