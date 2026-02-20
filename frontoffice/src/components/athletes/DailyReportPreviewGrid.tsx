import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarMonth,
  Favorite,
  Mood,
  Notes,
  TrendingDown,
  TrendingUp,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { GlassCard } from '@components/common/GlassCard';
import { TextWithTooltip } from '@components/common/TextWithTooltip';
import type { DailyReport } from '@app-types/dailyReport';

interface DailyReportPreviewGridProps {
  readonly reports: DailyReport[];
  readonly loading: boolean;
  readonly formatDate: (value: string) => string;
  readonly onReportClick?: (report: DailyReport) => void;
}

/** Displays well-being reports as responsive, clickable cards. */
export function DailyReportPreviewGrid({
  reports,
  loading,
  formatDate,
  onReportClick,
}: DailyReportPreviewGridProps): React.JSX.Element {
  const { t } = useTranslation();

  const resolveScoreColor = React.useCallback((value: number) => {
    if (value >= 7) return 'success';
    if (value >= 4) return 'warning';
    return 'error';
  }, []);

  const resolveSummary = React.useCallback(
    (report: DailyReport) => {
      return t('athletes.details.wellbeing.summary', {
        energy: report.energyLevel,
        motivation: report.motivationLevel,
        mood: report.moodLevel,
        stress: report.stressLevel,
        sleep: report.sleepHours,
      });
    },
    [t],
  );

  if (!loading && reports.length === 0) {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary">
          {t('athletes.details.wellbeing.empty')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* General information */}
      <Grid container spacing={{ xs: 2, md: 2.5 }}>
        {reports.map((report) => {
          const summary = resolveSummary(report);
          const hasNotes = Boolean(report.notes?.trim());

          return (
            <Grid key={report.id} size={{ xs: 12, md: 6, xl: 4 }}>
              <GlassCard
                onClick={onReportClick ? () => onReportClick(report) : undefined}
                onKeyDown={onReportClick
                  ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onReportClick(report);
                    }
                  }
                  : undefined}
                role={onReportClick ? 'button' : undefined}
                tabIndex={onReportClick ? 0 : undefined}
                sx={{
                  height: '100%',
                  cursor: onReportClick ? 'pointer' : 'default',
                }}
              >
                <Stack spacing={2} sx={{ height: '100%' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarMonth fontSize="small" color="action" />
                    <TextWithTooltip
                      tooltipTitle={formatDate(report.reportDate)}
                      variant="subtitle1"
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      minHeight: 42,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {summary}
                  </Typography>

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip
                      size="small"
                      icon={<Favorite />}
                      color={resolveScoreColor(report.energyLevel)}
                      label={t('athletes.details.wellbeing.energy', { value: report.energyLevel })}
                    />
                    <Chip
                      size="small"
                      icon={<TrendingUp />}
                      color={resolveScoreColor(report.motivationLevel)}
                      label={t('athletes.details.wellbeing.motivation', { value: report.motivationLevel })}
                    />
                    <Chip
                      size="small"
                      icon={<Mood />}
                      color={resolveScoreColor(report.moodLevel)}
                      label={t('athletes.details.wellbeing.mood', { value: report.moodLevel })}
                    />
                    <Chip
                      size="small"
                      icon={<TrendingDown />}
                      color={resolveScoreColor(10 - report.stressLevel)}
                      label={t('athletes.details.wellbeing.stress', { value: report.stressLevel })}
                    />
                  </Stack>

                  <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                    {hasNotes ? (
                      <Tooltip title={report.notes?.trim() ?? ''}>
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'info.main' }}>
                          <Notes fontSize="inherit" />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {t('athletes.details.wellbeing.notes')}
                          </Typography>
                        </Stack>
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        {t('athletes.details.wellbeing.notes')}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </GlassCard>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
