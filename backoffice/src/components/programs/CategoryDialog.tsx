// src/components/programs/CategoryDialog.tsx
// ⚠️ Comment in English: Create/Edit dialog. Visibility allowed only on create (per schema).
import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Stack } from '@mui/material';
import type { Visibility, Category } from '@src/hooks/useCategories';

export interface CategoryDialogValues {
  slug: string;
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

const DEFAULTS: CategoryDialogValues = { slug: '', locale: 'en', visibility: 'PRIVATE' };

export function CategoryDialog({ open, mode, initial, onClose, onSubmit }: CategoryDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<CategoryDialogValues>(DEFAULTS);
  const isEdit = mode === 'edit';

  React.useEffect(() => {
    if (isEdit && initial) {
      setValues({ slug: initial.slug, locale: initial.locale, visibility: initial.visibility });
    } else {
      setValues(DEFAULTS);
    }
  }, [isEdit, initial]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="category-dialog-title">
      <DialogTitle id="category-dialog-title">{isEdit ? 'Edit Category' : 'New Category'}</DialogTitle>
      <DialogContent>
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Slug"
            name="slug"
            value={values.slug}
            onChange={onChange}
            inputProps={{ 'aria-label': 'category-slug' }}
            required
            fullWidth
          />
          <TextField select label="Locale" name="locale" value={values.locale} onChange={onChange} required fullWidth>
            {['en', 'fr', 'es', 'de', 'it'].map((loc) => (
              <MenuItem key={loc} value={loc}>{loc}</MenuItem>
            ))}
          </TextField>

          {!isEdit && (
            <TextField select label="Visibility" name="visibility" value={values.visibility} onChange={onChange} required fullWidth>
              <MenuItem value="PRIVATE">PRIVATE</MenuItem>
              <MenuItem value="PUBLIC">PUBLIC</MenuItem>
            </TextField>
          )}

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">{isEdit ? 'Save' : 'Create'}</Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
