// src/pages/programs/EquipmentPanel.tsx
import * as React from 'react';
import { Box } from '@mui/material';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useTabParams } from '@hooks/useTabParams';
import { useEquipment } from '@hooks/useEquipment';
import { EquipmentTable } from '@components/programs/EquipmentTable';
import { EquipmentDialog } from '@components/programs/EquipmentDialog';
import { ConfirmDialog } from '@components/common/ConfirmDialog';

export function EquipmentPanel(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('eqp');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);
  React.useEffect(() => { if (debounced !== q) setQ(debounced); }, [debounced, q, setQ]);

  const { items, total, loading, create, update, remove } = useEquipment({ page, limit, q });

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const editing = React.useMemo(() => items.find(i => i.id === editId), [items, editId]);

  return (
    <Box>
      <EquipmentTable
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

      <EquipmentDialog
        open={openCreate}
        mode="create"
        onClose={() => setOpenCreate(false)}
        onSubmit={(v) => create({ slug: v.slug, locale: v.locale, visibility: v.visibility })}
      />
      <EquipmentDialog
        open={!!editId}
        mode="edit"
        initial={editing}
        onClose={() => setEditId(null)}
        onSubmit={(v) => editId ? update({ id: editId, slug: v.slug, locale: v.locale }) : undefined}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete equipment"
        message="This action cannot be undone."
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) remove(deleteId).finally(() => setDeleteId(null)); }}
        confirmLabel="Delete"
      />
    </Box>
  );
}
