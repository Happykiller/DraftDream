// src/components/prospects/ProspectFormPanel.tsx
import * as React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Add, Edit } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import type { ProspectMetadataOption } from '@hooks/prospects/useProspectMetadataOptions';

import { DEFAULT_PROSPECT_FORM_VALUES, type ProspectFormValues } from './prospectFormValues';

export interface ProspectFormCopy {
  title: string;
  subtitle: string;
  editTitle?: string;
  editSubtitle?: string;
  /**
   * Legacy translation keys kept for backward compatibility until
   * all dictionaries are migrated to camelCase naming.
   */
  'edit_title'?: string;
  'edit_subtitle'?: string;
  sections: {
    identity: string;
    profile: string;
    commercial: string;
    notes: string;
  };
  fields: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    level: string;
    source: string;
    objectives: string;
    objectivesHelper: string;
    activityPreferences: string;
    activityPreferencesHelper: string;
    medicalConditions: string;
    allergies: string;
    notes: string;
    budget: string;
    dealDescription: string;
    desiredStartDate: string;
    cancel: string;
    submitCreate: string;
    submitEdit: string;
  };
}

export interface ProspectFormPanelProps {
  mode: 'create' | 'edit';
  initialValues: ProspectFormValues;
  metadata: {
    levels: ProspectMetadataOption[];
    sources: ProspectMetadataOption[];
    objectives: ProspectMetadataOption[];
    activityPreferences: ProspectMetadataOption[];
  };
  metadataLoading: boolean;
  submitting: boolean;
  copy: ProspectFormCopy;
  onCancel: () => void;
  onSubmit: (values: ProspectFormValues) => Promise<void> | void;
}

