// src/pages/prospects/ProspectCreate.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ProspectFormPanel, type ProspectFormCopy } from '@components/prospects/ProspectFormPanel';
import { useProspectFormValues, type ProspectFormValues } from '@components/prospects/prospectFormValues';

import { useProspectMetadataOptions } from '@hooks/prospects/useProspectMetadataOptions';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';

import { prospectCreate } from '@services/graphql/prospects.service';

import { pipelineStatuses, ProspectStatusEnum } from '@src/commons/prospects/status';

import { buildProspectCreateInput } from './prospectFormMappers';

/** Creation screen for prospect records. */
export function ProspectCreate(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const metadata = useProspectMetadataOptions();
  const initialValues = useProspectFormValues(null);
  const { execute } = useAsyncTask();
  const flashSuccess = useFlashStore((state) => state.success);
  const flashError = useFlashStore((state) => state.error);
  const [submitting, setSubmitting] = React.useState(false);

  const initialStatus = React.useMemo<ProspectStatusEnum | null>(() => {
    const statusParam = searchParams.get('status') as ProspectStatusEnum | null;
    if (!statusParam) {
      return null;
    }

    return pipelineStatuses.includes(statusParam) ? statusParam : null;
  }, [searchParams]);

  const copy = React.useMemo(
    () =>
      t('prospects.form', {
        returnObjects: true,
      }) as ProspectFormCopy,
    [t],
  );

  const handleSubmit = React.useCallback(
    async (values: ProspectFormValues) => {
      setSubmitting(true);
      try {
        await execute(() =>
          prospectCreate({
            ...buildProspectCreateInput(values),
            status: initialStatus ?? undefined,
          }),
        );
        flashSuccess(t('prospects.notifications.create_success'));
        navigate('/prospects');
      } catch (error) {
        console.error('[ProspectCreate] Failed to create prospect', error);
        flashError(t('prospects.notifications.create_failure'));
      } finally {
        setSubmitting(false);
      }
    },
    [execute, flashError, flashSuccess, initialStatus, navigate, t],
  );

  const handleCancel = React.useCallback(() => {
    navigate('/prospects');
  }, [navigate]);

  return (
    <ProspectFormPanel
      mode="create"
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
