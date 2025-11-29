// src/components/prospects/ProspectWorkflow.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Add,
  AccountBalanceWallet,
  CalendarMonth,
  Cancel,
  Chat,
  CheckCircle,
  Description,
  Equalizer,
  GpsFixed,
  People,
  Phone,
  TaskAlt,
  TrendingUp,
  VerifiedUser,
  type SvgIconComponent,
} from '@mui/icons-material';
import {
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { orange } from '@mui/material/colors';

import { ProspectWorkflowCard } from '@components/prospects/ProspectCard';

import type { Prospect, ProspectSourceFilterValue } from '@app-types/prospects';
import { pipelineStatuses, ProspectStatusEnum } from '@src/commons/prospects/status';

type PipelineStatus = (typeof pipelineStatuses)[number];

interface ProspectWorkflowStage {
  status: PipelineStatus;
  title: string;
  description: string;
  accentColor: string;
  tintColor: string;
  Icon: SvgIconComponent;
}

interface ProspectWorkflowProps {
  prospectsByStatus: Partial<Record<PipelineStatus, Prospect[]>>;
  loading: boolean;
  onCreateProspect?: (status: PipelineStatus) => void;
  onEditProspect: (prospect: Prospect) => void;
  onDeleteProspect: (prospect: Prospect) => void;
  onMoveProspect?: (
    prospect: Prospect,
    toStatus: PipelineStatus,
    fromStatus: PipelineStatus,
  ) => void;
  onValidateProspect?: (prospect: Prospect) => void;
  sourceFilter: ProspectSourceFilterValue;
}

interface DragPayload {
  prospectId: string;
  fromStatus?: PipelineStatus;
}

interface DraggableProspectCardProps {
  prospect: Prospect;
  stage: PipelineStatus;
  isDragging: boolean;
  onEditProspect?: (prospect: Prospect) => void;
  onDeleteProspect?: (prospect: Prospect) => void;
  onValidateProspect?: (prospect: Prospect) => void;
  onDragStart: (prospect: Prospect, fromStatus: PipelineStatus, event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}

function DraggableProspectCard({
  prospect,
  stage,
  isDragging,
  onEditProspect,
  onDeleteProspect,
  onValidateProspect,
  onDragStart,
  onDragEnd,
}: DraggableProspectCardProps): React.JSX.Element {
  const isDraggable = stage !== ProspectStatusEnum.A_FAIRE;

  return (
    <Stack
      component="div"
      draggable={isDraggable}
      onDragStart={(event) => {
        if (isDraggable) {
          onDragStart(prospect, stage, event);
        } else {
          event.preventDefault();
        }
      }}
      onDragEnd={onDragEnd}
      sx={{
        cursor: isDraggable ? 'grab' : 'default',
        opacity: isDragging ? 0.7 : 1,
        transition: 'opacity 150ms ease',
      }}
    >
      {/* General information */}
      <ProspectWorkflowCard
        prospect={prospect}
        onEdit={onEditProspect}
        onDelete={onDeleteProspect}
        onValidate={onValidateProspect}
      />
    </Stack>
  );
}

const pipelineCopyKeys: Record<PipelineStatus, { title: string; description: string }> = {
  [ProspectStatusEnum.LEAD]: {
    title: 'prospects.workflow.stages.lead.title',
    description: 'prospects.workflow.stages.lead.description',
  },
  [ProspectStatusEnum.CONTACTE]: {
    title: 'prospects.workflow.stages.contact.title',
    description: 'prospects.workflow.stages.contact.description',
  },
  [ProspectStatusEnum.RDV_PLANIFIE]: {
    title: 'prospects.workflow.stages.meeting.title',
    description: 'prospects.workflow.stages.meeting.description',
  },
  [ProspectStatusEnum.PROPOSITION]: {
    title: 'prospects.workflow.stages.proposal.title',
    description: 'prospects.workflow.stages.proposal.description',
  },
  [ProspectStatusEnum.NEGOCIATION]: {
    title: 'prospects.workflow.stages.negotiation.title',
    description: 'prospects.workflow.stages.negotiation.description',
  },
  [ProspectStatusEnum.GAGNE]: {
    title: 'prospects.workflow.stages.won.title',
    description: 'prospects.workflow.stages.won.description',
  },
  [ProspectStatusEnum.PERDUS]: {
    title: 'prospects.workflow.stages.lost.title',
    description: 'prospects.workflow.stages.lost.description',
  },
  [ProspectStatusEnum.A_FAIRE]: {
    title: 'prospects.workflow.stages.todo.title',
    description: 'prospects.workflow.stages.todo.description',
  },
  [ProspectStatusEnum.CLIENT]: {
    title: 'prospects.workflow.stages.client.title',
    description: 'prospects.workflow.stages.client.description',
  },
} as const;

/**
 * Displays the prospect pipeline to give coaches a quick overview of the workflow steps.
 */
export function ProspectWorkflow({
  prospectsByStatus,
  loading,
  onCreateProspect,
  onEditProspect,
  onDeleteProspect,
  onMoveProspect,
  onValidateProspect,
  sourceFilter,
}: ProspectWorkflowProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }),
    [i18n.language],
  );

  const integerFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        maximumFractionDigits: 0,
      }),
    [i18n.language],
  );

  const normalizeColumns = React.useCallback(
    (input: Partial<Record<PipelineStatus, Prospect[]>>): Record<PipelineStatus, Prospect[]> =>
      pipelineStatuses.reduce(
        (acc, status) => ({ ...acc, [status]: [...(input[status] ?? [])] }),
        {} as Record<PipelineStatus, Prospect[]>,
      ),
    [],
  );

  const [columns, setColumns] = React.useState<Record<PipelineStatus, Prospect[]>>(() =>
    normalizeColumns(prospectsByStatus),
  );
  const [draggedProspectId, setDraggedProspectId] = React.useState<string | null>(null);
  const [activeDropStage, setActiveDropStage] = React.useState<PipelineStatus | null>(null);

  const stageStyles = React.useMemo<Record<PipelineStatus, { accentColor: string; Icon: SvgIconComponent }>>(
    () => ({
      [ProspectStatusEnum.LEAD]: {
        accentColor: theme.palette.text.primary,
        Icon: People,
      },
      [ProspectStatusEnum.CONTACTE]: {
        accentColor: theme.palette.primary.main,
        Icon: Phone,
      },
      [ProspectStatusEnum.RDV_PLANIFIE]: {
        accentColor: theme.palette.warning.main,
        Icon: CalendarMonth,
      },
      [ProspectStatusEnum.PROPOSITION]: {
        accentColor: theme.palette.secondary.main,
        Icon: Description,
      },
      [ProspectStatusEnum.NEGOCIATION]: {
        accentColor: orange[600],
        Icon: Chat,
      },
      [ProspectStatusEnum.GAGNE]: {
        accentColor: theme.palette.success.main,
        Icon: CheckCircle,
      },
      [ProspectStatusEnum.PERDUS]: {
        accentColor: theme.palette.error.main,
        Icon: Cancel,
      },
      [ProspectStatusEnum.A_FAIRE]: {
        accentColor: theme.palette.info.main,
        Icon: TaskAlt,
      },
      [ProspectStatusEnum.CLIENT]: {
        accentColor: theme.palette.success.dark,
        Icon: VerifiedUser,
      },
    }),
    [theme],
  );

  const stages = React.useMemo<ProspectWorkflowStage[]>(
    () =>
      pipelineStatuses.map((status) => ({
        status,
        title: t(pipelineCopyKeys[status].title),
        description: t(pipelineCopyKeys[status].description),
        accentColor: stageStyles[status].accentColor,
        tintColor: alpha(stageStyles[status].accentColor, 0.06),
        Icon: stageStyles[status].Icon,
      })),
    [stageStyles, t],
  );

  const helpItems = React.useMemo(
    () => t('prospects.workflow.help.items', { returnObjects: true }) as string[],
    [t],
  );

  const filteredColumns = React.useMemo(
    () =>
      pipelineStatuses.reduce((acc, status) => {
        const prospectsForStage = columns[status] ?? [];

        acc[status] =
          sourceFilter === 'all'
            ? prospectsForStage
            : prospectsForStage.filter((prospect) => {
                const resolvedSourceId = prospect.source?.id ?? prospect.sourceId ?? '';

                if (sourceFilter === 'none') {
                  return !resolvedSourceId;
                }

                return resolvedSourceId === sourceFilter;
              });

        return acc;
      }, {} as Record<PipelineStatus, Prospect[]>),
    [columns, sourceFilter],
  );

  const pipelineMetrics = React.useMemo(() => {
    const stageLists = Object.values(filteredColumns);
    const totalProspects = stageLists.reduce((count, items) => count + items.length, 0);
    const totalValue = stageLists.reduce(
      (sum, items) => sum + items.reduce((budgetSum, prospect) => budgetSum + (prospect.budget ?? 0), 0),
      0,
    );
    const successfulProspects =
      (filteredColumns[ProspectStatusEnum.GAGNE]?.length ?? 0) +
      (filteredColumns[ProspectStatusEnum.CLIENT]?.length ?? 0);
    const conversionRate = totalProspects === 0 ? 0 : Math.round((successfulProspects / totalProspects) * 100);
    const averageValue = totalProspects === 0 ? 0 : totalValue / totalProspects;

    return {
      totalProspects,
      totalValue,
      conversionRate,
      averageValue,
    };
  }, [filteredColumns]);

  const kpiCards = React.useMemo(
    () => [
      {
        key: 'totalProspects',
        label: t('prospects.workflow.summary.metrics.total_prospects'),
        value: integerFormatter.format(pipelineMetrics.totalProspects),
        color: theme.palette.primary.main,
        Icon: People,
      },
      {
        key: 'pipelineValue',
        label: t('prospects.workflow.summary.metrics.pipeline_value'),
        value: currencyFormatter.format(pipelineMetrics.totalValue),
        color: theme.palette.info.main,
        Icon: AccountBalanceWallet,
      },
      {
        key: 'conversionRate',
        label: t('prospects.workflow.summary.metrics.conversion_rate'),
        value: `${pipelineMetrics.conversionRate}%`,
        color: theme.palette.success.main,
        Icon: TrendingUp,
      },
      {
        key: 'averageValue',
        label: t('prospects.workflow.summary.metrics.average_value'),
        value: currencyFormatter.format(pipelineMetrics.averageValue),
        color: theme.palette.secondary.main,
        Icon: Equalizer,
      },
    ],
    [currencyFormatter, integerFormatter, pipelineMetrics, t, theme.palette.info.main, theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main],
  );

  React.useEffect(() => {
    setColumns(normalizeColumns(prospectsByStatus));
  }, [normalizeColumns, prospectsByStatus]);

  const dragContextRef = React.useRef<DragPayload | null>(null);

  const handleDragStart = React.useCallback(
    (prospect: Prospect, fromStatus: PipelineStatus, event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData(
        'application/json',
        JSON.stringify({ prospectId: prospect.id, fromStatus } satisfies DragPayload),
      );
      event.dataTransfer.setData('text/plain', prospect.id);
      dragContextRef.current = { prospectId: prospect.id, fromStatus } satisfies DragPayload;
      setDraggedProspectId(prospect.id ?? null);
    },
    [],
  );

  const handleDragEnd = React.useCallback(() => {
    setDraggedProspectId(null);
    setActiveDropStage(null);
    dragContextRef.current = null;
  }, []);

  const handleDragOver = React.useCallback(
    (status: PipelineStatus, event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setActiveDropStage(status);
    },
    [],
  );

  const handleDragLeave = React.useCallback((status: PipelineStatus) => {
    setActiveDropStage((current) => (current === status ? null : current));
  }, []);

  const handleDrop = React.useCallback(
    (targetStatus: PipelineStatus, event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setActiveDropStage(null);

      const rawPayload = event.dataTransfer.getData('application/json');
      let payload: DragPayload | null = null;

      if (rawPayload) {
        try {
          payload = JSON.parse(rawPayload) as DragPayload;
        } catch {
          payload = null;
        }
      }

      if (!payload && dragContextRef.current) {
        payload = dragContextRef.current;
      }

      if (!payload?.prospectId) {
        return;
      }

      const currentColumns = columns;
      const sourceStatus =
        (payload.fromStatus && currentColumns[payload.fromStatus] != null && payload.fromStatus) ||
        pipelineStatuses.find((status) =>
          (currentColumns[status] ?? []).some((item) => item.id === payload.prospectId),
        );

      if (!sourceStatus || sourceStatus === targetStatus) {
        return;
      }

      const sourceList = currentColumns[sourceStatus] ?? [];
      const movingIndex = sourceList.findIndex((item) => item.id === payload.prospectId);
      if (movingIndex < 0) {
        return;
      }

      const movingProspect = sourceList[movingIndex];
      const updatedProspect = { ...movingProspect, status: targetStatus };

      const nextColumns: Record<PipelineStatus, Prospect[]> = {
        ...currentColumns,
        [sourceStatus]: [...sourceList.slice(0, movingIndex), ...sourceList.slice(movingIndex + 1)],
        [targetStatus]: [...(currentColumns[targetStatus] ?? []), updatedProspect],
      };

      setColumns(nextColumns);
      onMoveProspect?.(updatedProspect, targetStatus, sourceStatus);
    },
    [columns, onMoveProspect],
  );

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {/* General information */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Stack alignItems="flex-start" direction="row" flexWrap="wrap" spacing={2}>
            <Stack alignItems="center" direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
              <Stack
                alignItems="center"
                bgcolor={alpha(theme.palette.error.main, 0.1)}
                borderRadius={1.5}
                height={48}
                justifyContent="center"
                width={48}
              >
                <GpsFixed sx={{ color: theme.palette.error.main }} />
              </Stack>

              <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                <Typography variant="h6">{t('prospects.workflow.summary.title')}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {t('prospects.workflow.summary.helper')}
                </Typography>
              </Stack>
            </Stack>

          </Stack>

          {loading ? (
            <Grid columnSpacing={2} columns={{ xs: 1, sm: 2, lg: 4 }} container rowSpacing={1.5}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Grid key={`kpi-skeleton-${index}`} size={1}>
                  <Skeleton height={94} variant="rounded" />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid columnSpacing={2} columns={{ xs: 1, sm: 2, lg: 4 }} container rowSpacing={1.5}>
              {kpiCards.map((card) => (
                <Grid key={card.key} size={1}>
                  <Paper
                    elevation={0}
                    sx={{
                      height: '100%',
                      bgcolor: alpha(card.color, 0.08),
                      borderRadius: 2,
                      px: 2,
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Stack
                      alignItems="center"
                      bgcolor={alpha(card.color, 0.18)}
                      borderRadius={2}
                      justifyContent="center"
                      sx={{ height: 44, width: 44 }}
                    >
                      <card.Icon sx={{ color: card.color }} />
                    </Stack>
                    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                      <Typography color="text.secondary" variant="body2">
                        {card.label}
                      </Typography>
                      <Typography fontWeight={800} noWrap variant="h6">
                        {card.value}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h6">{t('prospects.workflow.card_title')}</Typography>
            <Typography color="text.secondary" variant="body2">
              {t('prospects.workflow.card_helper')}
            </Typography>
          </Stack>

          <Grid columnSpacing={2} columns={{ xs: 1, lg: 4, xl: 8 }} container rowSpacing={2}>
            {stages.map((stage) => {
              const prospectsForStage = filteredColumns[stage.status] ?? [];
              const stageCount = prospectsForStage.length;
              const totalBudget = prospectsForStage.reduce(
                (sum, prospect) => sum + (prospect.budget ?? 0),
                0,
              );
              const formattedTotalBudget = currencyFormatter.format(totalBudget || 0);
              const isActiveDropZone = activeDropStage === stage.status;

              return (
                <Grid key={stage.status} size={1}>
                  <Paper
                    elevation={0}
                    sx={{
                      height: '100%',
                      border: '1px solid',
                      borderColor: stage.accentColor,
                      bgcolor: stage.tintColor,
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                    }}
                  >
                    <Stack spacing={0.75}>
                      <Stack direction="row" justifyContent="space-between" spacing={1.25}>
                        <Stack alignItems="flex-start" direction="row" spacing={1.25} sx={{ minWidth: 0 }}>
                          <Stack
                            alignItems="center"
                            bgcolor={alpha(stage.accentColor, 0.1)}
                            borderRadius={1}
                            height={44}
                            justifyContent="center"
                            width={44}
                          >
                            <stage.Icon fontSize="small" sx={{ color: stage.accentColor }} />
                          </Stack>

                          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                            <Typography component="span" fontWeight={700} variant="body1">
                              {stage.title}
                            </Typography>
                            <Typography color="text.secondary" noWrap variant="caption">
                              {t('prospects.workflow.stage_count', { count: stageCount })}
                            </Typography>
                          </Stack>
                        </Stack>

                        {onCreateProspect && stage.status !== ProspectStatusEnum.A_FAIRE ? (
                          <Tooltip title={t('prospects.workflow.actions.create_at_stage')}>
                            <IconButton
                              aria-label={`create-prospect-${stage.status}`}
                              color="primary"
                              size="small"
                              onClick={() => onCreateProspect(stage.status)}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : null}
                      </Stack>
                    </Stack>

                    <Typography color="text.secondary" variant="body2">
                      {stage.description}
                    </Typography>

                    <Paper
                      elevation={0}
                      sx={{
                        bgcolor: alpha(stage.accentColor, 0.08),
                        borderRadius: 2,
                        px: 1.25,
                        py: 1.25,
                        textAlign: 'center',
                      }}
                    >
                      <Typography color="text.secondary" textAlign="center" variant="caption">
                        {t('prospects.workflow.total_value_label')}
                      </Typography>
                      <Typography fontWeight={700} textAlign="center" variant="body2">
                        {formattedTotalBudget}
                      </Typography>
                    </Paper>

                    <Paper
                      elevation={0}
                      onDragOver={(event) => {
                        if (stage.status !== ProspectStatusEnum.A_FAIRE) {
                          handleDragOver(stage.status, event);
                        }
                      }}
                      onDragLeave={() => {
                        if (stage.status !== ProspectStatusEnum.A_FAIRE) {
                          handleDragLeave(stage.status);
                        }
                      }}
                      onDrop={(event) => {
                        if (stage.status !== ProspectStatusEnum.A_FAIRE) {
                          handleDrop(stage.status, event);
                        }
                      }}
                      sx={{
                        border: '1px dashed',
                        borderColor: isActiveDropZone ? stage.accentColor : alpha(stage.accentColor, 0.6),
                        bgcolor: isActiveDropZone
                          ? alpha(stage.accentColor, 0.12)
                          : alpha(stage.accentColor, 0.05),
                        borderRadius: 2,
                        px: 1.25,
                        py: 2,
                        textAlign: 'center',
                        transition: 'background-color 150ms ease, border-color 150ms ease',
                      }}
                    >
                      {loading ? (
                        <Stack spacing={1.25}>
                          {Array.from({ length: 2 }).map((_, index) => (
                            <Skeleton key={index} variant="rounded" height={220} />
                          ))}
                        </Stack>
                      ) : prospectsForStage.length === 0 ? (
                        <>
                          <Typography fontWeight={700} variant="body2">
                            {t('prospects.workflow.empty_title')}
                          </Typography>
                          <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
                            {t('prospects.workflow.empty_description')}
                          </Typography>
                        </>
                      ) : (
                        <Stack spacing={1.25}>
                          {prospectsForStage.map((prospect) => (
                            <DraggableProspectCard
                              key={prospect.id}
                              prospect={prospect}
                              stage={stage.status}
                              isDragging={draggedProspectId === prospect.id}
                              onEditProspect={
                                stage.status !== ProspectStatusEnum.A_FAIRE ? onEditProspect : undefined
                              }
                              onDeleteProspect={
                                stage.status !== ProspectStatusEnum.A_FAIRE
                                  ? onDeleteProspect
                                  : undefined
                              }
                              onValidateProspect={
                                stage.status === ProspectStatusEnum.GAGNE
                                  ? onValidateProspect
                                  : undefined
                              }
                              onDragStart={handleDragStart}
                              onDragEnd={handleDragEnd}
                            />
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.3),
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          p: { xs: 2, md: 3 },
        }}
      >
        <Stack spacing={1.5}>
          <Typography color="primary.main" fontWeight={700} variant="subtitle1">
            {t('prospects.workflow.help.title')}
          </Typography>
          <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
            {helpItems.map((item) => (
              <Typography key={item} component="li" color="primary.main" variant="body2">
                {item}
              </Typography>
            ))}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
