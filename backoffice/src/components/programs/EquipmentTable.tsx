// src/components/programs/EquipmentTable.tsx
import * as React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Button, Stack, TextField, IconButton, Tooltip } from '@mui/material';

import type { Equipment } from '@hooks/useEquipment';
import { useDateFormatter } from '@hooks/useDateFormatter';

export interface EquipmentTableProps {
  rows: Equipment[];
  total: number;
  page: number;   // 1-based
  limit: number;
  q: string;
  loading: boolean;
  onCreate: () => void;
  onEdit: (row: Equipment) => void;
  onDelete: (row: Equipment) => void;
  onQueryChange: (q: string) => void;
  onPageChange: (page: number) => void; // 1-based
  onLimitChange: (limit: number) => void;
}


export const EquipmentTable = React.memo(function EquipmentTable({
  rows, total, page, limit, q, loading, onCreate, onEdit, onDelete, onQueryChange, onPageChange, onLimitChange,
}: EquipmentTableProps): React.JSX.Element {
  const fmtDate = useDateFormatter();

  const columns = React.useMemo<GridColDef<Equipment>[]>(
    () => [
      { field: 'slug', headerName: 'Slug', flex: 1, minWidth: 150 },
      { field: 'locale', headerName: 'Locale', width: 120 },
      { field: 'visibility', headerName: 'Visibility', width: 140 },
      {
        field: 'creator',
        headerName: 'Creator',
        flex: 1,
        minWidth: 180,
        valueFormatter: (p:any) => p.email,
      },
      { field: 'createdAt', headerName: 'Created', valueFormatter: (p:any) => fmtDate(p), flex: 1, minWidth: 180 },
      { field: 'updatedAt', headerName: 'Updated', valueFormatter: (p:any) => fmtDate(p), flex: 1, minWidth: 180 },
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
          inputProps={{ 'aria-label': 'search-equipment' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>New Equipment</Button>
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
        aria-label="equipment-table"
      />
    </Box>
  );
});
