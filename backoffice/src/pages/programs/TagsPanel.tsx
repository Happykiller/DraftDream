// src/pages/programs/TagsPanel.tsx
import * as React from 'react';
import { Box } from '@mui/material';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useTabParams } from '@hooks/useTabParams';
import { useTags } from '@hooks/useTags';
import { TagTable } from '@components/programs/TagTable';
import { TagDialog } from '@components/programs/TagDialog';
import { ConfirmDialog } from '@components/common/ConfirmDialog';

export function TagsPanel(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('tag');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);
  React.useEffect(() => { if (debounced !== q) setQ(debounced); }, [debounced, q, setQ]);

  const { items, total, loading, create, update, remove } = useTags({ page, limit, q });

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const editing = React.useMemo(() => items.find(i => i.id === editId), [items, editId]);

  return (
    <Box>
      <TagTable
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

      <TagDialog
        open={openCreate}
        mode="create"
        onClose={() => setOpenCreate(false)}
        onSubmit={(v) => create({ slug: v.slug, locale: v.locale, visibility: v.visibility })}
      />
      <TagDialog
        open={!!editId}
        mode="edit"
        initial={editing}
        onClose={() => setEditId(null)}
        onSubmit={(v) => editId ? update({ id: editId, slug: v.slug, locale: v.locale }) : undefined}
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Delete tag"
        message="This action cannot be undone."
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) remove(deleteId).finally(() => setDeleteId(null)); }}
        confirmLabel="Delete"
      />
    </Box>
  );
}
