// src/components/meal-plans/MealPlanTable.tsx
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';

import type { MealPlan } from '@hooks/useMealPlans';
import { useDateFormatter } from '@hooks/useDateFormatter';

export interface MealPlanTableProps {
  rows: MealPlan[];
  total: number;
  page: number; // 1-based
  limit: number;
  q: string;
  loading: boolean;
  onCreate: () => void;
  onEdit: (row: MealPlan) => void;
  onDelete: (row: MealPlan) => void;
  onQueryChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function MealPlanTable(props: MealPlanTableProps): React.JSX.Element {
  const { rows, total, page, limit, q, loading, onCreate, onEdit, onDelete, onQueryChange, onPageChange, onLimitChange } = props;
  const { t } = useTranslation();
  const formatDate = useDateFormatter();

  const columns = React.useMemo<GridColDef<MealPlan>[]>(() => {
    return [
      { field: 'slug', headerName: t('common.labels.slug'), flex: 1 },
      { field: 'label', headerName: t('common.labels.label'), flex: 1.2 },
      { field: 'locale', headerName: t('common.labels.locale'), width: 120 },
      {
        field: 'visibility',
        headerName: t('common.labels.visibility'),
        width: 140,
        valueFormatter: ({ value }) =>
          value === 'PUBLIC' ? t('common.visibility.public') : t('common.visibility.private'),
      },
      {
        field: 'description',
        headerName: t('common.labels.description'),
        flex: 1.5,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.value || t('common.messages.no_value')}
          </Typography>
        ),
      },
      {
        field: 'dayCount',
        headerName: t('meals.mealPlans.columns.day_count'),
        width: 140,
        renderCell: ({ row }) => row.days.length,
      },
      {
        field: 'calories',
        headerName: t('meals.mealPlans.columns.calories'),
        width: 120,
      },
      {
        field: 'proteinGrams',
        headerName: t('meals.mealPlans.columns.protein'),
        width: 120,
      },
      {
        field: 'carbGrams',
        headerName: t('meals.mealPlans.columns.carb'),
        width: 120,
      },
      {
        field: 'fatGrams',
        headerName: t('meals.mealPlans.columns.fat'),
        width: 120,
      },
      {
        field: 'athlete',
        headerName: t('common.labels.user'),
        flex: 1,
        renderCell: ({ row }) => row.athlete?.email || row.userId || t('common.messages.no_value'),
      },
      {
        field: 'createdAt',
        headerName: t('common.labels.created'),
        flex: 1,
        valueFormatter: (value) => formatDate(value as string),
      },
      {
        field: 'updatedAt',
        headerName: t('common.labels.updated'),
        flex: 1,
        valueFormatter: (value) => formatDate(value as string),
      },
      {
        field: 'actions',
        headerName: t('common.labels.actions'),
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={t('common.tooltips.edit')}>
              <IconButton size="small" aria-label={`edit-meal-plan-${params.row.id}`} onClick={() => onEdit(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.tooltips.delete')}>
              <IconButton size="small" aria-label={`delete-meal-plan-${params.row.id}`} onClick={() => onDelete(params.row)}>
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
          placeholder={t('meals.mealPlans.search_placeholder')}
          value={q}
          onChange={(event) => onQueryChange(event.target.value)}
          inputProps={{ 'aria-label': 'search-meal-plans' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>
          {t('meals.mealPlans.create')}
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
        aria-label="meal-plans-table"
        pageSizeOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
