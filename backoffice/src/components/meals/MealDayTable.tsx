// src/components/meals/MealDayTable.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Button, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';

import type { MealDay } from '@hooks/useMealDays';
import { useDateFormatter } from '@hooks/useDateFormatter';

export interface MealDayTableProps {
  rows: MealDay[];
  total: number;
  page: number; // 1-based
  limit: number;
  q: string;
  loading: boolean;
  onCreate: () => void;
  onEdit: (row: MealDay) => void;
  onDelete: (row: MealDay) => void;
  onQueryChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function MealDayTable(props: MealDayTableProps): React.JSX.Element {
  const { rows, total, page, limit, q, loading, onCreate, onEdit, onDelete, onQueryChange, onPageChange, onLimitChange } = props;
  const { t } = useTranslation();
  const formatDate = useDateFormatter();

  const columns = React.useMemo<GridColDef<MealDay>[]>(() => {
    return [
      { field: 'label', headerName: t('common.labels.label'), flex: 1.2 },
      { field: 'locale', headerName: t('common.labels.locale'), width: 120 },
      {
        field: 'description',
        headerName: t('common.labels.description'),
        renderCell: (params) => (
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.value || t('common.messages.no_value')}
          </Typography>
        ),
      },
      {
        field: 'mealCount',
        headerName: t('meals.mealDays.columns.count'),
        width: 140,
        renderCell: (params) => {
          return params.row.meals ? params.row.meals.length : 0;
        },
      },
      { field: 'visibility', headerName: t('common.labels.visibility'), width: 140 },
      {
        field: 'creator',
        headerName: t('common.labels.creator'),
        valueGetter: (creator :any) => {
          return creator?.email || t('common.messages.unknown');
        },
        flex: 1,
      },
      {
        field: 'createdAt',
        headerName: t('common.labels.created'),
        valueFormatter: (value: any) => formatDate(value),
        flex: 1,
      },
      {
        field: 'updatedAt',
        headerName: t('common.labels.updated'),
        valueFormatter: (value: any) => formatDate(value),
        flex: 1,
      },
      {
        field: 'actions',
        headerName: t('common.labels.actions'),
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={t('common.tooltips.edit')}>
              <IconButton size="small" aria-label={`edit-meal-day-${params.row.id}`} onClick={() => onEdit(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.tooltips.delete')}>
              <IconButton size="small" aria-label={`delete-meal-day-${params.row.id}`} onClick={() => onDelete(params.row)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ];
  }, [formatDate, onDelete, onEdit, t]);

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
          placeholder={t('meals.mealDays.search_placeholder')}
          value={q}
          onChange={(event) => onQueryChange(event.target.value)}
          inputProps={{ 'aria-label': 'search-meal-days' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>
          {t('meals.mealDays.create')}
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
        aria-label="meal-days-table"
        pageSizeOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
