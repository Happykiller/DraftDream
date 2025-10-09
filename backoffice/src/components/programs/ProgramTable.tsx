// src/components/programs/ProgramTable.tsx
import * as React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Autocomplete, Box, Button, Chip, IconButton, Stack, TextField, Tooltip } from '@mui/material';

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

  const columns = React.useMemo<GridColDef<Program>[]>(() => [
    { field: 'name', headerName: 'Name', flex: 1.4, minWidth: 180 },
    {
      field: 'duration',
      headerName: 'Duration (weeks)',
      width: 150,
      valueFormatter: (value: any) => `${value}`,
    },
    {
      field: 'frequency',
      headerName: 'Frequency / week',
      width: 160,
      valueFormatter: (value: any) => `${value}`,
    },
    {
      field: 'userId',
      headerName: 'User',
      flex: 1,
      minWidth: 160,
      valueFormatter: (value: any) => value || '',
    },
    {
      field: 'sessionIds',
      headerName: 'Sessions',
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Chip
          size="small"
          label={`${p.row.sessionIds.length} linked`}
          color={p.row.sessionIds.length > 0 ? 'primary' : 'default'}
        />
      ),
    },
    {
      field: 'creator',
      headerName: 'Creator',
      flex: 1,
      minWidth: 170,
      valueFormatter: (params: any) => params?.email ?? '',
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      flex: 1,
      minWidth: 170,
      valueFormatter: (params: any) => fmtDate(params),
    },
    {
      field: 'updatedAt',
      headerName: 'Updated',
      flex: 1,
      minWidth: 170,
      valueFormatter: (params: any) => fmtDate(params),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton size="small" aria-label={`edit-${p.row.id}`} onClick={() => onEdit(p.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" aria-label={`delete-${p.row.id}`} onClick={() => onDelete(p.row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [onEdit, onDelete, fmtDate]);

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ mb: 1 }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <TextField
          placeholder="Search..."
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
            onChange={(_, v) => onUserFilterChange && onUserFilterChange(v)}
            getOptionLabel={(opt) => opt?.email || ''}
            renderInput={(params) => <TextField {...params} placeholder="Filter by user" />}
          />)
        }
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>
          New Program
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
