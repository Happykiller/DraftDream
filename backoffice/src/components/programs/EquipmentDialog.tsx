// src\components\programs\EquipmentDialog.tsx
import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Stack } from '@mui/material';
import type { Equipment, EquipmentVisibility } from '@src/hooks/useEquipment';

export interface EquipmentDialogValues {
  slug: string;
  locale: string;
  visibility: EquipmentVisibility;
}

export interface EquipmentDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Equipment;
  onClose: () => void;
  onSubmit: (values: EquipmentDialogValues) => Promise<void> | void;
}

const DEFAULTS: EquipmentDialogValues = { slug: '', locale: 'en', visibility: 'PRIVATE' };

export function EquipmentDialog({ open, mode, initial, onClose, onSubmit }: EquipmentDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<EquipmentDialogValues>(DEFAULTS);
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
    <Dialog open={open} onClose={onClose} aria-labelledby="equipment-dialog-title">
      <DialogTitle id="equipment-dialog-title">{isEdit ? 'Edit Equipment' : 'New Equipment'}</DialogTitle>
      <DialogContent>
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>
          <TextField label="Slug" name="slug" value={values.slug} onChange={onChange} inputProps={{ 'aria-label': 'equipment-slug' }} required fullWidth />
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
