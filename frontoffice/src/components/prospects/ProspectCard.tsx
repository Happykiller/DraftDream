// src/components/prospects/ProspectCard.tsx
import * as React from 'react';
import {
  AttachMoney,
  CalendarMonth,
  Delete,
  Edit,
  Phone,
} from '@mui/icons-material';
import {
  Button,
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

import { useDateFormatter } from '@hooks/useDateFormatter';
import type { Prospect } from '@app-types/prospects';

export interface ProspectCardProps {
  prospect: Prospect;
  onEdit?: (prospect: Prospect) => void;
  onDelete?: (prospect: Prospect) => void;
  onValidate?: (prospect: Prospect) => void;
}

/** Presentational card summarizing the key attributes for a prospect. */
export function ProspectCard({
  prospect,
  onEdit,
  onDelete,
  onValidate,
}: ProspectCardProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const formatDate = useDateFormatter({
    locale: i18n.language,
    options: { day: '2-digit', month: '2-digit', year: 'numeric' },
  });

  const displayName = React.useMemo(() => {
    const parts = [prospect.firstName?.trim(), prospect.lastName?.trim()].filter(Boolean);
    if (parts.length === 0) {
      return t('prospects.list.card.no_name');
    }

    return parts.join(' ');
  }, [prospect.firstName, prospect.lastName, t]);

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

  const formattedUpdatedAt = React.useMemo(() => {
    if (!prospect.updatedAt) {
      return null;
    }

    const parsedDate = new Date(prospect.updatedAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    return formatDate(prospect.updatedAt);
  }, [formatDate, prospect.updatedAt]);

  const lastUpdatedLabel = formattedUpdatedAt
    ? t('prospects.list.card.updated_label', { date: formattedUpdatedAt })
    : t('prospects.list.card.updated_unknown');

  const shouldShowObjectiveBadges = (prospect.objectives?.length ?? 0) > 0;
  const shouldShowPreferenceBadges = (prospect.activityPreferences?.length ?? 0) > 0;
  const shouldShowMetadataBadges = shouldShowObjectiveBadges || shouldShowPreferenceBadges;

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
          <Stack spacing={0.25} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Tooltip title={displayName}>
              <Typography
                fontWeight={700}
                noWrap
                sx={{
                  overflow: 'hidden',
                  textAlign: 'left',
                  textOverflow: 'ellipsis',
                }}
                variant="subtitle1"
              >
                {displayName}
              </Typography>
            </Tooltip>
            {prospect.email ? (
              <Typography sx={{ textAlign: 'left' }} variant="body2" color="text.secondary">
                {prospect.email}
              </Typography>
            ) : null}
          </Stack>

          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            {onEdit ? (
              <Tooltip title={t('prospects.list.actions.edit')}>
                <IconButton
                  aria-label={`edit-prospect-${prospect.id}`}
                  onClick={() => onEdit(prospect)}
                  size="small"
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
            {onDelete ? (
              <Tooltip title={t('prospects.list.actions.delete')}>
                <IconButton
                  aria-label={`delete-prospect-${prospect.id}`}
                  onClick={() => onDelete(prospect)}
                  size="small"
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
        </Stack>

        <Stack columnGap={2} direction="row" flexWrap="wrap" rowGap={1.25} useFlexGap>
          <Stack
            alignItems="center"
            direction="row"
            spacing={1}
            sx={{ flex: '1 1 220px', minWidth: 0 }}
          >
            <Phone color="action" fontSize="small" />
            <Typography
              sx={{ minWidth: 0, textAlign: 'left', wordBreak: 'break-word' }}
              variant="body2"
            >
              {prospect.phone || t('prospects.list.card.no_phone')}
            </Typography>
          </Stack>

          {shouldShowMetadataBadges ? (
            <Stack direction="row" flexBasis="100%" flexWrap="wrap" spacing={0.75} useFlexGap>
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

          <Stack
            alignItems="center"
            direction="row"
            spacing={1}
            sx={{ flex: '1 1 220px', minWidth: 0 }}
          >
            <AttachMoney color="action" fontSize="small" />
            <Typography sx={{ textAlign: 'left' }} variant="body2">
              {budgetLabel}
            </Typography>
          </Stack>

          <Stack
            alignItems="center"
            direction="row"
            spacing={1}
            sx={{ flex: '1 1 220px', minWidth: 0 }}
          >
            <CalendarMonth color="action" fontSize="small" />
            <Typography sx={{ textAlign: 'left' }} variant="body2">
              {t('prospects.list.card.created_label', { date: formatDate(prospect.createdAt) })}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>

      <Divider />

      <CardActions sx={{ px: 2, py: 1.5 }}>
        <Stack spacing={1.25} sx={{ width: '100%' }}>
          <Stack alignItems="center" direction="row" flexWrap="wrap" rowGap={0.75} columnGap={1.5}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ flexGrow: 1, textAlign: 'left' }}
            >
              {lastUpdatedLabel}
            </Typography>

            {!onValidate && prospect.level?.label ? (
              <Chip label={prospect.level.label} color="success" size="small" />
            ) : null}
          </Stack>

          {onValidate ? <Divider flexItem /> : null}

          {onValidate ? (
            <Stack alignItems="center" direction="row" justifyContent="center" sx={{ width: '100%' }}>
              <Button
                color="error"
                fullWidth
                onClick={() => onValidate(prospect)}
                size="small"
                variant="contained"
                sx={{ fontWeight: 700, maxWidth: 220, minWidth: 160 }}
              >
                {t('prospects.list.actions.validate')}
              </Button>
            </Stack>
          ) : null}
        </Stack>
      </CardActions>
    </Card>
  );
}
