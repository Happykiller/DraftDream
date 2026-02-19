// src/pages/athletes/AthleteLinkDetails.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CalendarMonth,
  Email,
  EventBusy,
  EventNote,
  Mail,
  Addchart,
  MonitorHeart,
  Notes,
  Phone,
  TrackChanges,
  Visibility,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { ResponsiveButton } from '@components/common/ResponsiveButton';
import { AthleteCalendar } from '@components/athletes/AthleteCalendar';
import { AthleteNotesTab } from '@components/athletes/AthleteNotesTab';
import { MealRecordPreviewGrid } from '@components/athletes/MealRecordPreviewGrid';
import { ProgramRecordPreviewGrid } from '@components/athletes/ProgramRecordPreviewGrid';
import { getAthleteDisplayName } from '@components/athletes/athleteLinkUtils';
import { MealPlanList } from '@components/nutrition/MealPlanList';
import { ProgramList } from '@components/programs/ProgramList';
import { useAthleteInfo } from '@hooks/athletes/useAthleteInfo';
import { useCoachAthleteLink } from '@hooks/athletes/useCoachAthleteLink';
import { usePrograms, type Program } from '@hooks/programs/usePrograms';
import { useMealPlans, type MealPlan } from '@hooks/nutrition/useMealPlans';
import { useMealRecords, type MealRecord } from '@hooks/nutrition/useMealRecords';
import { useProgramRecords, type ProgramRecord } from '@hooks/program-records/useProgramRecords';
import { useDateFormatter } from '@hooks/useDateFormatter';

