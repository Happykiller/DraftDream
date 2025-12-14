// src/pages/athletes/AthleteLinkDetails.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, CalendarMonth, EventBusy, EventNote, Mail, Notes, Visibility } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { getAthleteDisplayName } from '@components/athletes/athleteLinkUtils';
import type { AthleteLinkDetailsLoaderResult } from '@pages/athletes/AthleteLinkDetails.loader';
import { useCoachAthleteLink } from '@hooks/athletes/useCoachAthleteLink';
import { useDateFormatter } from '@hooks/useDateFormatter';

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

  const headerBackground = React.useMemo(
    () => ({
      backgroundColor: alpha(theme.palette.info.main, 0.14),
      color: theme.palette.info.contrastText,
    }),
    [theme.palette.info.contrastText, theme.palette.info.main],
  );

  const finalError = error ?? loaderError;
  const showEmptyState = !loading && !link && finalError !== null;

  const handleBack = React.useCallback(() => {
    navigate('/athletes');
  }, [navigate]);

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
            <Box sx={{ flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
              <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 3.5 } }}>
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
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {t('athletes.details.summary_title')}
                    </Typography>

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
                      <Typography variant="body2">
                        {link.athlete?.email || t('athletes.details.fields.no_email')}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Notes color="action" fontSize="small" sx={{ mt: 0.25 }} />
                      <Typography variant="body2">
                        {link.note?.trim() || t('athletes.details.fields.no_note')}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Visibility color="action" fontSize="small" />
                      <Typography variant="body2">{statusLabel}</Typography>
                    </Stack>
                  </Stack>
                ) : null}
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
