// src/components/programs/SessionTables.tsx
import * as React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Button, Chip, IconButton, Stack, TextField, Tooltip } from '@mui/material';
import { useDateFormatter } from '@hooks/useDateFormatter';
import type { Session } from '@hooks/useSessions';

export interface SessionTablesProps {
  rows: Session[];
  total: number;
  page: number; // 1-based
  limit: number;
  q: string;
  loading: boolean;
  onCreate: () => void;
  onEdit: (row: Session) => void;
  onDelete: (row: Session) => void;
  onQueryChange: (q: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const SessionTables = React.memo(function SessionTables({
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
}: SessionTablesProps): React.JSX.Element {
  const fmtDate = useDateFormatter();

  const columns = React.useMemo<GridColDef<Session>[]>(() => [
    { field: 'slug', headerName: 'Slug', flex: 1, minWidth: 160 },
    { field: 'title', headerName: 'Title', flex: 1.4, minWidth: 180 },
    { field: 'locale', headerName: 'Locale', width: 100 },
    {
      field: 'durationMin',
      headerName: 'Duration (min)',
      width: 130,
      valueFormatter: (params:any) => `${params.value}`,
    },
    {
      field: 'exerciseIds',
      headerName: 'Exercises',
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Chip
          size="small"
          label={`${p.row.exerciseIds.length} linked`}
          color={p.row.exerciseIds.length > 0 ? 'primary' : 'default'}
        />
      ),
    },
    {
      field: 'creator',
      headerName: 'Creator',
      flex: 1,
      minWidth: 170,
      valueFormatter: (p: any) => p?.email ?? '',
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      flex: 1,
      minWidth: 170,
      valueFormatter: (p: any) => fmtDate(p),
    },
    {
      field: 'updatedAt',
      headerName: 'Updated',
      flex: 1,
      minWidth: 170,
      valueFormatter: (p: any) => fmtDate(p),
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
          onChange={(e) => onQueryChange(e.target.value)}
          inputProps={{ 'aria-label': 'search-sessions' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>
          New Session
        </Button>
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
        aria-label="session-table"
      />
    </Box>
  );
});
