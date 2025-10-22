// src/components/programs/MuscleDialog.tsx
// Comment in English: Create/Edit dialog for muscles. Visibility editable only on create.
import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Muscle, MuscleVisibility } from '@src/hooks/useMuscles';

export interface MuscleDialogValues {
  slug: string;
  label: string;
  locale: string;
  visibility: MuscleVisibility;
}

export interface MuscleDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Muscle;
  onClose: () => void;
  onSubmit: (values: MuscleDialogValues) => Promise<unknown> | void;
}

const DEFAULTS: MuscleDialogValues = { slug: '', label: '', locale: 'en', visibility: 'PRIVATE' };

export function MuscleDialog({ open, mode, initial, onClose, onSubmit }: MuscleDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<MuscleDialogValues>(DEFAULTS);
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
    <Dialog open={open} onClose={onClose} aria-labelledby="muscle-dialog-title">
      <DialogTitle id="muscle-dialog-title">
        {isEdit ? t('programs.muscles.dialog.edit_title') : t('programs.muscles.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>
          {/* Keep slug editable to let coaches match existing workout plans without migrations. */}
          <TextField
            label={t('common.labels.slug')}
            name="slug"
            value={values.slug}
            onChange={onChange}
            inputProps={{ 'aria-label': 'muscle-slug' }}
            required
            fullWidth
          />
          {/* Label drives translations in the training app, so we gather it upfront. */}
          <TextField
            label={t('common.labels.label')}
            name="label"
            value={values.label}
            onChange={onChange}
            inputProps={{ 'aria-label': 'muscle-label' }}
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
