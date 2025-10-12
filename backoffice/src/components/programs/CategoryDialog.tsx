// src/components/programs/CategoryDialog.tsx
// Comment in English: Create/Edit dialog. Visibility allowed only on create (per schema).
import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Visibility, Category } from '@src/hooks/useCategories';

export interface CategoryDialogValues {
  slug: string;
  label: string;
  locale: string;
  visibility: Visibility;
}

export interface CategoryDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Category;
  onClose: () => void;
  onSubmit: (values: CategoryDialogValues) => Promise<void> | void;
}

const DEFAULTS: CategoryDialogValues = { slug: '', label: '', locale: 'en', visibility: 'PRIVATE' };

export function CategoryDialog({ open, mode, initial, onClose, onSubmit }: CategoryDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<CategoryDialogValues>(DEFAULTS);
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
      setValues(DEFAULTS);
    }
  }, [isEdit, initial]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="category-dialog-title">
      <DialogTitle id="category-dialog-title">
        {isEdit ? t('programs.categories.dialog.edit_title') : t('programs.categories.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={t('common.labels.slug')}
            name="slug"
            value={values.slug}
            onChange={onChange}
            inputProps={{ 'aria-label': 'category-slug' }}
            required
            fullWidth
          />
          <TextField
            label={t('common.labels.label')}
            name="label"
            value={values.label}
            onChange={onChange}
            inputProps={{ 'aria-label': 'category-label' }}
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
            {['en', 'fr', 'es', 'de', 'it'].map((loc) => (
              <MenuItem key={loc} value={loc}>
                {loc.toUpperCase()}
              </MenuItem>
            ))}
          </TextField>

          {!isEdit && (
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
          )}

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
