// src/components/athletes/AthleteLinkCard.tsx
import * as React from 'react';
import { CalendarMonth, EventBusy, EventNote, Notes, Visibility } from '@mui/icons-material';
import { Card, CardContent, CardHeader, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useDateFormatter } from '@hooks/useDateFormatter';
import { getAthleteDisplayName } from './athleteLinkUtils';
import type { CoachAthleteLink } from '@app-types/coachAthletes';

export interface AthleteLinkCardProps {
  link: CoachAthleteLink;
  onView?: (link: CoachAthleteLink) => void;
}

/** Card summarizing a coach-athlete relation for the coach portal. */
export const AthleteLinkCard = React.memo(function AthleteLinkCard({
  link,
  onView,
}: AthleteLinkCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const formatDate = useDateFormatter({ options: { day: '2-digit', month: '2-digit', year: 'numeric' } });
  const athleteName = React.useMemo(() => getAthleteDisplayName(link), [link]);

  const startDateLabel = React.useMemo(() => formatDate(link.startDate), [formatDate, link.startDate]);
  const endDateLabel = React.useMemo(
    () => (link.endDate ? formatDate(link.endDate) : t('athletes.list.card.no_end_date')),
    [formatDate, link.endDate, t],
  );
  const handleView = React.useCallback(() => {
    onView?.(link);
  }, [link, onView]);

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      {/* General information */}
      <CardHeader
        title={
          <Typography fontWeight={600} variant="subtitle1">
            {athleteName}
          </Typography>
        }
        subheader={link.athlete?.email || undefined}
        action={
          onView ? (
            <Tooltip title={t('athletes.list.card.actions.view')}>
              <IconButton aria-label={t('athletes.list.card.actions.view')} onClick={handleView} size="small">
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : undefined
        }
      />
      <Divider />
      <CardContent>
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
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Notes color="action" fontSize="small" sx={{ mt: 0.25 }} />
            <Typography variant="body2">
              {link.note?.trim() || t('athletes.list.card.no_note')}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
});
