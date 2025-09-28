// src/components/programs/TagDialog.tsx
import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Stack } from '@mui/material';
import type { Tag, TagVisibility } from '@src/hooks/useTags';

export interface TagDialogValues {
  slug: string;
  locale: string;
  visibility: TagVisibility;
}

export interface TagDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Tag;
  onClose: () => void;
  onSubmit: (values: TagDialogValues) => Promise<void> | void;
}

const DEFAULTS: TagDialogValues = { slug: '', locale: 'en', visibility: 'PRIVATE' };

export function TagDialog({ open, mode, initial, onClose, onSubmit }: TagDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<TagDialogValues>(DEFAULTS);
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
    <Dialog open={open} onClose={onClose} aria-labelledby="tag-dialog-title">
      <DialogTitle id="tag-dialog-title">{isEdit ? 'Edit Tag' : 'New Tag'}</DialogTitle>
      <DialogContent>
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>
          <TextField label="Slug" name="slug" value={values.slug} onChange={onChange} inputProps={{ 'aria-label': 'tag-slug' }} required fullWidth />
          <TextField select label="Locale" name="locale" value={values.locale} onChange={onChange} required fullWidth>
            {['en', 'fr', 'es', 'de', 'it'].map((loc) => (<MenuItem key={loc} value={loc}>{loc}</MenuItem>))}
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
