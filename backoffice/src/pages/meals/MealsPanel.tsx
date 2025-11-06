// src/pages/meals/MealsPanel.tsx
import * as React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { MealDialog } from '@components/meals/MealDialog';
import { MealTable } from '@components/meals/MealTable';
import { useMeals } from '@hooks/useMeals';
import { useMealTypes } from '@hooks/useMealTypes';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useTabParams } from '@hooks/useTabParams';

export function MealsPanel(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('meal');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);
  React.useEffect(() => { if (debounced !== q) setQ(debounced); }, [debounced, q, setQ]);

  const { items, total, loading, create, update, remove } = useMeals({ page, limit, q });
  const {
    items: mealTypes,
    loading: mealTypesLoading,
  } = useMealTypes({ page: 1, limit: 100, q: '' });
  const { t } = useTranslation();

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const editing = React.useMemo(() => items.find((item) => item.id === editId), [items, editId]);

  return (
    <Box>
      {/* General information */}
      <MealTable
        rows={items}
        total={total}
        page={page}
        limit={limit}
        q={searchInput}
        loading={loading}
        mealTypes={mealTypes}
        onCreate={() => setOpenCreate(true)}
        onEdit={(row) => setEditId(row.id)}
        onDelete={(row) => setDeleteId(row.id)}
        onQueryChange={setSearchInput}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />

      <MealDialog
        open={openCreate}
        mode="create"
        mealTypes={mealTypes}
        mealTypesLoading={mealTypesLoading}
        onClose={() => setOpenCreate(false)}
        onSubmit={(values) =>
          create({
            slug: values.slug,
            label: values.label,
            locale: values.locale,
            typeId: values.typeId,
            foods: values.foods,
            calories: values.calories,
            proteinGrams: values.proteinGrams,
            carbGrams: values.carbGrams,
            fatGrams: values.fatGrams,
            visibility: values.visibility,
          })
        }
      />

      <MealDialog
        open={Boolean(editId)}
        mode="edit"
        initial={editing ?? undefined}
        mealTypes={mealTypes}
        mealTypesLoading={mealTypesLoading}
        onClose={() => setEditId(null)}
        onSubmit={(values) =>
          editId
            ? update({
              id: editId,
              slug: values.slug,
              label: values.label,
              locale: values.locale,
              typeId: values.typeId,
              foods: values.foods,
              calories: values.calories,
              proteinGrams: values.proteinGrams,
              carbGrams: values.carbGrams,
              fatGrams: values.fatGrams,
              visibility: values.visibility,
            })
            : Promise.resolve()
        }
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title={t('meals.meals.confirm.delete_title')}
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
