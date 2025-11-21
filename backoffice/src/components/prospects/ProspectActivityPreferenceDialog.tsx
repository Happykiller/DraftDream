// src/components/prospects/ProspectActivityPreferenceDialog.tsx
import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type {
  ClientActivityPreference,
  ClientActivityPreferenceVisibility,
} from '@hooks/useClientActivityPreferences';

export interface ProspectActivityPreferenceDialogValues {
  label: string;
  locale: string;
  visibility: ClientActivityPreferenceVisibility;
}

export interface ProspectActivityPreferenceDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: ClientActivityPreference;
  onClose: () => void;
  onSubmit: (values: ProspectActivityPreferenceDialogValues) => Promise<void> | void;
}

const DEFAULTS: ProspectActivityPreferenceDialogValues = { label: '', locale: 'fr', visibility: 'PRIVATE' };

export function ProspectActivityPreferenceDialog({ open, mode, initial, onClose, onSubmit }: ProspectActivityPreferenceDialogProps) {
  const [values, setValues] = React.useState<ProspectActivityPreferenceDialogValues>(DEFAULTS);
  const { t } = useTranslation();
  const isEdit = mode === 'edit';

  React.useEffect(() => {
    if (isEdit && initial) {
      setValues({
        label: initial.label,
        locale: initial.locale,
        visibility: initial.visibility,
      });
    } else {
      setValues(DEFAULTS);
    }
  }, [initial, isEdit]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="prospect-activity-preference-dialog">
      <DialogTitle id="prospect-activity-preference-dialog">
        {isEdit
          ? t('prospects.activity_preferences.dialog.edit_title')
          : t('prospects.activity_preferences.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        {/* General information */}
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={t('common.labels.label')}
            name="label"
            value={values.label}
            onChange={onChange}
            inputProps={{ 'aria-label': 'activity-preference-label' }}
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
            {['en', 'fr', 'es', 'de', 'it'].map(loc => (
              <MenuItem key={loc} value={loc}>
                {loc.toUpperCase()}
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

