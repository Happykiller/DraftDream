import * as React from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import {
  Box,
  Chip,
  Stack,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useDateFormatter } from '@hooks/useDateFormatter';
import type { User } from '@hooks/useUsers';

export interface CoachWithLinks extends User {
  activeAthleteLinks: number;
}

export interface CoachTableProps {
  rows: CoachWithLinks[];
  total: number;
  page: number;
  limit: number;
  q: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function CoachTable(props: CoachTableProps): React.JSX.Element {
  const {
    rows,
    total,
    page,
    limit,
    q,
    loading,
    onQueryChange,
    onPageChange,
    onLimitChange,
  } = props;
  const { t } = useTranslation();
  const fmtDate = useDateFormatter();

  const columns = React.useMemo<GridColDef<CoachWithLinks>[]>(
    () => [
      {
        field: 'first_name',
        headerName: t('common.labels.first_name'),
        flex: 1,
        minWidth: 140,
      },
      {
        field: 'last_name',
        headerName: t('common.labels.last_name'),
        flex: 1,
        minWidth: 140,
      },
      {
        field: 'email',
        headerName: t('common.labels.email'),
        flex: 1,
        minWidth: 220,
      },
      {
        field: 'phone',
        headerName: t('common.labels.phone'),
        flex: 1,
        minWidth: 150,
        renderCell: (params) => params.value || t('common.messages.no_value'),
      },
      {
        field: 'is_active',
        headerName: t('common.labels.status'),
        minWidth: 130,
        renderCell: (params) => (
          <Chip
            size="small"
            color={params.value ? 'success' : 'default'}
            label={params.value ? t('common.status.active') : t('common.status.inactive')}
          />
        ),
      },
      {
        field: 'createdAt',
        headerName: t('common.labels.created'),
        minWidth: 160,
        renderCell: (params) => (params.value ? fmtDate(params.value as string) : t('common.messages.no_value')),
      },
      {
        field: 'activeAthleteLinks',
        headerName: t('coach.table.columns.active_athlete_links'),
        minWidth: 190,
      },
    ],
    [fmtDate, t],
  );

  return (
    <Box>
      {/* General information */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <TextField
          value={q}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t('coach.table.search_placeholder')}
          inputProps={{ 'aria-label': 'search-coaches' }}
          fullWidth
        />
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        rowCount={total}
        paginationMode="server"
        paginationModel={{ page: page - 1, pageSize: limit }}
        onPaginationModelChange={(model) => {
          if (model.page !== page - 1) onPageChange(model.page + 1);
          if (model.pageSize !== limit) onLimitChange(model.pageSize);
        }}
        disableRowSelectionOnClick
        autoHeight
        pageSizeOptions={[5, 10, 25, 50]}
        aria-label="coach-table"
      />
    </Box>
  );
}
