// src/components/users/UsersTable.tsx
import * as React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Button, Stack, TextField, IconButton, Tooltip, Chip, Select, MenuItem, FormControl, InputLabel, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import type { User } from '@hooks/useUsers';
import { useDateFormatter } from '@src/hooks/useDateFormatter';

export interface UsersTableProps {
  rows: User[];
  total: number;
  page: number;   // 1-based
  limit: number;
  q: string;
  type?: string;
  loading: boolean;
  onCreate: () => void;
  onEdit: (row: User) => void;
  onDelete: (row: User) => void;
  onQueryChange: (q: string) => void;
  onTypeChange: (type: string) => void;
  onPageChange: (page: number) => void; // 1-based
  onLimitChange: (limit: number) => void;
}

export const UsersTable = React.memo(function UsersTable({
  rows, total, page, limit, q, type, loading,
  onCreate, onEdit, onDelete, onQueryChange, onTypeChange, onPageChange, onLimitChange,
}: UsersTableProps): React.JSX.Element {
  const fmtDate = useDateFormatter();
  const theme = useTheme();
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  const columns = React.useMemo<GridColDef<User>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        flex: 1.2,
        valueGetter: (_value, row) => {
          const full = `${row?.first_name ?? ''} ${row?.last_name ?? ''}`.trim();
          return full || '—';
        },
        sortComparator: (a, b) => String(a).localeCompare(String(b)),
      },
      { field: 'email', headerName: 'Email', flex: 1 },
      { field: 'type', headerName: 'Type' },
      {
        field: 'is_active',
        headerName: 'Status',
        renderCell: (params) => (
          <Chip size="small" label={params.value ? 'Active' : 'Inactive'} color={params.value ? 'success' : 'default'} />
        ),
        sortable: false,
        filterable: false,
      },
      ...(isXl
        ? [
          {
            field: 'company',
            headerName: 'Company',
            flex: 1,
            valueGetter: (p: any) => p?.name ?? '—',
          },
          { field: 'createdAt', headerName: 'Created', flex: 1, minWidth: 180, valueFormatter: (p: any) => fmtDate(p) },
          { field: 'updatedAt', headerName: 'Updated', flex: 1, minWidth: 180, valueFormatter: (p: any) => fmtDate(p) },
        ]
        : []),
      {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        filterable: false,
        renderCell: (p) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit">
              <IconButton size="small" aria-label={`edit-${p?.row.id}`} onClick={() => onEdit(p.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" aria-label={`delete-${p?.row.id}`} onClick={() => onDelete(p.row)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [onEdit, onDelete, fmtDate, isXl]
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <TextField
          placeholder="Search…"
          value={q}
          onChange={(e) => onQueryChange(e.target.value)}
          inputProps={{ 'aria-label': 'search-users' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="user-type-filter-label">Type</InputLabel>
          <Select
            labelId="user-type-filter-label"
            id="user-type-filter"
            value={type || ''}
            label="Type"
            onChange={(e) => onTypeChange(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="athlete">Athlete</MenuItem>
            <MenuItem value="coach">Coach</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>New User</Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        loading={loading}
        rowCount={total}
        paginationMode="server"
        sortingMode="client"
        paginationModel={{ page: page - 1, pageSize: limit }}
        onPaginationModelChange={(m) => {
          if (m.page !== page - 1) onPageChange(m.page + 1);
          if (m.pageSize !== limit) onLimitChange(m.pageSize);
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        disableRowSelectionOnClick
        autoHeight
        aria-label="users-table"
      />
    </Box>
  );
});
