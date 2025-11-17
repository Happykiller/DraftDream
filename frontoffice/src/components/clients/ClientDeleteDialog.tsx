// src/components/clients/ClientDeleteDialog.tsx
import * as React from 'react';

import { DeleteOutline } from '@mui/icons-material';
import {
  Button,
  Stack,
  Typography,
} from '@mui/material';
import type { DialogProps } from '@mui/material/Dialog';

import { ProgramDialogLayout } from '@components/programs/ProgramDialogLayout';

import type { Client } from '@app-types/clients';

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
  onConfirm: () => void | Promise<void>;
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
  const clientName = React.useMemo(() => {
    if (!client) {
      return '';
    }
    return `${client.firstName} ${client.lastName}`;
  }, [client]);

  const description = React.useMemo(
    () => copy.description.replace('{{name}}', clientName),
    [clientName, copy.description],
  );

  const handleDialogClose = React.useCallback<NonNullable<DialogProps['onClose']>>(
    (_event, _reason) => {
      if (loading) {
        return;
      }
      onCancel();
    },
    [loading, onCancel],
  );

  const handleCancelClick = React.useCallback(() => {
    if (loading) {
      return;
    }
    onCancel();
  }, [loading, onCancel]);

  const handleConfirmClick = React.useCallback(() => {
    if (loading) {
      return;
    }
    void onConfirm();
  }, [loading, onConfirm]);

  return (
    <ProgramDialogLayout
      open={open}
      onClose={(event, reason) => {
        handleDialogClose(event, reason);
      }}
      icon={<DeleteOutline fontSize="large" />}
      tone="primary"
      title={copy.title}
      description={description}
      actions={
        <>
          <Button onClick={handleCancelClick} disabled={loading} color="inherit">
            {copy.actions.cancel}
          </Button>
          <Button onClick={handleConfirmClick} color="error" variant="contained" disabled={loading}>
            {loading ? copy.actions.confirming : copy.actions.confirm}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        {/* General information */}
        <Typography variant="body2" color="text.secondary">
          {copy.helper}
        </Typography>
      </Stack>
    </ProgramDialogLayout>
  );
}
