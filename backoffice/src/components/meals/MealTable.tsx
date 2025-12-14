// src/components/meals/MealTable.tsx
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, IconButton, Stack, TextField, Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

import type { Meal } from '@hooks/useMeals';
import { useDateFormatter } from '@hooks/useDateFormatter';

export interface MealTableProps {
  rows: Meal[];
  total: number;
  page: number; // 1-based
  limit: number;
  q: string;
  loading: boolean;
  onCreate: () => void;
  onEdit: (row: Meal) => void;
  onDelete: (row: Meal) => void;
  onQueryChange: (query: string) => void;
  onPageChange: (page: number) => void; // 1-based
  onLimitChange: (limit: number) => void;
}

export function MealTable(props: MealTableProps): React.JSX.Element {
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
  // Responsive: Hide columns on smaller screens
  const isXl = useMediaQuery(useTheme().breakpoints.up('xl'));

  const columns = React.useMemo<GridColDef<Meal>[]>(() => {
    return [
      { field: 'label', headerName: t('common.labels.label'), flex: 1 },
      { field: 'locale', headerName: t('common.labels.locale'), width: 120 },
      {
        field: 'type',
        headerName: t('common.labels.type'),
        valueGetter: (params: any) => {
          return params.label ?? '';
        },
        flex: 1,
      },
      ...(isXl
        ? [
          { field: 'calories', headerName: t('common.labels.calories'), width: 120 },
          { field: 'proteinGrams', headerName: t('common.labels.protein_grams'), width: 150 },
          { field: 'carbGrams', headerName: t('common.labels.carb_grams'), width: 150 },
          { field: 'fatGrams', headerName: t('common.labels.fat_grams'), width: 140 },
        ]
        : []),
      { field: 'visibility', headerName: t('common.labels.visibility'), width: 140 },
      {
        field: 'creator',
        headerName: t('common.labels.creator'),
        valueGetter: (params: any) => params?.row?.creator?.email ?? '',
        flex: 1,
      },
      ...(isXl
        ? [
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
    ];
  }, [formatDate, isXl, onDelete, onEdit, t]);

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
          placeholder={t('meals.meals.search_placeholder')}
          value={q}
          onChange={(event) => onQueryChange(event.target.value)}
          inputProps={{ 'aria-label': 'search-meals' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>
          {t('meals.meals.create')}
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
        aria-label="meals-table"
        pageSizeOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
