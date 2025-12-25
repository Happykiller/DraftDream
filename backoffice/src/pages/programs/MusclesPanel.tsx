import * as React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useTabParams } from '@hooks/useTabParams';
import { useMuscles } from '@hooks/useMuscles';
import { MuscleTable } from '@components/programs/MuscleTable';
import { MuscleDialog } from '@components/programs/MuscleDialog';
import { ConfirmDialog } from '@components/common/ConfirmDialog';

export function MusclesPanel(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('mus');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);
  React.useEffect(() => { if (debounced !== q) setQ(debounced); }, [debounced, q, setQ]);

  const { items, total, loading, create, update, remove } = useMuscles({ page, limit, q });
  const { t } = useTranslation();

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const editing = React.useMemo(() => items.find(i => i.id === editId), [items, editId]);

  return (
    <Box>
      {/* General information */}
      <MuscleTable
        rows={items}
        total={total}
        page={page}
        limit={limit}
        q={searchInput}
        loading={loading}
        onCreate={() => setOpenCreate(true)}
        onEdit={(row) => setEditId(row.id)}
        onDelete={(row) => setDeleteId(row.id)}
        onQueryChange={setSearchInput}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <MuscleDialog
        open={openCreate}
        mode="create"
        onClose={() => setOpenCreate(false)}
        onSubmit={(v) => create({ label: v.label, locale: v.locale, visibility: v.visibility })}
      />
      <MuscleDialog
        open={!!editId}
        mode="edit"
        initial={editing}
        onClose={() => setEditId(null)}
        onSubmit={(v) => editId ? update({ id: editId, label: v.label, locale: v.locale, visibility: v.visibility }) : undefined}
      />
      <ConfirmDialog
        open={!!deleteId}
        title={t('programs.muscles.confirm.delete_title')}
        message={t('common.messages.confirm_deletion_warning')}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) remove(deleteId).finally(() => setDeleteId(null)); }}
        confirmLabel={t('common.buttons.delete')}
      />
    </Box>
  );
}
