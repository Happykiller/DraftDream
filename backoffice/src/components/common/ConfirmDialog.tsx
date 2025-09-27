// src/components/common/ConfirmDialog.tsx
// ⚠️ Comment in English: Small confirm dialog with accessible labels.
import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmDialog({
  open,
  title = 'Confirm',
  message = 'Are you sure?',
  onClose,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}: ConfirmDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="confirm-title" aria-describedby="confirm-desc">
      <DialogTitle id="confirm-title">{title}</DialogTitle>
      <DialogContent>
        <Typography id="confirm-desc">{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">{cancelLabel}</Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
