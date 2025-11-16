// src/pages/clients/ClientEdit.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Alert, Button, Stack } from '@mui/material';

import {
  ClientFormPanel,
  useClientFormValues,
  type ClientFormCopy,
  type ClientFormValues,
} from '@components/clients/ClientFormPanel';

import { useClientMetadataOptions } from '@hooks/clients/useClientMetadataOptions';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';

import { clientUpdate } from '@services/graphql/clients.service';

import type { ClientEditLoaderData } from './ClientEdit.loader';
import { buildClientUpdateInput } from './clientFormMappers';

/** Editing screen for existing client records. */
export function ClientEdit(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loaderData = useLoaderData() as ClientEditLoaderData;
  const metadata = useClientMetadataOptions();
  const { execute } = useAsyncTask();
  const flashSuccess = useFlashStore((state) => state.success);
  const flashError = useFlashStore((state) => state.error);
  const [submitting, setSubmitting] = React.useState(false);

  const copy = React.useMemo(
    () =>
      t('clients.form', {
        returnObjects: true,
      }) as ClientFormCopy,
    [t],
  );

  if (loaderData.status !== 'success' || !loaderData.client) {
    return (
      <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
        <Alert severity="error">{t('clients.form.not_found')}</Alert>
        <Button variant="contained" onClick={() => navigate('/clients')}>
          {t('clients.actions.back_to_list')}
        </Button>
      </Stack>
    );
  }

  const initialValues = useClientFormValues(loaderData.client);

  const handleSubmit = React.useCallback(
    async (values: ClientFormValues) => {
      setSubmitting(true);
      try {
        await execute(() => clientUpdate(buildClientUpdateInput(loaderData.client!.id, values)));
        flashSuccess(t('clients.notifications.update_success'));
        navigate('/clients');
      } catch (error) {
        console.error('[ClientEdit] Failed to update client', error);
        flashError(t('clients.notifications.update_failure'));
      } finally {
        setSubmitting(false);
      }
    },
    [execute, flashError, flashSuccess, loaderData.client, navigate, t],
  );

  const handleCancel = React.useCallback(() => {
    navigate('/clients');
  }, [navigate]);

  return (
    <ClientFormPanel
      mode="edit"
      initialValues={initialValues}
      metadata={{
        statuses: metadata.statuses,
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
