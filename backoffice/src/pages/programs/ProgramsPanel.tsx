// src/pages/programs/ProgramsPanel.tsx
import * as React from 'react';
import { Box } from '@mui/material';

import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useTabParams } from '@hooks/useTabParams';
import { usePrograms } from '@hooks/usePrograms';
import { useSessions } from '@hooks/useSessions';
import { useUsers } from '@hooks/useUsers';
import { ProgramTable } from '@components/programs/ProgramTable';
import { ProgramDialog, type ProgramSessionOption, type ProgramDialogValues, type ProgramUserOption } from '@components/programs/ProgramDialog';
import { ConfirmDialog } from '@components/common/ConfirmDialog';

export function ProgramsPanel(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('prog');
  const [searchInput, setSearchInput] = React.useState(q);
  const [userFilter, setUserFilter] = React.useState<ProgramUserOption | null>(null);
  const debounced = useDebouncedValue(searchInput, 300);

  React.useEffect(() => {
    if (debounced !== q) setQ(debounced);
  }, [debounced, q, setQ]);

  const { items, total, loading, create, update, remove } = usePrograms({ page, limit, q, userId: userFilter?.id });
  const { items: sessionItems } = useSessions({ page: 1, limit: 200, q: '' });
  const { items: userItems } = useUsers({ page: 1, limit: 200, q: '' });

  const sessionOptions = React.useMemo<ProgramSessionOption[]>(
    () =>
      sessionItems.map((session) => ({
        id: session.id,
        slug: session.slug,
        title: session.title,
        locale: session.locale,
        durationMin: session.durationMin,
      })),
    [sessionItems]
  );

  const userOptions = React.useMemo<ProgramUserOption[]>(
    () => userItems.map(u => ({ id: u.id, email: u.email })),
    [userItems]
  );

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const editing = React.useMemo(() => items.find((program) => program.id === editId) ?? null, [items, editId]);

  const toCreateInput = (values: ProgramDialogValues) => ({
    name: values.name,
    duration: values.duration,
    frequency: values.frequency,
    description: values.description ? values.description : undefined,
    sessionIds: values.sessions.map((session) => session.id),
    userId: values.user?.id ?? undefined,
  });

  const toUpdateInput = (id: string, values: ProgramDialogValues) => ({
    id,
    name: values.name,
    duration: values.duration,
    frequency: values.frequency,
    description: values.description ? values.description : undefined,
    sessionIds: values.sessions.map((session) => session.id),
    userId: values.user?.id ?? undefined,
  });

  return (
    <Box>
      <ProgramTable
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
        userOptions={userOptions}
        userFilter={userFilter}
        onUserFilterChange={setUserFilter}
      />

      <ProgramDialog
        open={openCreate}
        mode="create"
        sessionOptions={sessionOptions}
        userOptions={userOptions}
        onClose={() => setOpenCreate(false)}
        onSubmit={(values) => create(toCreateInput(values))}
      />

      <ProgramDialog
        open={!!editId}
        mode="edit"
        initial={editing}
        sessionOptions={sessionOptions}
        userOptions={userOptions}
        onClose={() => setEditId(null)}
        onSubmit={(values) => {
          if (!editId) return undefined;
          return update(toUpdateInput(editId, values));
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete program"
        message="This action cannot be undone."
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            remove(deleteId).finally(() => setDeleteId(null));
          }
        }}
        confirmLabel="Delete"
      />
    </Box>
  );
}
