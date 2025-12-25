// src/components/programs/SessionTables.tsx
import * as React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, type GridColDef, type GridValueFormatterParams } from '@mui/x-data-grid';

import { Box, Button, Chip, IconButton, Stack, TextField, Tooltip, useMediaQuery } from '@mui/material';
import type { Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDateFormatter } from '@hooks/useDateFormatter';
import type { Session } from '@hooks/useSessions';
import { getVisibilityLabel } from '../../commons/visibility';

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
  const { t } = useTranslation();
  // Responsive: Hide Created/Updated on smaller screens
  const isXl = useMediaQuery((theme: Theme) => theme.breakpoints.up('xl'));


  const columns = React.useMemo<GridColDef<Session>[]>(() => [
    { field: 'label', headerName: t('common.labels.label'), flex: 1.4, minWidth: 180 },
    { field: 'locale', headerName: t('common.labels.locale'), width: 100 },
    {
      field: 'durationMin',
      headerName: t('common.labels.duration_minutes'),
      width: 130,
      valueFormatter: (params: GridValueFormatterParams<Session>) => `${params.value}`,
    },
    {
      field: 'exerciseIds',
      headerName: t('common.labels.exercises'),
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Chip
          size="small"
          label={t('programs.sessions.table.exercises_linked', { count: p.row.exerciseIds.length })}
          color={p.row.exerciseIds.length > 0 ? 'primary' : 'default'}
        />
      ),
    },
    {
      field: 'visibility',
      headerName: t('common.labels.visibility'),
      width: 140,
      renderCell: ({ value }) => getVisibilityLabel(value, t),
    },
    {
      field: 'creator',
      headerName: t('common.labels.creator'),
      flex: 1,
      minWidth: 170,
      valueFormatter: (params: GridValueFormatterParams<Session>) => params.value?.email ?? '',
    },
    ...(isXl
      ? [
        {
          field: 'createdAt',
          headerName: t('common.labels.created'),
          flex: 1,
          minWidth: 170,
          valueFormatter: (params: GridValueFormatterParams<Session>) => fmtDate(params.value),
        },
        {
          field: 'updatedAt',
          headerName: t('common.labels.updated'),
          flex: 1,
          minWidth: 170,
          valueFormatter: (params: GridValueFormatterParams<Session>) => fmtDate(params.value),
        },
      ]
      : []),
    {
      field: 'actions',
      headerName: t('common.labels.actions'),
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t('common.tooltips.edit')}>
            <IconButton size="small" aria-label={`edit-${p.row.id}`} onClick={() => onEdit(p.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.tooltips.delete')}>
            <IconButton size="small" aria-label={`delete-${p.row.id}`} onClick={() => onDelete(p.row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [onEdit, onDelete, fmtDate, t, isXl]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* General information */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ mb: 1 }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        {/* Search funnels into the hook so locale filtering stays consistent with other tabs. */}
        <TextField
          placeholder={t('programs.sessions.search_placeholder')}
          value={q}
          onChange={(e) => onQueryChange(e.target.value)}
          inputProps={{ 'aria-label': 'search-sessions' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>
          {t('programs.sessions.create')}
        </Button>
      </Stack>

      {/* Server pagination lets us reuse backend access rules for session visibility. */}
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
