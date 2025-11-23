// src/pages/prospects/ProspectEdit.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Alert, Button, Stack } from '@mui/material';

import { ProspectFormPanel, type ProspectFormCopy } from '@components/prospects/ProspectFormPanel';
import { useProspectFormValues, type ProspectFormValues } from '@components/prospects/prospectFormValues';

import { useProspectMetadataOptions } from '@hooks/prospects/useProspectMetadataOptions';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';

import { prospectUpdate } from '@services/graphql/prospects.service';

import type { ProspectEditLoaderData } from './ProspectEdit.loader';
import { buildProspectUpdateInput } from './prospectFormMappers';

/** Editing screen for existing prospect records. */
export function ProspectEdit(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loaderData = useLoaderData() as ProspectEditLoaderData;
  const metadata = useProspectMetadataOptions();
  const hasProspect = loaderData.status === 'success' && Boolean(loaderData.prospect);
  const prospect = hasProspect ? loaderData.prospect : null;
  const prospectId = prospect?.id ?? null;
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
      if (!prospectId) {
        return;
      }
      setSubmitting(true);
      try {
        await execute(() => prospectUpdate(buildProspectUpdateInput(prospectId, values)));
        flashSuccess(t('prospects.notifications.update_success'));
        navigate('/prospects');
      } catch (error) {
        console.error('[ProspectEdit] Failed to update prospect', error);
        flashError(t('prospects.notifications.update_failure'));
      } finally {
        setSubmitting(false);
      }
    },
    [prospectId, execute, flashError, flashSuccess, navigate, t],
  );

  const handleCancel = React.useCallback(() => {
    navigate('/prospects');
  }, [navigate]);

  if (!hasProspect) {
    return (
      <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
        <Alert severity="error">{t('prospects.form.not_found')}</Alert>
        <Button variant="contained" onClick={() => navigate('/prospects')}>
          {t('prospects.actions.back_to_list')}
        </Button>
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
