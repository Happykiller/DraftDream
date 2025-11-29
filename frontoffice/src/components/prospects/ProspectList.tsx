// src/components/prospects/ProspectList.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AssignmentTurnedIn,
  FlagOutlined,
  PeopleAlt,
  Search,
  VerifiedUser,
} from '@mui/icons-material';
import { alpha, Avatar, Box, Grid, InputAdornment, Paper, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { ProspectListCard } from './ProspectCard';

import { type ProspectListMetrics } from '@hooks/prospects/useProspectListMetrics';
import type { Prospect } from '@app-types/prospects';

export interface ProspectListProps {
  prospects: Prospect[];
  loading: boolean;
  metrics?: ProspectListMetrics;
  metricsLoading?: boolean;
  searchQuery: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  onSearchChange: (value: string) => void;
  onEditProspect: (prospect: Prospect) => void;
  onDeleteProspect: (prospect: Prospect) => void;
}

/** List wrapper exposing search and responsive card layout for prospects. */
export function ProspectList({
  prospects,
  loading,
  metrics,
  metricsLoading,
  searchQuery,
  searchPlaceholder,
  searchAriaLabel,
  emptyTitle,
  emptyDescription,
  onSearchChange,
  onEditProspect,
  onDeleteProspect,
}: ProspectListProps): React.JSX.Element {
  const showEmpty = !loading && prospects.length === 0;

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {/* General information */}
      <ProspectListSummary metrics={metrics} loading={metricsLoading} />

      <TextField
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" color="disabled" />
            </InputAdornment>
          ),
          'aria-label': searchAriaLabel,
        }}
        size="small"
        sx={{ bgcolor: 'common.white' }}
      />

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton variant="rounded" height={280} />
            </Grid>
          ))}
        </Grid>
      ) : showEmpty ? (
        <Box
          sx={{
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="h6">{emptyTitle}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {emptyDescription}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {prospects.map((prospect) => (
            <Grid key={prospect.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ProspectListCard
                prospect={prospect}
                onEdit={onEditProspect}
                onDelete={onDeleteProspect}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}

interface ProspectListSummaryProps {
  metrics?: ProspectListMetrics;
  loading?: boolean;
}

/** Displays headline metrics for the prospect list. */
function ProspectListSummary({ metrics, loading }: ProspectListSummaryProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  const totalProspects = metrics?.totalProspects ?? 0;
  const clientCount = metrics?.clientCount ?? 0;
  const pipelineProspects = metrics?.pipelineProspects ?? 0;
  const newClients = metrics?.newClientsThisMonth ?? 0;

  const activeRatio = totalProspects > 0 ? (clientCount / totalProspects) * 100 : 0;
  const formattedActiveRatio = new Intl.NumberFormat(i18n.language, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(activeRatio);

  const cards = [
    {
      key: 'total',
      label: t('prospects.list.metrics.total'),
      helper: undefined as string | undefined,
      value: totalProspects,
      color: theme.palette.error.main,
      icon: PeopleAlt,
    },
    {
      key: 'active',
      label: t('prospects.list.metrics.active_clients'),
      helper: t('prospects.list.metrics.active_clients_helper', { value: formattedActiveRatio }),
      value: clientCount,
      color: theme.palette.success.main,
      icon: VerifiedUser,
    },
    {
      key: 'pipeline',
      label: t('prospects.list.metrics.prospects'),
      helper: t('prospects.list.metrics.prospects_helper'),
      value: pipelineProspects,
      color: theme.palette.warning.main,
      icon: FlagOutlined,
    },
    {
      key: 'new-clients',
      label: t('prospects.list.metrics.new_clients'),
      helper: t('prospects.list.metrics.new_clients_helper'),
      value: newClients,
      color: theme.palette.info.main,
      icon: AssignmentTurnedIn,
    },
  ];

  return (
    <Paper elevation={0} sx={{ borderRadius: 2, p: { xs: 1, sm: 1.5 }, bgcolor: 'transparent' }}>
      {/* General information */}
      {loading ? (
        <Grid columnSpacing={1} columns={{ xs: 1, sm: 2, lg: 4 }} container rowSpacing={1}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid key={`list-metric-skeleton-${index}`} size={1}>
              <Skeleton height={84} variant="rounded" />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid columnSpacing={1} columns={{ xs: 1, sm: 2, lg: 4 }} container rowSpacing={1}>
          {cards.map((card) => (
            <Grid key={card.key} size={1}>
              <Stack
                alignItems="center"
                direction="row"
                spacing={1.5}
                sx={{
                  bgcolor: alpha(card.color, 0.08),
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  height: '100%',
                }}
              >
                <Avatar sx={{ bgcolor: alpha(card.color, 0.24), color: card.color, width: 40, height: 40 }}>
                  <card.icon fontSize="small" />
                </Avatar>
                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                  <Typography color="text.secondary" variant="body2">
                    {card.label}
                  </Typography>
                  <Typography fontWeight={800} noWrap variant="h6">
                    {new Intl.NumberFormat(i18n.language).format(card.value)}
                  </Typography>
                  {card.helper ? (
                    <Typography color="text.secondary" fontSize={12} lineHeight={1.2} noWrap>
                      {card.helper}
                    </Typography>
                  ) : null}
                </Stack>
              </Stack>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
}
