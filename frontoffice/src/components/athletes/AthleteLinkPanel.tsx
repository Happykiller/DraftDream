// src/components/athletes/AthleteLinkPanel.tsx
import * as React from 'react';
import { ArrowBack, CalendarMonth, EventBusy, EventNote, Mail, Notes, Visibility } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Button, Card, CardContent, Dialog, Divider, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { getAthleteDisplayName } from './athleteLinkUtils';

import { useDateFormatter } from '@hooks/useDateFormatter';
import type { CoachAthleteLink } from '@app-types/coachAthletes';

interface AthleteLinkPanelProps {
  link: CoachAthleteLink;
  open: boolean;
  onClose: () => void;
}

/**
 * Detailed coach-athlete link view rendered inside a modal panel.
 */
export const AthleteLinkPanel = React.memo(function AthleteLinkPanel({
  link,
  open,
  onClose,
}: AthleteLinkPanelProps): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const formatDate = useDateFormatter({ options: { day: '2-digit', month: '2-digit', year: 'numeric' } });

  const athleteName = React.useMemo(() => getAthleteDisplayName(link), [link]);
  const statusLabel = link.is_active
    ? t('athletes.list.card.status_active')
    : t('athletes.list.card.status_inactive');
  const startDateLabel = React.useMemo(() => formatDate(link.startDate), [formatDate, link.startDate]);
  const endDateLabel = React.useMemo(
    () => (link.endDate ? formatDate(link.endDate) : t('athletes.list.card.no_end_date')),
    [formatDate, link.endDate, t],
  );

  const headerBackground = React.useMemo(
    () => ({
      backgroundColor: alpha(theme.palette.info.main, 0.14),
      color: theme.palette.info.contrastText,
    }),
    [theme.palette.info.contrastText, theme.palette.info.main],
  );

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      onClose={onClose}
      open={open}
      aria-labelledby="athlete-link-panel-title"
    >
      <Card variant="outlined" sx={{ boxShadow: 3 }}>
        {/* General information */}
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
              <Typography id="athlete-link-panel-title" variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                {athleteName}
              </Typography>
              {link.athlete?.email ? (
                <Typography color="text.secondary" noWrap>
                  {link.athlete.email}
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {t('athletes.list.panel.title')}
          </Typography>

          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarMonth color="action" fontSize="small" />
              <Typography variant="body2">
                {t('athletes.list.card.start_date', { date: startDateLabel })}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              {link.endDate ? <EventNote color="action" fontSize="small" /> : <EventBusy color="action" fontSize="small" />}
              <Typography variant="body2">
                {t('athletes.list.card.end_date', { date: endDateLabel })}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Mail color="action" fontSize="small" />
              <Typography variant="body2">
                {link.athlete?.email || t('athletes.list.panel.no_email')}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Notes color="action" fontSize="small" sx={{ mt: 0.25 }} />
              <Typography variant="body2">
                {link.note?.trim() || t('athletes.list.card.no_note')}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Visibility color="action" fontSize="small" />
              <Typography variant="body2">{statusLabel}</Typography>
            </Stack>
          </Stack>
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
          <Button color="info" onClick={onClose} startIcon={<ArrowBack />}>
            {t('athletes.list.panel.actions.back_to_list')}
          </Button>
        </Box>
      </Card>
    </Dialog>
  );
});