type AthleteLinkTab =
  | 'overview'
  | 'client-info'
  | 'calendar'
  | 'wellbeing'
  | 'programs'
  | 'nutritions'
  | 'sessions'
  | 'meal-records'
  | 'notes';

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
  const { link, loading, error, update } = useCoachAthleteLink({ linkId });
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
      color: theme.palette.text.primary,
    }),
    [theme.palette.text.primary, theme.palette.primary.main],
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

  const { list: listMealRecords } = useMealRecords();
  const [mealRecords, setMealRecords] = React.useState<MealRecord[]>([]);
  const [mealRecordsLoading, setMealRecordsLoading] = React.useState(false);

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

  const showEmptyState = !loading && !link && error !== null;
  const [currentTab, setCurrentTab] = React.useState<AthleteLinkTab>('overview');
  const [noteDraft, setNoteDraft] = React.useState('');
  const [noteSaving, setNoteSaving] = React.useState(false);
  const [noteError, setNoteError] = React.useState<string | null>(null);

  const notePlaceholder = t('athletes.details.notes_placeholder');
  const noteSaveLabel = t('athletes.details.notes_actions.save');
  const noteCancelLabel = t('athletes.details.notes_actions.cancel');

  React.useEffect(() => {
    setNoteDraft(link?.note ?? '');
    setNoteError(null);
  }, [link?.note, link?.id]);

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

  React.useEffect(() => {
    if (!athleteId) {
      setMealRecords([]);
      return;
    }

    setMealRecordsLoading(true);
    listMealRecords({ userId: athleteId, limit: 12, page: 1 })
      .then(({ items }) => setMealRecords(items))
      .finally(() => setMealRecordsLoading(false));
  }, [athleteId, listMealRecords]);

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
  const handleMealRecordClick = React.useCallback(
    (record: MealRecord) => {
      navigate(`/meal-record/${record.id}`);
    },
    [navigate],
  );
  const handleRecordClick = React.useCallback(
    (record: ProgramRecord) => {
      navigate(`/program-record/${record.id}`);
    },
    [navigate],
  );

  // Keep the draft note state in sync with the text field.
  const handleNoteChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNoteDraft(event.target.value);
  }, []);

  // Restore the draft to the last saved note.
  const handleNoteCancel = React.useCallback(() => {
    setNoteDraft(link?.note ?? '');
    setNoteError(null);
  }, [link?.note]);

  // Persist commercial notes updates for the coach-athlete link.
  const handleNoteSave = React.useCallback(async () => {
    if (!link) {
      return;
    }

    setNoteSaving(true);
    setNoteError(null);

    try {
      await update({
        id: link.id,
        note: noteDraft.trim() ? noteDraft.trim() : null,
      });
    } catch (_caught: unknown) {
      setNoteError(t('athletes.details.notes_update_failed'));
    } finally {
      setNoteSaving(false);
    }
  }, [link, noteDraft, t, update]);

  const noteIsDirty = noteDraft !== (link?.note ?? '');
  const noteIsDisabled = noteSaving || !noteIsDirty;

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


              {/* Content block */}
              <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                {loading && !link ? (
                  <Stack alignItems="center" spacing={1} sx={{ py: 3 }}>
                    <CircularProgress color="info" size={32} />
                    <Typography color="text.secondary" variant="body2">
                      {t('athletes.details.loading')}
                    </Typography>
                  </Stack>
                ) : null}

                {showEmptyState ? (
                  <Alert severity="error" sx={{ m: 2 }}>
                    {error}
                  </Alert>
                ) : null}

                {/* Mobile: Select dropdown */}
                <Box sx={{ display: { xs: 'block', sm: 'none' }, px: 2, py: 1.5 }}>
                  <Select
                    value={currentTab}
                    onChange={(e) => setCurrentTab(e.target.value as AthleteLinkTab)}
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="client-info">{t('athletes.details.client_sheet_title')}</MenuItem>
                    <MenuItem value="overview">{t('athletes.details.tabs.overview')}</MenuItem>
                    <MenuItem value="notes">{t('athletes.details.tabs.notes')}</MenuItem>
                    <MenuItem value="programs">{t('athletes.details.tabs.programs')}</MenuItem>
                    <MenuItem value="nutritions">{t('athletes.details.tabs.nutritions')}</MenuItem>
                    <MenuItem value="calendar">{t('athletes.details.tabs.calendar')}</MenuItem>
                    <MenuItem value="wellbeing">{t('athletes.details.tabs.wellbeing')}</MenuItem>
                    <MenuItem value="sessions">{t('athletes.details.tabs.sessions')}</MenuItem>
                    <MenuItem value="meal-records">{t('athletes.details.tabs.meal_records')}</MenuItem>
                  </Select>
                </Box>

                {/* Desktop: Tabs */}
                <Tabs
                  value={currentTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    px: { sm: 2, md: 3 },
                  }}
                >
                  <Tab value="client-info" label={t('athletes.details.client_sheet_title')} />
                  <Tab value="overview" label={t('athletes.details.tabs.overview')} />
                  <Tab value="notes" label={t('athletes.details.tabs.notes')} />
                  <Tab value="programs" label={t('athletes.details.tabs.programs')} />
                  <Tab value="nutritions" label={t('athletes.details.tabs.nutritions')} />
                  <Tab value="calendar" label={t('athletes.details.tabs.calendar')} />
                  <Tab value="wellbeing" label={t('athletes.details.tabs.wellbeing')} />
                  <Tab value="sessions" label={t('athletes.details.tabs.sessions')} />
                  <Tab value="meal-records" label={t('athletes.details.tabs.meal_records')} />
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

                          <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                              <Notes color="action" fontSize="small" sx={{ mt: 0.6 }} />
                              <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                value={noteDraft}
                                onChange={handleNoteChange}
                                placeholder={notePlaceholder}
                                disabled={noteSaving}
                              />
                            </Stack>

                            {noteError ? (
                              <Alert severity="error" sx={{ m: 0 }}>
                                {noteError}
                              </Alert>
                            ) : null}

                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button variant="text" onClick={handleNoteCancel} disabled={!noteIsDirty || noteSaving}>
                                {noteCancelLabel}
                              </Button>
                              <Button variant="contained" onClick={handleNoteSave} disabled={noteIsDisabled}>
                                {noteSaveLabel}
                              </Button>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Stack>
                    ) : null}
                  </TabPanel>

                  <TabPanel value="client-info" currentTab={currentTab}>
                    {link ? (
                      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
                        <Stack spacing={2}>
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
                      </Box>
                    ) : null}
                  </TabPanel>

                  <TabPanel value="notes" currentTab={currentTab}>
                    <AthleteNotesTab athleteId={athleteId} />
                  </TabPanel>

                  <TabPanel value="calendar" currentTab={currentTab}>
                    {link ? (
                      <AthleteCalendar
                        programRecords={programRecords}
                        mealRecords={mealRecords}
                        onProgramRecordClick={(recordId) => navigate(`/program-record/${recordId}`)}
                        onMealRecordClick={(recordId) => navigate(`/meal-record/${recordId}`)}
                      />
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


                  <TabPanel value="wellbeing" currentTab={currentTab}>
                    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Addchart color="info" />
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {t('athletes.details.wellbeing.title')}
                              </Typography>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {t('athletes.details.wellbeing.description')}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Box>
                  </TabPanel>

                  <TabPanel value="sessions" currentTab={currentTab}>
                    {link ? (
                      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
                        <ProgramRecordPreviewGrid
                          records={programRecords}
                          loading={programRecordsLoading}
                          programLabelById={programLabelById}
                          formatDate={formatDate}
                          onRecordClick={handleRecordClick}
                        />
                      </Box>
                    ) : null}
                  </TabPanel>

                  <TabPanel value="meal-records" currentTab={currentTab}>
                    {link ? (
                      <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
                        <MealRecordPreviewGrid
                          records={mealRecords}
                          loading={mealRecordsLoading}
                          formatDate={formatDate}
                          onRecordClick={handleMealRecordClick}
                        />
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
