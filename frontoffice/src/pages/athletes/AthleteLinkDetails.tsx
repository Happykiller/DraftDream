// src/pages/athletes/AthleteLinkDetails.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, CalendarMonth, EventBusy, EventNote, Mail, Notes, Visibility } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { getAthleteDisplayName } from '@components/athletes/athleteLinkUtils';
import { TextWithTooltip } from '@components/common/TextWithTooltip';
import type { AthleteLinkDetailsLoaderResult } from '@pages/athletes/AthleteLinkDetails.loader';
import { useCoachAthleteLink } from '@hooks/athletes/useCoachAthleteLink';
import { useDateFormatter } from '@hooks/useDateFormatter';

type AthleteLinkTab = 'overview' | 'programs' | 'nutritions';

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

interface EmptySectionPlaceholderProps {
  readonly title: string;
  readonly helper: string;
}

/** Placeholder shown when a tab has no implemented content yet. */
function EmptySectionPlaceholder({ title, helper }: EmptySectionPlaceholderProps): React.JSX.Element {
  return (
    <Stack spacing={1} alignItems="flex-start" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {helper}
      </Typography>
    </Stack>
  );
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

  const athleteFirstName = React.useMemo(
    () => link?.athlete?.first_name?.trim() || t('athletes.details.fields.no_first_name'),
    [link?.athlete?.first_name, t],
  );

  const athleteLastName = React.useMemo(
    () => link?.athlete?.last_name?.trim() || t('athletes.details.fields.no_last_name'),
    [link?.athlete?.last_name, t],
  );

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
      backgroundColor: alpha(theme.palette.info.main, 0.14),
      color: theme.palette.info.contrastText,
    }),
    [theme.palette.info.contrastText, theme.palette.info.main],
  );

  const finalError = error ?? loaderError;
  const showEmptyState = !loading && !link && finalError !== null;
  const [currentTab, setCurrentTab] = React.useState<AthleteLinkTab>('overview');

  const handleBack = React.useCallback(() => {
    navigate('/athletes');
  }, [navigate]);

  const handleTabChange = React.useCallback((_: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue as AthleteLinkTab);
  }, []);

  const renderClientField = React.useCallback(
    (label: string, value: string) => (
      <Stack spacing={0.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.4 }}>
          {label}
        </Typography>
        <TextWithTooltip tooltipTitle={value} variant="body2" sx={{ width: '100%' }} />
      </Stack>
    ),
    [],
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
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {t('athletes.details.client_sheet_title')}
                    </Typography>

                    <Grid container spacing={1.5} rowSpacing={2}>
                      <Grid size={{ xs: 6, sm: 6 }}>
                        {renderClientField(t('athletes.details.fields.first_name'), athleteFirstName)}
                      </Grid>
                      <Grid size={{ xs: 6, sm: 6 }}>
                        {renderClientField(t('athletes.details.fields.last_name'), athleteLastName)}
                      </Grid>
                      <Grid size={{ xs: 6, sm: 6 }}>
                        {renderClientField(t('athletes.details.fields.email'), athleteEmail)}
                      </Grid>
                      <Grid size={{ xs: 6, sm: 6 }}>
                        {renderClientField(t('athletes.details.fields.phone'), athletePhone)}
                      </Grid>
                    </Grid>
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
                    <EmptySectionPlaceholder
                      title={t('athletes.details.tabs.programs')}
                      helper={t('athletes.details.tabs.programs_helper')}
                    />
                  </TabPanel>

                  <TabPanel value="nutritions" currentTab={currentTab}>
                    <EmptySectionPlaceholder
                      title={t('athletes.details.tabs.nutritions')}
                      helper={t('athletes.details.tabs.nutritions_helper')}
                    />
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

              <Button
                variant="contained"
                color="info"
                onClick={handleBack}
                startIcon={<ArrowBack />}
                sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
              >
                {t('athletes.details.actions.back_to_list')}
              </Button>
            </Stack>
          </Box>
        </Card>
      </Box>
    </Stack>
  );
}
