// src/components/athletes/AthleteLinkCard.tsx
import * as React from 'react';
import { CalendarMonth, EventBusy, EventNote, Notes } from '@mui/icons-material';
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useDateFormatter } from '@hooks/useDateFormatter';
import type { CoachAthleteLink } from '@app-types/coachAthletes';

export interface AthleteLinkCardProps {
  link: CoachAthleteLink;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const [first = '', last = ''] = name.split(' ');
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?';
}

function formatFullName(link: CoachAthleteLink): string {
  const first = link.athlete?.first_name ?? '';
  const last = link.athlete?.last_name ?? '';
  const fallback = link.athlete?.email || link.athleteId;
  const display = `${first} ${last}`.trim();
  return display || fallback;
}

/** Card summarizing a coach-athlete relation for the coach portal. */
export function AthleteLinkCard({ link }: AthleteLinkCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const formatDate = useDateFormatter({ options: { day: '2-digit', month: '2-digit', year: 'numeric' } });
  const athleteName = React.useMemo(() => formatFullName(link), [link]);
  const initials = React.useMemo(() => getInitials(athleteName), [athleteName]);

  const startDateLabel = React.useMemo(() => formatDate(link.startDate), [formatDate, link.startDate]);
  const endDateLabel = React.useMemo(
    () => (link.endDate ? formatDate(link.endDate) : t('athletes.list.card.no_end_date')),
    [formatDate, link.endDate, t],
  );

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      {/* General information */}
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>{initials}</Avatar>}
        title={
          <Typography fontWeight={600} variant="subtitle1">
            {athleteName}
          </Typography>
        }
        subheader={link.athlete?.email || undefined}
        action={
          <Chip
            label={link.is_active ? t('athletes.list.card.status_active') : t('athletes.list.card.status_inactive')}
            color={link.is_active ? 'success' : 'default'}
            size="small"
          />
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
}
