// src/pages/prospects/ProspectEdit.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Stack,
} from '@mui/material';
import { ResponsiveButton } from '@components/common/ResponsiveButton';

import { ProspectFormPanel, type ProspectFormCopy } from '@components/prospects/ProspectFormPanel';
import { useProspectFormValues, type ProspectFormValues } from '@components/prospects/prospectFormValues';

import { useProspect } from '@hooks/prospects/useProspect';
import { useProspectMetadataOptions } from '@hooks/prospects/useProspectMetadataOptions';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';

import { prospectUpdate } from '@services/graphql/prospects.service';

import { buildProspectUpdateInput } from './prospectFormMappers';

/** Editing screen for existing prospect records. */
export function ProspectEdit(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { prospectId } = useParams<{ prospectId: string }>();
  const { prospect, loading, error } = useProspect({ prospectId });
  const metadata = useProspectMetadataOptions();
  const initialValues = useProspectFormValues(prospect);
  const { execute } = useAsyncTask();
  const flashSuccess = useFlashStore((state) => state.success);
  const flashError = useFlashStore((state) => state.error);
  const [submitting, setSubmitting] = React.useState(false);
  const copy = React.useMemo(
    () =>
      t('prospects.form', {
        returnObjects: true,
      }) as ProspectFormCopy,
    [t],
  );

  const handleSubmit = React.useCallback(
    async (values: ProspectFormValues) => {
      if (!prospect?.id) {
        return;
      }
      setSubmitting(true);
      try {
        await execute(() => prospectUpdate(buildProspectUpdateInput(prospect.id, values)));
        flashSuccess(t('prospects.notifications.update_success'));
        navigate('/prospects');
      } catch (error) {
        console.error('[ProspectEdit] Failed to update prospect', error);
        flashError(t('prospects.notifications.update_failure'));
      } finally {
        setSubmitting(false);
      }
    },
    [prospect, execute, flashError, flashSuccess, navigate, t],
  );

  const handleCancel = React.useCallback(() => {
    navigate('/prospects');
  }, [navigate]);

  if (loading) {
    return <></>; // Global loader overlay will show
  }

  if (error || !prospect) {
    return (
      <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
        <Alert severity="error">{error || t('prospects.form.not_found')}</Alert>
        <ResponsiveButton variant="contained" onClick={() => navigate('/prospects')}>
          {t('prospects.actions.back_to_list')}
        </ResponsiveButton>
      </Stack>
    );
  }

  return (
    <ProspectFormPanel
      mode="edit"
      initialValues={initialValues}
      metadata={{
        levels: metadata.levels,
        sources: metadata.sources,
        objectives: metadata.objectives,
        activityPreferences: metadata.activityPreferences,
      }}
      metadataLoading={metadata.loading}
      submitting={submitting}
      copy={copy}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
  );
}