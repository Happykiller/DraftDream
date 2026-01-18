import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DeleteOutline } from '@mui/icons-material';
import {
  Stack,
  Typography,
} from '@mui/material';

import { ResponsiveButton } from '@components/common/ResponsiveButton';
import { StandardDialog } from '@components/common/StandardDialog';

export interface MealPlanBuilderDeleteDayDialogProps {
  open: boolean;
  dayLabel: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/**
 * Confirms deletion of a private meal day template from the library.
 */
export function MealPlanBuilderDeleteDayDialog({
  open,
  dayLabel,
  onClose,
  onConfirm,
}: MealPlanBuilderDeleteDayDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
      setErrorMessage(null);
    }
  }, [open]);

  const handleDialogClose = React.useCallback(() => {
    if (isSubmitting) {
      return;
    }
    onClose();
  }, [isSubmitting, onClose]);

  const handleConfirm = React.useCallback(async () => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onConfirm();
      onClose();
    } catch (_error) {
      setErrorMessage(t('nutrition-coach.builder.delete_day_dialog.errors.delete_failed'));
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, onClose, onConfirm, t]);

  const dialogTitle = t('nutrition-coach.builder.delete_day_dialog.title');
  const dialogSubtitle = t('nutrition-coach.builder.delete_day_dialog.subtitle', {
    label: dayLabel,
  });
  const cancelLabel = t('nutrition-coach.builder.delete_day_dialog.actions.cancel');
  const confirmLabel = t('nutrition-coach.builder.delete_day_dialog.actions.confirm');
  const confirmingLabel = t('nutrition-coach.builder.delete_day_dialog.actions.confirming');

  return (
    <StandardDialog
      open={open}
      onClose={handleDialogClose}
      title={dialogTitle}
      description={dialogSubtitle}
      icon={<DeleteOutline fontSize="small" />}
      tone="warning"
      actions={(
        <Stack direction="row" spacing={1}>
          <ResponsiveButton
            label={cancelLabel}
            variant="text"
            onClick={handleDialogClose}
            disabled={isSubmitting}
          />
          <ResponsiveButton
            label={isSubmitting ? confirmingLabel : confirmLabel}
            variant="contained"
            color="warning"
            onClick={handleConfirm}
            disabled={isSubmitting}
          />
        </Stack>
      )}
    >
      {/* General information */}
      <Stack spacing={1}>
        {errorMessage ? (
          <Typography variant="body2" color="error">
            {errorMessage}
          </Typography>
        ) : null}
      </Stack>
    </StandardDialog>
  );
}
