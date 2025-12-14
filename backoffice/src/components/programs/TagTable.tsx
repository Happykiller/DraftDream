// src/components/programs/TagTable.tsx
import * as React from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Stack, TextField, IconButton, Tooltip, useMediaQuery } from '@mui/material';

import { useTranslation } from 'react-i18next';
import type { Tag } from '@src/hooks/useTags';
import { useDateFormatter } from '@src/hooks/useDateFormatter';
import { getVisibilityLabel } from '../../commons/visibility';

export interface TagTableProps {
  rows: Tag[];
  total: number;
  page: number; // 1-based
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
}: TagTableProps): React.JSX.Element {
  const fmtDate = useDateFormatter();
  const { t } = useTranslation();
  // Responsive: Hide Created/Updated on smaller screens
  const isXl = useMediaQuery((theme: any) => theme.breakpoints.up('xl'));


  const columns = React.useMemo<GridColDef<Tag>[]>(() => [
    { field: 'label', headerName: t('common.labels.label'), flex: 1 },
    { field: 'locale', headerName: t('common.labels.locale'), width: 120 },
    {
      field: 'visibility',
      headerName: t('common.labels.visibility'),
      width: 140,
      renderCell: ({ value }) => getVisibilityLabel(value, t),
    },
    {
      field: 'creator',
      headerName: t('common.labels.creator'),
      valueGetter: (params: any) => params?.email,
      flex: 1,
    },
    ...(isXl
      ? [
        {
          field: 'createdAt',
          headerName: t('common.labels.created'),
          valueFormatter: (value: any) => fmtDate(value),
          flex: 1,
          minWidth: 170,
        },
        {
          field: 'updatedAt',
          headerName: t('common.labels.updated'),
          valueFormatter: (value: any) => fmtDate(value),
          flex: 1,
          minWidth: 170,
        },
      ]
      : []),
    {
      field: 'actions',
      headerName: t('common.labels.actions'),
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t('common.tooltips.edit')}>
            <IconButton size="small" aria-label={`edit-${params.row.id}`} onClick={() => onEdit(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.tooltips.delete')}>
            <IconButton size="small" aria-label={`delete-${params.row.id}`} onClick={() => onDelete(params.row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ], [fmtDate, onDelete, onEdit, t, isXl]);

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ mb: 1 }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        {/* Search delegates to the hook so we reuse backend filtering logic. */}
        <TextField
          placeholder={t('programs.tags.search_placeholder')}
          value={q}
          onChange={(event) => onQueryChange(event.target.value)}
          inputProps={{ 'aria-label': 'search-tags' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>
          {t('programs.tags.create')}
        </Button>
      </Stack>

      {/* Rely on server pagination because tag volumes can spike with marketing campaigns. */}
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
        aria-label="tags-table"
      />
    </Box>
  );
});
