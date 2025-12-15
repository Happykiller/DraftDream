// src/components/athletes/AthleteInformationTable.tsx
import * as React from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Stack, TextField, useMediaQuery } from '@mui/material';
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
        field: 'level',
        headerName: t('athletes.information.table.columns.level'),
        flex: 0.8,
        valueGetter: (_value, row) => row.level?.label ?? '—',
        sortComparator: (a, b) => String(a).localeCompare(String(b)),
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
