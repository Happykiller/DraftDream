import * as React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { MealRecordDialog } from '@components/meal-records/MealRecordDialog';
import { MealRecordTable } from '@components/meal-records/MealRecordTable';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useMealPlans } from '@hooks/useMealPlans';
import { useMealRecords, type MealRecordState } from '@hooks/useMealRecords';
import { useTabParams } from '@hooks/useTabParams';
import { useUsers } from '@hooks/useUsers';

const DEFAULT_FILTERS = {
  userId: '',
  mealPlanId: '',
  state: '' as MealRecordState | '',
};

export function MealRecordsPanel(): React.JSX.Element {
  const { t } = useTranslation();
  const { page, limit, setPage, setLimit } = useTabParams('meal_record');
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);
  const debouncedUserId = useDebouncedValue(filters.userId, 300);
  const debouncedMealPlanId = useDebouncedValue(filters.mealPlanId, 300);

  const { items, total, loading, create, update, deleteRecord, hardDeleteRecord, reload } = useMealRecords({
    page,
    limit,
    userId: debouncedUserId || undefined,
    mealPlanId: debouncedMealPlanId || undefined,
    state: filters.state || undefined,
  });

  const { items: mealPlans } = useMealPlans({ page: 1, limit: 100, q: '' });
  const { items: users } = useUsers({ page: 1, limit: 100, q: '', type: 'athlete' });

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleteType, setDeleteType] = React.useState<'soft' | 'hard' | null>(null);
  const editing = React.useMemo(() => items.find((item) => item.id === editId) ?? null, [items, editId]);

  const handleDeleteCallback = (id: string, type: 'soft' | 'hard') => {
    setDeleteId(id);
    setDeleteType(type);
  };

  return (
    <Box>
      {/* General information */}
      <MealRecordTable
        rows={items}
        total={total}
        page={page}
        limit={limit}
        loading={loading}
        filters={filters}
        mealPlans={mealPlans}
        users={users}
        onCreate={() => setOpenCreate(true)}
        onEdit={(row) => setEditId(row.id)}
        onDelete={(row) => handleDeleteCallback(row.id, 'soft')}
        onHardDelete={(row) => handleDeleteCallback(row.id, 'hard')}
        onFiltersChange={setFilters}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRefresh={reload}
      />

      <MealRecordDialog
        open={openCreate}
        mode="create"
        mealPlans={mealPlans}
        users={users}
        onClose={() => setOpenCreate(false)}
        onSubmit={(values) => create(values)}
      />

      <MealRecordDialog
        open={!!editId}
        mode="edit"
        initial={editing}
        mealPlans={mealPlans}
        users={users}
        onClose={() => setEditId(null)}
        onSubmit={(values) => (
          editId
            ? update({
              id: editId,
              state: values.state,
              comment: values.comment,
              satisfactionRating: values.satisfactionRating,
            })
            : undefined
        )}
      />

      <ConfirmDialog
        open={!!deleteId}
        title={deleteType === 'hard' ? t('common.buttons.delete') : t('meals.records.confirm.delete_title')}
        message={
          deleteType === 'hard'
            ? t('common.messages.confirm_deletion_warning')
            : t('common.messages.are_you_sure')
        }
        confirmLabel={deleteType === 'hard' ? t('common.buttons.delete') : t('common.buttons.confirm')}
        onClose={() => {
          setDeleteId(null);
          setDeleteType(null);
        }}
        onConfirm={async () => {
          if (deleteId && deleteType) {
            if (deleteType === 'hard') {
              await hardDeleteRecord(deleteId);
            } else {
              await deleteRecord(deleteId);
            }
            setDeleteId(null);
            setDeleteType(null);
          }
        }}
      />
    </Box>
  );
}
