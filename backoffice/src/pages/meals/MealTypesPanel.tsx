// src/pages/meals/MealTypesPanel.tsx
import * as React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { MealTypeDialog } from '@components/meals/MealTypeDialog';
import { MealTypeTable } from '@components/meals/MealTypeTable';
import { useMealTypes } from '@hooks/useMealTypes';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useTabParams } from '@hooks/useTabParams';

export function MealTypesPanel(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('type');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);
  React.useEffect(() => { if (debounced !== q) setQ(debounced); }, [debounced, q, setQ]);

  const { items, total, loading, create, update, remove } = useMealTypes({ page, limit, q });
  const { t } = useTranslation();

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const editing = React.useMemo(() => items.find((item) => item.id === editId), [items, editId]);

  return (
    <Box>
      {/* General information */}
      <MealTypeTable
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

      <MealTypeDialog
        open={openCreate}
        mode="create"
        onClose={() => setOpenCreate(false)}
        onSubmit={(values) =>
          create({
            slug: values.slug,
            label: values.label,
            locale: values.locale,
            icon: values.icon.trim() ? values.icon.trim() : null,
            visibility: values.visibility,
          })
        }
      />

      <MealTypeDialog
        open={Boolean(editId)}
        mode="edit"
        initial={editing ?? undefined}
        onClose={() => setEditId(null)}
        onSubmit={(values) =>
          editId
            ? update({
                id: editId,
                slug: values.slug,
                label: values.label,
                locale: values.locale,
                icon: values.icon.trim() ? values.icon.trim() : null,
                visibility: values.visibility,
              })
            : undefined
        }
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        title={t('meals.mealTypes.confirm.delete_title')}
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
