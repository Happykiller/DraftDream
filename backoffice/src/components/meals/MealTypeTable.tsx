// src/components/meals/MealTypeTable.tsx
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, IconButton, Stack, TextField, Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid, type GridColDef, type GridValueFormatterParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

import type { MealType } from '@hooks/useMealTypes';
import { useDateFormatter } from '@src/hooks/useDateFormatter';

export interface MealTypeTableProps {
  rows: MealType[];
  total: number;
  page: number; // 1-based
  limit: number;
  q: string;
  loading: boolean;
  onCreate: () => void;
  onEdit: (row: MealType) => void;
  onDelete: (row: MealType) => void;
  onQueryChange: (query: string) => void;
  onPageChange: (page: number) => void; // 1-based
  onLimitChange: (limit: number) => void;
}

export function MealTypeTable(props: MealTypeTableProps): React.JSX.Element {
  const {
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
  } = props;
  const { t } = useTranslation();
  const formatDate = useDateFormatter();
  const theme = useTheme();
  // Responsive: Hide columns on smaller screens
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  const columns = React.useMemo<GridColDef<MealType>[]>(
    () => [
      { field: 'label', headerName: t('common.labels.label'), flex: 1 },
      {
        field: 'icon',
        headerName: t('common.labels.icon'),
        width: 140,
        renderCell: (params) => params.row.icon ?? t('common.messages.no_value'),
      },
      { field: 'locale', headerName: t('common.labels.locale'), width: 120 },
      { field: 'visibility', headerName: t('common.labels.visibility'), width: 140 },
      {
        field: 'creator',
        headerName: t('common.labels.creator'),
        renderCell: (params) => params.row.creator?.email ?? t('common.messages.no_value'),
        flex: 1,
      },
      ...(isXl
        ? [
          {
            field: 'createdAt',
            headerName: t('common.labels.created'),
            valueFormatter: (params: GridValueFormatterParams<MealType>) => formatDate(params.value),
            flex: 1,
          },
          {
            field: 'updatedAt',
            headerName: t('common.labels.updated'),
            valueFormatter: (params: GridValueFormatterParams<MealType>) => formatDate(params.value),
            flex: 1,
          },
        ]
        : []),
      {
        field: 'actions',
        headerName: t('common.labels.actions'),
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
    ],
    [formatDate, onDelete, onEdit, t, isXl],
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* General information */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ mb: 1 }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <TextField
          placeholder={t('meals.mealTypes.search_placeholder')}
          value={q}
          onChange={(event) => onQueryChange(event.target.value)}
          inputProps={{ 'aria-label': 'search-meal-types' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>
          {t('meals.mealTypes.create')}
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
        disableRowSelectionOnClick
        autoHeight
        aria-label="meal-types-table"
        pageSizeOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
