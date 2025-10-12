// src/components/programs/ProgramTable.tsx
import * as React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Autocomplete, Box, Button, Chip, IconButton, Stack, TextField, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useDateFormatter } from '@hooks/useDateFormatter';
import type { Program } from '@hooks/usePrograms';
import type { ProgramUserOption } from '@components/programs/ProgramDialog';

export interface ProgramTableProps {
  rows: Program[];
  total: number;
  page: number; // 1-based
  limit: number;
  q: string;
  loading: boolean;
  onCreate: () => void;
  onEdit: (row: Program) => void;
  onDelete: (row: Program) => void;
  onQueryChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  userOptions?: ProgramUserOption[];
  userFilter?: ProgramUserOption | null;
  onUserFilterChange?: (user: ProgramUserOption | null) => void;
}

export const ProgramTable = React.memo(function ProgramTable({
  rows,
  total,
  page,
  limit,
  q,
  loading,
  onCreate,
  onEdit,
  onDelete,
  onQueryChange,
  onPageChange,
  onLimitChange,
  userOptions,
  userFilter,
  onUserFilterChange,
}: ProgramTableProps): React.JSX.Element {
  const fmtDate = useDateFormatter();
  const { t } = useTranslation();

  const columns = React.useMemo<GridColDef<Program>[]>(() => [
    { field: 'slug', headerName: t('common.labels.slug'), flex: 1.1, minWidth: 160 },
    { field: 'label', headerName: t('common.labels.label'), flex: 1.4, minWidth: 180 },
    { field: 'locale', headerName: t('common.labels.locale'), width: 110 },
    {
      field: 'duration',
      headerName: t('common.labels.duration_weeks'),
      width: 150,
      valueFormatter: (value: any) => `${value}`,
    },
    {
      field: 'frequency',
      headerName: t('common.labels.frequency_per_week'),
      width: 160,
      valueFormatter: (value: any) => `${value}`,
    },
    {
      field: 'userId',
      headerName: t('common.labels.user'),
      flex: 1,
      minWidth: 160,
      valueFormatter: (value: any) => value || '',
    },
    {
      field: 'sessionIds',
      headerName: t('common.labels.sessions'),
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Chip
          size="small"
          label={t('programs.table.sessions_linked', { count: params.row.sessionIds.length })}
          color={params.row.sessionIds.length > 0 ? 'primary' : 'default'}
        />
      ),
    },
    {
      field: 'creator',
      headerName: t('common.labels.creator'),
      flex: 1,
      minWidth: 170,
      valueFormatter: (params: any) => params?.email ?? '',
    },
    {
      field: 'createdAt',
      headerName: t('common.labels.created'),
      flex: 1,
      minWidth: 170,
      valueFormatter: (params: any) => fmtDate(params),
    },
    {
      field: 'updatedAt',
      headerName: t('common.labels.updated'),
      flex: 1,
      minWidth: 170,
      valueFormatter: (params: any) => fmtDate(params),
    },
    {
      field: 'actions',
      headerName: t('common.labels.actions'),
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t('common.tooltips.edit')}>
            <IconButton size="small" aria-label={`edit-${params.row.id}`} onClick={() => onEdit(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.tooltips.delete')}>
            <IconButton size="small" aria-label={`delete-${params.row.id}`} onClick={() => onDelete(params.row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [fmtDate, onDelete, onEdit, t]);

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ mb: 1 }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <TextField
          placeholder={t('programs.table.search_placeholder')}
          value={q}
          onChange={(event) => onQueryChange(event.target.value)}
          inputProps={{ 'aria-label': 'search-programs' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        {userOptions && (
          <Autocomplete
            sx={{ minWidth: 260 }}
            size="small"
            options={userOptions}
            value={userFilter ?? null}
            onChange={(_, value) => onUserFilterChange && onUserFilterChange(value)}
            getOptionLabel={(option) => option?.email || ''}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={t('programs.table.filter_by_user')}
                label={t('common.labels.user')}
              />
            )}
          />
        )}
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>
          {t('programs.dialog.create_title')}
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        rowCount={total}
        paginationMode="server"
        sortingMode="client"
        paginationModel={{ page: page - 1, pageSize: limit }}
        onPaginationModelChange={(model) => {
          if (model.page !== page - 1) onPageChange(model.page + 1);
          if (model.pageSize !== limit) onLimitChange(model.pageSize);
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        disableRowSelectionOnClick
        autoHeight
        aria-label="programs-table"
      />
    </Box>
  );
});
