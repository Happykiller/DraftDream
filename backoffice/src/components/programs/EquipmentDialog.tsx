// src/components/programs/EquipmentDialog.tsx
import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  React.useEffect(() => {
    if (isEdit && initial) {
      setValues({ slug: initial.slug, locale: initial.locale, visibility: initial.visibility });
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
    <Dialog open={open} onClose={onClose} aria-labelledby="equipment-dialog-title">
      <DialogTitle id="equipment-dialog-title">
        {isEdit ? t('programs.equipment.dialog.edit_title') : t('programs.equipment.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={t('common.labels.slug')}
            name="slug"
            value={values.slug}
            onChange={onChange}
            inputProps={{ 'aria-label': 'equipment-slug' }}
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
