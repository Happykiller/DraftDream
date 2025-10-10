// src/components/programs/TagDialog.tsx
import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
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
    <Dialog open={open} onClose={onClose} aria-labelledby="tag-dialog-title">
      <DialogTitle id="tag-dialog-title">
        {isEdit ? t('programs.tags.dialog.edit_title') : t('programs.tags.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={t('common.labels.slug')}
            name="slug"
            value={values.slug}
            onChange={onChange}
            inputProps={{ 'aria-label': 'tag-slug' }}
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
