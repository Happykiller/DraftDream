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
  React.useEffect(() => {
    if (debounced !== q) {
      setQ(debounced);
    }
  }, [debounced, q, setQ]);

  const { items, total, loading, create, update, remove } = useExercises({ page, limit, q });
  const { t } = useTranslation();

  // Small datasets for select options; move to async search if volume grows.
  const cats = useCategories({ page: 1, limit: 100, q: '' });
  const musc = useMuscles({ page: 1, limit: 200, q: '' });
  const tags = useTags({ page: 1, limit: 200, q: '' });
  const eqp = useEquipment({ page: 1, limit: 200, q: '' });

  const categoryOptions = React.useMemo<RefEntity[]>(
    () => cats.items.map((item) => ({ id: item.id, slug: item.slug, label: item.label, locale: item.locale })),
    [cats.items],
  );
  const muscleOptions = React.useMemo<RefEntity[]>(
    () => musc.items.map((item) => ({ id: item.id, slug: item.slug, label: item.label, locale: item.locale })),
    [musc.items],
  );
  const tagOptions = React.useMemo<RefEntity[]>(
    () => tags.items.map((item) => ({ id: item.id, slug: item.slug, label: item.label, locale: item.locale })),
    [tags.items],
  );
  const equipmentOptions = React.useMemo<RefEntity[]>(
    () => eqp.items.map((item) => ({ id: item.id, slug: item.slug, label: item.label, locale: item.locale })),
    [eqp.items],
  );

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [duplicateId, setDuplicateId] = React.useState<string | null>(null);
  const editing = React.useMemo(() => items.find(i => i.id === editId), [items, editId]);
  const duplicating = React.useMemo(() => {
    if (!duplicateId) return undefined;
    const original = items.find(i => i.id === duplicateId);
    if (!original) return undefined;
    return {
      ...original,
      slug: `${original.slug}-copy`,
      label: `${original.label} (Copy)`,
    };
  }, [items, duplicateId]);

  const ids = (arr: RefEntity[]) => arr.map(x => x.id);

  const toCreateInput = (v: ExerciseDialogValues) => ({
    locale: v.locale,
    label: v.label,
    series: v.series,
    repetitions: v.repetitions,
    description: v.description || undefined,
    instructions: v.instructions || undefined,
    charge: v.charge || undefined,
    rest: v.rest ?? undefined,
    videoUrl: v.videoUrl || undefined,
    visibility: v.visibility,
    categoryIds: ids(v.categories),                   // required
    muscleIds: ids(v.muscles),                        // required (non-empty)
    equipmentIds: ids(v.equipment),
    tagIds: ids(v.tags),
  });

  const toUpdateInput = (id: string, v: ExerciseDialogValues) => ({
    id,
    locale: v.locale,
    label: v.label,
    series: v.series,
    repetitions: v.repetitions,
    description: v.description || undefined,
    instructions: v.instructions || undefined,
    charge: v.charge || undefined,
    rest: v.rest ?? undefined,
    videoUrl: v.videoUrl || undefined,
    // Visibility can be updated, so keep it aligned with the current form state.
    visibility: v.visibility,
    categoryIds: ids(v.categories),
    muscleIds: ids(v.muscles),
    equipmentIds: ids(v.equipment),
    tagIds: ids(v.tags),
  });

  return (
    <Box>
      {/* General information */}
      <ExerciseTable
        rows={items}
        total={total}
        page={page}
        limit={limit}
        q={searchInput}
        loading={loading}
        onCreate={() => setOpenCreate(true)}
        onEdit={(row) => setEditId(row.id)}
        onDuplicate={(row) => setDuplicateId(row.id)}
        onDelete={(row) => setDeleteId(row.id)}
        onQueryChange={setSearchInput}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <ExerciseDialog
        open={openCreate}
        mode="create"
        categoryOptions={categoryOptions}
        muscleOptions={muscleOptions}
        tagOptions={tagOptions}
        equipmentOptions={equipmentOptions}
        onClose={() => setOpenCreate(false)}
        onSubmit={(v) => create(toCreateInput(v))}
      />

      <ExerciseDialog
        open={!!editId}
        mode="edit"
        initial={editing as any}
        categoryOptions={categoryOptions}
        muscleOptions={muscleOptions}
        tagOptions={tagOptions}
        equipmentOptions={equipmentOptions}
        onClose={() => setEditId(null)}
        onSubmit={(v) => editId ? update(toUpdateInput(editId, v)) : undefined}
      />

      <ExerciseDialog
        open={!!duplicateId}
        mode="create"
        title={t('programs.exercises.dialog.duplicate_title')}
        initial={duplicating as any}
        categoryOptions={categoryOptions}
        muscleOptions={muscleOptions}
        tagOptions={tagOptions}
        equipmentOptions={equipmentOptions}
        onClose={() => setDuplicateId(null)}
        onSubmit={(v) => create(toCreateInput(v))}
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
