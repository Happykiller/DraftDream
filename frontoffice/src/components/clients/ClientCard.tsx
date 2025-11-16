// src/components/clients/ClientCard.tsx
import * as React from 'react';
import { Edit, Delete } from '@mui/icons-material';
import {
  Avatar,
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

/** Presentational card summarizing the key attributes for a client. */
export function ClientCard({ client, onEdit, onDelete }: ClientCardProps): React.JSX.Element {
  const { t } = useTranslation();
  const formatDate = useDateFormatter();

  const initials = React.useMemo(() => {
    const first = client.firstName?.[0] ?? '';
    const last = client.lastName?.[0] ?? '';
    return `${first}${last}`.toUpperCase() || client.firstName?.[0]?.toUpperCase() || '?';
  }, [client.firstName, client.lastName]);

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

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* General information */}
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: 'warning.main' }}>{initials}</Avatar>}
        title={`${client.firstName} ${client.lastName}`}
        subheader={client.email}
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

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('clients.list.card.contact')}
          </Typography>
          <Typography variant="body2">{client.phone || t('clients.list.card.no_phone')}</Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {client.status?.label ? <Chip label={client.status.label} size="small" color="primary" /> : null}
          {client.level?.label ? <Chip label={client.level.label} size="small" color="success" /> : null}
          {client.source?.label ? <Chip label={client.source.label} size="small" color="default" /> : null}
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
            <Typography variant="body2">{formatDate(client.desiredStartDate)}</Typography>
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
    </Card>
  );
}
