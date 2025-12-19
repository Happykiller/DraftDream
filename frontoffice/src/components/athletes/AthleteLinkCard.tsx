// src/components/athletes/AthleteLinkCard.tsx
import * as React from 'react';
import { CalendarMonth, EventBusy, EventNote, Notes, Visibility } from '@mui/icons-material';
import { Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useDateFormatter } from '@hooks/useDateFormatter';
import { getAthleteDisplayName } from './athleteLinkUtils';
import type { CoachAthleteLink } from '@app-types/coachAthletes';
import { GlassCard } from '../common/GlassCard';

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
    <GlassCard
      sx={{
        height: '100%',
        p: 0, // Reset padding to handle internal separation if needed, or just keep it and adjust
        overflow: 'hidden',
      }}
    >
      <Stack spacing={2} sx={{ p: 2.5 }}>
        {/* Header section manually built to match GlassCard look better than CardHeader */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Typography
              fontWeight={700}
              noWrap
              variant="subtitle1"
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {athleteName}
            </Typography>
            {link.athlete?.email && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {link.athlete.email}
              </Typography>
            )}
          </Stack>

          {onView && (
            <Tooltip title={t('athletes.list.card.actions.view')}>
              <IconButton aria-label={t('athletes.list.card.actions.view')} onClick={handleView} size="small">
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        <Divider sx={{ opacity: 0.6 }} />

        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <CalendarMonth color="action" fontSize="small" />
            <Typography variant="body2" color="text.primary">
              {t('athletes.list.card.start_date', { date: startDateLabel })}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.25} alignItems="center">
            {link.endDate ? <EventNote color="action" fontSize="small" /> : <EventBusy color="action" fontSize="small" />}
            <Typography variant="body2" color="text.primary">
              {t('athletes.list.card.end_date', { date: endDateLabel })}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Notes color="action" fontSize="small" sx={{ mt: 0.25 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: link.note ? 'normal' : 'italic' }}>
              {link.note?.trim() || t('athletes.list.card.no_note')}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </GlassCard>
  );
});
