// src/components/programs/ProgramRecordTable.tsx
import * as React from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
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
import { useTranslation } from 'react-i18next';

import type { ProgramRecord, ProgramRecordState } from '@hooks/useProgramRecords';
import type { Program } from '@hooks/usePrograms';
import type { User } from '@hooks/useUsers';
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
  programs: Program[];
  users: User[];
  onCreate: () => void;
  onEdit: (row: ProgramRecord) => void;
  onDelete: (row: ProgramRecord) => void;
  onHardDelete: (row: ProgramRecord) => void;
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
  programs,
  users,
  onCreate,
  onEdit,
  onDelete,
  onHardDelete,
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
      {
        field: 'userId',
        headerName: t('common.labels.user'),
        flex: 1,
        minWidth: 180,
        valueFormatter: (value: string) => {
          const user = users.find((u) => u.id === value);
          return user ? `${user.first_name} ${user.last_name}` : value;
        },
      },
      {
        field: 'programId',
        headerName: t('common.labels.program'),
        flex: 1,
        minWidth: 180,
        valueFormatter: (value: string) => {
          const program = programs.find((p) => p.id === value);
          return program ? program.label : value;
        },
      },
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
    ],
    [formatDate, isXl, onEdit, onDelete, onHardDelete, stateLabelMap, t, users, programs],
  );

  const programOptions = React.useMemo(
    () => programs.map((program) => ({ id: program.id, label: program.label })),
    [programs],
  );

  const athleteOptions = React.useMemo(
    () =>
      users.map((athlete) => ({
        id: athlete.id,
        label: `${athlete.first_name} ${athlete.last_name} (${athlete.email})`,
      })),
    [users],
  );

  const selectedAthlete = React.useMemo(
    () => athleteOptions.find((o) => o.id === filters.userId) || null,
    [athleteOptions, filters.userId],
  );

  const selectedProgram = React.useMemo(
    () => programOptions.find((o) => o.id === filters.programId) || null,
    [programOptions, filters.programId],
  );

  const handleFilterChange = (partial: Partial<ProgramRecordTableFilters>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  return (
    <Box sx={{ width: '100%' }}>
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
          options={programOptions}
          value={selectedProgram}
          onChange={(_, newValue) => handleFilterChange({ programId: newValue?.id || '' })}
          sx={{ minWidth: 200 }}
          size="small"
          renderInput={(params) => <TextField {...params} label={t('common.labels.program')} />}
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
