// src/pages/Programs.tsx
import * as React from 'react';
import { Box, Stack, Tabs, Tab, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useCategories } from '@src/hooks/useCategories';
import { CategoryDialog } from '@src/components/programs/CategoryDialog';
import { ConfirmDialog } from '@src/components/common/ConfirmDialog';
import { useDebouncedValue } from '@src/hooks/useDebouncedValue';

import { CategoryTable } from '@src/components/programs/CategoryTable';

export function Programs(): React.JSX.Element {
  const [params, setParams] = useSearchParams();

  const tab = (params.get('tab') || 'categories') as string;
  const page = parseInt(params.get('page') || '1', 10);
  const limit = parseInt(params.get('limit') || '10', 10);
  const qParam = params.get('q') || '';
  const [searchInput, setSearchInput] = React.useState(qParam);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const { items, total, loading, create, update, remove } = useCategories({ page, limit, q: qParam });

  // Dialog states
  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const editing = React.useMemo(() => items.find((i) => i.id === editId), [items, editId]);

  // URL helpers
  const setTab = (val: string) => { params.set('tab', val); setParams(params, { replace: true }); };
  const setPage = (p: number) => { params.set('page', String(p)); setParams(params, { replace: true }); };
  const setLimit = (l: number) => { params.set('limit', String(l)); params.set('page', '1'); setParams(params, { replace: true }); };

  React.useEffect(() => {
    if (debouncedSearch !== qParam) {
      debouncedSearch ? params.set('q', debouncedSearch) : params.delete('q');
      params.set('page', '1');
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <Stack spacing={3} sx={{ mt: 3, width: '100%' }}>
      <Box>
        <Typography variant="body2" color="text.secondary">
          Manage taxonomies and building blocks used by programs.
        </Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="Programs domain tabs" variant="scrollable" scrollButtons="auto">
        <Tab value="programs" label="Programs" />
        <Tab value="sessions" label="Sessions" />
        <Tab value="exercices" label="Exercices" />
        <Tab value="categories" label="Categories" />
        <Tab value="muscles" label="Muscles" />
        <Tab value="tags" label="Tags" />
        <Tab value="equipment" label="Equipment" />
      </Tabs>

      {tab === 'categories' && (
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
      )}

      {tab !== 'categories' && (
        <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="body2">{tab} management coming next (same pattern: table + dialogs).</Typography>
        </Box>
      )}

      <CategoryDialog
        open={openCreate}
        mode="create"
        onClose={() => setOpenCreate(false)}
        onSubmit={(v) => create({ slug: v.slug, locale: v.locale, visibility: v.visibility })}
      />

      <CategoryDialog
        open={!!editId}
        mode="edit"
        initial={editing}
        onClose={() => setEditId(null)}
        onSubmit={(v) => (editId ? update({ id: editId, slug: v.slug, locale: v.locale }) : undefined)}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete category"
        message="This action cannot be undone."
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) remove(deleteId).finally(() => setDeleteId(null)); }}
        confirmLabel="Delete"
      />
    </Stack>
  );
}
