// src/components/programs/ExerciseTable.tsx
import * as React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { Box, Button, Stack, TextField, IconButton, Tooltip, Chip, useMediaQuery } from '@mui/material';
import type { Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '@hooks/useExercises';
import { useDateFormatter } from '@hooks/useDateFormatter';
import { getVisibilityLabel } from '../../commons/visibility';

export interface ExerciseTableProps {
  rows: Exercise[];
  total: number;
  page: number; // 1-based
  limit: number;
  q: string;
  loading: boolean;
  onCreate: () => void;
  onRefresh: () => void;
  onEdit: (row: Exercise) => void;
  onDuplicate: (row: Exercise) => void;
  onDelete: (row: Exercise) => void;
  onQueryChange: (q: string) => void;
  onPageChange: (page: number) => void; // 1-based
  onLimitChange: (limit: number) => void;
}

export const ExerciseTable = React.memo(function ExerciseTable({
  rows,
  total,
  page,
  limit,
  q,
  loading,
  onCreate,
  onRefresh,
  onEdit,
  onDuplicate,
  onDelete,
  onQueryChange,
  onPageChange,
  onLimitChange,
}: ExerciseTableProps): React.JSX.Element {
  const fmtDate = useDateFormatter();
  const { t } = useTranslation();
  // Responsive: Hide Created/Updated on smaller screens
  const isXl = useMediaQuery((theme: Theme) => theme.breakpoints.up('xl'));


  const columns = React.useMemo<GridColDef<Exercise>[]>(() => [
    { field: 'label', headerName: t('common.labels.label'), flex: 1.4, minWidth: 160 },
    { field: 'locale', headerName: t('common.labels.locale'), width: 90 },
    { field: 'series', headerName: t('common.labels.series'), width: 110 },
    { field: 'repetitions', headerName: t('common.labels.repetitions'), width: 110 },
    {
      field: 'videoUrl',
      headerName: t('common.labels.video_url'),
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row.videoUrl ? (
          <Tooltip title={params.row.videoUrl}>
            <Chip
              size="small"
              label={t('common.buttons.open')}
              component="a"
              href={params.row.videoUrl}
              clickable
              target="_blank"
              rel="noreferrer"
            />
          </Tooltip>
        ) : null,
    },
    {
      field: 'creator',
      headerName: t('common.labels.creator'),
      flex: 1,
      minWidth: 170,
      valueFormatter: (value: any) => value?.email ?? '',
    },
    {
      field: 'visibility',
      headerName: t('common.labels.visibility'),
      width: 130,
      renderCell: ({ value }) => getVisibilityLabel(value, t),
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
          <Tooltip title={t('common.tooltips.duplicate')}>
            <IconButton size="small" aria-label={`duplicate-${params.row.id}`} onClick={() => onDuplicate(params.row)}>
              <ContentCopyIcon fontSize="small" />
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
  ], [fmtDate, onDelete, onEdit, onDuplicate, t, isXl]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* General information */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ mb: 1 }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        {/* Search queries the API so the grid reflects permission filtering from the backend. */}
        <TextField
          placeholder={t('programs.exercises.search_placeholder')}
          value={q}
          onChange={(event) => onQueryChange(event.target.value)}
          inputProps={{ 'aria-label': 'search-exercises' }}
          size="small"
          sx={{ maxWidth: 360 }}
        />
        <Box sx={{ flex: 1 }} />
        <Tooltip title={t('common.buttons.refresh')}>
          <IconButton onClick={onRefresh} aria-label={t('common.buttons.refresh')} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        <Button variant="contained" onClick={onCreate}>
          {t('programs.exercises.create')}
        </Button>
      </Stack>

      {/* Server pagination avoids pulling every exercise video reference to the browser. */}
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
        aria-label="exercise-table"
      />
    </Box>
  );
});
