// src/components/prospects/ProspectClientTable.tsx
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Button, IconButton, MenuItem, Stack, TextField, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { Client } from '@hooks/useClients';
import type { ClientMetadataOption } from '@hooks/useClientMetadataOptions';
import { useDateFormatter } from '@hooks/useDateFormatter';

export interface ProspectClientTableProps {
  rows: Client[];
  total: number;
  page: number; // 1-based
  limit: number;
  q: string;
  statusFilter?: string | null;
  levelFilter?: string | null;
  sourceFilter?: string | null;
  statuses: ClientMetadataOption[];
  levels: ClientMetadataOption[];
  sources: ClientMetadataOption[];
  loading: boolean;
  onCreate: () => void;
  onEdit: (row: Client) => void;
  onDelete: (row: Client) => void;
  onQueryChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onStatusFilterChange: (value: string | null) => void;
  onLevelFilterChange: (value: string | null) => void;
  onSourceFilterChange: (value: string | null) => void;
}

export function ProspectClientTable(props: ProspectClientTableProps): React.JSX.Element {
  const {
    rows,
    total,
    page,
    limit,
    q,
    statusFilter,
    levelFilter,
    sourceFilter,
    statuses,
    levels,
    sources,
    loading,
    onCreate,
    onEdit,
    onDelete,
    onQueryChange,
    onPageChange,
    onLimitChange,
    onStatusFilterChange,
    onLevelFilterChange,
    onSourceFilterChange,
  } = props;
  const { t } = useTranslation();
  const fmtDate = useDateFormatter();

  const renderList = React.useCallback((value?: { label?: string }[]) => {
    if (!value?.length) return t('common.messages.no_value');
    return value.map((item) => item.label).join(', ');
  }, [t]);

  const columns = React.useMemo<GridColDef<Client>[]>(
    () => [
      { field: 'firstName', headerName: t('common.labels.first_name'), flex: 1, minWidth: 160 },
      { field: 'lastName', headerName: t('common.labels.last_name'), flex: 1, minWidth: 160 },
      { field: 'email', headerName: t('common.labels.email'), flex: 1, minWidth: 200 },
      { field: 'phone', headerName: t('common.labels.phone'), flex: 1, minWidth: 160 },
      {
        field: 'status',
        headerName: t('common.labels.status'),
        valueGetter: (params) => params.row.status?.label ?? t('common.messages.no_value'),
        minWidth: 140,
        flex: 1,
      },
      {
        field: 'level',
        headerName: t('common.labels.level'),
        valueGetter: (params) => params.row.level?.label ?? t('common.messages.no_value'),
        minWidth: 140,
        flex: 1,
      },
      {
        field: 'source',
        headerName: t('common.labels.source'),
        valueGetter: (params) => params.row.source?.label ?? t('common.messages.no_value'),
        minWidth: 140,
        flex: 1,
      },
      {
        field: 'objectives',
        headerName: t('common.labels.objectives'),
        valueGetter: (params) => renderList(params.row.objectives),
        flex: 1,
      },
      {
        field: 'activityPreferences',
        headerName: t('common.labels.activity_preferences'),
        valueGetter: (params) => renderList(params.row.activityPreferences),
        flex: 1,
      },
      {
        field: 'budget',
        headerName: t('common.labels.budget'),
        valueFormatter: (params) =>
          params.value != null ? `${params.value} €` : t('common.messages.no_value'),
        minWidth: 120,
      },
      {
        field: 'desiredStartDate',
        headerName: t('common.labels.desired_start_date'),
        valueFormatter: (params) => (params.value ? fmtDate(params.value) : t('common.messages.no_value')),
        minWidth: 160,
      },
      {
        field: 'updatedAt',
        headerName: t('common.labels.updated'),
        valueFormatter: (params) => fmtDate(params.value as string),
        minWidth: 160,
      },
      {
        field: 'actions',
        headerName: t('common.labels.actions'),
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={t('common.tooltips.edit')}>
              <IconButton size="small" aria-label={`edit-client-${params.row.id}`} onClick={() => onEdit(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.tooltips.delete')}>
              <IconButton size="small" aria-label={`delete-client-${params.row.id}`} onClick={() => onDelete(params.row)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
        minWidth: 120,
      },
    ],
    [fmtDate, onDelete, onEdit, renderList, t],
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* General information */}
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            placeholder={t('prospects.clients.search_placeholder')}
            value={q}
            onChange={(event) => onQueryChange(event.target.value)}
            inputProps={{ 'aria-label': 'search-clients' }}
            size="small"
            sx={{ maxWidth: 360 }}
          />
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" onClick={onCreate} sx={{ alignSelf: { xs: 'stretch', md: 'flex-start' } }}>
            {t('prospects.clients.create')}
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
          <TextField
            select
            size="small"
            label={t('common.labels.status')}
            value={statusFilter || ''}
            onChange={(event) => onStatusFilterChange(event.target.value || null)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">{t('common.placeholders.select')}</MenuItem>
            {statuses.map((status) => (
              <MenuItem key={status.id} value={status.id}>
                {status.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label={t('common.labels.level')}
            value={levelFilter || ''}
            onChange={(event) => onLevelFilterChange(event.target.value || null)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">{t('common.placeholders.select')}</MenuItem>
            {levels.map((level) => (
              <MenuItem key={level.id} value={level.id}>
                {level.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label={t('common.labels.source')}
            value={sourceFilter || ''}
            onChange={(event) => onSourceFilterChange(event.target.value || null)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">{t('common.placeholders.select')}</MenuItem>
            {sources.map((source) => (
              <MenuItem key={source.id} value={source.id}>
                {source.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        rowCount={total}
        paginationMode="server"
        paginationModel={{ page: page - 1, pageSize: limit }}
        onPaginationModelChange={(model) => {
          if (model.page !== page - 1) onPageChange(model.page + 1);
          if (model.pageSize !== limit) onLimitChange(model.pageSize);
        }}
        disableRowSelectionOnClick
        autoHeight
        aria-label="prospect-clients-table"
        pageSizeOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
