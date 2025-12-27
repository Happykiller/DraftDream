import * as React from 'react';
import { Box } from '@mui/material';

import { ProgramRecordDialog } from '@components/programs/ProgramRecordDialog';
import { ProgramRecordTable } from '@components/programs/ProgramRecordTable';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useProgramRecords, type ProgramRecordState } from '@hooks/useProgramRecords';
import { useTabParams } from '@hooks/useTabParams';

const DEFAULT_FILTERS = { userId: '', programId: '', state: '' as ProgramRecordState | '' };

export function ProgramRecordsPanel(): React.JSX.Element {
  const { page, limit, setPage, setLimit } = useTabParams('program_record');
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);
  const debouncedUserId = useDebouncedValue(filters.userId, 300);
  const debouncedProgramId = useDebouncedValue(filters.programId, 300);

  const { items, total, loading, create, update } = useProgramRecords({
    page,
    limit,
    userId: debouncedUserId || undefined,
    programId: debouncedProgramId || undefined,
    state: filters.state || undefined,
  });

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const editing = React.useMemo(() => items.find((item) => item.id === editId) ?? null, [items, editId]);

  return (
    <Box>
      {/* General information */}
      <ProgramRecordTable
        rows={items}
        total={total}
        page={page}
        limit={limit}
        loading={loading}
        filters={filters}
        onCreate={() => setOpenCreate(true)}
        onEdit={(row) => setEditId(row.id)}
        onFiltersChange={setFilters}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <ProgramRecordDialog
        open={openCreate}
        mode="create"
        onClose={() => setOpenCreate(false)}
        onSubmit={(values) => create(values)}
      />

      <ProgramRecordDialog
        open={!!editId}
        mode="edit"
        initial={editing}
        onClose={() => setEditId(null)}
        onSubmit={(values) => (editId ? update({ id: editId, state: values.state }) : undefined)}
      />
    </Box>
  );
}
