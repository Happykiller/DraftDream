// src/pages/athletes/AthleteLinkDetails.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import {
  CalendarMonth,
  Email,
  EventBusy,
  EventNote,
  FitnessCenter,
  HourglassBottom,
  Mail,
  MonitorHeart,
  Notes,
  Phone,
  RateReview,
  StarBorder,
  TrackChanges,
  TrendingUp,
  Update,
  Visibility,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ResponsiveButton } from '@components/common/ResponsiveButton';
import { GlassCard } from '@components/common/GlassCard';
import { TextWithTooltip } from '@components/common/TextWithTooltip';

import { getAthleteDisplayName } from '@components/athletes/athleteLinkUtils';

import { MealPlanList } from '@components/nutrition/MealPlanList';
import { ProgramList } from '@components/programs/ProgramList';
import type { AthleteLinkDetailsLoaderResult } from '@pages/athletes/AthleteLinkDetails.loader';
import { useAthleteInfo } from '@hooks/athletes/useAthleteInfo';
import { useCoachAthleteLink } from '@hooks/athletes/useCoachAthleteLink';
import { usePrograms, type Program } from '@hooks/programs/usePrograms';
import { useMealPlans, type MealPlan } from '@hooks/nutrition/useMealPlans';
import { useProgramRecords, ProgramRecordState, type ProgramRecord } from '@hooks/program-records/useProgramRecords';
import { useDateFormatter } from '@hooks/useDateFormatter';

type AthleteLinkTab = 'overview' | 'programs' | 'nutritions' | 'sessions';

interface TabPanelProps {
  readonly value: AthleteLinkTab;
  readonly currentTab: AthleteLinkTab;
  readonly children: React.ReactNode;
}

/** Simple tab panel that hides content when the tab is not selected. */
function TabPanel({ value, currentTab, children }: TabPanelProps): React.JSX.Element | null {
  if (value !== currentTab) {
    return null;
  }

  return <Box sx={{ height: '100%' }}>{children}</Box>;
}

interface ProgramTabEmptyState {
  readonly title: string;
  readonly description: string;
  readonly helper?: string;
}

interface NutritionTabEmptyState {
  readonly title: string;
  readonly description: string;
  readonly helper?: string;
}

interface MacroLabels {
  readonly calories: string;
  readonly protein: string;
  readonly carbs: string;
  readonly fats: string;
}

