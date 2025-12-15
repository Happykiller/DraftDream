// src/components/athletes/AthleteInformationTable.tsx
import * as React from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Chip, Stack, TextField, Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import type { AthleteInfo } from '@hooks/useAthleteInfos';
import { useDateFormatter } from '@hooks/useDateFormatter';

export interface AthleteInformationTableProps {
  rows: AthleteInfo[];
  total: number;
  page: number; // 1-based
  limit: number;
  query: string;
  loading: boolean;
  onQueryChange: (q: string) => void;
  onPageChange: (page: number) => void; // 1-based
  onLimitChange: (limit: number) => void;
}

/** Presentational table to inspect athlete profiles. */
export const AthleteInformationTable = React.memo(function AthleteInformationTable({
  rows,
  total,
  page,
  limit,
  query,
  loading,
  onQueryChange,
  onPageChange,
  onLimitChange,
}: AthleteInformationTableProps): React.JSX.Element {
  const { t } = useTranslation();
  const fmtDate = useDateFormatter();
  const theme = useTheme();
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  React.useEffect(() => {
    if (query && page !== 1) onPageChange(1);
  }, [onPageChange, page, query]);

  const columns = React.useMemo<GridColDef<AthleteInfo>[]>(
    () => [
      {
        field: 'athlete',
        headerName: t('athletes.information.table.columns.name'),
        flex: 1.1,
        valueGetter: (_value, row) => {
          const full = `${row?.athlete?.first_name ?? ''} ${row?.athlete?.last_name ?? ''}`.trim();
          return full || '—';
        },
        sortComparator: (a, b) => String(a).localeCompare(String(b)),
      },
      {
        field: 'email',
        headerName: t('athletes.information.table.columns.email'),
        flex: 1,
        valueGetter: (_value, row) => row.athlete?.email ?? '—',
      },
      {
        field: 'phone',
        headerName: t('athletes.information.table.columns.phone'),
        flex: 0.8,
        valueGetter: (_value, row) => row.athlete?.phone ?? '—',
      },
      {
        field: 'type',
        headerName: t('athletes.information.table.columns.type'),
        flex: 0.6,
        valueGetter: (_value, row) => row.athlete?.type ?? '—',
      },
      {
        field: 'level',
        headerName: t('athletes.information.table.columns.level'),
        flex: 0.8,
        valueGetter: (_value, row) => row.level?.label ?? '—',
        sortComparator: (a, b) => String(a).localeCompare(String(b)),
      },
      {
        field: 'is_active',
        headerName: t('athletes.information.table.columns.status'),
        valueGetter: (_value, row) => row.athlete?.is_active ?? false,
        renderCell: (params) => (
          <Chip
            size="small"
            label={params.value ? t('athletes.information.table.status.active') : t('athletes.information.table.status.inactive')}
            color={params.value ? 'success' : 'default'}
          />
        ),
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        minWidth: 140,
      },
      ...(isXl
        ? [
          {
            field: 'company',
            headerName: t('athletes.information.table.columns.company'),
            flex: 1,
            valueGetter: (_value, row) => row.athlete?.company?.name ?? '—',
          },
          {
            field: 'address',
            headerName: t('athletes.information.table.columns.address'),
            flex: 1,
            valueGetter: (_value, row) => {
              const city = row?.athlete?.address?.city ?? '';
              const country = row?.athlete?.address?.country ?? '';
              const label = `${city}${city && country ? ', ' : ''}${country}`;
              return label || '—';
            },
          },
          {
            field: 'updatedAt',
            headerName: t('athletes.information.table.columns.updated_at'),
            flex: 1,
            minWidth: 180,
            valueGetter: (_value, row) => row.updatedAt ?? row.athlete?.updatedAt ?? null,
            valueFormatter: (p: any) => fmtDate(p),
          },
        ]
        : []),
    ],
    [fmtDate, isXl, t],
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <TextField
          placeholder={t('athletes.information.search_placeholder')}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          inputProps={{ 'aria-label': 'search-athletes' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Tooltip title={t('athletes.information.helper')} arrow placement="top">
          <Chip label={t('athletes.information.helper')} color="info" size="small" sx={{ alignSelf: 'center' }} />
        </Tooltip>
      </Stack>

      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        rowCount={total}
        pagination
        paginationMode="server"
        disableColumnMenu
        loading={loading}
        pageSizeOptions={[10, 25, 50]}
        paginationModel={{ page: page - 1, pageSize: limit }}
        onPaginationModelChange={({ page: newPage, pageSize }) => {
          if (pageSize !== limit) onLimitChange(pageSize);
          if (newPage + 1 !== page) onPageChange(newPage + 1);
        }}
        getRowId={(row) => row.id}
        initialState={{ density: 'compact' }}
      />
    </Box>
  );
});
