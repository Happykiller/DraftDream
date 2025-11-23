// src/components/prospects/ProspectCard.tsx
import * as React from 'react';
import { AttachMoney, CalendarMonth, Delete, Edit, Phone } from '@mui/icons-material';
import {
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { prospectStatusLabels } from '@src/commons/prospects/status';
import { useDateFormatter } from '@hooks/useDateFormatter';
import type { Prospect } from '@app-types/prospects';

export interface ProspectCardProps {
  prospect: Prospect;
  onEdit: (prospect: Prospect) => void;
  onDelete: (prospect: Prospect) => void;
}

/** Presentational card summarizing the key attributes for a prospect. */
export function ProspectCard({ prospect, onEdit, onDelete }: ProspectCardProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const formatDate = useDateFormatter({
    locale: i18n.language,
    options: { day: '2-digit', month: '2-digit', year: 'numeric' },
  });

  const statusLabel = prospect.status ? prospectStatusLabels[prospect.status] : null;

  const budgetLabel = React.useMemo(() => {
    if (prospect.budget == null) {
      return t('prospects.list.card.no_budget');
    }
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(prospect.budget);
  }, [prospect.budget, t]);

  const daysInCurrentStage = React.useMemo(() => {
    if (!prospect.updatedAt) {
      return null;
    }

    const updatedAt = new Date(prospect.updatedAt);
    if (Number.isNaN(updatedAt.getTime())) {
      return null;
    }

    const now = new Date();
    const diffInDays = Math.max(0, Math.floor((now.getTime() - updatedAt.getTime()) / 86_400_000));

    return diffInDays;
  }, [prospect.updatedAt]);

  const stageDurationLabel = daysInCurrentStage != null
    ? t('prospects.list.card.stage_duration', { count: daysInCurrentStage })
    : t('prospects.list.card.stage_duration', { count: 0 });

  const shouldShowStatusBadge = Boolean(statusLabel);
  const shouldShowObjectiveBadges = (prospect.objectives?.length ?? 0) > 0;
  const shouldShowPreferenceBadges = (prospect.activityPreferences?.length ?? 0) > 0;
  const shouldShowMetadataBadges =
    shouldShowStatusBadge || shouldShowObjectiveBadges || shouldShowPreferenceBadges;

  return (
    <Card
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* General information */}
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
          <Stack spacing={0.25}>
            <Typography fontWeight={700} variant="subtitle1">
              {`${prospect.firstName} ${prospect.lastName}`}
            </Typography>
            {prospect.email ? (
              <Typography variant="body2" color="text.secondary">
                {prospect.email}
              </Typography>
            ) : null}
          </Stack>

          <Stack direction="row" spacing={0.5}>
            <Tooltip title={t('prospects.list.actions.edit')}>
              <IconButton
                aria-label={`edit-prospect-${prospect.id}`}
                onClick={() => onEdit(prospect)}
                size="small"
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('prospects.list.actions.delete')}>
              <IconButton
                aria-label={`delete-prospect-${prospect.id}`}
                onClick={() => onDelete(prospect)}
                size="small"
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Phone color="action" fontSize="small" />
            <Typography variant="body2">
              {prospect.phone || t('prospects.list.card.no_phone')}
            </Typography>
          </Stack>

          {shouldShowMetadataBadges ? (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {statusLabel ? <Chip label={statusLabel} size="small" color="primary" /> : null}
              {shouldShowObjectiveBadges
                ? prospect.objectives?.map((objective) => (
                    <Chip key={objective.id ?? objective.label} label={objective.label} size="small" />
                  ))
                : null}
              {shouldShowPreferenceBadges
                ? prospect.activityPreferences?.map((preference) => (
                    <Chip key={preference.id ?? preference.label} label={preference.label} size="small" color="secondary" />
                  ))
                : null}
            </Stack>
          ) : null}

          <Stack direction="row" spacing={1} alignItems="center">
            <AttachMoney color="action" fontSize="small" />
            <Typography variant="body2">{budgetLabel}</Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarMonth color="action" fontSize="small" />
            <Typography variant="body2">
              {t('prospects.list.card.created_label', { date: formatDate(prospect.createdAt) })}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>

      <Divider />

      <CardActions sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          {stageDurationLabel}
        </Typography>

        {prospect.level?.label ? <Chip label={prospect.level.label} color="success" size="small" /> : null}
      </CardActions>
    </Card>
  );
}
