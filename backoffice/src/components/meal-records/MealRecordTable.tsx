// src/components/meal-records/MealRecordTable.tsx
import * as React from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import type { MealPlan } from '@hooks/useMealPlans';
import type { MealRecord, MealRecordState } from '@hooks/useMealRecords';
import { useDateFormatter } from '@hooks/useDateFormatter';
import type { User } from '@hooks/useUsers';

interface Option {
  id: string;
  label: string;
}

export interface MealRecordTableFilters {
  userId: string;
  mealPlanId: string;
  state: MealRecordState | '';
}

export interface MealRecordTableProps {
  rows: MealRecord[];
  total: number;
  page: number; // 1-based
  limit: number;
  loading: boolean;
  filters: MealRecordTableFilters;
  mealPlans: MealPlan[];
  users: User[];
  onCreate: () => void;
  onEdit: (row: MealRecord) => void;
  onDelete: (row: MealRecord) => void;
  onHardDelete: (row: MealRecord) => void;
  onFiltersChange: (filters: MealRecordTableFilters) => void;
  onPageChange: (page: number) => void; // 1-based
  onLimitChange: (limit: number) => void;
  onRefresh: () => void;
}

export const MealRecordTable = React.memo(function MealRecordTable({
  rows,
  total,
  page,
  limit,
  loading,
  filters,
  mealPlans,
  users,
  onCreate,
  onEdit,
  onDelete,
  onHardDelete,
  onFiltersChange,
  onPageChange,
  onLimitChange,
  onRefresh,
}: MealRecordTableProps): React.JSX.Element {
  const { t } = useTranslation();
  const formatDate = useDateFormatter();
  const isXl = useMediaQuery((theme: Theme) => theme.breakpoints.up('xl'));

  const stateLabelMap = React.useMemo(
    () => ({
      CREATE: t('meals.records.states.create'),
      DRAFT: t('meals.records.states.draft'),
      FINISH: t('meals.records.states.finish'),
    }),
    [t],
  );

  const columns = React.useMemo<GridColDef<MealRecord>[]>(() => [
    {
      field: 'userId',
      headerName: t('common.labels.user'),
      flex: 1,
      minWidth: 180,
      valueFormatter: (value: string) => {
        const user = users.find((candidate) => candidate.id === value);
        return user ? `${user.first_name} ${user.last_name}` : value;
      },
    },
    {
      field: 'mealPlanId',
      headerName: t('common.labels.meal_plan'),
      flex: 1,
      minWidth: 180,
      valueFormatter: (value: string) => {
        const plan = mealPlans.find((candidate) => candidate.id === value);
        return plan ? plan.label : value;
      },
    },
    {
      field: 'mealDayId',
      headerName: t('common.labels.meal_day'),
      flex: 1,
      minWidth: 160,
      valueFormatter: (value: string) => {
        for (const plan of mealPlans) {
          const day = plan.days.find((candidate) => candidate.id === value);
          if (day) return day.label;
        }
        return value;
      },
    },
    {
      field: 'mealId',
      headerName: t('common.labels.meal'),
      flex: 1,
      minWidth: 160,
      valueFormatter: (value: string) => {
        for (const plan of mealPlans) {
          for (const day of plan.days) {
            const meal = day.meals.find((candidate) => candidate.id === value);
            if (meal) return meal.label;
          }
        }
        return value;
      },
    },
    {
      field: 'state',
      headerName: t('meals.records.labels.state'),
      width: 140,
      valueFormatter: (value: MealRecordState) => stateLabelMap[value] ?? value,
    },
    ...(isXl
      ? [
        {
          field: 'createdAt',
          headerName: t('common.labels.created'),
          valueFormatter: (value: string) => formatDate(value),
          flex: 1,
          minWidth: 170,
        },
        {
          field: 'updatedAt',
          headerName: t('common.labels.updated'),
          valueFormatter: (value: string) => formatDate(value),
          flex: 1,
          minWidth: 170,
        },
      ]
      : []),
    {
      field: 'actions',
      headerName: t('common.labels.actions'),
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('common.tooltips.edit')}>
            <IconButton
              size="small"
              aria-label={`edit-${params.row.id}`}
              onClick={() => onEdit(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.tooltips.delete')}>
            <IconButton
              size="small"
              aria-label={`delete-${params.row.id}`}
              onClick={() => onDelete(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.buttons.delete')}>
            <IconButton
              size="small"
              aria-label={`hard-delete-${params.row.id}`}
              color="error"
              onClick={() => onHardDelete(params.row)}
            >
              <DeleteForeverIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [formatDate, isXl, mealPlans, onDelete, onEdit, onHardDelete, stateLabelMap, t, users]);

  const mealPlanOptions = React.useMemo<Option[]>(
    () => mealPlans.map((plan) => ({ id: plan.id, label: plan.label })),
    [mealPlans],
  );

  const athleteOptions = React.useMemo<Option[]>(
    () =>
      users.map((athlete) => ({
        id: athlete.id,
        label: `${athlete.first_name} ${athlete.last_name} (${athlete.email})`,
      })),
    [users],
  );

  const selectedAthlete = React.useMemo(
    () => athleteOptions.find((option) => option.id === filters.userId) || null,
    [athleteOptions, filters.userId],
  );

  const selectedMealPlanOption = React.useMemo(
    () => mealPlanOptions.find((option) => option.id === filters.mealPlanId) || null,
    [mealPlanOptions, filters.mealPlanId],
  );

  const handleFilterChange = (partial: Partial<MealRecordTableFilters>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* General information */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        sx={{ mb: 1 }}
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <Autocomplete
          options={athleteOptions}
          value={selectedAthlete}
          onChange={(_, newValue) => handleFilterChange({ userId: newValue?.id || '' })}
          sx={{ minWidth: 200 }}
          size="small"
          renderInput={(params) => <TextField {...params} label={t('common.labels.user')} />}
        />
        <Autocomplete
          options={mealPlanOptions}
          value={selectedMealPlanOption}
          onChange={(_, newValue) => handleFilterChange({ mealPlanId: newValue?.id || '' })}
          sx={{ minWidth: 200 }}
          size="small"
          renderInput={(params) => <TextField {...params} label={t('common.labels.meal_plan')} />}
        />
        <TextField
          select
          label={t('meals.records.filters.state')}
          value={filters.state}
          onChange={(event) => handleFilterChange({ state: event.target.value as MealRecordState | '' })}
          size="small"
          inputProps={{ 'aria-label': 'filter-state' }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">{t('meals.records.filters.state_all')}</MenuItem>
          <MenuItem value="CREATE">{stateLabelMap.CREATE}</MenuItem>
          <MenuItem value="DRAFT">{stateLabelMap.DRAFT}</MenuItem>
          <MenuItem value="FINISH">{stateLabelMap.FINISH}</MenuItem>
        </TextField>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={t('common.buttons.refresh')}>
          <IconButton onClick={onRefresh} sx={{ mr: 1 }} aria-label="refresh-meal-records">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Button variant="contained" onClick={onCreate}>
          {t('common.buttons.create')}
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
        aria-label="meal-records-table"
      />
    </Box>
  );
});
