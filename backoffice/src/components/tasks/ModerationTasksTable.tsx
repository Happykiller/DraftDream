import * as React from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Chip, IconButton, Stack, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useDateFormatter } from '@hooks/useDateFormatter';
import type { Task } from '@hooks/useTasks';

export interface ModerationTasksTableProps {
  rows: Task[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

/** Render the moderation task list table. */
export const ModerationTasksTable = React.memo(function ModerationTasksTable({
  rows,
  total,
  page,
  limit,
  loading,
  onRefresh,
  onPageChange,
  onLimitChange,
}: ModerationTasksTableProps): React.JSX.Element {
  const { t } = useTranslation();
  const formatDate = useDateFormatter();

  const statusLabelMap = React.useMemo<Record<string, string>>(
    () => ({
      TODO: t('tasks.status.todo'),
      DONE: t('tasks.status.done'),
    }),
    [t],
  );

  const priorityLabelMap = React.useMemo<Record<string, string>>(
    () => ({
      LOW: t('tasks.priority.low'),
      MIDDLE: t('tasks.priority.middle'),
      HIGH: t('tasks.priority.high'),
    }),
    [t],
  );

  const columns = React.useMemo<GridColDef<Task>[]>(
    () => [
      { field: 'label', headerName: t('tasks.table.columns.label'), flex: 1, minWidth: 200 },
      {
        field: 'priority',
        headerName: t('tasks.table.columns.priority'),
        width: 130,
        valueFormatter: (value: string) => priorityLabelMap[value] ?? value,
      },
      {
        field: 'status',
        headerName: t('tasks.table.columns.status'),
        width: 130,
        renderCell: (params) => {
          const status = params.row.status;
          const color = status === 'DONE' ? 'success' : 'warning';
          return (
            <Chip
              size="small"
              label={statusLabelMap[status] ?? status}
              color={color}
              variant={status === 'DONE' ? 'filled' : 'outlined'}
            />
          );
        },
        sortable: false,
      },
      {
        field: 'day',
        headerName: t('tasks.table.columns.day'),
        width: 150,
        valueFormatter: (value: string) => formatDate(value),
      },
      {
        field: 'creator',
        headerName: t('common.labels.creator'),
        flex: 1,
        minWidth: 180,
        valueGetter: (_value, row) => {
          const creator = row.creator;
          if (creator) {
            const name = `${creator.first_name ?? ''} ${creator.last_name ?? ''}`.trim();
            return name.length > 0 ? name : creator.email ?? row.createdBy;
          }
          return row.createdBy;
        },
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
    [formatDate, priorityLabelMap, statusLabelMap, t],
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* General information */}
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
        <Tooltip title={t('common.buttons.refresh')}>
          <span>
            <IconButton aria-label={t('common.buttons.refresh')} onClick={onRefresh} disabled={loading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        rowCount={total}
        paginationMode="server"
        pageSizeOptions={[10, 25, 50]}
        paginationModel={{ page: page - 1, pageSize: limit }}
        onPaginationModelChange={(model) => {
          if (model.page !== page - 1) onPageChange(model.page + 1);
          if (model.pageSize !== limit) onLimitChange(model.pageSize);
        }}
        disableRowSelectionOnClick
        autoHeight
        localeText={{ noRowsLabel: t('tasks.empty') }}
        aria-label="moderation-tasks-table"
      />
    </Box>
  );
});
