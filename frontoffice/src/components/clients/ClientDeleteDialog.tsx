// src/components/clients/ClientDeleteDialog.tsx
import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';

import type { Client } from '@types/clients';

export interface ClientDeleteDialogCopy {
  title: string;
  description: string;
  helper: string;
  actions: {
    cancel: string;
    confirm: string;
    confirming: string;
  };
}

export interface ClientDeleteDialogProps {
  client: Client | null;
  open: boolean;
  loading: boolean;
  copy: ClientDeleteDialogCopy;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Confirmation dialog asking the user to validate client deletion. */
export function ClientDeleteDialog({
  client,
  open,
  loading,
  copy,
  onCancel,
  onConfirm,
}: ClientDeleteDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onClose={loading ? undefined : onCancel} maxWidth="xs" fullWidth>
      {/* General information */}
      <DialogTitle>{copy.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {copy.description.replace('{{name}}', client ? `${client.firstName} ${client.lastName}` : '')}
        </DialogContentText>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {copy.helper}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading} color="inherit">
          {copy.actions.cancel}
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          {loading ? copy.actions.confirming : copy.actions.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
