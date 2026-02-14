// src/components/athletes/CoachAthleteTable.tsx
import * as React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import type { CoachAthlete } from '@hooks/useCoachAthletes';
import { useDateFormatter } from '@src/hooks/useDateFormatter';

import type { CoachAthleteUserOption } from './CoachAthleteDialog';

export interface CoachAthleteTableProps {
  rows: CoachAthlete[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  coachOptions: CoachAthleteUserOption[];
  athleteOptions: CoachAthleteUserOption[];
  coachFilter: CoachAthleteUserOption | null;
  athleteFilter: CoachAthleteUserOption | null;
  statusFilter: 'all' | 'active' | 'inactive';
  includeArchived: boolean;
  onCoachFilterChange: (option: CoachAthleteUserOption | null) => void;
  onAthleteFilterChange: (option: CoachAthleteUserOption | null) => void;
  onStatusFilterChange: (status: 'all' | 'active' | 'inactive') => void;
  onIncludeArchivedChange: (value: boolean) => void;
  onCreate: () => void;
  onRefresh: () => void;
  onEdit: (row: CoachAthlete) => void;
  onDelete: (row: CoachAthlete) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const statusToChip = (isActive: boolean, t: (key: string) => string) =>
  isActive
    ? { label: t('athletes.table.status.active'), color: 'success' as const }
    : { label: t('athletes.table.status.inactive'), color: 'default' as const };

const formatName = (user?: CoachAthlete['coach'] | CoachAthlete['athlete'] | null) => {
  if (!user) return '';
  const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  return fullName || user.email;
};

export function CoachAthleteTable(props: CoachAthleteTableProps): React.JSX.Element {
  const {
    rows,
    total,
    page,
    limit,
    loading,
    coachOptions,
    athleteOptions,
    coachFilter,
    athleteFilter,
    statusFilter,
    includeArchived,
    onCoachFilterChange,
    onAthleteFilterChange,
    onStatusFilterChange,
    onIncludeArchivedChange,
    onCreate,
  onRefresh,
    onEdit,
    onDelete,
    onPageChange,
    onLimitChange,
  } = props;
  const { t } = useTranslation();
  const fmtDate = useDateFormatter();
  const theme = useTheme();
  // Responsive: Hide columns on smaller screens
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  const columns = React.useMemo<GridColDef<CoachAthlete>[]>(
    () => [
      {
        field: 'coach',
        headerName: t('athletes.table.columns.coach'),
        flex: 1,
        minWidth: 180,
        renderCell: (params) => formatName(params.row.coach) || params.row.coachId,
      },
      {
        field: 'athlete',
        headerName: t('athletes.table.columns.athlete'),
        flex: 1,
        minWidth: 180,
        renderCell: (params) => formatName(params.row.athlete) || params.row.athleteId,
      },
      {
        field: 'startDate',
        headerName: t('athletes.table.columns.start_date'),
        flex: 1,
        minWidth: 150,
        renderCell: (params) => (params.value ? fmtDate(params.value as string) : t('common.messages.no_value')),
      },
      {
        field: 'endDate',
        headerName: t('athletes.table.columns.end_date'),
        flex: 1,
        minWidth: 150,
        renderCell: (params) => (params.value ? fmtDate(params.value as string) : t('common.messages.no_value')),
      },
      {
        field: 'is_active',
        headerName: t('athletes.table.columns.status'),
        minWidth: 140,
        renderCell: (params) => {
          const chip = statusToChip(params.value as boolean, t);
          return <Chip label={chip.label} color={chip.color} size="small" />;
        },
      },
      {
        field: 'note',
        headerName: t('athletes.table.columns.note'),
        flex: 1,
        minWidth: 200,
        renderCell: (params) => params.value || t('athletes.table.no_note'),
      },
      ...(isXl
        ? [
          {
            field: 'createdAt',
            headerName: t('common.labels.created'),
            minWidth: 160,
            renderCell: (params: GridRenderCellParams) => fmtDate(params.value as string),
          },
          {
            field: 'updatedAt',
            headerName: t('athletes.table.columns.updated_at'),
            minWidth: 160,
            renderCell: (params: GridRenderCellParams) => fmtDate(params.value as string),
          },
          {
            field: 'deletedAt',
            headerName: t('athletes.table.columns.deleted_at'),
            minWidth: 160,
            renderCell: (params: GridRenderCellParams) => (params.value ? fmtDate(params.value as string) : t('common.messages.no_value')),
          },
        ]
        : []),
      {
        field: 'actions',
        headerName: t('common.labels.actions'),
        sortable: false,
        filterable: false,
        minWidth: 120,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={t('common.tooltips.edit')}>
              <IconButton aria-label={`edit-link-${params.row.id}`} size="small" onClick={() => onEdit(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('common.tooltips.delete')}>
              <IconButton aria-label={`delete-link-${params.row.id}`} size="small" onClick={() => onDelete(params.row)}>
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
    <Box>
      {/* General information */}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Autocomplete
            sx={{ minWidth: 220 }}
            options={coachOptions}
            value={coachFilter}
            onChange={(_, value) => onCoachFilterChange(value)}
            getOptionLabel={(option) => option?.fullName || option?.email || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('athletes.table.filters.coach')}
                placeholder={t('athletes.table.filters.coach_placeholder')}
              />
            )}
          />

          <Autocomplete
            sx={{ minWidth: 220 }}
            options={athleteOptions}
            value={athleteFilter}
            onChange={(_, value) => onAthleteFilterChange(value)}
            getOptionLabel={(option) => option?.fullName || option?.email || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('athletes.table.filters.athlete')}
                placeholder={t('athletes.table.filters.athlete_placeholder')}
              />
            )}
          />

          <TextField
            select
            label={t('athletes.table.filters.status')}
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value as 'all' | 'active' | 'inactive')}
            SelectProps={{ native: true }}
            sx={{ minWidth: 160 }}
          >
            <option value="all">{t('athletes.table.status.all')}</option>
            <option value="active">{t('athletes.table.status.active')}</option>
            <option value="inactive">{t('athletes.table.status.inactive')}</option>
          </TextField>

          <FormControlLabel
            control={<Switch checked={includeArchived} onChange={(_, checked) => onIncludeArchivedChange(checked)} />}
            label={t('athletes.table.filters.include_archived')}
            sx={{ ml: { xs: 0, md: 2 } }}
          />

          <Box sx={{ flex: 1 }} />
          <Tooltip title={t('common.buttons.refresh')}>
            <IconButton onClick={onRefresh} aria-label={t('common.buttons.refresh')} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" onClick={onCreate} sx={{ alignSelf: { xs: 'stretch', md: 'flex-start' } }}>
            {t('athletes.table.create')}
          </Button>
        </Stack>
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
        aria-label="coach-athlete-table"
      />
    </Box>
  );
}
