import * as React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useTabParams } from '@hooks/useTabParams';
import { useExercises, type Exercise } from '@hooks/useExercises';
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

  const { items, total, loading, create, update, remove, getExercise } = useExercises({ page, limit, q });
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
  // Map backend exercises into dialog-friendly values safely.
  const toDialogValues = (exercise?: Exercise): ExerciseDialogValues | undefined => {
    if (!exercise) return undefined;
    const toRefs = (
      entities: Array<{ id: string; slug: string; label?: string | null; locale?: string | null }> | undefined | null,
      ids: string[] | undefined | null,
      options: RefEntity[],
    ): RefEntity[] => {
      if (entities?.length) {
        return entities.map((item) => ({
          id: item.id,
          slug: item.slug,
          label: item.label ?? item.slug,
          locale: item.locale ?? undefined,
        }));
      }

      return (ids ?? [])
        .map((id) => options.find((option) => option.id === id) ?? null)
        .filter((option): option is RefEntity => Boolean(option));
    };

    return {
      locale: exercise.locale,
      label: exercise.label,
      series: exercise.series,
      repetitions: exercise.repetitions,
      description: exercise.description ?? '',
      instructions: exercise.instructions ?? '',
      charge: exercise.charge ?? '',
      rest: exercise.rest ?? null,
      videoUrl: exercise.videoUrl ?? '',
      visibility: exercise.visibility,
      categories: toRefs(exercise.categories, exercise.categoryIds, categoryOptions),
      muscles: toRefs(exercise.muscles, exercise.muscleIds, muscleOptions),
      equipment: toRefs(exercise.equipment, exercise.equipmentIds, equipmentOptions),
      tags: toRefs(exercise.tags, exercise.tagIds, tagOptions),
    };
  };

  const [fullExercise, setFullExercise] = React.useState<Awaited<ReturnType<typeof getExercise>> | null>(null);

  React.useEffect(() => {
    if (editId) {
      void getExercise(editId).then(setFullExercise);
      return;
    }
    setFullExercise(null);
  }, [editId, getExercise]);
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
    categoryIds: ids(v.categories),
    muscleIds: ids(v.muscles),
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
        initial={toDialogValues(fullExercise ?? undefined)}
        details={fullExercise ?? undefined}
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
        initial={toDialogValues(duplicating)}
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