/** Dedicated page showing the details of a coach-athlete link. */
export function AthleteLinkDetails(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { linkId } = useParams<{ linkId: string }>();
  const loaderData = useLoaderData() as AthleteLinkDetailsLoaderResult;
  const loaderError = React.useMemo(() => {
    if (loaderData.status === 'not_found') {
      return t('athletes.details.errors.not_found');
    }
    if (loaderData.status === 'error') {
      return t('athletes.details.errors.load_failed');
    }
    return null;
  }, [loaderData.status, t]);

  const { link, loading, error } = useCoachAthleteLink({
    linkId,
    initialLink: loaderData.link,
    initialError: loaderError,
  });
  const formatDate = useDateFormatter({ options: { day: '2-digit', month: '2-digit', year: 'numeric' } });

  const displayName = React.useMemo(
    () => (link ? getAthleteDisplayName(link) : t('athletes.details.title')),
    [link, t],
  );
  const statusLabel = React.useMemo(
    () => (link?.is_active ? t('athletes.details.status.active') : t('athletes.details.status.inactive')),
    [link?.is_active, t],
  );
  const startDateLabel = React.useMemo(
    () => (link ? formatDate(link.startDate) : t('athletes.details.fields.no_start_date')),
    [formatDate, link, t],
  );
  const startDateFieldLabel = React.useMemo(
    () => t('athletes.details.fields.start_date', { date: startDateLabel }),
    [startDateLabel, t],
  );
  const endDateLabel = React.useMemo(() => {
    if (!link) {
      return t('athletes.details.fields.no_end_date');
    }
    return link.endDate ? formatDate(link.endDate) : t('athletes.details.fields.no_end_date');
  }, [formatDate, link, t]);

  const athleteEmail = React.useMemo(
    () => link?.athlete?.email?.trim() || t('athletes.details.fields.no_email'),
    [link?.athlete?.email, t],
  );

  const athletePhone = React.useMemo(
    () => link?.athlete?.phone?.trim() || t('athletes.details.fields.no_phone'),
    [link?.athlete?.phone, t],
  );

  const headerBackground = React.useMemo(
    () => ({
      backgroundColor: alpha(theme.palette.primary.main, 0.14),
      color: theme.palette.primary.contrastText,
    }),
    [theme.palette.primary.contrastText, theme.palette.primary.main],
  );

  const { athleteInfo, loading: athleteInfoLoading, error: athleteInfoError } = useAthleteInfo({
    userId: link?.athlete?.id,
  });

  const objectives = React.useMemo(() => athleteInfo?.objectives ?? [], [athleteInfo?.objectives]);
  const activityPreferences = React.useMemo(
    () => athleteInfo?.activityPreferences ?? [],
    [athleteInfo?.activityPreferences],
  );

  const athleteId = link?.athlete?.id;

  const [programSearchQuery, setProgramSearchQuery] = React.useState('');
  const [nutritionSearchQuery, setNutritionSearchQuery] = React.useState('');

  const { items: programs, total: totalPrograms, loading: programsLoading } = usePrograms({
    page: 1,
    limit: 12,
    q: programSearchQuery,
    userId: athleteId ?? undefined,
    enabled: Boolean(athleteId),
  });

  const programEmptyState = React.useMemo(
    () =>
      t('athletes.details.programs.empty_state', {
        returnObjects: true,
      }) as ProgramTabEmptyState,
    [t],
  );

  const programSearchPlaceholder = t('athletes.details.programs.search_placeholder');
  const programSearchAriaLabel = t('athletes.details.programs.search_aria_label');

  const programResultCountLabel = React.useMemo(
    () =>
      programsLoading
        ? undefined
        : t('athletes.details.programs.result_count', {
          count: programs.length,
          total: totalPrograms,
        }),
    [programs.length, programsLoading, t, totalPrograms],
  );

  const { items: mealPlans, total: totalMealPlans, loading: mealPlansLoading } = useMealPlans({
    page: 1,
    limit: 12,
    q: nutritionSearchQuery,
    userId: athleteId ?? undefined,
    enabled: Boolean(athleteId),
  });

  const { items: programsLookup } = usePrograms({
    page: 1,
    limit: 100,
    q: '',
    userId: athleteId ?? undefined,
    enabled: Boolean(athleteId),
  });

  const programLabelById = React.useMemo(() => {
    return programsLookup.reduce<Record<string, string>>((accumulator, program) => {
      accumulator[program.id] = program.label;
      return accumulator;
    }, {});
  }, [programsLookup]);

  const { list: listProgramRecords } = useProgramRecords();
  const [programRecords, setProgramRecords] = React.useState<ProgramRecord[]>([]);
  const [programRecordsLoading, setProgramRecordsLoading] = React.useState(false);

  const nutritionEmptyState = React.useMemo(
    () =>
      t('athletes.details.nutritions.empty_state', {
        returnObjects: true,
      }) as NutritionTabEmptyState,
    [t],
  );

  const nutritionSearchPlaceholder = t('athletes.details.nutritions.search_placeholder');
  const nutritionSearchAriaLabel = t('athletes.details.nutritions.search_aria_label');

  const macroLabels = React.useMemo(
    () => t('athletes.details.nutritions.macros', { returnObjects: true }) as MacroLabels,
    [t],
  );

  const nutritionResultCountLabel = React.useMemo(
    () =>
      mealPlansLoading
        ? undefined
        : t('athletes.details.nutritions.result_count', {
          count: mealPlans.length,
          total: totalMealPlans,
        }),
    [mealPlans.length, mealPlansLoading, t, totalMealPlans],
  );

  const sessionStatusLabels = React.useMemo(
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

  const sessionRecordsEmpty = programRecords.length === 0 && !programRecordsLoading;

  const finalError = error ?? loaderError;
  const showEmptyState = !loading && !link && finalError !== null;
  const [currentTab, setCurrentTab] = React.useState<AthleteLinkTab>('overview');

  const handleBack = React.useCallback(() => {
    navigate('/athletes');
  }, [navigate]);

  const handleTabChange = React.useCallback((_: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue as AthleteLinkTab);
  }, []);

  const handleProgramSearchChange = React.useCallback((value: string) => {
    setProgramSearchQuery(value);
  }, []);

  const handleNutritionSearchChange = React.useCallback((value: string) => {
    setNutritionSearchQuery(value);
  }, []);

  React.useEffect(() => {
    setProgramSearchQuery('');
    setNutritionSearchQuery('');
  }, [athleteId]);

  React.useEffect(() => {
    if (!athleteId) {
      setProgramRecords([]);
      return;
    }

    setProgramRecordsLoading(true);
    listProgramRecords({ userId: athleteId, limit: 12, page: 1 })
      .then(({ items }) => setProgramRecords(items))
      .finally(() => setProgramRecordsLoading(false));
  }, [athleteId, listProgramRecords]);

  const handleViewProgram = React.useCallback(
    (program: Program) => {
      navigate(`/programs-coach/view/${program.id}`);
    },
    [navigate],
  );

  const handleViewMealPlan = React.useCallback(
    (mealPlan: MealPlan) => {
      navigate(`/nutrition-coach/view/${mealPlan.id}`);
    },
    [navigate],
  );



  return (
    <Stack
      sx={{
        minHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
        maxHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
        height: '100%',
        flex: 1,
        overflow: 'hidden',
        bgcolor: theme.palette.backgroundColor,
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Card
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            bgcolor: theme.palette.backgroundColor,
            boxShadow: 3,
          }}
        >
          {/* General information */}
          <Box
            component="header"
            sx={{
              ...headerBackground,
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 2.5 },
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                aria-hidden
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'info.main',
                  color: theme.palette.info.contrastText,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 10px 24px ${alpha(theme.palette.info.main, 0.32)}`,
                }}
              >
                <Visibility fontSize="medium" />
              </Box>
              <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }} noWrap>
                  {displayName}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {t('athletes.details.helper')}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          <CardContent
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              p: 0,
              '&:last-child': { pb: 0 },
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                overflow: 'hidden',
                minHeight: 0,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
              }}
            >
              {/* Info block */}
              <Box
                sx={{
                  width: { xs: '100%', md: '15%' },
                  minWidth: { md: 180 },
                  maxWidth: { md: 260 },
                  borderRight: { md: 1 },
                  borderColor: { md: 'divider' },
                  bgcolor: alpha(theme.palette.info.main, 0.04),
                  px: { xs: 2, sm: 3, md: 2 },
                  py: { xs: 2, sm: 3 },
                  overflow: 'auto',
                }}
              >
                {loading && !link ? (
                  <Stack alignItems="center" spacing={1} sx={{ py: 3 }}>
                    <CircularProgress color="info" size={32} />
                    <Typography color="text.secondary" variant="body2">
                      {t('athletes.details.loading')}
                    </Typography>
                  </Stack>
                ) : null}

                {showEmptyState ? <Alert severity="error">{finalError}</Alert> : null}

                {link ? (
                  <Stack spacing={2}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {t('athletes.details.client_sheet_title')}
                    </Typography>

                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Tooltip title={t('athletes.details.fields.email')}>
                          <Email color="primary" fontSize="small" />
                        </Tooltip>
                        <Typography variant="body2">{athleteEmail}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Tooltip title={t('athletes.details.fields.phone')}>
                          <Phone color="primary" fontSize="small" />
                        </Tooltip>
                        <Typography variant="body2">{athletePhone}</Typography>
                      </Stack>
                    </Stack>

                    <Card
                      variant="outlined"
                      sx={{
                        borderColor: alpha(theme.palette.info.main, 0.24),
                        backgroundColor: alpha(theme.palette.info.main, 0.06),
                        boxShadow: 'none',
                      }}
                    >
                      <Stack spacing={1.5} sx={{ p: 1.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TrackChanges color="info" fontSize="small" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {t('athletes.details.objectives.title')}
                          </Typography>
                        </Stack>

                        {athleteInfoLoading ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CircularProgress size={18} color="info" />
                            <Typography variant="caption" color="text.secondary">
                              {t('athletes.details.loading')}
                            </Typography>
                          </Stack>
                        ) : null}

                        {!athleteInfoLoading && athleteInfoError ? (
                          <Alert severity="warning" sx={{ m: 0 }}>
                            {athleteInfoError}
                          </Alert>
                        ) : null}

                        {!athleteInfoLoading && !athleteInfoError ? (
                          objectives.length ? (
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                              {objectives.map((objective) => (
                                <Chip
                                  key={objective.id}
                                  label={objective.label}
                                  color="info"
                                  variant="outlined"
                                  sx={{
                                    borderColor: alpha(theme.palette.info.main, 0.3),
                                    backgroundColor: alpha(theme.palette.info.main, 0.12),
                                    color: theme.palette.info.main,
                                    fontWeight: 600,
                                  }}
                                />
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {t('athletes.details.objectives.empty')}
                            </Typography>
                          )
                        ) : null}
                      </Stack>
                    </Card>

                    <Card
                      variant="outlined"
                      sx={{
                        borderColor: alpha(theme.palette.success.main, 0.24),
                        backgroundColor: alpha(theme.palette.success.main, 0.07),
                        boxShadow: 'none',
                      }}
                    >
                      <Stack spacing={1.5} sx={{ p: 1.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <MonitorHeart color="success" fontSize="small" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {t('athletes.details.activity_preferences.title')}
                          </Typography>
                        </Stack>

                        {athleteInfoLoading ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CircularProgress size={18} color="success" />
                            <Typography variant="caption" color="text.secondary">
                              {t('athletes.details.loading')}
                            </Typography>
                          </Stack>
                        ) : null}

                        {!athleteInfoLoading && athleteInfoError ? (
                          <Alert severity="warning" sx={{ m: 0 }}>
                            {athleteInfoError}
                          </Alert>
                        ) : null}

                        {!athleteInfoLoading && !athleteInfoError ? (
                          activityPreferences.length ? (
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                              {activityPreferences.map((preference) => (
                                <Chip
                                  key={preference.id}
                                  label={preference.label}
                                  color="success"
                                  variant="outlined"
                                  sx={{
                                    borderColor: alpha(theme.palette.success.main, 0.3),
                                    backgroundColor: alpha(theme.palette.success.main, 0.12),
                                    color: theme.palette.success.main,
                                    fontWeight: 600,
                                  }}
                                />
                              ))}
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {t('athletes.details.activity_preferences.empty')}
                            </Typography>
                          )
                        ) : null}
                      </Stack>
                    </Card>
                  </Stack>
                ) : null}
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

              {/* Content block */}
              <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <Tabs
                  value={currentTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{ px: { xs: 1, sm: 2, md: 3 } }}
                >
                  <Tab value="overview" label={t('athletes.details.tabs.overview')} />
                  <Tab value="programs" label={t('athletes.details.tabs.programs')} />
                  <Tab value="nutritions" label={t('athletes.details.tabs.nutritions')} />
                  <Tab value="sessions" label={t('athletes.details.tabs.sessions')} />
                </Tabs>

                <Divider />

                <Box sx={{ flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
                  <TabPanel value="overview" currentTab={currentTab}>
                    {link ? (
                      <Stack spacing={3} sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
                        <Stack spacing={1.5}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {t('athletes.details.summary_title')}
                          </Typography>

                          <Stack spacing={1}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <CalendarMonth color="action" fontSize="small" />
                              <Typography variant="body2">{startDateFieldLabel}</Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center">
                              {link.endDate ? (
                                <EventNote color="action" fontSize="small" />
                              ) : (
                                <EventBusy color="action" fontSize="small" />
                              )}
                              <Typography variant="body2">
                                {t('athletes.details.fields.end_date', { date: endDateLabel })}
                              </Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center">
                              <Mail color="action" fontSize="small" />
                              <Typography variant="body2">{athleteEmail}</Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center">
                              <Visibility color="action" fontSize="small" />
                              <Typography variant="body2">{statusLabel}</Typography>
                            </Stack>
                          </Stack>
                        </Stack>

                        <Divider />

                        <Stack spacing={1.5}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {t('athletes.details.notes_title')}
                          </Typography>

                          <Stack direction="row" spacing={1} alignItems="flex-start">
                            <Notes color="action" fontSize="small" sx={{ mt: 0.25 }} />
                            <Typography variant="body2">
                              {link.note?.trim() || t('athletes.details.fields.no_note')}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    ) : null}
                  </TabPanel>

                  <TabPanel value="programs" currentTab={currentTab}>
                    {link ? (
                      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
                        <ProgramList
                          programs={programs}
                          loading={programsLoading}
                          placeholderTitle={programEmptyState.title}
                          placeholderSubtitle={programEmptyState.description}
                          placeholderHelper={programEmptyState.helper}
                          allowedActions={['view']}
                          onViewProgram={handleViewProgram}
                          onSearchChange={handleProgramSearchChange}
                          searchPlaceholder={programSearchPlaceholder}
                          searchAriaLabel={programSearchAriaLabel}
                          searchQuery={programSearchQuery}
                          resultCountLabel={programResultCountLabel}
                        />
                      </Box>
                    ) : null}
                  </TabPanel>

                  <TabPanel value="nutritions" currentTab={currentTab}>
                    {link ? (
                      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
                        <MealPlanList
                          mealPlans={mealPlans}
                          loading={mealPlansLoading}
                          placeholderTitle={nutritionEmptyState.title}
                          placeholderSubtitle={nutritionEmptyState.description}
                          placeholderHelper={nutritionEmptyState.helper}
                          allowedActions={['view']}
                          onViewMealPlan={handleViewMealPlan}
                          dayCountFormatter={(count) =>
                            t('athletes.details.nutritions.day_count', {
                              count,
                            })
                          }
                          macroLabels={macroLabels}
                          onSearchChange={handleNutritionSearchChange}
                          searchPlaceholder={nutritionSearchPlaceholder}
                          searchAriaLabel={nutritionSearchAriaLabel}
                          searchQuery={nutritionSearchQuery}
                          resultCountLabel={nutritionResultCountLabel}
                        />
                      </Box>
                    ) : null}
                  </TabPanel>

                  <TabPanel value="sessions" currentTab={currentTab}>
                    {link ? (
                      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
                        <Stack spacing={2.5}>
                          {sessionRecordsEmpty ? (
                            <Typography variant="body2" color="text.secondary">
                              {t('athletes.details.sessions.empty')}
                            </Typography>
                          ) : null}

                          <Grid container spacing={{ xs: 2, md: 2.5 }}>
                            {programRecords.map((session) => {
                              const statusConfig = sessionStatusLabels[session.state];
                              const sessionLabel = session.sessionSnapshot?.label ?? session.sessionId;
                              const programLabel = programLabelById[session.programId] ?? session.programId;
                              const satisfactionScore = session.satisfactionRating ?? null;
                              const durationValue = session.durationMinutes ?? session.sessionSnapshot?.durationMin ?? null;
                              const difficultyLabel = resolveDifficultyLabel(session.difficultyRating);
                              const comment = session.comment?.trim() || t('athletes.details.sessions.comment_fallback');

                              return (
                                <Grid key={session.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                  <GlassCard sx={{ height: '100%' }}>
                                    <Stack spacing={2}>
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        justifyContent="space-between"
                                      >
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
                                          <TextWithTooltip
                                            tooltipTitle={programLabel}
                                            variant="body2"
                                            sx={{ minWidth: 0 }}
                                          />
                                        </Stack>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                          <Tooltip title={t('athletes.details.sessions.fields.created_at')}>
                                            <CalendarMonth color="action" fontSize="small" />
                                          </Tooltip>
                                          <Typography variant="body2">
                                            {formatDate(session.createdAt)}
                                          </Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                          <Tooltip title={t('athletes.details.sessions.fields.updated_at')}>
                                            <Update color="action" fontSize="small" />
                                          </Tooltip>
                                          <Typography variant="body2">
                                            {formatDate(session.updatedAt)}
                                          </Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                          <Tooltip title={t('athletes.details.sessions.fields.satisfaction')}>
                                            <StarBorder color="warning" fontSize="small" />
                                          </Tooltip>
                                          <Typography variant="body2">
                                            {satisfactionScore !== null
                                              ? t('athletes.details.sessions.satisfaction_value', {
                                                value: satisfactionScore.toFixed(1),
                                              })
                                              : t('athletes.details.sessions.satisfaction_missing')}
                                          </Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                          <Tooltip title={t('athletes.details.sessions.fields.difficulty')}>
                                            <TrendingUp color="info" fontSize="small" />
                                          </Tooltip>
                                          <Typography variant="body2">{difficultyLabel}</Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={1} alignItems="center">
                                          <Tooltip title={t('athletes.details.sessions.fields.duration')}>
                                            <HourglassBottom color="action" fontSize="small" />
                                          </Tooltip>
                                          <Typography variant="body2">
                                            {durationValue !== null
                                              ? t('athletes.details.sessions.duration_value', {
                                                count: durationValue,
                                              })
                                              : t('athletes.details.sessions.duration_missing')}
                                          </Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={1} alignItems="flex-start">
                                          <Tooltip title={t('athletes.details.sessions.fields.comment')}>
                                            <RateReview color="action" fontSize="small" sx={{ mt: 0.2 }} />
                                          </Tooltip>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              display: '-webkit-box',
                                              WebkitLineClamp: 2,
                                              WebkitBoxOrient: 'vertical',
                                              overflow: 'hidden',
                                            }}
                                          >
                                            {comment}
                                          </Typography>
                                        </Stack>
                                      </Stack>
                                    </Stack>
                                  </GlassCard>
                                </Grid>
                              );
                            })}
                          </Grid>
                        </Stack>
                      </Box>
                    ) : null}
                  </TabPanel>
                </Box>
              </Box>
            </Box>
          </CardContent>

          <Divider />

          <Box
            component="footer"
            sx={{
              backgroundColor: alpha(theme.palette.grey[500], 0.08),
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 2.5 },
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              {link ? (
                <Typography variant="caption" color="text.secondary">
                  {startDateFieldLabel}
                </Typography>
              ) : (
                <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />
              )}

              <ResponsiveButton
                variant="contained"
                color="info"
                onClick={handleBack}
                sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
              >
                {t('athletes.details.actions.back_to_list')}
              </ResponsiveButton>
            </Stack>
          </Box>
        </Card>
      </Box>
    </Stack>
  );
}
