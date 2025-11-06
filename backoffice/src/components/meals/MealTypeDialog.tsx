// src/components/meals/MealTypeDialog.tsx
// Comment in English: Dialog used to create or edit nutrition meal types.
import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { MealType, MealTypeVisibility } from '@hooks/useMealTypes';

export interface MealTypeDialogValues {
  slug: string;
  label: string;
  locale: string;
  visibility: MealTypeVisibility;
}

export interface MealTypeDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: MealType;
  onClose: () => void;
  onSubmit: (values: MealTypeDialogValues) => Promise<void> | void;
}

const DEFAULT_VALUES: MealTypeDialogValues = {
  slug: '',
  label: '',
  locale: 'en',
  visibility: 'PRIVATE',
};

export function MealTypeDialog({ open, mode, initial, onClose, onSubmit }: MealTypeDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<MealTypeDialogValues>(DEFAULT_VALUES);
  const isEdit = mode === 'edit';
  const { t } = useTranslation();

  React.useEffect(() => {
    if (isEdit && initial) {
      setValues({
        slug: initial.slug,
        label: initial.label,
        locale: initial.locale,
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
      [name]: name === 'visibility' ? (value as MealTypeVisibility) : value,
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="meal-type-dialog-title">
      <DialogTitle id="meal-type-dialog-title">
        {isEdit ? t('meals.mealTypes.dialog.edit_title') : t('meals.mealTypes.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>
          {/* General information */}
          <TextField
            label={t('common.labels.slug')}
            name="slug"
            value={values.slug}
            onChange={onChange}
            inputProps={{ 'aria-label': 'meal-type-slug' }}
            required
            fullWidth
          />
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
            <MenuItem value="PRIVATE">{t('common.visibility.private')}</MenuItem>
            <MenuItem value="PUBLIC">{t('common.visibility.public')}</MenuItem>
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
