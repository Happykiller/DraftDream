import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';

import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { ProgramRecordDialog } from '@components/programs/ProgramRecordDialog';
import { ProgramRecordTable } from '@components/programs/ProgramRecordTable';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useProgramRecords, type ProgramRecordState } from '@hooks/useProgramRecords';
import { usePrograms } from '@hooks/usePrograms';
import { useTabParams } from '@hooks/useTabParams';
import { useUsers } from '@hooks/useUsers';

const DEFAULT_FILTERS = { userId: '', programId: '', state: '' as ProgramRecordState | '' };

export function ProgramRecordsPanel(): React.JSX.Element {
  const { t } = useTranslation();
  const { page, limit, setPage, setLimit } = useTabParams('program_record');
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);
  const debouncedUserId = useDebouncedValue(filters.userId, 300);
  const debouncedProgramId = useDebouncedValue(filters.programId, 300);

  const { items, total, loading, create, update, deleteRecord, hardDeleteRecord } = useProgramRecords({
    page,
    limit,
    userId: debouncedUserId || undefined,
    programId: debouncedProgramId || undefined,
    state: filters.state || undefined,
  });

  const { items: programs } = usePrograms({ page: 1, limit: 100, q: '' });
  const { items: users } = useUsers({ page: 1, limit: 100, q: '', type: 'athlete' });

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleteType, setDeleteType] = React.useState<'soft' | 'hard' | null>(null);
  const editing = React.useMemo(() => items.find((item) => item.id === editId) ?? null, [items, editId]);

  const handleDeleteCallback = (id: string, type: 'soft' | 'hard') => {
    setDeleteId(id);
    setDeleteType(type);
  };

  return (
    <Box>
      <ProgramRecordTable
        rows={items}
        total={total}
        page={page}
        limit={limit}
        loading={loading}
        filters={filters}
        programs={programs}
        users={users}
        onCreate={() => setOpenCreate(true)}
        onEdit={(row) => setEditId(row.id)}
        onDelete={(row) => handleDeleteCallback(row.id, 'soft')}
        onHardDelete={(row) => handleDeleteCallback(row.id, 'hard')}
        onFiltersChange={setFilters}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <ProgramRecordDialog
        open={openCreate}
        mode="create"
        programs={programs}
        users={users}
        onClose={() => setOpenCreate(false)}
        onSubmit={(values) => create(values)}
      />

      <ProgramRecordDialog
        open={!!editId}
        mode="edit"
        initial={editing}
        programs={programs}
        users={users}
        onClose={() => setEditId(null)}
        onSubmit={(values) => (editId ? update({ id: editId, state: values.state }) : undefined)}
      />

      <ConfirmDialog
        open={!!deleteId}
        title={deleteType === 'hard' ? t('common.buttons.delete') : t('programs.records.dialog.delete_title', 'Supprimer l\'enregistrement')}
        message={
          deleteType === 'hard'
            ? t('common.messages.confirm_deletion_warning')
            : t('common.messages.are_you_sure')
        }
        confirmLabel={deleteType === 'hard' ? t('common.buttons.delete') : t('common.buttons.confirm')}
        onClose={() => {
          setDeleteId(null);
          setDeleteType(null);
        }}
        onConfirm={async () => {
          if (deleteId && deleteType) {
            if (deleteType === 'hard') {
              await hardDeleteRecord(deleteId);
            } else {
              await deleteRecord(deleteId);
            }
            setDeleteId(null);
            setDeleteType(null);
          }
        }}
      />
    </Box>
  );
}
