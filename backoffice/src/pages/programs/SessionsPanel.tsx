// src/pages/programs/SessionsPanel.tsx
import * as React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useTabParams } from '@hooks/useTabParams';
import { useSessions } from '@hooks/useSessions';
import { useExercises } from '@hooks/useExercises';
import { SessionTables } from '@components/programs/SessionTables';
import { SessionDialog, type SessionDialogValues, type ExerciseOption } from '@components/programs/SessionDialog';
import { ConfirmDialog } from '@components/common/ConfirmDialog';

export function SessionsPanel(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('ses');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);
  React.useEffect(() => {
    if (debounced !== q) setQ(debounced);
  }, [debounced, q, setQ]);

  const { items, total, loading, create, update, remove } = useSessions({ page, limit, q });
  const { items: exerciseItems } = useExercises({ page: 1, limit: 200, q: '' });
  const { t } = useTranslation();

  const exerciseOptions = React.useMemo<ExerciseOption[]>(
    () => exerciseItems.map(ex => ({ id: ex.id, slug: ex.slug, name: ex.name })),
    [exerciseItems]
  );

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const editing = React.useMemo(() => items.find(s => s.id === editId) ?? null, [items, editId]);

  const toCreateInput = (values: SessionDialogValues) => ({
    slug: values.slug,
    locale: values.locale,
    title: values.title,
    durationMin: values.durationMin,
    description: values.description ? values.description : undefined,
    exerciseIds: values.exercises.map(ex => ex.id),
  });

  const toUpdateInput = (id: string, values: SessionDialogValues) => ({
    id,
    slug: values.slug,
    locale: values.locale,
    title: values.title,
    durationMin: values.durationMin,
    description: values.description ? values.description : undefined,
    exerciseIds: values.exercises.map(ex => ex.id),
  });

  return (
    <Box>
      <SessionTables
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

      <SessionDialog
        open={openCreate}
        mode="create"
        exerciseOptions={exerciseOptions}
        onClose={() => setOpenCreate(false)}
        onSubmit={(values) => create(toCreateInput(values))}
      />

      <SessionDialog
        open={!!editId}
        mode="edit"
        initial={editing ?? undefined}
        exerciseOptions={exerciseOptions}
        onClose={() => setEditId(null)}
        onSubmit={(values) => {
          if (!editId) return undefined;
          return update(toUpdateInput(editId, values));
        }}
      />

      <ConfirmDialog
        open={!!deleteId}
        title={t('programs.sessions.confirm.delete_title')}
        message={t('common.messages.confirm_deletion_warning')}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            remove(deleteId).finally(() => setDeleteId(null));
          }
        }}
        confirmLabel={t('common.buttons.delete')}
      />
    </Box>
  );
}
