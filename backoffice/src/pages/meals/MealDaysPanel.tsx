// src/pages/meals/MealDaysPanel.tsx
import * as React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { MealDayDialog } from '@components/meals/MealDayDialog';
import type { MealDayDialogValues } from '@components/meals/MealDayDialog';
import { MealDayTable } from '@components/meals/MealDayTable';
import { useMealDays } from '@hooks/useMealDays';
import { useMeals } from '@hooks/useMeals';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useTabParams } from '@hooks/useTabParams';

export function MealDaysPanel(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('mealDay');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);
  React.useEffect(() => {
    if (debounced !== q) setQ(debounced);
  }, [debounced, q, setQ]);

  const { items, total, loading, create, update, remove } = useMealDays({ page, limit, q });
  const {
    items: mealOptions,
    loading: mealOptionsLoading,
    reload: reloadMealOptions,
  } = useMeals({ page: 1, limit: 100, q: '' });
  const { t } = useTranslation();

  const mealDialogOptions = React.useMemo(
    () =>
      mealOptions.map((meal) => ({
        id: meal.id,
        slug: meal.slug,
        label: meal.label,
        locale: meal.locale,
        visibility: meal.visibility,
      })),
    [mealOptions],
  );

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const editing = React.useMemo(() => items.find((item) => item.id === editId) ?? null, [items, editId]);

  const mapDialogValuesToInput = React.useCallback(
    (values: MealDayDialogValues) => ({
      slug: values.slug,
      locale: values.locale,
      label: values.label,
      description: values.description ? values.description : undefined,
      mealIds: values.meals.map((meal) => meal.id),
      visibility: values.visibility,
    }),
    [],
  );

  return (
    <Box>
      {/* General information */}
      <MealDayTable
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

      <MealDayDialog
        open={openCreate}
        mode="create"
        mealOptions={mealDialogOptions}
        mealOptionsLoading={mealOptionsLoading}
        onClose={() => setOpenCreate(false)}
        onRefreshMeals={() => {
          void reloadMealOptions();
        }}
        onSubmit={async (values) => {
          await create(mapDialogValuesToInput(values));
        }}
      />

      <MealDayDialog
        open={Boolean(editId)}
        mode="edit"
        initial={editing ?? undefined}
        mealOptions={mealDialogOptions}
        mealOptionsLoading={mealOptionsLoading}
        onClose={() => setEditId(null)}
        onRefreshMeals={() => {
          void reloadMealOptions();
        }}
        onSubmit={async (values) => {
          if (!editId) return;
          await update({ id: editId, ...mapDialogValuesToInput(values) });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title={t('meals.mealDays.confirm.delete_title')}
        message={t('common.messages.confirm_deletion_warning')}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            void remove(deleteId).finally(() => setDeleteId(null));
          }
        }}
        confirmLabel={t('common.buttons.delete')}
      />
    </Box>
  );
}
