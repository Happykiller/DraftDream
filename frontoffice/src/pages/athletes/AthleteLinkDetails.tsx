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
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Card variant="outlined" sx={{ boxShadow: 3 }}>
        <Box
          component="header"
          sx={{
            ...headerBackground,
            p: { xs: 2, md: 2.5 },
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

        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loading && !link ? (
            <Stack alignItems="center" spacing={1} sx={{ py: 3 }}>
              <CircularProgress color="info" size={32} />
              <Typography color="text.secondary" variant="body2">
                {t('athletes.details.loading')}
              </Typography>
            </Stack>
          ) : null}

          {showEmptyState ? (
            <Alert severity="error">{finalError}</Alert>
          ) : null}

          {link ? (
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {t('athletes.details.summary_title')}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarMonth color="action" fontSize="small" />
                <Typography variant="body2">
                  {t('athletes.details.fields.start_date', { date: startDateLabel })}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                {link.endDate ? <EventNote color="action" fontSize="small" /> : <EventBusy color="action" fontSize="small" />}
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
        </CardContent>

        <Divider />

        <Box
          component="footer"
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: { xs: 2, md: 2.5 },
          }}
        >
          <Button color="info" onClick={handleBack} startIcon={<ArrowBack />}>
            {t('athletes.details.actions.back_to_list')}
          </Button>
        </Box>
      </Card>
    </Stack>
  );
}
