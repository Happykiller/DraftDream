// src/components/common/ConfirmDialog.tsx
// ⚠️ Comment in English: Small confirm dialog with accessible labels.
import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

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
  title,
  message,
  onClose,
  onConfirm,
  confirmLabel,
  cancelLabel,
}: ConfirmDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('common.buttons.confirm');
  const resolvedMessage = message ?? t('common.messages.are_you_sure');
  const resolvedConfirmLabel = confirmLabel ?? t('common.buttons.confirm');
  const resolvedCancelLabel = cancelLabel ?? t('common.buttons.cancel');

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="confirm-title" aria-describedby="confirm-desc">
      {/* General information */}
      <DialogTitle id="confirm-title">{resolvedTitle}</DialogTitle>
      <DialogContent>
        <Typography id="confirm-desc">{resolvedMessage}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">{resolvedCancelLabel}</Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          {resolvedConfirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
