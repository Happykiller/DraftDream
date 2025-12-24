// ⚠️ Comment in English: Unified dialog for creating/updating a user.
// Password fields are shown only in "create" mode (schema does not allow password update).
import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, MenuItem, FormControlLabel, Switch, Divider, Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDateFormatter } from '@src/hooks/useDateFormatter';
import type { User } from '@src/hooks/useUsers';

export type UserDialogMode = 'create' | 'edit';

export interface UserDialogValues {
  type: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  // password (create only)
  password?: string;
  confirm_password?: string;
  // minimal company/address for POC (optional fields)
  company_name?: string;
  // company address
  company_address_name?: string;
  company_address_city?: string;
  company_address_code?: string;
  company_address_country?: string;
  address_name?: string;
  address_city?: string;
  address_code?: string;
  address_country?: string;
}

export interface UserDialogProps {
  open: boolean;
  mode: UserDialogMode;
  initial?: User;
  onClose: () => void;
  onSubmit: (values: UserDialogValues) => Promise<void> | void;
}

const DEFAULTS: UserDialogValues = {
  type: 'coach',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  is_active: true,
  password: '',
  confirm_password: '',
  company_name: '',
  company_address_name: '',
  company_address_city: '',
  company_address_code: '',
  company_address_country: '',
  address_name: '',
  address_city: '',
  address_code: '',
  address_country: '',
};

export function UserDialog({ open, mode, initial, onClose, onSubmit }: UserDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const isEdit = mode === 'edit';
  const [values, setValues] = React.useState<UserDialogValues>(DEFAULTS);
  const formatDate = useDateFormatter();


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
        type: initial.type ?? 'coach',
        first_name: initial.first_name ?? '',
        last_name: initial.last_name ?? '',
        email: initial.email ?? '',
        phone: initial.phone ?? '',
        is_active: initial.is_active,
        password: '',
        confirm_password: '',
        company_name: initial.company?.name ?? '',
        company_address_name: initial.company?.address?.name ?? '',
        company_address_city: initial.company?.address?.city ?? '',
        company_address_code: initial.company?.address?.code ?? '',
        company_address_country: initial.company?.address?.country ?? '',
        address_name: initial.address?.name ?? '',
        address_city: initial.address?.city ?? '',
        address_code: initial.address?.code ?? '',
        address_country: initial.address?.country ?? '',
      });
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
    <Dialog open={open} onClose={onClose} aria-labelledby="user-dialog-title" fullWidth maxWidth="sm">
      <DialogTitle id="user-dialog-title">{isEdit ? t('users.dialog.edit_title') : t('users.dialog.create_title')}</DialogTitle>
      <DialogContent>
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>

          {/* Section 1: Automatic Fields (Read-only) - Edit Mode Only */}
          {isEdit && initial && (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('users.sections.info')}</Typography>
              <Stack spacing={1.5} sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Stack flex={1} spacing={0.25}>
                    <Typography variant="caption" color="text.secondary">ID</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{initial.id}</Typography>
                  </Stack>
                  <Stack flex={1} spacing={0.25}>
                    <Typography variant="caption" color="text.secondary">{t('common.labels.creator')}</Typography>
                    <Typography variant="body2">{initial.createdBy || '-'}</Typography>
                  </Stack>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Stack flex={1} spacing={0.25}>
                    <Typography variant="caption" color="text.secondary">{t('common.labels.created')}</Typography>
                    <Typography variant="body2">{formattedCreatedAt}</Typography>
                  </Stack>
                  <Stack flex={1} spacing={0.25}>
                    <Typography variant="caption" color="text.secondary">{t('common.labels.updated')}</Typography>
                    <Typography variant="body2">{formattedUpdatedAt}</Typography>
                  </Stack>
                </Stack>
              </Stack>
              <Divider />
            </>
          )}

          {/* Section 2: General */}
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('users.sections.general')}</Typography>

          <TextField select label={t('common.labels.type')} name="type" value={values.type} onChange={onChange} required fullWidth>
            {['coach', 'athlete', 'admin'].map((k) => (
              <MenuItem key={k} value={k}>{t(`users.types.${k}`)}</MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label={t('common.labels.first_name')} name="first_name" value={values.first_name} onChange={onChange} required fullWidth />
            <TextField label={t('common.labels.last_name')} name="last_name" value={values.last_name} onChange={onChange} required fullWidth />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label={t('common.labels.email')} name="email" type="email" value={values.email} onChange={onChange} required fullWidth />
            <TextField label={t('common.labels.phone')} name="phone" value={values.phone} onChange={onChange} fullWidth />
          </Stack>

          {!isEdit && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label={t('common.labels.password')} name="password" type="password" value={values.password} onChange={onChange} required fullWidth />
              <TextField label={t('common.labels.confirm_password')} name="confirm_password" type="password" value={values.confirm_password} onChange={onChange} fullWidth />
            </Stack>
          )}

          <FormControlLabel
            control={<Switch checked={values.is_active} onChange={(_, c) => setValues(v => ({ ...v, is_active: c }))} />}
            label={t('common.status.active')}
          />

          <Divider />

          {/* Section 3: Address */}
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('users.sections.address')}</Typography>
          <Stack spacing={2}>
            <TextField label={t('common.labels.address_name')} name="address_name" value={values.address_name} onChange={onChange} fullWidth />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label={t('common.labels.address_city')} name="address_city" value={values.address_city} onChange={onChange} fullWidth />
              <TextField label={t('common.labels.address_code')} name="address_code" value={values.address_code} onChange={onChange} fullWidth />
            </Stack>
            <TextField label={t('common.labels.address_country')} name="address_country" value={values.address_country} onChange={onChange} fullWidth />
          </Stack>

          <Divider />

          {/* Section 4: Company */}
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('users.sections.company')}</Typography>
          <TextField label={t('common.labels.company')} name="company_name" value={values.company_name} onChange={onChange} fullWidth />
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label={t('common.labels.address_name')} name="company_address_name" value={values.company_address_name} onChange={onChange} fullWidth />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label={t('common.labels.address_city')} name="company_address_city" value={values.company_address_city} onChange={onChange} fullWidth />
              <TextField label={t('common.labels.address_code')} name="company_address_code" value={values.company_address_code} onChange={onChange} fullWidth />
            </Stack>
            <TextField label={t('common.labels.address_country')} name="company_address_country" value={values.company_address_country} onChange={onChange} fullWidth />
          </Stack>

          <DialogActions sx={{ px: 0, pt: 2 }}>
            <Button onClick={onClose} color="inherit">{t('common.buttons.cancel')}</Button>
            <Button type="submit" variant="contained">{isEdit ? t('common.buttons.save') : t('common.buttons.create')}</Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
