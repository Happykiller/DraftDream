// src/components/prospects/ProspectDeleteDialog.tsx
import * as React from 'react';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { DeleteOutline } from '@mui/icons-material';
import {
  Stack,
  Typography,
} from '@mui/material';
import type { DialogProps } from '@mui/material/Dialog';

import { StandardDialog } from '@components/common/StandardDialog';
import { ResponsiveButton } from '@components/common/ResponsiveButton';

import type { Prospect } from '@app-types/prospects';

export interface ProspectDeleteDialogCopy {
  title: string;
  description: string;
  helper: string;
  actions: {
    cancel: string;
    confirm: string;
    confirming: string;
  };
}

export interface ProspectDeleteDialogProps {
  prospect: Prospect | null;
  open: boolean;
  loading: boolean;
  copy: ProspectDeleteDialogCopy;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

/** Confirmation dialog asking the user to validate prospect deletion. */
export function ProspectDeleteDialog({
  prospect,
  open,
  loading,
  copy,
  onCancel,
  onConfirm,
}: ProspectDeleteDialogProps): React.JSX.Element {
  const prospectName = React.useMemo(() => {
    if (!prospect) {
      return '';
    }
    return `${prospect.firstName} ${prospect.lastName}`;
  }, [prospect]);

  const description = React.useMemo(
    () => copy.description.replace('{{name}}', prospectName),
    [prospectName, copy.description],
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
    <StandardDialog
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
          <ResponsiveButton
            onClick={handleCancelClick}
            disabled={loading}
            color="inherit"
            label={copy.actions.cancel}
            icon={<CloseRoundedIcon fontSize="small" />}
          />
          <ResponsiveButton
            onClick={handleConfirmClick}
            color="error"
            variant="contained"
            disabled={loading}
            label={loading ? copy.actions.confirming : copy.actions.confirm}
            icon={<DeleteOutline fontSize="small" />}
          />
        </>
      }
    >
      <Stack spacing={2}>
        {/* General information */}
        <Typography variant="body2" color="text.secondary">
          {copy.helper}
        </Typography>
      </Stack>
    </StandardDialog>
  );
}
