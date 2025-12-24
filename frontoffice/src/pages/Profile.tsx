// src/pages/Profile.tsx
import * as React from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useTranslation } from 'react-i18next';

import { useUser } from '@hooks/useUser';
import { useMeUpdate, type UpdateMeInput, type AddressInput, type CompanyInput } from '@hooks/useMeUpdate';
import { PasswordDialog } from '@components/profile/PasswordDialog';
import { GlassCard } from '@components/common/GlassCard';

/**
 * Profile page for commercial Use.
 */
export function Profile(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const { user, reload } = useUser();
  const { updateMe, updatePassword, loading: updating } = useMeUpdate();

  const [formData, setFormData] = React.useState<UpdateMeInput>({});
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);

  // --- Language Handling (Preserved) ---
  const normalizeLanguage = React.useCallback((value: string | undefined) => value?.split('-')[0] ?? 'fr', []);

  const languagesDictionary = React.useMemo(() => {
    const dictionary = t('languages', { returnObjects: true }) as Record<string, string> | string;
    return typeof dictionary === 'string' ? {} : dictionary;
  }, [t]);

  const [language, setLanguage] = React.useState<string>(() => normalizeLanguage(i18n.language));

  React.useEffect(() => {
    setLanguage(normalizeLanguage(i18n.language));
  }, [i18n.language, normalizeLanguage]);

  const handleLanguageChange = React.useCallback(
    (event: SelectChangeEvent<string>) => {
      const nextLanguage = event.target.value;
      if (!nextLanguage || nextLanguage === language) return;
      setLanguage(nextLanguage);
      void i18n.changeLanguage(nextLanguage);
    },
    [i18n, language],
  );

  const languageOptions = React.useMemo(() => Object.entries(languagesDictionary), [languagesDictionary]);
  const activeLanguage = React.useMemo(() => {
    if (languageOptions.length === 0) return '';
    return languageOptions.some(([value]) => value === language) ? language : languageOptions[0][0];
  }, [language, languageOptions]);
  // -------------------------------------

  // Sync user data to form
  React.useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address ? {
          name: user.address.name || '',
          city: user.address.city || '',
          code: user.address.code || '',
          country: user.address.country || '',
        } : { name: '', city: '', code: '', country: '' },
        company: user.company ? {
          name: user.company.name || '',
          address: user.company.address ? {
            name: user.company.address.name || '',
            city: user.company.address.city || '',
            code: user.company.address.code || '',
            country: user.company.address.country || '',
          } : { name: '', city: '', code: '', country: '' }
        } : { name: '', address: { name: '', city: '', code: '', country: '' } }
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof UpdateMeInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof AddressInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...(prev.address as AddressInput), [field]: value },
    }));
  };

  const handleCompanyChange = (field: keyof CompanyInput | 'address', value: string | AddressInput) => {
    if (field === 'address') {
      // managed separately
      return;
    }
    setFormData((prev) => ({
      ...prev,
      company: {
        ...(prev.company || { name: '', address: null }),
        [field]: value as string,
      },
    }));
  };

  const handleCompanyAddressChange = (field: keyof AddressInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      company: {
        ...(prev.company as CompanyInput),
        address: { ...(prev.company?.address as AddressInput), [field]: value }
      }
    }));
  };

  const handleSave = async () => {
    await updateMe(formData);
    void reload();
  };

  const handlePasswordSubmit = async (password: string) => {
    await updatePassword(password);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 6, md: 10 },
        background: (theme) => theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={4}>
              {/* Personal Information */}
              <GlassCard>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  {t('profile.section.personal', 'Personal Information')}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label={t('profile.field.firstName', 'First Name')}
                      value={formData.first_name || ''}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label={t('profile.field.lastName', 'Last Name')}
                      value={formData.last_name || ''}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label={t('profile.field.email', 'Email')}
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label={t('profile.field.phone', 'Phone')}
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </Grid>

                  {/* Personal Address */}
                  <Grid size={12}>
                    <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 500 }}>
                      {t('profile.section.address', 'Address')}
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label={t('profile.field.addressName', 'Street Address')}
                      value={formData.address?.name || ''}
                      onChange={(e) => handleAddressChange('name', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      label={t('profile.field.city', 'City')}
                      value={formData.address?.city || ''}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      label={t('profile.field.code', 'Zip Code')}
                      value={formData.address?.code || ''}
                      onChange={(e) => handleAddressChange('code', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label={t('profile.field.country', 'Country')}
                      value={formData.address?.country || ''}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </GlassCard>

              {/* Company Information */}
              <GlassCard>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  {t('profile.section.company', 'Company')}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label={t('profile.field.companyName', 'Company Name')}
                      value={formData.company?.name || ''}
                      onChange={(e) => handleCompanyChange('name', e.target.value)}
                    />
                  </Grid>
                  {/* Company Address */}
                  <Grid size={12}>
                    <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 500 }}>
                      {t('profile.section.companyAddress', 'Company Address')}
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label={t('profile.field.addressName', 'Street Address')}
                      value={formData.company?.address?.name || ''}
                      onChange={(e) => handleCompanyAddressChange('name', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      label={t('profile.field.city', 'City')}
                      value={formData.company?.address?.city || ''}
                      onChange={(e) => handleCompanyAddressChange('city', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      label={t('profile.field.code', 'Zip Code')}
                      value={formData.company?.address?.code || ''}
                      onChange={(e) => handleCompanyAddressChange('code', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label={t('profile.field.country', 'Country')}
                      value={formData.company?.address?.country || ''}
                      onChange={(e) => handleCompanyAddressChange('country', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </GlassCard>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSave}
                  disabled={updating}
                >
                  {t('common.actions.save', 'Save Changes')}
                </Button>
              </Box>
            </Stack>
          </Grid>

          {/* Sidebar / Settings */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              <GlassCard>
                <Typography variant="h6" gutterBottom>
                  {t('profile.section.settings', 'Settings')}
                </Typography>
                <Stack spacing={3}>
                  <FormControl fullWidth disabled={languageOptions.length === 0}>
                    <InputLabel id="profile-language-select-label">{t('profile.language.label')}</InputLabel>
                    <Select
                      labelId="profile-language-select-label"
                      label={t('profile.language.label')}
                      value={activeLanguage}
                      onChange={handleLanguageChange}
                    >
                      {languageOptions.map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Divider />

                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    {t('profile.actions.changePassword', 'Change Password')}
                  </Button>
                </Stack>
              </GlassCard>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <PasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        onSubmit={handlePasswordSubmit}
        loading={updating}
      />
    </Box>
  );
}
