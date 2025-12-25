// src/components/prospects/ProspectLevelTable.tsx
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, type GridColDef, type GridValueFormatterParams } from '@mui/x-data-grid';
import { Box, Button, IconButton, Stack, TextField, Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import type { ProspectLevel } from '@hooks/useProspectLevels';
import { useDateFormatter } from '@src/hooks/useDateFormatter';

export interface ProspectLevelTableProps {
  rows: ProspectLevel[];
  total: number;
  page: number; // 1-based
  limit: number;
  q: string;
  loading: boolean;
  onCreate: () => void;
  onEdit: (row: ProspectLevel) => void;
  onDelete: (row: ProspectLevel) => void;
  onQueryChange: (q: string) => void;
  onPageChange: (page: number) => void; // 1-based
  onLimitChange: (limit: number) => void;
}

export function ProspectLevelTable(props: ProspectLevelTableProps): React.JSX.Element {
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
  const { t } = useTranslation();
  const fmtDate = useDateFormatter();
  const theme = useTheme();
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  const columns = React.useMemo<GridColDef<ProspectLevel>[]>(
    () => [
      { field: 'label', headerName: t('common.labels.label'), flex: 1 },
      { field: 'locale', headerName: t('common.labels.locale'), width: 120 },
      { field: 'visibility', headerName: t('common.labels.visibility'), width: 140 },
      ...(isXl
        ? [
          {
            field: 'createdAt',
            headerName: t('common.labels.created'),
            valueFormatter: (params: GridValueFormatterParams<ProspectLevel>) => fmtDate(params.value),
            flex: 1,
          },
          {
            field: 'updatedAt',
            headerName: t('common.labels.updated'),
            valueFormatter: (params: GridValueFormatterParams<ProspectLevel>) => fmtDate(params.value),
            flex: 1,
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
    [fmtDate, onDelete, onEdit, t, isXl],
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
        <TextField
          placeholder={t('prospects.levels.search_placeholder')}
          value={q}
          onChange={(event) => onQueryChange(event.target.value)}
          inputProps={{ 'aria-label': 'search-levels' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={onCreate}>
          {t('prospects.levels.create')}
        </Button>
      </Stack>

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
        aria-label="prospect-levels-table"
        pageSizeOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
