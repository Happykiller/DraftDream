import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Save } from '@mui/icons-material';
import {
  Stack,
  TextField,
} from '@mui/material';
import { ResponsiveButton } from '@components/common/ResponsiveButton';
import { ProgramDialogLayout } from '@components/programs/ProgramDialogLayout';

export interface ProgramBuilderSaveSessionDialogProps {
  open: boolean;
  sessionLabel: string;
  onClose: () => void;
  onSave: (label: string) => Promise<void>;
}

/**
 * Prompts the coach to confirm the session label before saving it as a template.
 */
export function ProgramBuilderSaveSessionDialog({
  open,
  sessionLabel,
  onClose,
  onSave,
}: ProgramBuilderSaveSessionDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const [labelDraft, setLabelDraft] = React.useState(sessionLabel);
  const [labelError, setLabelError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
      setLabelError(null);
      return;
    }
    setLabelDraft(sessionLabel);
    setLabelError(null);
  }, [open, sessionLabel]);

  const handleDialogClose = React.useCallback(() => {
    if (isSubmitting) {
      return;
    }
    onClose();
  }, [isSubmitting, onClose]);

  const handleSubmit = React.useCallback(
    async (event?: React.SyntheticEvent) => {
      event?.preventDefault();
      if (isSubmitting) {
        return;
      }

      const trimmedLabel = labelDraft.trim();
      if (!trimmedLabel) {
        setLabelError(t('programs-coatch.builder.save_session_dialog.errors.missing_label'));
        return;
      }

      setIsSubmitting(true);
      setLabelError(null);
      try {
        await onSave(trimmedLabel);
        onClose();
      } catch (_error) {
        setLabelError(t('programs-coatch.builder.save_session_dialog.errors.save_failed'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, labelDraft, onClose, onSave, t],
  );

  const dialogTitle = t('programs-coatch.builder.save_session_dialog.title');
  const dialogSubtitle = t('programs-coatch.builder.save_session_dialog.subtitle');
  const labelFieldLabel = t('programs-coatch.builder.save_session_dialog.fields.label');
  const labelFieldPlaceholder = t('programs-coatch.builder.save_session_dialog.fields.placeholder');
  const cancelLabel = t('programs-coatch.builder.save_session_dialog.actions.cancel');
  const saveLabel = t('programs-coatch.builder.save_session_dialog.actions.save');
  const savingLabel = t('programs-coatch.builder.save_session_dialog.actions.saving');

  return (
    <ProgramDialogLayout
      open={open}
      onClose={handleDialogClose}
      title={dialogTitle}
      description={dialogSubtitle}
      icon={<Save fontSize="small" />}
      actions={(
        <Stack direction="row" spacing={1}>
          <ResponsiveButton
            label={cancelLabel}
            variant="text"
            onClick={handleDialogClose}
            disabled={isSubmitting}
          />
          <ResponsiveButton
            label={isSubmitting ? savingLabel : saveLabel}
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
          />
        </Stack>
      )}
      formComponent="form"
      formProps={{ onSubmit: handleSubmit }}
    >
      {/* General information */}
      <Stack spacing={2}>
        <TextField
          label={labelFieldLabel}
          value={labelDraft}
          onChange={(event) => {
            setLabelDraft(event.target.value);
            setLabelError(null);
          }}
          placeholder={labelFieldPlaceholder}
          error={Boolean(labelError)}
          helperText={labelError}
          fullWidth
          autoFocus
        />
      </Stack>
    </ProgramDialogLayout>
  );
}
