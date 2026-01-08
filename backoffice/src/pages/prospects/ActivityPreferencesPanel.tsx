import * as React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { ProspectActivityPreferenceDialog } from '@components/prospects/ProspectActivityPreferenceDialog';
import { ProspectActivityPreferenceTable } from '@components/prospects/ProspectActivityPreferenceTable';
import { useProspectActivityPreferences } from '@hooks/useProspectActivityPreferences';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useTabParams } from '@hooks/useTabParams';

export function ActivityPreferencesPanel(): React.JSX.Element {
  const { page, limit, q, setPage, setLimit, setQ } = useTabParams('actPref');
  const [searchInput, setSearchInput] = React.useState(q);
  const debounced = useDebouncedValue(searchInput, 300);
  React.useEffect(() => {
    if (debounced !== q) setQ(debounced);
  }, [debounced, q, setQ]);

  const { items, total, loading, create, update, remove, hardRemove, reload } = useProspectActivityPreferences({
    page,
    limit,
    q,
  });
  const { t } = useTranslation();

  const [openCreate, setOpenCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleteType, setDeleteType] = React.useState<'soft' | 'hard' | null>(null);
  const editing = React.useMemo(() => items.find((item) => item.id === editId), [items, editId]);

  const handleDeleteCallback = (id: string, type: 'soft' | 'hard') => {
    setDeleteId(id);
    setDeleteType(type);
  };

  return (
    <Box>
      {/* General information */}
      <ProspectActivityPreferenceTable
        rows={items}
        total={total}
        page={page}
        limit={limit}
        q={searchInput}
        loading={loading}
        onCreate={() => setOpenCreate(true)}
        onEdit={(row) => setEditId(row.id)}
        onDelete={(row) => handleDeleteCallback(row.id, 'soft')}
        onHardDelete={(row) => handleDeleteCallback(row.id, 'hard')}
        onQueryChange={setSearchInput}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onRefresh={reload}
      />

      <ProspectActivityPreferenceDialog
        open={openCreate}
        mode="create"
        onClose={() => setOpenCreate(false)}
        onSubmit={values => create(values)}
      />

      <ProspectActivityPreferenceDialog
        open={!!editId}
        mode="edit"
        initial={editing}
        onClose={() => setEditId(null)}
        onSubmit={values =>
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
        title={deleteType === 'hard' ? t('common.buttons.delete') : t('prospects.activity_preferences.confirm.delete_title')}
        message={
          deleteType === 'hard'
            ? t('common.messages.confirm_deletion_warning')
            : t('common.messages.are_you_sure')
        }
        onClose={() => {
          setDeleteId(null);
          setDeleteType(null);
        }}
        onConfirm={async () => {
          if (deleteId && deleteType) {
            if (deleteType === 'hard') {
              await hardRemove(deleteId);
            } else {
              await remove(deleteId);
            }
            setDeleteId(null);
            setDeleteType(null);
          }
        }}
        confirmLabel={deleteType === 'hard' ? t('common.buttons.delete') : t('common.buttons.confirm')}
      />
    </Box>
  );
}

