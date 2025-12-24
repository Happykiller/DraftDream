// src/pages/AthleteInformation.tsx
import * as React from 'react';
import { Stack } from '@mui/material';

import { AthleteInformationDialog } from '@components/athletes/AthleteInformationDialog';
import { AthleteInformationTable } from '@components/athletes/AthleteInformationTable';
import { type AthleteInfo, useAthleteInfos } from '@hooks/useAthleteInfos';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useProspectMetadataOptions } from '@hooks/useProspectMetadataOptions';
import { useTabParams } from '@hooks/useTabParams';

export function AthleteInformation(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('athinfo');
  const [searchInput, setSearchInput] = React.useState(q);
  const [editing, setEditing] = React.useState<AthleteInfo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const debounced = useDebouncedValue(searchInput, 300);
  React.useEffect(() => {
    if (debounced !== q) setQ(debounced);
  }, [debounced, q, setQ]);

  const { items, total, loading, update } = useAthleteInfos({
    page,
    limit,
    q: debounced,
  });
  const metadata = useProspectMetadataOptions();

  const handleEdit = (row: AthleteInfo) => {
    setEditing(row);
    setIsDialogOpen(true);
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
        onEdit={handleEdit}
      />
      <AthleteInformationDialog
        open={isDialogOpen}
        initial={editing}
        levels={metadata.levels}
        objectives={metadata.objectives}
        activityPreferences={metadata.activityPreferences}
        loadingOptions={metadata.loading}
        onClose={handleDialogClose}
        onSubmit={async (values) => {
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
    </Stack>
  );
}
