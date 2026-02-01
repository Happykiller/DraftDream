import * as React from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { Note } from '@hooks/useNotes';
import { useDateFormatter } from '@hooks/useDateFormatter';

interface NotesTableProps {
  rows: Note[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function NotesTable({
  rows,
  total,
  page,
  limit,
  loading,
  onPageChange,
  onLimitChange,
}: NotesTableProps): React.JSX.Element {
  const { t } = useTranslation();
  const formatDate = useDateFormatter();

  const columns = React.useMemo<GridColDef<Note>[]>(
    () => [
      {
        field: 'label',
        headerName: t('notes.table.columns.label'),
        flex: 0.8,
        minWidth: 160,
      },
      {
        field: 'description',
        headerName: t('notes.table.columns.description'),
        flex: 1.4,
        minWidth: 240,
      },
      {
        field: 'athleteId',
        headerName: t('notes.table.columns.athlete'),
        minWidth: 180,
        flex: 0.7,
        valueGetter: (value) => value || '—',
      },
      {
        field: 'createdBy',
        headerName: t('notes.table.columns.created_by'),
        minWidth: 180,
        flex: 0.7,
      },
      {
        field: 'createdAt',
        headerName: t('notes.table.columns.created_at'),
        minWidth: 180,
        flex: 0.7,
        valueFormatter: (value) => formatDate(value),
      },
    ],
    [formatDate, t],
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* General information */}
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
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        autoHeight
        aria-label="notes-table"
      />
    </Box>
  );
}
