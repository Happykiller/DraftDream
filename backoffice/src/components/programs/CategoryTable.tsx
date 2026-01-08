// src/components/programs/CategoryTable.tsx
import * as React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';

import { Box, Button, Stack, TextField, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import type { Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { Category } from '@hooks/useCategories';
import { useDateFormatter } from '@hooks/useDateFormatter';
import { getVisibilityLabel } from '../../commons/visibility';

export interface CategoryTableProps {
  rows: Category[];
  total: number;
  page: number; // 1-based
  limit: number;
  q: string;
  loading: boolean;
  onCreate: () => void;
  onEdit: (row: Category) => void;
  onDelete: (row: Category) => void;
  onQueryChange: (q: string) => void;
  onPageChange: (page: number) => void; // 1-based
  onLimitChange: (limit: number) => void;
}

export function CategoryTable(props: CategoryTableProps): React.JSX.Element {
  const {
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
  } = props;
  const fmtDate = useDateFormatter();
  const { t } = useTranslation();
  // Responsive: Hide Created/Updated on smaller screens
  const isXl = useMediaQuery((theme: Theme) => theme.breakpoints.up('xl'));


  const columns = React.useMemo<GridColDef<Category>[]>(
    () => [
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
        valueGetter: (value: any) => value?.email ?? '—',
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
    ],
    [fmtDate, onDelete, onEdit, t, isXl]
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* General information */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ mb: 1 }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        {/* Search input pushes the filter upstream instead of client-side to keep pagination accurate. */}
        <TextField
          placeholder={t('programs.categories.search_placeholder')}
          value={q}
          onChange={(event) => onQueryChange(event.target.value)}
          inputProps={{ 'aria-label': 'search-categories' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>
          {t('programs.categories.create')}
        </Button>
      </Stack>

      {/* Server-driven pagination avoids downloading the full catalogue in backoffice sessions. */}
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
        disableRowSelectionOnClick
        autoHeight
        aria-label="categories-table"
        pageSizeOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
