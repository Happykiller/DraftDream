// ⚠️ Comment in English: Self-contained Users panel with its own URL params (usr_*).
import * as React from 'react';
import { Box } from '@mui/material';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useTabParams } from '@hooks/useTabParams';
import { useUsers } from '@hooks/useUsers';
import { UsersTable } from '@components/users/UsersTable';
import { UserDialog, type UserDialogValues } from '@components/users/UserDialog';
import { ConfirmDialog } from '@components/common/ConfirmDialog';

export function UsersPanel(): React.JSX.Element {
  const { page, limit, q, type, setPage, setLimit, setQ, setType } = useTabParams('usr');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);
  React.useEffect(() => { if (debounced !== q) setQ(debounced); }, [debounced, q, setQ]);

  const { items, total, loading, create, update, remove } = useUsers({
    page,
    limit,
    q,
    type: type as 'athlete' | 'coach' | 'admin' | undefined
  });

  // Dialog states
  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const editing = React.useMemo(() => items.find((i) => i.id === editId), [items, editId]);

  // Create handler: map dialog values → GQL input
  const handleCreate = async (v: UserDialogValues) => {
    await create({
      type: v.type,
      first_name: v.first_name,
      last_name: v.last_name,
      email: v.email,
      phone: v.phone || undefined,
      password: v.password || '',
      confirm_password: v.confirm_password || undefined,
      is_active: v.is_active,
      company: v.company_name ? { name: v.company_name } : undefined,
      address: v.address_name || v.address_city || v.address_code || v.address_country
        ? {
          name: v.address_name || '',
          city: v.address_city || '',
          code: v.address_code || '',
          country: v.address_country || '',
        }
        : undefined,
    });
  };

  // Update handler: map dialog values → GQL input (no password)
  const handleUpdate = async (v: UserDialogValues) => {
    if (!editId) return;
    await update({
      id: editId,
      type: v.type,
      first_name: v.first_name,
      last_name: v.last_name,
      email: v.email,
      phone: v.phone || undefined,
      is_active: v.is_active,
      company: v.company_name ? { name: v.company_name } : undefined,
      address: v.address_name || v.address_city || v.address_code || v.address_country
        ? {
          name: v.address_name || '',
          city: v.address_city || '',
          code: v.address_code || '',
          country: v.address_country || '',
        }
        : undefined,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await remove(deleteId);
    setDeleteId(null);
  };

  return (
    <Box>
      <UsersTable
        rows={items}
        total={total}
        page={page}
        limit={limit}
        q={searchInput}
        type={type}
        loading={loading}
        onCreate={() => setOpenCreate(true)}
        onEdit={(row) => setEditId(row.id)}
        onDelete={(row) => setDeleteId(row.id)}
        onQueryChange={setSearchInput}
        onTypeChange={setType}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <UserDialog
        open={openCreate}
        mode="create"
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreate}
      />

      <UserDialog
        open={!!editId}
        mode="edit"
        initial={editing}
        onClose={() => setEditId(null)}
        onSubmit={handleUpdate}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
