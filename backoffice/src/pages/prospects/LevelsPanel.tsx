// src/pages/prospects/LevelsPanel.tsx
import * as React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { ProspectLevelDialog } from '@components/prospects/ProspectLevelDialog';
import { ProspectLevelTable } from '@components/prospects/ProspectLevelTable';
import { useClientLevels } from '@hooks/useClientLevels';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useTabParams } from '@hooks/useTabParams';

export function LevelsPanel(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('lvl');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);
  React.useEffect(() => {
    if (debounced !== q) setQ(debounced);
  }, [debounced, q, setQ]);

  const { items, total, loading, create, update, remove } = useClientLevels({ page, limit, q });
  const { t } = useTranslation();

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const editing = React.useMemo(() => items.find((item) => item.id === editId), [items, editId]);

  return (
    <Box>
      {/* General information */}
      <ProspectLevelTable
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

      <ProspectLevelDialog
        open={openCreate}
        mode="create"
        onClose={() => setOpenCreate(false)}
        onSubmit={(values) => create(values)}
      />

      <ProspectLevelDialog
        open={!!editId}
        mode="edit"
        initial={editing}
        onClose={() => setEditId(null)}
        onSubmit={(values) =>
          editId
            ? update({
                id: editId,
                label: values.label,
                locale: values.locale,
                visibility: values.visibility,
              })
            : undefined
        }
      />

      <ConfirmDialog
        open={!!deleteId}
        title={t('prospects.levels.confirm.delete_title')}
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
