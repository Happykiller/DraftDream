// src/pages/meals/MealPlansPanel.tsx
import * as React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog } from '@components/common/ConfirmDialog';
import {
  MealPlanDialog,
  type MealPlanDialogDay,
  type MealPlanDialogDayOption,
  type MealPlanDialogMealOption,
  type MealPlanDialogUserOption,
  type MealPlanDialogValues,
} from '@components/meal-plans/MealPlanDialog';
import { MealPlanTable } from '@components/meal-plans/MealPlanTable';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useMealDays } from '@hooks/useMealDays';
import { useMealPlans } from '@hooks/useMealPlans';
import { useMeals } from '@hooks/useMeals';
import { useTabParams } from '@hooks/useTabParams';
import { useUsers } from '@hooks/useUsers';

function toMealPlanMutationDay(day: MealPlanDialogDay) {
  return {
    id: day.id,
    templateMealDayId: day.templateMealDayId ?? undefined,
    slug: day.slug ?? undefined,
    locale: day.locale ?? undefined,
    label: day.label,
    description: day.description ?? undefined,
    meals: day.meals.map((meal) => ({
      id: meal.id,
      templateMealId: meal.templateMealId ?? undefined,
      slug: meal.slug ?? undefined,
      locale: meal.locale ?? undefined,
      label: meal.label,
      description: meal.description ?? undefined,
      foods: meal.foods,
      calories: meal.calories,
      proteinGrams: meal.proteinGrams,
      carbGrams: meal.carbGrams,
      fatGrams: meal.fatGrams,
      type: {
        id: meal.type.id ?? undefined,
        templateMealTypeId: meal.type.templateMealTypeId ?? meal.type.id ?? undefined,
        slug: meal.type.slug ?? undefined,
        locale: meal.type.locale ?? undefined,
        label: meal.type.label,
        visibility: meal.type.visibility ?? undefined,
      },
    })),
  };
}

function toMealDayOption(items: ReturnType<typeof useMealDays>['items']): MealPlanDialogDayOption[] {
  return items.map((day) => ({
    id: day.id,
    slug: day.slug,
    label: day.label,
    locale: day.locale,
    description: day.description ?? null,
    meals: (day.meals ?? []).map((meal) => ({
      id: meal.id,
      slug: meal.slug ?? meal.id,
      label: meal.label,
      locale: meal.locale ?? day.locale,
      foods: meal.foods ?? '',
      calories: meal.calories ?? 0,
      proteinGrams: meal.proteinGrams ?? 0,
      carbGrams: meal.carbGrams ?? 0,
      fatGrams: meal.fatGrams ?? 0,
      type: meal.type
        ? {
            id: meal.type.id ?? undefined,
            templateMealTypeId: meal.type.id ?? undefined,
            slug: meal.type.slug ?? undefined,
            locale: meal.type.locale ?? undefined,
            label: meal.type.label,
            visibility: meal.type.visibility ?? undefined,
          }
        : null,
    })),
  }));
}

function toMealOptions(items: ReturnType<typeof useMeals>['items']): MealPlanDialogMealOption[] {
  return items.map((meal) => ({
    id: meal.id,
    slug: meal.slug,
    label: meal.label,
    locale: meal.locale,
    foods: meal.foods,
    calories: meal.calories,
    proteinGrams: meal.proteinGrams,
    carbGrams: meal.carbGrams,
    fatGrams: meal.fatGrams,
    description: null,
    type: meal.type
      ? {
          id: meal.type.id,
          templateMealTypeId: meal.type.id ?? undefined,
          slug: meal.type.slug ?? undefined,
          locale: meal.type.locale ?? undefined,
          label: meal.type.label,
          visibility: meal.type.visibility ?? undefined,
        }
      : null,
  }));
}

export function MealPlansPanel(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('mealPlan');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (debounced !== q) setQ(debounced);
  }, [debounced, q, setQ]);

  const { items, total, loading, create, update, remove } = useMealPlans({ page, limit, q });
  const {
    items: mealDayItems,
    loading: mealDayLoading,
    reload: reloadMealDays,
  } = useMealDays({ page: 1, limit: 200, q: '' });
  const {
    items: mealItems,
    loading: mealOptionsLoading,
    reload: reloadMeals,
  } = useMeals({ page: 1, limit: 200, q: '' });
  const { items: userItems } = useUsers({ page: 1, limit: 200, q: '' });

  const mealDayOptions = React.useMemo<MealPlanDialogDayOption[]>(() => toMealDayOption(mealDayItems), [mealDayItems]);
  const mealOptions = React.useMemo<MealPlanDialogMealOption[]>(() => toMealOptions(mealItems), [mealItems]);
  const userOptions = React.useMemo<MealPlanDialogUserOption[]>(
    () => userItems.map((user) => ({ id: user.id, email: user.email })),
    [userItems],
  );

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const editing = React.useMemo(() => items.find((plan) => plan.id === editId) ?? null, [items, editId]);

  const toCreateInput = React.useCallback(
    (values: MealPlanDialogValues) => ({
      slug: values.slug,
      locale: values.locale,
      label: values.label,
      description: values.description ? values.description : undefined,
      calories: values.calories,
      proteinGrams: values.proteinGrams,
      carbGrams: values.carbGrams,
    fatGrams: values.fatGrams,
    userId: values.user?.id ?? undefined,
    days: values.days.map(toMealPlanMutationDay),
    visibility: values.visibility,
  }),
  [],
);

  const toUpdateInput = React.useCallback(
    (id: string, values: MealPlanDialogValues) => ({
      id,
      slug: values.slug,
      locale: values.locale,
      label: values.label,
      description: values.description ? values.description : undefined,
      calories: values.calories,
      proteinGrams: values.proteinGrams,
      carbGrams: values.carbGrams,
    fatGrams: values.fatGrams,
    userId: values.user?.id ?? undefined,
    days: values.days.map(toMealPlanMutationDay),
    visibility: values.visibility,
  }),
  [],
);

  return (
    <Box>
      {/* General information */}
      <MealPlanTable
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

      <MealPlanDialog
        open={openCreate}
        mode="create"
        mealDayOptions={mealDayOptions}
        mealDayOptionsLoading={mealDayLoading}
        mealOptions={mealOptions}
        mealOptionsLoading={mealOptionsLoading}
        userOptions={userOptions}
        onClose={() => setOpenCreate(false)}
        onSubmit={(values) => create(toCreateInput(values))}
        onRefreshMealDays={() => {
          void reloadMealDays();
        }}
        onRefreshMeals={() => {
          void reloadMeals();
        }}
      />

      <MealPlanDialog
        open={Boolean(editId)}
        mode="edit"
        initial={editing ?? undefined}
        mealDayOptions={mealDayOptions}
        mealDayOptionsLoading={mealDayLoading}
        mealOptions={mealOptions}
        mealOptionsLoading={mealOptionsLoading}
        userOptions={userOptions}
        onClose={() => setEditId(null)}
        onSubmit={(values) => {
          if (!editId) return Promise.resolve();
          return update(toUpdateInput(editId, values));
        }}
        onRefreshMealDays={() => {
          void reloadMealDays();
        }}
        onRefreshMeals={() => {
          void reloadMeals();
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title={t('meals.mealPlans.confirm.delete_title')}
        message={t('common.messages.confirm_deletion_warning')}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          remove(deleteId).finally(() => setDeleteId(null));
        }}
        confirmLabel={t('common.buttons.delete')}
      />
    </Box>
  );
}
