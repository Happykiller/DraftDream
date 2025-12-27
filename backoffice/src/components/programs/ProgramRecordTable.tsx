// src/components/programs/ProgramRecordTable.tsx
import * as React from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { ProgramRecord, ProgramRecordState } from '@hooks/useProgramRecords';
import { useDateFormatter } from '@hooks/useDateFormatter';

export interface ProgramRecordTableFilters {
  userId: string;
  programId: string;
  state: ProgramRecordState | '';
}

export interface ProgramRecordTableProps {
  rows: ProgramRecord[];
  total: number;
  page: number; // 1-based
  limit: number;
  loading: boolean;
  filters: ProgramRecordTableFilters;
  onCreate: () => void;
  onEdit: (row: ProgramRecord) => void;
  onFiltersChange: (filters: ProgramRecordTableFilters) => void;
  onPageChange: (page: number) => void; // 1-based
  onLimitChange: (limit: number) => void;
}

export const ProgramRecordTable = React.memo(function ProgramRecordTable({
  rows,
  total,
  page,
  limit,
  loading,
  filters,
  onCreate,
  onEdit,
  onFiltersChange,
  onPageChange,
  onLimitChange,
}: ProgramRecordTableProps): React.JSX.Element {
  const { t } = useTranslation();
  const formatDate = useDateFormatter();
  const isXl = useMediaQuery((theme: any) => theme.breakpoints.up('xl'));

  const stateLabelMap = React.useMemo(
    () => ({
      CREATE: t('programs.records.states.create'),
      IDLE: t('programs.records.states.idle'),
      SAVE: t('programs.records.states.save'),
    }),
    [t],
  );

  const columns = React.useMemo<GridColDef<ProgramRecord>[]>(
    () => [
      { field: 'userId', headerName: t('common.labels.user'), flex: 1, minWidth: 180 },
      { field: 'programId', headerName: t('common.labels.program'), flex: 1, minWidth: 180 },
      {
        field: 'state',
        headerName: t('programs.records.labels.state'),
        width: 140,
        valueFormatter: (value: ProgramRecordState) => stateLabelMap[value] ?? value,
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
        width: 100,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Tooltip title={t('common.tooltips.edit')}>
            <IconButton
              size="small"
              aria-label={`edit-${params.row.id}`}
              onClick={() => onEdit(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [formatDate, isXl, onEdit, stateLabelMap, t],
  );

  const handleFilterChange = (partial: Partial<ProgramRecordTableFilters>) => {
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
        {/* Filters target specific record keys to keep list queries efficient. */}
        <TextField
          label={t('programs.records.filters.user')}
          value={filters.userId}
          onChange={(event) => handleFilterChange({ userId: event.target.value })}
          size="small"
          inputProps={{ 'aria-label': 'filter-user-id' }}
          sx={{ minWidth: 200 }}
        />
        <TextField
          label={t('programs.records.filters.program')}
          value={filters.programId}
          onChange={(event) => handleFilterChange({ programId: event.target.value })}
          size="small"
          inputProps={{ 'aria-label': 'filter-program-id' }}
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          label={t('programs.records.filters.state')}
          value={filters.state}
          onChange={(event) => handleFilterChange({ state: event.target.value as ProgramRecordState | '' })}
          size="small"
          inputProps={{ 'aria-label': 'filter-state' }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">{t('programs.records.filters.state_all')}</MenuItem>
          <MenuItem value="CREATE">{stateLabelMap.CREATE}</MenuItem>
          <MenuItem value="IDLE">{stateLabelMap.IDLE}</MenuItem>
          <MenuItem value="SAVE">{stateLabelMap.SAVE}</MenuItem>
        </TextField>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>
          {t('programs.records.create')}
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
        aria-label="program-records-table"
      />
    </Box>
  );
});
