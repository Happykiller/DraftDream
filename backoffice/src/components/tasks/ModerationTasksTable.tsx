import * as React from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useDateFormatter } from '@hooks/useDateFormatter';

export type ModerationTaskStatus = 'pending' | 'approved' | 'rejected';

export type ModerationTask = {
  id: string;
  title: string;
  type: string;
  creator: string;
  status: ModerationTaskStatus;
  createdAt: string;
  updatedAt: string;
};

export interface ModerationTasksTableProps {
  rows: ModerationTask[];
  loading: boolean;
}

/** Render the moderation task list table. */
export const ModerationTasksTable = React.memo(function ModerationTasksTable({
  rows,
  loading,
}: ModerationTasksTableProps): React.JSX.Element {
  const { t } = useTranslation();
  const formatDate = useDateFormatter();

  const statusLabelMap = React.useMemo(
    () => ({
      pending: t('tasks.moderation.status.pending'),
      approved: t('tasks.moderation.status.approved'),
      rejected: t('tasks.moderation.status.rejected'),
    }),
    [t],
  );

  const columns = React.useMemo<GridColDef<ModerationTask>[]>(
    () => [
      { field: 'title', headerName: t('common.labels.title'), flex: 1, minWidth: 200 },
      { field: 'type', headerName: t('common.labels.type'), width: 160 },
      { field: 'creator', headerName: t('common.labels.creator'), flex: 1, minWidth: 180 },
      {
        field: 'status',
        headerName: t('common.labels.status'),
        width: 140,
        renderCell: (params) => {
          const status = params.row.status;
          const color = status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning';
          return (
            <Chip
              size="small"
              label={statusLabelMap[status] ?? status}
              color={color}
              variant={status === 'pending' ? 'outlined' : 'filled'}
            />
          );
        },
        sortable: false,
      },
      {
        field: 'createdAt',
        headerName: t('common.labels.created'),
        width: 160,
        valueFormatter: (value: string) => formatDate(value),
      },
      {
        field: 'updatedAt',
        headerName: t('common.labels.updated'),
        width: 160,
        valueFormatter: (value: string) => formatDate(value),
      },
    ],
    [formatDate, statusLabelMap, t],
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* General information */}
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        autoHeight
        localeText={{ noRowsLabel: t('tasks.moderation.empty') }}
        aria-label="moderation-tasks-table"
      />
    </Box>
  );
});
