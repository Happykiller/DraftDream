import * as React from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { Note, NoteUser } from '@hooks/useNotes';
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

  const formatUserLabel = React.useCallback((user?: NoteUser | null) => {
    if (!user) return '—';
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
    return name || user.email || user.id;
  }, []);

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
        field: 'athlete',
        headerName: t('notes.table.columns.athlete'),
        minWidth: 180,
        flex: 0.7,
        valueGetter: (_value, row) => formatUserLabel(row.athlete),
      },
      {
        field: 'creator',
        headerName: t('notes.table.columns.created_by'),
        minWidth: 180,
        flex: 0.7,
        valueGetter: (_value, row) => formatUserLabel(row.creator),
      },
      {
        field: 'createdAt',
        headerName: t('notes.table.columns.created_at'),
        minWidth: 180,
        flex: 0.7,
        valueFormatter: (value) => formatDate(value),
      },
    ],
    [formatDate, formatUserLabel, t],
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
