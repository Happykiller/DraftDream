import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Stack,
  Typography,
} from '@mui/material';
import { ResponsiveButton } from '@components/common/ResponsiveButton';
import { DeleteOutline } from '@mui/icons-material';

import { StandardDialog } from '@components/common/StandardDialog';

interface ProgramDeleteDialogProps {
  open: boolean;
  programLabel: string;
  loading?: boolean;
  onClose: (event?: unknown, reason?: 'backdropClick' | 'escapeKeyDown') => void;
  onConfirm: () => void | Promise<void>;
}

/**
 * ProgramDeleteDialog prompts the user to confirm program deletion.
 */
export function ProgramDeleteDialog({
  open,
  programLabel,
  loading = false,
  onClose,
  onConfirm,
}: ProgramDeleteDialogProps): React.JSX.Element {
  const { t } = useTranslation();

  const deleteDialogTitle = t('programs-coatch.list.delete_dialog.title');
  const deleteDialogDescription = t('programs-coatch.list.delete_dialog.description', {
    label: programLabel,
  });
  const deleteDialogCancel = t('programs-coatch.list.delete_dialog.actions.cancel');
  const deleteDialogConfirm = t('programs-coatch.list.delete_dialog.actions.confirm');
  const deleteDialogConfirming = t('programs-coatch.list.delete_dialog.actions.confirming');

  const handleClose = React.useCallback(
    (
      event?: Parameters<NonNullable<ProgramDeleteDialogProps['onClose']>>[0],
      reason?: Parameters<NonNullable<ProgramDeleteDialogProps['onClose']>>[1],
    ) => {
      if (loading) {
        return;
      }
      onClose(event, reason);
    },
    [loading, onClose],
  );

  return (
    <StandardDialog
      open={open}
      onClose={(event, reason) => {
        handleClose(event, reason);
      }}
      icon={<DeleteOutline fontSize="large" />}
      title={deleteDialogTitle}
      description={deleteDialogDescription}
      actions={
        <>
          <ResponsiveButton onClick={handleClose} disabled={loading} color="inherit">
            {deleteDialogCancel}
          </ResponsiveButton>
          <ResponsiveButton
            onClick={() => {
              void onConfirm();
            }}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? deleteDialogConfirming : deleteDialogConfirm}
          </ResponsiveButton>
        </>
      }
    >
      <Stack spacing={2}>
        {/* General information */}
        <Typography variant="body2" color="text.secondary">
          {t('programs-coatch.list.delete_dialog.helper')}
        </Typography>
      </Stack>
    </StandardDialog>
  );
}