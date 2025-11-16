// src/pages/clients/ClientCreate.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  ClientFormPanel,
  useClientFormValues,
  type ClientFormCopy,
  type ClientFormValues,
} from '@components/clients/ClientFormPanel';

import { useClientMetadataOptions } from '@hooks/clients/useClientMetadataOptions';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';

import { clientCreate } from '@services/graphql/clients.service';

import { buildClientCreateInput } from './clientFormMappers';

/** Creation screen for client records. */
export function ClientCreate(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const metadata = useClientMetadataOptions();
  const initialValues = useClientFormValues(null);
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

  const handleSubmit = React.useCallback(
    async (values: ClientFormValues) => {
      setSubmitting(true);
      try {
        await execute(() => clientCreate(buildClientCreateInput(values)));
        flashSuccess(t('clients.notifications.create_success'));
        navigate('/clients');
      } catch (error) {
        console.error('[ClientCreate] Failed to create client', error);
        flashError(t('clients.notifications.create_failure'));
      } finally {
        setSubmitting(false);
      }
    },
    [execute, flashError, flashSuccess, navigate, t],
  );

  const handleCancel = React.useCallback(() => {
    navigate('/clients');
  }, [navigate]);

  return (
    <ClientFormPanel
      mode="create"
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
