// src/pages/programs/ExercisesPanel.tsx
import * as React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useTabParams } from '@hooks/useTabParams';
import { useExercises } from '@hooks/useExercises';
import { ExerciseTable } from '@components/programs/ExerciseTable';
import { ExerciseDialog, type ExerciseDialogValues, type RefEntity } from '@components/programs/ExerciseDialog';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { useCategories } from '@hooks/useCategories';
import { useMuscles } from '@hooks/useMuscles';
import { useTags } from '@hooks/useTags';
import { useEquipment } from '@hooks/useEquipment';

export function ExercisesPanel(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('exs');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);
  React.useEffect(() => { if (debounced !== q) setQ(debounced); }, [debounced, q, setQ]);

  const { items, total, loading, create, update, remove } = useExercises({ page, limit, q });
  const { t } = useTranslation();

  // Options (petites pages, à passer en async si volume ↑)
  const cats = useCategories({ page: 1, limit: 100, q: '' });
  const musc = useMuscles({ page: 1, limit: 200, q: '' });
  const tags = useTags({ page: 1, limit: 200, q: '' });
  const eqp = useEquipment({ page: 1, limit: 200, q: '' });

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const editing = React.useMemo(() => items.find(i => i.id === editId), [items, editId]);

  const ids = (arr: RefEntity[]) => arr.map(x => x.id);

  const toCreateInput = (v: ExerciseDialogValues) => ({
    slug: v.slug,
    locale: v.locale,
    label: v.label,
    level: v.level,
    series: v.series,
    repetitions: v.repetitions,
    description: v.description || undefined,
    instructions: v.instructions || undefined,
    charge: v.charge || undefined,
    rest: v.rest ?? undefined,
    videoUrl: v.videoUrl || undefined,
    visibility: v.visibility,
    categoryId: v.category!.id,                        // required
    primaryMuscleIds: ids(v.primaryMuscles),          // required (non-empty)
    secondaryMuscleIds: ids(v.secondaryMuscles),
    equipmentIds: ids(v.equipment),
    tagIds: ids(v.tags),
  });

  const toUpdateInput = (id: string, v: ExerciseDialogValues) => ({
    id,
    slug: v.slug,
    locale: v.locale,
    label: v.label,
    level: v.level,
    series: v.series,
    repetitions: v.repetitions,
    description: v.description || undefined,
    instructions: v.instructions || undefined,
    charge: v.charge || undefined,
    rest: v.rest ?? undefined,
    videoUrl: v.videoUrl || undefined,
    // visibility modifiable selon schéma (oui) → on l’envoie si différent
    visibility: v.visibility,
    categoryId: v.category ? v.category.id : undefined,
    primaryMuscleIds: ids(v.primaryMuscles),
    secondaryMuscleIds: ids(v.secondaryMuscles),
    equipmentIds: ids(v.equipment),
    tagIds: ids(v.tags),
  });

  return (
    <Box>
      <ExerciseTable
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

      <ExerciseDialog
        open={openCreate}
        mode="create"
        categoryOptions={cats.items as any}
        muscleOptions={musc.items as any}
        tagOptions={tags.items.map(t => ({ id: t.id, slug: t.slug, label: t.label })) as any}
        equipmentOptions={eqp.items as any}
        onClose={() => setOpenCreate(false)}
        onSubmit={(v) => create(toCreateInput(v))}
      />

      <ExerciseDialog
        open={!!editId}
        mode="edit"
        initial={editing as any}
        categoryOptions={cats.items as any}
        muscleOptions={musc.items as any}
        tagOptions={tags.items.map(t => ({ id: t.id, slug: t.slug, label: t.label })) as any}
        equipmentOptions={eqp.items as any}
        onClose={() => setEditId(null)}
        onSubmit={(v) => editId ? update(toUpdateInput(editId, v)) : undefined}
      />

      <ConfirmDialog
        open={!!deleteId}
        title={t('programs.exercises.confirm.delete_title')}
        message={t('common.messages.confirm_deletion_warning')}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) remove(deleteId).finally(() => setDeleteId(null)); }}
        confirmLabel={t('common.buttons.delete')}
      />
    </Box>
  );
}
