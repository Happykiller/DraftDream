import * as React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog } from '@components/common/ConfirmDialog';
import {
  ProspectClientDialog,
  type ProspectClientDialogValues,
} from '@components/prospects/ProspectClientDialog';
import { ProspectClientTable } from '@components/prospects/ProspectClientTable';
import { ProspectStatus } from '@commons/prospects/status';
import { useProspectMetadataOptions } from '@hooks/useProspectMetadataOptions';
import { useProspects } from '@hooks/useProspects';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useTabParams } from '@hooks/useTabParams';

export function ClientsPanel(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('pros');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);
  React.useEffect(() => {
    if (debounced !== q) setQ(debounced);
  }, [debounced, q, setQ]);

  const [statusFilter, setStatusFilter] = React.useState<ProspectStatus | null>(null);
  const [levelFilter, setLevelFilter] = React.useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = React.useState<string | null>(null);

  const { items, total, loading, create, update, remove } = useProspects({
    page,
    limit,
    q,
    status: (statusFilter as ProspectStatus | null) ?? undefined,
    levelId: levelFilter,
    sourceId: sourceFilter,
  });
  const metadata = useProspectMetadataOptions();
  const { t } = useTranslation();

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const editing = React.useMemo(() => items.find((item) => item.id === editId), [editId, items]);

  const sanitizeValues = React.useCallback(
    (values: ProspectClientDialogValues) => ({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone || undefined,
      status: values.status as ProspectStatus | undefined,
      levelId: values.levelId || undefined,
      sourceId: values.sourceId || undefined,
      objectiveIds: values.objectiveIds,
      activityPreferenceIds: values.activityPreferenceIds,
      medicalConditions: values.medicalConditions || undefined,
      allergies: values.allergies || undefined,
      notes: values.notes || undefined,
      budget: values.budget ? Number(values.budget) : undefined,
      dealDescription: values.dealDescription || undefined,
      desiredStartDate: values.desiredStartDate || undefined,
    }),
    [],
  );

  const statusOptions = React.useMemo(
    () =>
      Object.values(ProspectStatus).map((value) => ({
        value,
        label: t(`prospects.statuses.values.${value.toLowerCase()}`),
      })),
    [t],
  );


  return (
    <Box>
      {/* General information */}
      <ProspectClientTable
        rows={items}
        total={total}
        page={page}
        limit={limit}
        q={searchInput}
        statusFilter={statusFilter}
        levelFilter={levelFilter}
        sourceFilter={sourceFilter}
        statuses={statusOptions}
        levels={metadata.levels}
        sources={metadata.sources}
        loading={loading || metadata.loading}
        onCreate={() => setOpenCreate(true)}
        onEdit={(row) => setEditId(row.id)}
        onDelete={(row) => setDeleteId(row.id)}
        onQueryChange={setSearchInput}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onStatusFilterChange={setStatusFilter}
        onLevelFilterChange={setLevelFilter}
        onSourceFilterChange={setSourceFilter}
      />

      <ProspectClientDialog
        open={openCreate}
        mode="create"
        statuses={statusOptions}
        levels={metadata.levels}
        sources={metadata.sources}
        objectives={metadata.objectives}
        activityPreferences={metadata.activityPreferences}
        loadingOptions={metadata.loading}
        onClose={() => setOpenCreate(false)}
        onSubmit={async (values) => {
          await create(sanitizeValues(values));
        }}
      />

      <ProspectClientDialog
        open={!!editId && !!editing}
        mode="edit"
        initial={editing ?? undefined}
        statuses={statusOptions}
        levels={metadata.levels}
        sources={metadata.sources}
        objectives={metadata.objectives}
        activityPreferences={metadata.activityPreferences}
        loadingOptions={metadata.loading}
        onClose={() => setEditId(null)}
        onSubmit={async (values) => {
          if (!editId) return;
          await update({ id: editId, ...sanitizeValues(values) });
          setEditId(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        title={t('prospects.list.confirm.delete_title')}
        message={t('common.messages.confirm_deletion_warning')}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            remove(deleteId).finally(() => setDeleteId(null));
          }
        }}
        confirmLabel={t('common.buttons.delete')}
      />
    </Box>
  );
}
