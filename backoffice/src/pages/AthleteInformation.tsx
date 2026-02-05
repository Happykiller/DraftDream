// src/pages/AthleteInformation.tsx
import * as React from 'react';
import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { AthleteInformationDialog, type AthleteInformationUserOption } from '@components/athletes/AthleteInformationDialog';
import { AthleteInformationTable } from '@components/athletes/AthleteInformationTable';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { type AthleteInfo, useAthleteInfos } from '@hooks/useAthleteInfos';
import { useProspectMetadataOptions } from '@hooks/useProspectMetadataOptions';
import { useTabParams } from '@hooks/useTabParams';
import { useUsers } from '@hooks/useUsers';

export function AthleteInformation(): React.JSX.Element {
  const { t } = useTranslation();
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('athinfo');
  const [searchInput, setSearchInput] = React.useState(q);
  const [editing, setEditing] = React.useState<AthleteInfo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<'create' | 'edit'>('edit');
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const debounced = useDebouncedValue(searchInput, 300);
  React.useEffect(() => {
    if (debounced !== q) setQ(debounced);
  }, [debounced, q, setQ]);

  const { items, total, loading, create, update, remove, reload } = useAthleteInfos({
    page,
    limit,
    q: debounced,
  });
  const metadata = useProspectMetadataOptions();
  const { items: athleteItems } = useUsers({ page: 1, limit: 200, q: '', type: 'athlete' });
  const athleteOptions = React.useMemo<AthleteInformationUserOption[]>(
    () =>
      athleteItems.map((user) => ({
        id: user.id,
        email: user.email,
        fullName: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email,
      })),
    [athleteItems],
  );

  const handleEdit = (row: AthleteInfo) => {
    setEditing(row);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditing(null);
    setDialogMode('create');
    setIsDialogOpen(true);
  };

  const handleDelete = (row: AthleteInfo) => {
    setDeleteId(row.id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await remove(deleteId);
    setDeleteId(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditing(null);
  };

  return (
    <Stack spacing={2} sx={{ mt: 3, width: '100%' }}>
      {/* General information */}
      <AthleteInformationTable
        rows={items}
        total={total}
        page={page}
        limit={limit}
        query={searchInput}
        loading={loading}
        onQueryChange={setSearchInput}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={reload}
      />
      <AthleteInformationDialog
        open={isDialogOpen}
        mode={dialogMode}
        initial={editing}
        athleteOptions={athleteOptions}
        levels={metadata.levels}
        objectives={metadata.objectives}
        activityPreferences={metadata.activityPreferences}
        loadingOptions={metadata.loading}
        onClose={handleDialogClose}
        onSubmit={async (values) => {
          if (dialogMode === 'create') {
            if (!values.athlete) return;
            await create({
              userId: values.athlete.id,
              levelId: values.levelId ?? null,
              objectiveIds: values.objectiveIds,
              activityPreferenceIds: values.activityPreferenceIds,
              medicalConditions: values.medicalConditions ?? null,
              allergies: values.allergies ?? null,
              notes: values.notes ?? null,
            });
            return;
          }
          if (!editing) return;
          await update({
            id: editing.id,
            userId: editing.userId,
            levelId: values.levelId ?? null,
            objectiveIds: values.objectiveIds,
            activityPreferenceIds: values.activityPreferenceIds,
            medicalConditions: values.medicalConditions ?? null,
            allergies: values.allergies ?? null,
            notes: values.notes ?? null,
          });
        }}
      />
      <ConfirmDialog
        open={Boolean(deleteId)}
        title={t('athletes.information.confirm.delete_title')}
        message={t('athletes.information.confirm.delete_message')}
        confirmLabel={t('athletes.information.confirm.delete_confirm')}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </Stack>
  );
}
