// src/components/nutrition/MealPlanDeleteDialog.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';

import { ResponsiveButton } from '@components/common/ResponsiveButton';
import { ProgramDialogLayout } from '@components/programs/ProgramDialogLayout';

interface MealPlanDeleteDialogProps {
  open: boolean;
  mealPlanLabel: string;
  loading?: boolean;
  onClose: (event?: unknown, reason?: 'backdropClick' | 'escapeKeyDown') => void;
  onConfirm: () => void | Promise<void>;
}

/**
 * MealPlanDeleteDialog prompts the user to confirm a meal plan deletion.
 */
export function MealPlanDeleteDialog({
  open,
  mealPlanLabel,
  loading = false,
  onClose,
  onConfirm,
}: MealPlanDeleteDialogProps): React.JSX.Element {
  const { t } = useTranslation();

  const deleteDialogTitle = t('nutrition-coach.list.delete_dialog.title');
  const deleteDialogDescription = t('nutrition-coach.list.delete_dialog.description', {
    label: mealPlanLabel,
  });
  const deleteDialogCancel = t('nutrition-coach.list.delete_dialog.actions.cancel');
  const deleteDialogConfirm = t('nutrition-coach.list.delete_dialog.actions.confirm');
  const deleteDialogConfirming = t('nutrition-coach.list.delete_dialog.actions.confirming');

  const handleClose = React.useCallback(
    (
      event?: Parameters<NonNullable<MealPlanDeleteDialogProps['onClose']>>[0],
      reason?: Parameters<NonNullable<MealPlanDeleteDialogProps['onClose']>>[1],
    ) => {
      if (loading) {
        return;
      }

      onClose(event, reason);
    },
    [loading, onClose],
  );

  return (
    <ProgramDialogLayout
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
          {t('nutrition-coach.list.delete_dialog.helper')}
        </Typography>
      </Stack>
    </ProgramDialogLayout>
  );
}
