// src/components/prospects/ProspectWorkflow.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Cancel,
  CalendarMonth,
  Chat,
  CheckCircle,
  Description,
  People,
  Phone,
  type SvgIconComponent,
} from '@mui/icons-material';
import {
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { orange } from '@mui/material/colors';

import { ProspectCard } from '@components/prospects/ProspectCard';

import type { Prospect } from '@app-types/prospects';
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
  onEditProspect: (prospect: Prospect) => void;
  onDeleteProspect: (prospect: Prospect) => void;
  onMoveProspect?: (prospect: Prospect, toStatus: PipelineStatus) => void;
}

interface DragPayload {
  prospectId: string;
  fromStatus?: PipelineStatus;
}

interface DraggableProspectCardProps {
  prospect: Prospect;
  stage: PipelineStatus;
  isDragging: boolean;
  onEditProspect: (prospect: Prospect) => void;
  onDeleteProspect: (prospect: Prospect) => void;
  onDragStart: (prospect: Prospect, fromStatus: PipelineStatus, event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
}

function DraggableProspectCard({
  prospect,
  stage,
  isDragging,
  onEditProspect,
  onDeleteProspect,
  onDragStart,
  onDragEnd,
}: DraggableProspectCardProps): React.JSX.Element {
  return (
    <Stack
      component="div"
      draggable
      onDragStart={(event) => onDragStart(prospect, stage, event)}
      onDragEnd={onDragEnd}
      sx={{ cursor: 'grab', opacity: isDragging ? 0.7 : 1, transition: 'opacity 150ms ease' }}
    >
      {/* General information */}
      <ProspectCard prospect={prospect} onEdit={onEditProspect} onDelete={onDeleteProspect} />
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
} as const;

/**
 * Displays the prospect pipeline to give coaches a quick overview of the workflow steps.
 */
export function ProspectWorkflow({
  prospectsByStatus,
  loading,
  onEditProspect,
  onDeleteProspect,
  onMoveProspect,
}: ProspectWorkflowProps): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();

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

  React.useEffect(() => {
    setColumns(normalizeColumns(prospectsByStatus));
  }, [normalizeColumns, prospectsByStatus]);

  const handleDragStart = React.useCallback(
    (prospect: Prospect, fromStatus: PipelineStatus, event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData(
        'application/json',
        JSON.stringify({ prospectId: prospect.id, fromStatus } satisfies DragPayload),
      );
      setDraggedProspectId(prospect.id ?? null);
    },
    [],
  );

  const handleDragEnd = React.useCallback(() => {
    setDraggedProspectId(null);
    setActiveDropStage(null);
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
      if (!rawPayload) {
        return;
      }

      let payload: DragPayload;
      try {
        payload = JSON.parse(rawPayload) as DragPayload;
      } catch {
        return;
      }

      if (!payload.prospectId) {
        return;
      }

      setColumns((currentColumns) => {
        const sourceStatus =
          (payload.fromStatus && currentColumns[payload.fromStatus] != null && payload.fromStatus) ||
          pipelineStatuses.find((status) =>
            (currentColumns[status] ?? []).some((item) => item.id === payload.prospectId),
          );

        if (!sourceStatus || sourceStatus === targetStatus) {
          return currentColumns;
        }

        const sourceList = currentColumns[sourceStatus] ?? [];
        const movingIndex = sourceList.findIndex((item) => item.id === payload.prospectId);
        if (movingIndex < 0) {
          return currentColumns;
        }

        const movingProspect = sourceList[movingIndex];
        const updatedProspect = { ...movingProspect, status: targetStatus };

        const nextColumns: Record<PipelineStatus, Prospect[]> = {
          ...currentColumns,
          [sourceStatus]: [...sourceList.slice(0, movingIndex), ...sourceList.slice(movingIndex + 1)],
          [targetStatus]: [...(currentColumns[targetStatus] ?? []), updatedProspect],
        };

        onMoveProspect?.(updatedProspect, targetStatus);

        return nextColumns;
      });
    },
    [onMoveProspect],
  );

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {/* General information */}
      <Stack spacing={1}>
        <Typography variant="h6">{t('prospects.workflow.title')}</Typography>
        <Typography color="text.secondary" variant="body2">
          {t('prospects.workflow.description')}
        </Typography>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Typography color="text.secondary" variant="body2">
            {t('prospects.workflow.card_helper')}
          </Typography>

          <Grid columnSpacing={2} columns={{ xs: 1, lg: 4, xl: 8 }} container rowSpacing={2}>
            {stages.map((stage) => {
              const prospectsForStage = columns[stage.status] ?? [];
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
                    <Stack alignItems="center" direction="row" spacing={1.25}>
                      <stage.Icon fontSize="small" sx={{ color: stage.accentColor }} />
                      <Typography component="span" fontWeight={700} variant="body1">
                        {stage.title}
                      </Typography>
                    </Stack>

                    <Typography color="text.secondary" variant="body2">
                      {stage.description}
                    </Typography>

                    <Paper
                      elevation={0}
                      onDragOver={(event) => handleDragOver(stage.status, event)}
                      onDragLeave={() => handleDragLeave(stage.status)}
                      onDrop={(event) => handleDrop(stage.status, event)}
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
                              onEditProspect={onEditProspect}
                              onDeleteProspect={onDeleteProspect}
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
          <Typography color="primary.main" variant="body2">
            {t('prospects.workflow.help.footer')}
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}
