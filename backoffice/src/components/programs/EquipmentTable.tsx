// src/components/programs/EquipmentTable.tsx
import * as React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, type GridColDef, type GridValueFormatterParams } from '@mui/x-data-grid';
import { Box, Button, Stack, TextField, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { Equipment } from '@src/hooks/useEquipment';
import { useDateFormatter } from '@src/hooks/useDateFormatter';
import { getVisibilityLabel } from '../../commons/visibility';

export interface EquipmentTableProps {
  rows: Equipment[];
  total: number;
  page: number; // 1-based
  limit: number;
  q: string;
  loading: boolean;
  onCreate: () => void;
  onEdit: (row: Equipment) => void;
  onDelete: (row: Equipment) => void;
  onQueryChange: (q: string) => void;
  onPageChange: (page: number) => void; // 1-based
  onLimitChange: (limit: number) => void;
}

export const EquipmentTable = React.memo(function EquipmentTable({
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
}: EquipmentTableProps): React.JSX.Element {
  const fmtDate = useDateFormatter();
  const { t } = useTranslation();
  // Responsive: Hide Created/Updated on smaller screens
  const isXl = useMediaQuery((theme: any) => theme.breakpoints.up('xl'));


  const columns = React.useMemo<GridColDef<Equipment>[]>(() => [
    { field: 'label', headerName: t('common.labels.label'), flex: 1, minWidth: 150 },
    { field: 'locale', headerName: t('common.labels.locale'), width: 120 },
    {
      field: 'visibility',
      headerName: t('common.labels.visibility'),
      width: 140,
      renderCell: ({ value }) => getVisibilityLabel(value, t),
    },
    {
      field: 'creator',
      headerName: t('common.labels.creator'),
      flex: 1,
      minWidth: 180,
      valueFormatter: (value: GridValueFormatterParams<Equipment>['value']) => value?.email ?? '—',
    },
    ...(isXl
      ? [
        {
          field: 'createdAt',
          headerName: t('common.labels.created'),
          valueFormatter: (value: GridValueFormatterParams<Equipment>['value']) => fmtDate(value),
          flex: 1,
          minWidth: 180,
        },
        {
          field: 'updatedAt',
          headerName: t('common.labels.updated'),
          valueFormatter: (value: GridValueFormatterParams<Equipment>['value']) => fmtDate(value),
          flex: 1,
          minWidth: 180,
        },
      ]
      : []),
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
  ], [fmtDate, onDelete, onEdit, t, isXl]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* General information */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ mb: 1 }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        {/* Search propagates to the data hook to avoid caching stale inventory client-side. */}
        <TextField
          placeholder={t('programs.equipment.search_placeholder')}
          value={q}
          onChange={(event) => onQueryChange(event.target.value)}
          inputProps={{ 'aria-label': 'search-equipment' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>
          {t('programs.equipment.create')}
        </Button>
      </Stack>

      {/* Server pagination keeps the grid light even when gyms onboard large inventories. */}
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
        aria-label="equipment-table"
      />
    </Box>
  );
});
