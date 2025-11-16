// src/components/clients/ClientCard.tsx
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

import { useDateFormatter } from '@hooks/useDateFormatter';
import type { Client } from '@types/clients';

export interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

const COLLAPSED_CONTENT_MAX_HEIGHT = 360;

/** Presentational card summarizing the key attributes for a client. */
export function ClientCard({ client, onEdit, onDelete }: ClientCardProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const formatDate = useDateFormatter();
  const formatDesiredStartDate = useDateFormatter({
    locale: i18n.language,
    options: { day: '2-digit', month: '2-digit', year: 'numeric' },
  });
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const budgetLabel = React.useMemo(() => {
    if (client.budget == null) {
      return t('clients.list.card.no_budget');
    }
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(client.budget);
  }, [client.budget, t]);

  const shouldShowStatusBadge = Boolean(client.status?.label);
  const overflowToggleLabel = isExpanded
    ? t('clients.list.collapse_details')
    : t('clients.list.expand_details');

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
  }, [client.id]);

  React.useEffect(() => {
    if (!isOverflowing && isExpanded) {
      setIsExpanded(false);
    }
  }, [isExpanded, isOverflowing]);

  React.useEffect(() => {
    setIsExpanded(false);
  }, [client.id]);

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
              {`${client.firstName} ${client.lastName}`}
            </Typography>
          }
          subheader={
            client.email || shouldShowStatusBadge ? (
              <Stack spacing={0.75} sx={{ pt: 0.5 }}>
                {client.email ? (
                  <Typography variant="body2" color="text.secondary">
                    {client.email}
                  </Typography>
                ) : null}
                {shouldShowStatusBadge ? (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {client.status?.label ? (
                      <Chip label={client.status.label} size="small" color="primary" />
                    ) : null}
                  </Stack>
                ) : null}
              </Stack>
            ) : null
          }
          action={
            <Stack direction="row" spacing={0.5}>
              <Tooltip title={t('clients.list.actions.edit')}>
                <IconButton aria-label={`edit-client-${client.id}`} onClick={() => onEdit(client)} size="small">
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('clients.list.actions.delete')}>
                <IconButton aria-label={`delete-client-${client.id}`} onClick={() => onDelete(client)} size="small">
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
            <Typography variant="body2">{client.phone || t('clients.list.card.no_phone')}</Typography>
          </Stack>

          {client.objectives?.length ? (
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('clients.list.card.objectives')}
              </Typography>
              <Typography variant="body2">
                {client.objectives.map((objective) => objective.label).join(', ')}
              </Typography>
            </Stack>
          ) : null}

          {client.activityPreferences?.length ? (
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('clients.list.card.preferences')}
              </Typography>
              <Typography variant="body2">
                {client.activityPreferences.map((pref) => pref.label).join(', ')}
              </Typography>
            </Stack>
          ) : null}

          {client.notes ? (
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('clients.list.card.notes')}
              </Typography>
              <Typography variant="body2">{client.notes}</Typography>
            </Stack>
          ) : null}

          <Stack spacing={0.5}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('clients.list.card.budget')}
            </Typography>
            <Typography variant="body2">{budgetLabel}</Typography>
          </Stack>

          {client.desiredStartDate ? (
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('clients.list.card.start_date')}
              </Typography>
              <Typography variant="body2">{formatDesiredStartDate(client.desiredStartDate)}</Typography>
            </Stack>
          ) : null}

          {client.level?.label ? (
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography variant="subtitle2" color="text.secondary">
                {t('clients.list.card.level')}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {client.level.label}
              </Typography>
            </Stack>
          ) : null}
        </CardContent>

        <Divider />

        <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            {t('clients.list.card.created', { date: formatDate(client.createdAt) })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('clients.list.card.updated', { date: formatDate(client.updatedAt) })}
          </Typography>
        </CardActions>
      </Box>

      {isOverflowing ? (
        <>
          <Divider />
          <Stack direction="row" justifyContent="center" sx={{ py: 1 }}>
            <Tooltip title={overflowToggleLabel}>
              <IconButton
                size="small"
                aria-label={overflowToggleLabel}
                aria-expanded={isExpanded}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsExpanded((prev) => !prev);
                }}
                sx={(theme) => ({
                  color: theme.palette.text.secondary,
                  transition: theme.transitions.create('transform', {
                    duration: theme.transitions.duration.shorter,
                  }),
                  transform: isExpanded ? 'rotate(180deg)' : 'none',
                })}
              >
                <ExpandMoreOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </>
      ) : null}
    </Card>
  );
}
