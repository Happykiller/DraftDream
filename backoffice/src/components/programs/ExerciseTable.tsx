// src/components/programs/ExerciseTable.tsx
import * as React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Button, Stack, TextField, IconButton, Tooltip, Chip } from '@mui/material';
import type { Exercise } from '@hooks/useExercises';
import { useDateFormatter } from '@hooks/useDateFormatter';

export interface ExerciseTableProps {
  rows: Exercise[];
  total: number;
  page: number;   // 1-based
  limit: number;
  q: string;
  loading: boolean;
  onCreate: () => void;
  onEdit: (row: Exercise) => void;
  onDelete: (row: Exercise) => void;
  onQueryChange: (q: string) => void;
  onPageChange: (page: number) => void; // 1-based
  onLimitChange: (limit: number) => void;
}

export const ExerciseTable = React.memo(function ExerciseTable({
  rows, total, page, limit, q, loading, onCreate, onEdit, onDelete, onQueryChange, onPageChange, onLimitChange,
}: ExerciseTableProps): React.JSX.Element {
  const fmtDate = useDateFormatter();

  const columns = React.useMemo<GridColDef<Exercise>[]>(() => [
    { field: 'slug', headerName: 'Slug', flex: 1, minWidth: 140 },
    { field: 'name', headerName: 'Name', flex: 1.4, minWidth: 160 },
    { field: 'locale', headerName: 'Locale', width: 90 },
    { field: 'level', headerName: 'Level', width: 130 },
    { field: 'series', headerName: 'Series', width: 110 },
    { field: 'repetitions', headerName: 'Reps', width: 110 },
    {
      field: 'videoUrl',
      headerName: 'Video',
      width: 100,
      renderCell: (p) => p.row.videoUrl ? <Chip size="small" label="Link" component="a" href={p.row.videoUrl} clickable target="_blank" rel="noreferrer" /> : null,
      sortable: false, filterable: false,
    },
    {
      field: 'creator',
      headerName: 'Creator',
      flex: 1,
      minWidth: 170,
      valueFormatter: (p: any) => p?.email ?? '',
    },
    { field: 'visibility', headerName: 'Visibility', width: 130 },
    { field: 'createdAt', headerName: 'Created', valueFormatter: (p: any) => fmtDate(p), flex: 1, minWidth: 170 },
    { field: 'updatedAt', headerName: 'Updated', valueFormatter: (p: any) => fmtDate(p), flex: 1, minWidth: 170 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit"><IconButton size="small" aria-label={`edit-${p.row.id}`} onClick={() => onEdit(p.row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" aria-label={`delete-${p.row.id}`} onClick={() => onDelete(p.row)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
        </Stack>
      ),
    },
  ], [onEdit, onDelete, fmtDate]);

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <TextField
          placeholder="Search…"
          value={q}
          onChange={(e) => onQueryChange(e.target.value)}
          inputProps={{ 'aria-label': 'search-exercises' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>New Exercise</Button>
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
        aria-label="exercise-table"
      />
    </Box>
  );
});
