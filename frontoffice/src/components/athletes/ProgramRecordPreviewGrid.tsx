import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarMonth,
  FitnessCenter,
  HourglassBottom,
  RateReview,
  StarBorder,
  TrendingUp,
  Update,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  Grid,
  Stack,
  Tooltip,
} from '@mui/material';

import { GlassCard } from '@components/common/GlassCard';
import { TextWithTooltip } from '@components/common/TextWithTooltip';
import { ProgramRecordState, type ProgramRecord } from '@hooks/program-records/useProgramRecords';

interface ProgramRecordPreviewGridProps {
  readonly records: ProgramRecord[];
  readonly loading: boolean;
  readonly programLabelById: Record<string, string>;
  readonly formatDate: (value: string) => string;
  readonly onRecordClick?: (record: ProgramRecord) => void;
}

/** Preview grid for program record feedback cards. */
export function ProgramRecordPreviewGrid({
  records,
  loading,
  programLabelById,
  formatDate,
  onRecordClick,
}: ProgramRecordPreviewGridProps): React.JSX.Element {
  const { t } = useTranslation();

  const statusLabels = React.useMemo(
    () => ({
      [ProgramRecordState.FINISH]: { label: t('athletes.details.sessions.status.finish'), color: 'success' as const },
      [ProgramRecordState.DRAFT]: { label: t('athletes.details.sessions.status.draft'), color: 'warning' as const },
      [ProgramRecordState.CREATE]: { label: t('athletes.details.sessions.status.create'), color: 'info' as const },
    }),
    [t],
  );

  const resolveDifficultyLabel = React.useCallback(
    (value?: number | null) => {
      if (value == null) return t('athletes.details.sessions.difficulty.unknown');
      if (value <= 2) return t('athletes.details.sessions.difficulty.easy');
      if (value <= 4) return t('athletes.details.sessions.difficulty.moderate');
      return t('athletes.details.sessions.difficulty.hard');
    },
    [t],
  );

  if (!loading && records.length === 0) {
    return (
      <Box>
        <TextWithTooltip tooltipTitle={t('athletes.details.sessions.empty')} variant="body2" />
      </Box>
    );
  }

  return (
    <Box>
      {/* General information */}
      <Grid container spacing={{ xs: 2, md: 2.5 }}>
        {records.map((record) => {
          const statusConfig = statusLabels[record.state];
          const sessionLabel = record.sessionSnapshot?.label ?? record.sessionId;
          const programLabel = programLabelById[record.programId] ?? record.programId;
          const satisfactionScore = record.satisfactionRating ?? null;
          const durationValue = record.durationMinutes ?? record.sessionSnapshot?.durationMin ?? null;
          const difficultyLabel = resolveDifficultyLabel(record.difficultyRating);
          const comment = record.comment?.trim() || t('athletes.details.sessions.comment_fallback');

          return (
            <Grid key={record.id} size={{ xs: 12, sm: 6, md: 4 }} sx={{ maxWidth: '500px' }}>
              <GlassCard
                onClick={onRecordClick ? () => onRecordClick(record) : undefined}
                onKeyDown={onRecordClick
                  ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onRecordClick(record);
                    }
                  }
                  : undefined}
                role={onRecordClick ? 'button' : undefined}
                tabIndex={onRecordClick ? 0 : undefined}
                sx={{
                  height: '100%',
                  cursor: onRecordClick ? 'pointer' : 'default',
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <TextWithTooltip
                      tooltipTitle={sessionLabel}
                      variant="subtitle1"
                      sx={{ fontWeight: 700, flex: 1, minWidth: 0 }}
                    />
                    {statusConfig ? (
                      <Chip color={statusConfig.color} label={statusConfig.label} size="small" />
                    ) : null}
                  </Stack>

                  <Stack spacing={1.25}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title={t('athletes.details.sessions.fields.program')}>
                        <FitnessCenter color="primary" fontSize="small" />
                      </Tooltip>
                      <TextWithTooltip tooltipTitle={programLabel} variant="body2" sx={{ minWidth: 0 }} />
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title={t('athletes.details.sessions.fields.created_at')}>
                        <CalendarMonth color="action" fontSize="small" />
                      </Tooltip>
                      <TextWithTooltip tooltipTitle={formatDate(record.createdAt)} variant="body2" />
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title={t('athletes.details.sessions.fields.updated_at')}>
                        <Update color="action" fontSize="small" />
                      </Tooltip>
                      <TextWithTooltip tooltipTitle={formatDate(record.updatedAt)} variant="body2" />
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title={t('athletes.details.sessions.fields.satisfaction')}>
                        <StarBorder color="warning" fontSize="small" />
                      </Tooltip>
                      <TextWithTooltip
                        tooltipTitle={
                          satisfactionScore !== null
                            ? t('athletes.details.sessions.satisfaction_value', {
                              value: satisfactionScore.toFixed(1),
                            })
                            : t('athletes.details.sessions.satisfaction_missing')
                        }
                        variant="body2"
                      />
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title={t('athletes.details.sessions.fields.difficulty')}>
                        <TrendingUp color="info" fontSize="small" />
                      </Tooltip>
                      <TextWithTooltip tooltipTitle={difficultyLabel} variant="body2" />
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title={t('athletes.details.sessions.fields.duration')}>
                        <HourglassBottom color="action" fontSize="small" />
                      </Tooltip>
                      <TextWithTooltip
                        tooltipTitle={
                          durationValue !== null
                            ? t('athletes.details.sessions.duration_value', {
                              count: durationValue,
                            })
                            : t('athletes.details.sessions.duration_missing')
                        }
                        variant="body2"
                      />
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Tooltip title={t('athletes.details.sessions.fields.comment')}>
                        <RateReview color="action" fontSize="small" sx={{ mt: 0.2 }} />
                      </Tooltip>
                      <TextWithTooltip tooltipTitle={comment} variant="body2" />
                    </Stack>
                  </Stack>
                </Stack>
              </GlassCard>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