/** Large form layout mirroring the nutrition/program builders for prospect workflows. */
export function ProspectFormPanel({
  mode,
  initialValues,
  metadata,
  metadataLoading,
  submitting,
  copy,
  onCancel,
  onSubmit,
}: ProspectFormPanelProps): React.JSX.Element {
  const [values, setValues] = React.useState<ProspectFormValues>(
    initialValues ?? DEFAULT_PROSPECT_FORM_VALUES,
  );
  const theme = useTheme();

  React.useEffect(() => {
    setValues(initialValues ?? DEFAULT_PROSPECT_FORM_VALUES);
  }, [initialValues]);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      await onSubmit(values);
    },
    [onSubmit, values],
  );

  const editTitle = copy.editTitle ?? copy['edit_title'];
  const editSubtitle = copy.editSubtitle ?? copy['edit_subtitle'];
  const title = mode === 'edit' ? editTitle ?? copy.title : copy.title;
  const subtitle = mode === 'edit' ? editSubtitle ?? copy.subtitle : copy.subtitle;
  const submitLabel = mode === 'edit' ? copy.fields.submitEdit : copy.fields.submitCreate;
  const HeaderIcon = mode === 'edit' ? Edit : Add;
  const brandPrimary = theme.palette.primary.main;
  const headerBackground = alpha(brandPrimary, 0.08);
  const headerBorder = alpha(brandPrimary, 0.24);
  const headerContrast = theme.palette.getContrastText(brandPrimary);

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit}
      sx={{
        minHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
        maxHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
        overflow: 'hidden',
        bgcolor: theme.palette.backgroundColor,
      }}
    >
      {/* General information */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          px: { xs: 1.5, md: 2.5 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Card
          variant="outlined"
          sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        >
          <Box
            component="header"
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: headerBorder,
              backgroundColor: headerBackground,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                aria-hidden
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: brandPrimary,
                  color: headerContrast,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <HeaderIcon />
              </Box>
              <Stack spacing={0.5}>
                <Typography variant="h6">{title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <CardContent
            sx={{
              flexGrow: 1,
              minHeight: 0,
              p: 0,
              display: 'flex',
              flexDirection: 'column',
              '&:last-child': { paddingBottom: 0 },
            }}
          >
            <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'auto', p: { xs: 2, md: 3 } }}>
              <Stack spacing={3}>
                <Stack spacing={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {copy.sections.identity}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label={copy.fields.firstName}
                        name="firstName"
                        value={values.firstName}
                        onChange={handleChange}
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label={copy.fields.lastName}
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label={copy.fields.email}
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        required
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label={copy.fields.phone}
                        name="phone"
                        value={values.phone}
                        onChange={handleChange}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Stack>

                <Divider />

                <Stack spacing={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {copy.sections.profile}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        select
                        label={copy.fields.level}
                        name="levelId"
                        value={values.levelId ?? ''}
                        onChange={(event) =>
                          setValues((prev) => ({ ...prev, levelId: event.target.value || null }))
                        }
                        fullWidth
                      >
                        <MenuItem value="">
                          <em>—</em>
                        </MenuItem>
                        {metadata.levels.map((level) => (
                          <MenuItem key={level.id} value={level.id}>
                            {level.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Autocomplete
                        multiple
                        options={metadata.objectives}
                        loading={metadataLoading}
                        value={metadata.objectives.filter((opt) =>
                          values.objectiveIds.includes(opt.id),
                        )}
                        onChange={(_, data) =>
                          setValues((prev) => ({ ...prev, objectiveIds: data.map((opt) => opt.id) }))
                        }
                        getOptionLabel={(option) => option.label}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={copy.fields.objectives}
                            helperText={copy.fields.objectivesHelper}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Autocomplete
                        multiple
                        options={metadata.activityPreferences}
                        loading={metadataLoading}
                        value={metadata.activityPreferences.filter((opt) =>
                          values.activityPreferenceIds.includes(opt.id),
                        )}
                        onChange={(_, data) =>
                          setValues((prev) => ({
                            ...prev,
                            activityPreferenceIds: data.map((opt) => opt.id),
                          }))
                        }
                        getOptionLabel={(option) => option.label}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={copy.fields.activityPreferences}
                            helperText={copy.fields.activityPreferencesHelper}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label={copy.fields.medicalConditions}
                        name="medicalConditions"
                        value={values.medicalConditions}
                        onChange={handleChange}
                        multiline
                        minRows={2}
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label={copy.fields.allergies}
                        name="allergies"
                        value={values.allergies}
                        onChange={handleChange}
                        multiline
                        minRows={2}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Stack>

                <Divider />

                <Stack spacing={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {copy.sections.commercial}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        select
                        label={copy.fields.source}
                        name="sourceId"
                        value={values.sourceId ?? ''}
                        onChange={(event) =>
                          setValues((prev) => ({ ...prev, sourceId: event.target.value || null }))
                        }
                        fullWidth
                      >
                        <MenuItem value="">
                          <em>—</em>
                        </MenuItem>
                        {metadata.sources.map((source) => (
                          <MenuItem key={source.id} value={source.id}>
                            {source.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label={copy.fields.budget}
                        name="budget"
                        type="number"
                        value={values.budget}
                        onChange={handleChange}
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label={copy.fields.desiredStartDate}
                        name="desiredStartDate"
                        type="date"
                        value={values.desiredStartDate}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        label={copy.fields.dealDescription}
                        name="dealDescription"
                        value={values.dealDescription}
                        onChange={handleChange}
                        multiline
                        minRows={2}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Stack>

                <Divider />

                <Stack spacing={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {copy.sections.notes}
                  </Typography>
                  <TextField
                    label={copy.fields.notes}
                    name="notes"
                    value={values.notes}
                    onChange={handleChange}
                    multiline
                    minRows={3}
                    fullWidth
                  />
                </Stack>
              </Stack>
            </Box>

            <Divider />

            <Box component="footer" sx={{ p: 2, backgroundColor: 'background.default' }}>
              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button color="inherit" onClick={onCancel} disabled={submitting}>
                  {copy.fields.cancel}
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={submitting}>
                  {submitting ? `${submitLabel}…` : submitLabel}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}
