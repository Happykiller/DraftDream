import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarMonth,
  Restaurant,
  RateReview,
  StarBorder,
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
import { MealRecordState, type MealRecord } from '@hooks/nutrition/useMealRecords';

interface MealRecordPreviewGridProps {
  readonly records: MealRecord[];
  readonly loading: boolean;
  readonly formatDate: (value: string) => string;
  readonly onRecordClick?: (record: MealRecord) => void;
}

/** Preview grid for meal record feedback cards. */
export function MealRecordPreviewGrid({
  records,
  loading,
  formatDate,
  onRecordClick,
}: MealRecordPreviewGridProps): React.JSX.Element {
  const { t } = useTranslation();

  const statusLabels = React.useMemo(
    () => ({
      [MealRecordState.FINISH]: { label: t('athletes.details.meal_records.status.finish'), color: 'success' as const },
      [MealRecordState.DRAFT]: { label: t('athletes.details.meal_records.status.draft'), color: 'warning' as const },
      [MealRecordState.CREATE]: { label: t('athletes.details.meal_records.status.create'), color: 'info' as const },
    }),
    [t],
  );

  if (!loading && records.length === 0) {
    return (
      <Box>
        <TextWithTooltip tooltipTitle={t('athletes.details.meal_records.empty')} variant="body2" />
      </Box>
    );
  }

  return (
    <Box>
      {/* General information */}
      <Grid container spacing={{ xs: 2, md: 2.5 }}>
        {records.map((record) => {
          const statusConfig = statusLabels[record.state];
          const mealLabel = record.mealSnapshot?.label ?? record.mealId;
          const satisfactionScore = record.satisfactionRating ?? null;
          const comment = record.comment?.trim() || t('athletes.details.meal_records.comment_fallback');

          return (
            <Grid key={record.id} size={{ xs: 12, sm: 6, md: 4 }}>
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
                      tooltipTitle={mealLabel}
                      variant="subtitle1"
                      sx={{ fontWeight: 700, flex: 1, minWidth: 0 }}
                    />
                    {statusConfig ? (
                      <Chip color={statusConfig.color} label={statusConfig.label} size="small" />
                    ) : null}
                  </Stack>

                  <Stack spacing={1.25}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title={t('athletes.details.meal_records.fields.meal_plan')}>
                        <Restaurant color="primary" fontSize="small" />
                      </Tooltip>
                      <TextWithTooltip
                        tooltipTitle={record.mealPlanSnapshot?.label ?? record.mealPlanId}
                        variant="body2"
                        sx={{ minWidth: 0 }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title={t('athletes.details.meal_records.fields.created_at')}>
                        <CalendarMonth color="action" fontSize="small" />
                      </Tooltip>
                      <TextWithTooltip tooltipTitle={formatDate(record.createdAt)} variant="body2" />
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title={t('athletes.details.meal_records.fields.updated_at')}>
                        <Update color="action" fontSize="small" />
                      </Tooltip>
                      <TextWithTooltip tooltipTitle={formatDate(record.updatedAt)} variant="body2" />
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title={t('athletes.details.meal_records.fields.satisfaction')}>
                        <StarBorder color="warning" fontSize="small" />
                      </Tooltip>
                      <TextWithTooltip
                        tooltipTitle={
                          satisfactionScore !== null
                            ? t('athletes.details.meal_records.satisfaction_value', {
                              value: satisfactionScore.toFixed(1),
                            })
                            : t('athletes.details.meal_records.satisfaction_missing')
                        }
                        variant="body2"
                      />
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Tooltip title={t('athletes.details.meal_records.fields.comment')}>
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
