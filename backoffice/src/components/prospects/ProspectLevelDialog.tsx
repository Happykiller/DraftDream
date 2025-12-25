// src/components/prospects/ProspectLevelDialog.tsx
import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDateFormatter } from '@src/hooks/useDateFormatter';

import type { ProspectLevel } from '@hooks/useProspectLevels';
import { VISIBILITY_OPTIONS, type Visibility } from '@src/commons/visibility';

export interface ProspectLevelDialogValues {
  label: string;
  locale: string;
  visibility: Visibility;
}

export interface ProspectLevelDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: ProspectLevel;
  onClose: () => void;
  onSubmit: (values: ProspectLevelDialogValues) => Promise<void> | void;
}

const DEFAULTS: ProspectLevelDialogValues = { label: '', locale: 'fr', visibility: 'PUBLIC' };

export function ProspectLevelDialog({ open, mode, initial, onClose, onSubmit }: ProspectLevelDialogProps) {
  const [values, setValues] = React.useState<ProspectLevelDialogValues>(DEFAULTS);
  const { t } = useTranslation();
  const isEdit = mode === 'edit';
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
        visibility: initial.visibility,
      });
    } else {
      setValues(DEFAULTS);
    }
  }, [initial, isEdit]);

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
    <Dialog open={open} onClose={onClose} aria-labelledby="prospect-level-dialog">
      {/* General information */}
      <DialogTitle id="prospect-level-dialog">
        {isEdit ? t('prospects.levels.dialog.edit_title') : t('prospects.levels.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {isEdit && initial ? (
            <Stack spacing={1.5}>
              <Stack spacing={0.25}>
                <Typography variant="caption" color="text.secondary">
                  {t('common.labels.id')}
                </Typography>
                <Typography variant="body2">{initial.slug}</Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Stack flex={1} spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {t('common.labels.creator')}
                  </Typography>
                  <Typography variant="body2">{creatorEmail}</Typography>
                </Stack>
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

          <Stack component="form" onSubmit={submit} spacing={2}>
            <TextField
              label={t('common.labels.label')}
              name="label"
              value={values.label}
              onChange={onChange}
              inputProps={{ 'aria-label': 'level-label' }}
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
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
