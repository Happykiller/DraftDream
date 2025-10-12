// src/pages/programs/CategoriesPanel.tsx
import * as React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTabParams } from '@hooks/useTabParams';
import { useCategories } from '@hooks/useCategories';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { CategoryTable } from '@components/programs/CategoryTable';
import { CategoryDialog } from '@components/programs/CategoryDialog';

export function CategoriesPanel(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('cat');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);
  React.useEffect(() => { if (debounced !== q) setQ(debounced); }, [debounced, q, setQ]);

  const { items, total, loading, create, update, remove } = useCategories({ page, limit, q });
  const { t } = useTranslation();

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const editing = React.useMemo(() => items.find(i => i.id === editId), [items, editId]);

  return (
    <Box>
      <CategoryTable
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

      <CategoryDialog
        open={openCreate}
        mode="create"
        onClose={() => setOpenCreate(false)}
        onSubmit={(v) => create({ slug: v.slug, label: v.label, locale: v.locale, visibility: v.visibility })}
      />
      <CategoryDialog
        open={!!editId}
        mode="edit"
        initial={editing}
        onClose={() => setEditId(null)}
        onSubmit={(v) => editId ? update({ id: editId, slug: v.slug, label: v.label, locale: v.locale }) : undefined}
      />
      <ConfirmDialog
        open={!!deleteId}
        title={t('programs.categories.confirm.delete_title')}
        message={t('common.messages.confirm_deletion_warning')}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) remove(deleteId).finally(() => setDeleteId(null)); }}
        confirmLabel={t('common.buttons.delete')}
      />
    </Box>
  );
}
