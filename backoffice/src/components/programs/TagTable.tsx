//  src/components/programs/TagTable.tsx
import * as React from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Stack, TextField, IconButton, Tooltip } from '@mui/material';
import type { Tag } from '@src/hooks/useTags';
import { useDateFormatter } from '@src/hooks/useDateFormatter';

export interface TagTableProps {
  rows: Tag[];
  total: number;
  page: number;   // 1-based
  limit: number;
  q: string;
  loading: boolean;
  onCreate: () => void;
  onEdit: (row: Tag) => void;
  onDelete: (row: Tag) => void;
  onQueryChange: (q: string) => void;
  onPageChange: (page: number) => void; // 1-based
  onLimitChange: (limit: number) => void;
}

export const TagTable = React.memo(function TagTable({
  rows, total, page, limit, q, loading,
  onCreate, onEdit, onDelete, onQueryChange, onPageChange, onLimitChange,
}: TagTableProps): React.JSX.Element {
  const fmtDate = useDateFormatter();

  const columns = React.useMemo<GridColDef<Tag>[]>(
    () => [
      { field: 'slug', headerName: 'Slug', flex: 1 },
      { field: 'locale', headerName: 'Locale' },
      { field: 'visibility', headerName: 'Visibility' },
      {
        field: 'creator', headerName: 'Created', valueGetter: (p: any) => p.email, flex: 1
      },
      { field: 'createdAt', headerName: 'Created', valueFormatter: (p) => fmtDate(p), flex: 1 },
      { field: 'updatedAt', headerName: 'Updated', valueFormatter: (p) => fmtDate(p), flex: 1 },
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
    ],
    [onEdit, onDelete, fmtDate]
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <TextField
          placeholder="Search…"
          value={q}
          onChange={(e) => onQueryChange(e.target.value)}
          inputProps={{ 'aria-label': 'search-tags' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>New Tag</Button>
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
        aria-label="tags-table"
      />
    </Box>
  );
});
