// src/components/athletes/AthleteWellbeingTable.tsx
import * as React from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, IconButton, Stack, TextField, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';

import type { DailyReport } from '@hooks/useDailyReports';
import { useDateFormatter } from '@hooks/useDateFormatter';

export interface AthleteWellbeingTableProps {
  rows: DailyReport[];
  total: number;
  page: number;
  limit: number;
  query: string;
  loading: boolean;
  onQueryChange: (q: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefresh: () => void;
}

/** Render athlete wellbeing daily reports with simple filtering controls. */
export const AthleteWellbeingTable = React.memo(function AthleteWellbeingTable({
  rows,
  total,
  page,
  limit,
  query,
  loading,
  onQueryChange,
  onPageChange,
  onLimitChange,
  onRefresh,
}: AthleteWellbeingTableProps): React.JSX.Element {
  const { t } = useTranslation();
  const formatDate = useDateFormatter();

  const columns = React.useMemo<GridColDef<DailyReport>[]>(
    () => [
      {
        field: 'athleteName',
        headerName: t('common.labels.athlete'),
        flex: 1.2,
        valueGetter: (_value: unknown, row: DailyReport) => {
          const firstName = row.athlete?.first_name ?? '';
          const lastName = row.athlete?.last_name ?? '';
          return `${lastName} ${firstName}`.trim() || '—';
        },
      },
      {
        field: 'email',
        headerName: t('common.labels.email'),
        flex: 1,
        valueGetter: (_value: unknown, row: DailyReport) => row.athlete?.email ?? '—',
      },
      {
        field: 'reportDate',
        headerName: t('athletes.wellbeing.table.columns.report_date'),
        flex: 0.9,
        minWidth: 160,
        valueFormatter: (value: string) => formatDate(value),
      },
      {
        field: 'trainingDone',
        headerName: t('athletes.wellbeing.table.columns.training_done'),
        flex: 0.8,
        valueFormatter: (value: boolean) => (value ? t('common.labels.yes') : t('common.labels.no')),
      },
      {
        field: 'planRespected',
        headerName: t('athletes.wellbeing.table.columns.plan_respected'),
        flex: 0.9,
        valueGetter: (_value: unknown, row: DailyReport) => !row.nutritionDeviations,
        valueFormatter: (value: boolean) => (value ? t('common.labels.yes') : t('common.labels.no')),
      },
      {
        field: 'hasPain',
        headerName: t('athletes.wellbeing.table.columns.has_pain'),
        flex: 0.8,
        valueGetter: (_value: unknown, row: DailyReport) => row.painZones.length > 0,
        valueFormatter: (value: boolean) => (value ? t('common.labels.yes') : t('common.labels.no')),
      },
    ],
    [formatDate, t],
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* General information */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <TextField
          placeholder={t('athletes.wellbeing.search_placeholder')}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          inputProps={{ 'aria-label': 'search-daily-reports' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Box sx={{ flex: 1 }} />
        <Tooltip title={t('common.buttons.refresh')}>
          <IconButton aria-label={t('common.buttons.refresh')} onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>
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
