import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Addchart,
  FitnessCenter,
  LocalDining,
  NightsStay,
  Notes,
  TrackChanges,
} from '@mui/icons-material';
import {
  Box,
  Divider,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import type { DailyReport } from '@app-types/dailyReport';
import { GlassCard } from '@components/common/GlassCard';
import { TextWithTooltip } from '@components/common/TextWithTooltip';

interface DailyReportPreviewGridProps {
  readonly reports: DailyReport[];
  readonly loading: boolean;
  readonly formatDate: (value: string) => string;
  readonly onReportClick: (report: DailyReport) => void;
}

interface IndicatorTileProps {
  readonly backgroundColor: string;
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
  readonly helper?: string;
}

function IndicatorTile({
  backgroundColor,
  icon,
  label,
  value,
  helper,
}: IndicatorTileProps): React.JSX.Element {
  return (
    <Box
      sx={{
        borderRadius: 2,
        bgcolor: backgroundColor,
        p: 1.5,
        minHeight: 84,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={0.35} alignItems="center">
        {icon}
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.1 }}>
          {label}
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
          {value}
        </Typography>
        {helper ? (
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.1 }}>
            {helper}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}

/** Displays well-being reports as responsive, clickable cards. */
export function DailyReportPreviewGrid({
  reports,
  loading,
  formatDate,
  onReportClick,
}: DailyReportPreviewGridProps): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();

  // Format report times defensively to avoid runtime failures on invalid dates.
  const formatTime = React.useCallback((value?: string) => {
    if (!value) {
      return t('athletes.details.wellbeing.time_unknown');
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return t('athletes.details.wellbeing.time_unknown');
    }

    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsedDate);
  }, [t]);

  const moodValue = React.useCallback((score: number) => {
    if (score === 1) return '🙂';
    if (score === 2) return '😐';
    return '🙁';
  }, []);

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
          const hasNotes = Boolean(report.notes?.trim());
          const trainingStatusKey = report.trainingDone ? 'done' : 'missed';
          const nutritionStatusKey = report.nutritionPlanCompliance > 0 ? 'done' : 'missed';
          const sleepQualityKey = report.sleepQuality >= 7 ? 'good' : report.sleepQuality >= 4 ? 'average' : 'poor';

          return (
            <Grid key={report.id} size={{ xs: 12, md: 6, xl: 4 }}>
              <GlassCard
                onClick={() => onReportClick(report)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onReportClick(report);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={t('athletes.details.wellbeing.open_report', {
                  date: formatDate(report.reportDate),
                })}
                sx={{
                  height: '100%',
                  p: 0,
                }}
              >
                <Stack spacing={1.8} sx={{ p: 1.6 }}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 1.2,
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                        flexShrink: 0,
                      }}
                    >
                      <Addchart fontSize="small" />
                    </Box>
                    <Stack spacing={0.1} sx={{ minWidth: 0 }}>
                      <TextWithTooltip
                        tooltipTitle={t('athletes.details.wellbeing.report_title', {
                          date: formatDate(report.reportDate),
                        })}
                        variant="subtitle1"
                        sx={{ fontWeight: 800, lineHeight: 1.2 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                        {t('athletes.details.wellbeing.meta', {
                          time: formatTime(report.createdAt ?? report.reportDate),
                        })}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Grid container spacing={1.2}>
                    <Grid size={{ xs: 6 }}>
                      <IndicatorTile
                        backgroundColor={alpha(theme.palette.error.main, 0.08)}
                        icon={<FitnessCenter fontSize="small" color="error" />}
                        label={t('athletes.details.wellbeing.training')}
                        value={t(`athletes.details.wellbeing.status.${trainingStatusKey}`)}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <IndicatorTile
                        backgroundColor={alpha(theme.palette.secondary.main, 0.08)}
                        icon={<TrackChanges fontSize="small" color="secondary" />}
                        label={t('athletes.details.wellbeing.intensity')}
                        value={t('athletes.details.wellbeing.score_over_ten', { value: report.motivationLevel })}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <IndicatorTile
                        backgroundColor={alpha(theme.palette.success.main, 0.1)}
                        icon={<LocalDining fontSize="small" color="success" />}
                        label={t('athletes.details.wellbeing.nutrition')}
                        value={t(`athletes.details.wellbeing.status.${nutritionStatusKey}`)}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <IndicatorTile
                        backgroundColor={alpha(theme.palette.info.main, 0.1)}
                        icon={<NightsStay fontSize="small" color="info" />}
                        label={t('athletes.details.wellbeing.sleep')}
                        value={t('athletes.details.wellbeing.sleep_hours', { value: report.sleepHours })}
                        helper={t(`athletes.details.wellbeing.sleep_quality.${sleepQualityKey}`)}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ mt: 0.2, mb: 0.2 }} />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1.4} useFlexGap flexWrap="wrap">
                      <Typography variant="body2" color="text.secondary">
                        {t('athletes.details.wellbeing.energy', { value: report.energyLevel })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('athletes.details.wellbeing.motivation', { value: report.motivationLevel })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('athletes.details.wellbeing.mood_icon', { value: moodValue(report.moodLevel) })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('athletes.details.wellbeing.stress', { value: report.stressLevel })}
                      </Typography>
                    </Stack>

                    {hasNotes ? (
                      <Tooltip title={report.notes?.trim() ?? ''}>
                        <Stack direction="row" spacing={0.4} alignItems="center" sx={{ color: 'primary.main' }}>
                          <Notes fontSize="inherit" />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {t('athletes.details.wellbeing.notes')}
                          </Typography>
                        </Stack>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        {t('athletes.details.wellbeing.notes')}
                      </Typography>
                    )}
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
