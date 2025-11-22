// src/components/prospects/ProspectCard.tsx
import * as React from 'react';
import { Delete, Edit, ExpandMoreOutlined, Phone } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
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

const COLLAPSED_CONTENT_MAX_HEIGHT = 360;

/** Presentational card summarizing the key attributes for a prospect. */
export function ProspectCard({ prospect, onEdit, onDelete }: ProspectCardProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const formatDate = useDateFormatter();
  const formatDesiredStartDate = useDateFormatter({
    locale: i18n.language,
    options: { day: '2-digit', month: '2-digit', year: 'numeric' },
  });
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

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

  const shouldShowStatusBadge = Boolean(statusLabel);
  const shouldShowObjectiveBadges = (prospect.objectives?.length ?? 0) > 0;
  const shouldShowPreferenceBadges = (prospect.activityPreferences?.length ?? 0) > 0;
  const shouldShowMetadataBadges =
    shouldShowStatusBadge || shouldShowObjectiveBadges || shouldShowPreferenceBadges;
  const overflowToggleLabel = isExpanded
    ? t('prospects.list.collapse_details')
    : t('prospects.list.expand_details');

  React.useEffect(() => {
    const element = contentRef.current;

    if (!element) {
      return undefined;
    }

    const updateOverflowState = () => {
      setIsOverflowing(element.scrollHeight > COLLAPSED_CONTENT_MAX_HEIGHT + 1);
    };

    updateOverflowState();

    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(updateOverflowState);
      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateOverflowState);

      return () => {
        window.removeEventListener('resize', updateOverflowState);
      };
    }

    return undefined;
  }, [prospect.id]);

  React.useEffect(() => {
    if (!isOverflowing && isExpanded) {
      setIsExpanded(false);
    }
  }, [isExpanded, isOverflowing]);

  React.useEffect(() => {
    setIsExpanded(false);
  }, [prospect.id]);

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* General information */}
      <Box
        ref={contentRef}
        sx={(theme) => ({
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          maxHeight: isExpanded ? 'none' : COLLAPSED_CONTENT_MAX_HEIGHT,
          overflow: 'hidden',
          ...(isOverflowing && !isExpanded
            ? {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: theme.spacing(6),
                  backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, ${theme.palette.background.paper} 75%)`,
                },
              }
            : {}),
        })}
      >
        <CardHeader
          title={
            <Typography fontWeight={600} variant="subtitle1">
              {`${prospect.firstName} ${prospect.lastName}`}
            </Typography>
          }
          subheader={
            prospect.email || shouldShowMetadataBadges ? (
              <Stack spacing={0.75} sx={{ pt: 0.5 }}>
                {prospect.email ? (
                  <Typography variant="body2" color="text.secondary">
                    {prospect.email}
                  </Typography>
                ) : null}
                {shouldShowMetadataBadges ? (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {statusLabel ? <Chip label={statusLabel} size="small" color="primary" /> : null}
                    {shouldShowObjectiveBadges
                      ? prospect.objectives?.map((objective) => (
                          <Chip key={objective.id ?? objective.label} label={objective.label} size="small" />
                        ))
                      : null}
                    {shouldShowPreferenceBadges
                      ? prospect.activityPreferences?.map((preference) => (
                          <Chip key={preference.id ?? preference.label} label={preference.label} size="small" />
                        ))
                      : null}
                  </Stack>
                ) : null}
              </Stack>
            ) : null
          }
          action={
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
          }
        />

        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Phone color="action" fontSize="small" />
            <Typography variant="body2">
              {prospect.phone || t('prospects.list.card.no_phone')}
            </Typography>
          </Stack>

          {prospect.notes ? (
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('prospects.list.card.notes')}
              </Typography>
              <Typography variant="body2">{prospect.notes}</Typography>
            </Stack>
          ) : null}

          <Stack spacing={0.5}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('prospects.list.card.budget')}
            </Typography>
            <Typography variant="body2">{budgetLabel}</Typography>
          </Stack>

          {prospect.desiredStartDate ? (
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('prospects.list.card.start_date')}
              </Typography>
              <Typography variant="body2">
                {formatDesiredStartDate(prospect.desiredStartDate)}
              </Typography>
            </Stack>
          ) : null}

          {prospect.level?.label ? (
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography variant="subtitle2" color="text.secondary">
                {t('prospects.list.card.level')}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {prospect.level.label}
              </Typography>
            </Stack>
          ) : null}
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            {t('prospects.list.card.created', { date: formatDate(prospect.createdAt) })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('prospects.list.card.updated', { date: formatDate(prospect.updatedAt) })}
          </Typography>
        </CardActions>
      </Box>

      {isOverflowing ? (
        <>
          <Divider />
          <CardActions sx={{ justifyContent: 'center' }}>
            <Stack
              alignItems="center"
              color="primary.main"
              direction="row"
              spacing={1}
              sx={{ cursor: 'pointer' }}
              onClick={() => setIsExpanded((prev) => !prev)}
            >
              <ExpandMoreOutlined fontSize="small" />
              <Typography variant="body2" fontWeight={600}>
                {overflowToggleLabel} {t('prospects.title').toLowerCase()}
              </Typography>
            </Stack>
          </CardActions>
        </>
      ) : null}
    </Card>
  );
}
