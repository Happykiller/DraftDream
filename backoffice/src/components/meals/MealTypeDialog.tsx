// src/components/meals/MealTypeDialog.tsx
// Comment in English: Dialog used to create or edit nutrition meal types.
import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDateFormatter } from '@src/hooks/useDateFormatter';

import type { MealType } from '@hooks/useMealTypes';
import { VISIBILITY_OPTIONS, type Visibility } from '@src/commons/visibility';

export interface MealTypeDialogValues {
  label: string;
  locale: string;
  icon: string;
  visibility: Visibility;
}

export interface MealTypeDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: MealType;
  onClose: () => void;
  onSubmit: (values: MealTypeDialogValues) => Promise<void> | void;
}

const DEFAULT_VALUES: MealTypeDialogValues = {
  label: '',
  locale: 'en',
  icon: '',
  visibility: 'PRIVATE',
};

export function MealTypeDialog({ open, mode, initial, onClose, onSubmit }: MealTypeDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<MealTypeDialogValues>(DEFAULT_VALUES);
  const isEdit = mode === 'edit';
  const { t } = useTranslation();
  const formatDate = useDateFormatter();

  const creatorEmail = React.useMemo(() => initial?.creator?.email || '-', [initial?.creator?.email]);
  const formattedCreatedAt = React.useMemo(
    () => (initial?.createdAt ? formatDate(initial.createdAt) : '-'),
    [initial?.createdAt, formatDate],
  );
  const formattedUpdatedAt = React.useMemo(
    () => (initial?.updatedAt ? formatDate(initial.updatedAt) : '-'),
    [initial?.updatedAt, formatDate],
  );

  React.useEffect(() => {
    if (isEdit && initial) {
      setValues({
        label: initial.label,
        locale: initial.locale,
        icon: initial.icon ?? '',
        visibility: initial.visibility,
      });
    } else {
      setValues(DEFAULT_VALUES);
    }
  }, [isEdit, initial]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: name === 'visibility' ? (value as Visibility) : value,
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: MealTypeDialogValues = {
      ...values,
      icon: values.icon.trim(),
    };
    await onSubmit(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="meal-type-dialog-title">
      {/* General information */}
      <DialogTitle id="meal-type-dialog-title">
        {isEdit ? t('meals.mealTypes.dialog.edit_title') : t('meals.mealTypes.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>
          {isEdit && initial ? (
            <Stack spacing={1.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Stack flex={1} spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {t('common.labels.creator')}
                  </Typography>
                  <Typography variant="body2">{creatorEmail}</Typography>
                </Stack>
                <Stack flex={1} spacing={0.25}>
                  {/* Empty or another field if needed */}
                </Stack>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Stack flex={1} spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {t('common.labels.created')}
                  </Typography>
                  <Typography variant="body2">{formattedCreatedAt}</Typography>
                </Stack>
                <Stack flex={1} spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {t('common.labels.updated')}
                  </Typography>
                  <Typography variant="body2">{formattedUpdatedAt}</Typography>
                </Stack>
              </Stack>
            </Stack>
          ) : null}

          <TextField
            label={t('common.labels.label')}
            name="label"
            value={values.label}
            onChange={onChange}
            inputProps={{ 'aria-label': 'meal-type-label' }}
            required
            fullWidth
          />
          <TextField
            label={t('common.labels.icon')}
            name="icon"
            value={values.icon}
            onChange={onChange}
            inputProps={{ 'aria-label': 'meal-type-icon' }}
            placeholder={t('common.placeholders.icon')}
            fullWidth
          />
          <TextField
            select
            label={t('common.labels.locale')}
            name="locale"
            value={values.locale}
            onChange={onChange}
            required
            fullWidth
          >
            {['en', 'fr', 'es', 'de', 'it'].map((locale) => (
              <MenuItem key={locale} value={locale}>
                {locale.toUpperCase()}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label={t('common.labels.visibility')}
            name="visibility"
            value={values.visibility}
            onChange={onChange}
            required
            fullWidth
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {t(option.label)}
              </MenuItem>
            ))}
          </TextField>

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} color="inherit">
              {t('common.buttons.cancel')}
            </Button>
            <Button type="submit" variant="contained">
              {isEdit ? t('common.buttons.save') : t('common.buttons.create')}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
