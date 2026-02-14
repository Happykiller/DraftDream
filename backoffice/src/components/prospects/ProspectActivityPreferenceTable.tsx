// src/components/prospects/ProspectActivityPreferenceTable.tsx
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Button, IconButton, Stack, TextField, Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import type { ProspectActivityPreference } from '@hooks/useProspectActivityPreferences';
import { useDateFormatter } from '@src/hooks/useDateFormatter';

export interface ProspectActivityPreferenceTableProps {
  rows: ProspectActivityPreference[];
  total: number;
  page: number; // 1-based
  limit: number;
  q: string;
  loading: boolean;
  onCreate: () => void;
  onRefresh: () => void;
  onEdit: (row: ProspectActivityPreference) => void;
  onDelete: (row: ProspectActivityPreference) => void;
  onHardDelete: (row: ProspectActivityPreference) => void;
  onQueryChange: (q: string) => void;
  onPageChange: (page: number) => void; // 1-based
  onLimitChange: (limit: number) => void;
  onRefresh?: () => void;
}

export const ProspectActivityPreferenceTable = React.memo(function ProspectActivityPreferenceTable({
  rows, total, page, limit, q, loading,
  onCreate, onEdit, onDelete, onHardDelete, onQueryChange, onPageChange, onLimitChange, onRefresh,
}: ProspectActivityPreferenceTableProps): React.JSX.Element {
  const { t } = useTranslation();
  const fmtDate = useDateFormatter();
  const theme = useTheme();
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  const columns = React.useMemo<GridColDef<ProspectActivityPreference>[]>(
    () => [
      { field: 'label', headerName: t('common.labels.label'), flex: 1 },
      { field: 'locale', headerName: t('common.labels.locale'), width: 120 },
      { field: 'visibility', headerName: t('common.labels.visibility'), width: 140 },
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
          },
          {
            field: 'updatedAt',
            headerName: t('common.labels.updated'),
            valueFormatter: (value: any) => fmtDate(value),
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
          <Stack direction="row" spacing={1}>
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
            <Tooltip title={t('common.buttons.delete')}>
              <IconButton
                size="small"
                aria-label={`hard-delete-${params.row.id}`}
                color="error"
                onClick={() => onHardDelete(params.row)}
              >
                <DeleteForeverIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [fmtDate, onDelete, onEdit, onHardDelete, t, isXl],
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
          placeholder={t('prospects.activity_preferences.search_placeholder')}
          value={q}
          onChange={event => onQueryChange(event.target.value)}
          inputProps={{ 'aria-label': 'search-activity-preferences' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Box sx={{ flex: 1 }} />
        {onRefresh && (
          <Tooltip title={t('common.buttons.refresh')}>
            <IconButton onClick={onRefresh} size="small" aria-label="refresh-activity-preferences">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
        <Button variant="contained" onClick={onCreate}>
          {t('prospects.activity_preferences.create')}
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={row => row.id}
        loading={loading}
        rowCount={total}
        paginationMode="server"
        sortingMode="client"
        paginationModel={{ page: page - 1, pageSize: limit }}
        onPaginationModelChange={model => {
          if (model.page !== page - 1) onPageChange(model.page + 1);
          if (model.pageSize !== limit) onLimitChange(model.pageSize);
        }}
        disableRowSelectionOnClick
        autoHeight
        aria-label="prospect-activity-preferences-table"
        pageSizeOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
});
