// src/components/prospects/ProspectCard.tsx
import * as React from 'react';
import {
  AttachMoneyOutlined,
  CalendarMonthOutlined,
  DeleteOutline,
  EditOutlined,
  PhoneOutlined,
} from '@mui/icons-material';
import {
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useDateFormatter } from '@hooks/useDateFormatter';
import { usePhoneFormatter } from '@hooks/usePhoneFormatter';
import type { Prospect } from '@app-types/prospects';
import { GlassCard } from '../common/GlassCard';

interface ProspectCardSharedProps {
  prospect: Prospect;
  displayName: string;
  budgetLabel: string;
  lastUpdatedLabel: string;
  createdLabel: string;
  noPhoneLabel: string;
  showObjectiveBadges: boolean;
  showPreferenceBadges: boolean;
}

interface ProspectHeaderProps {
  prospect: Prospect;
  displayName: string;
  actions?: React.ReactNode;
}

interface ProspectDetailsProps {
  prospect: Prospect;
  budgetLabel: string;
  createdLabel: string;
  noPhoneLabel: string;
  showObjectiveBadges: boolean;
  showPreferenceBadges: boolean;
}

function useProspectCardData(
  prospect: Prospect,
): ProspectCardSharedProps & { t: (key: string, params?: any) => string } {
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

  const createdLabel = t('prospects.list.card.created_label', { date: formatDate(prospect.createdAt) });
  const noPhoneLabel = t('prospects.list.card.no_phone');
  const showObjectiveBadges = (prospect.objectives?.length ?? 0) > 0;
  const showPreferenceBadges = (prospect.activityPreferences?.length ?? 0) > 0;

  return {
    t,
    prospect,
    displayName,
    budgetLabel,
    lastUpdatedLabel,
    createdLabel,
    noPhoneLabel,
    showObjectiveBadges,
    showPreferenceBadges,
  };
}

function ProspectHeader({ displayName, actions }: ProspectHeaderProps): React.JSX.Element {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
      <Tooltip title={displayName} sx={{ flexGrow: 1, minWidth: 0 }}>
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

      {actions ? <Stack direction="row" spacing={1}>{actions}</Stack> : null}
    </Stack>
  );
}

function ProspectDetails({
  prospect,
  budgetLabel,
  createdLabel,
  noPhoneLabel,
  showObjectiveBadges,
  showPreferenceBadges,
}: ProspectDetailsProps): React.JSX.Element {
  const shouldShowMetadataBadges = showObjectiveBadges || showPreferenceBadges;

  return (
    <Stack columnGap={2} direction="row" flexWrap="wrap" rowGap={1.25} useFlexGap>
      <Stack alignItems="center" direction="row" spacing={1} sx={{ flex: '1 1 220px', minWidth: 0 }}>
        <PhoneOutlined color="action" fontSize="small" />
        <Typography sx={{ minWidth: 0, textAlign: 'left', wordBreak: 'break-word' }} variant="body2">
          {prospect.phone || noPhoneLabel}
        </Typography>
      </Stack>

      {shouldShowMetadataBadges ? (
        <Stack direction="row" flexBasis="100%" flexWrap="wrap" spacing={0.75} useFlexGap>
          {prospect.objectives?.map((objective) => (
            <Chip key={objective.id ?? objective.label} label={objective.label} size="small" />
          ))}
          {showPreferenceBadges
            ? prospect.activityPreferences?.map((preference) => (
              <Chip key={preference.id ?? preference.label} label={preference.label} size="small" color="secondary" />
            ))
            : null}
        </Stack>
      ) : null}

      <Stack alignItems="center" direction="row" spacing={1} sx={{ flex: '1 1 220px', minWidth: 0 }}>
        <AttachMoneyOutlined color="action" fontSize="small" />
        <Typography sx={{ textAlign: 'left' }} variant="body2">
          {budgetLabel}
        </Typography>
      </Stack>

      <Stack alignItems="center" direction="row" spacing={1} sx={{ flex: '1 1 220px', minWidth: 0 }}>
        <CalendarMonthOutlined color="action" fontSize="small" />
        <Typography sx={{ textAlign: 'left' }} variant="body2">
          {createdLabel}
        </Typography>
      </Stack>
    </Stack>
  );
}

export interface ProspectListCardProps {
  prospect: Prospect;
  onEdit?: (prospect: Prospect) => void;
  onDelete?: (prospect: Prospect) => void;
}

/** Presentational card summarizing the key attributes for a prospect in list views. */
export const ProspectListCard = React.memo(function ProspectListCard({
  prospect,
  onEdit,
  onDelete,
}: ProspectListCardProps): React.JSX.Element {
  const {
    t,
    displayName,
    noPhoneLabel,
    showObjectiveBadges,
  } = useProspectCardData(prospect);
  const formatPhone = usePhoneFormatter();
  const { i18n } = useTranslation();
  const formatDayMonthYear = useDateFormatter({
    locale: i18n.language,
    options: { day: '2-digit', month: '2-digit', year: 'numeric' },
  });

  const formattedPhone = React.useMemo(() => {
    if (!prospect.phone) {
      return noPhoneLabel;
    }

    const formatted = formatPhone(prospect.phone);
    return formatted || prospect.phone || noPhoneLabel;
  }, [formatPhone, noPhoneLabel, prospect.phone]);

  const clientSinceLabel = React.useMemo(() => {
    const history = prospect.workflowHistory ?? [];
    const latestEntry = history[history.length - 1];
    const candidateDate = latestEntry?.date ?? prospect.createdAt;
    if (!candidateDate) {
      return t('prospects.list.card.client_since_unknown');
    }

    const parsedDate = new Date(candidateDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return t('prospects.list.card.client_since_unknown');
    }

    const formattedDate = formatDayMonthYear(candidateDate);
    return t('prospects.list.card.client_since', { date: formattedDate });
  }, [formatDayMonthYear, prospect.createdAt, prospect.workflowHistory, t]);

  const levelLabel = prospect.level?.label || t('prospects.list.card.level_unknown');

  return (
    <GlassCard
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 1.25,
      }}
    >
      <ProspectHeader
        prospect={prospect}
        displayName={displayName}
        actions={
          <>
            {onEdit ? (
              <Tooltip title={t('prospects.list.actions.edit')}>
                <IconButton
                  aria-label={`edit-prospect-${prospect.id}`}
                  onClick={() => onEdit(prospect)}
                  size="small"
                >
                  <EditOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
            {onDelete ? (
              <Tooltip title={t('prospects.list.actions.delete')}>
                <IconButton
                  aria-label={`delete-prospect-${prospect.id}`}
                  color="error"
                  onClick={() => onDelete(prospect)}
                  size="small"
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          </>
        }
      />

      {prospect.email ? (
        <Typography sx={{ textAlign: 'left' }} variant="body2" color="text.secondary">
          {prospect.email}
        </Typography>
      ) : null}

      <Stack alignItems="center" direction="row" spacing={1}>
        <PhoneOutlined color="action" fontSize="small" />
        <Typography sx={{ textAlign: 'left' }} variant="body2">
          {formattedPhone}
        </Typography>
      </Stack>

      <Stack alignItems="center" direction="row" spacing={1}>
        <CalendarMonthOutlined color="action" fontSize="small" />
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
          {clientSinceLabel}
        </Typography>
      </Stack>

      <Typography variant="body2" fontWeight={700} sx={{ textAlign: 'left' }}>
        {t('prospects.list.card.objectives')}
      </Typography>

      {showObjectiveBadges ? (
        <Stack direction="row" flexWrap="wrap" spacing={0.75} useFlexGap>
          {prospect.objectives?.map((objective) => (
            <Chip key={objective.id ?? objective.label} label={objective.label} size="small" />
          ))}
        </Stack>
      ) : null}

      <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1} sx={{ mt: 'auto', pt: 1 }}>
        <Typography variant="body2">{t('prospects.list.card.level')}</Typography>
        <Typography variant="body2" fontWeight={700} sx={{ textAlign: 'right' }}>
          {levelLabel}
        </Typography>
      </Stack>
    </GlassCard>
  );
});

export interface ProspectWorkflowCardProps {
  prospect: Prospect;
  onEdit?: (prospect: Prospect) => void;
  onDelete?: (prospect: Prospect) => void;
  onValidate?: (prospect: Prospect) => void;
}

/** Presentational card tuned for workflow interactions, including validation actions. */
export const ProspectWorkflowCard = React.memo(function ProspectWorkflowCard({
  prospect,
  onEdit,
  onDelete,
  onValidate,
}: ProspectWorkflowCardProps): React.JSX.Element {
  const {
    t,
    displayName,
    budgetLabel,
    createdLabel,
    noPhoneLabel,
    showObjectiveBadges,
    showPreferenceBadges,
  } = useProspectCardData(prospect);

  const daysInStageLabel = React.useMemo(() => {
    const latestEntry = prospect.workflowHistory?.[prospect.workflowHistory.length - 1];
    if (!latestEntry) {
      return t('prospects.list.card.stage_duration', { count: 0 });
    }

    const parsedDate = new Date(latestEntry.date);
    if (Number.isNaN(parsedDate.getTime())) {
      return t('prospects.list.card.stage_duration', { count: 0 });
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const daysInStage = Math.max(0, Math.floor((Date.now() - parsedDate.getTime()) / millisecondsPerDay));

    return t('prospects.list.card.stage_duration', { count: daysInStage });
  }, [prospect.workflowHistory, t]);

  return (
    <GlassCard
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 1.5,
      }}
    >
      <ProspectHeader
        prospect={prospect}
        displayName={displayName}
        actions={
          <>
            {onEdit ? (
              <Tooltip title={t('prospects.list.actions.edit')}>
                <IconButton
                  aria-label={`edit-prospect-${prospect.id}`}
                  onClick={() => onEdit(prospect)}
                  size="small"
                >
                  <EditOutlined fontSize="small" />
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
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          </>
        }
      />

      <ProspectDetails
        prospect={prospect}
        budgetLabel={budgetLabel}
        createdLabel={createdLabel}
        noPhoneLabel={noPhoneLabel}
        showObjectiveBadges={showObjectiveBadges}
        showPreferenceBadges={showPreferenceBadges}
      />

      <Divider flexItem />

      <Stack spacing={1.25} sx={{ mt: 'auto' }}>
        <Stack alignItems="center" direction="row" flexWrap="wrap" rowGap={0.75} columnGap={1.5}>
          <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1, textAlign: 'left' }}>
            {daysInStageLabel}
          </Typography>

          {!onValidate && prospect.level?.label ? <Chip label={prospect.level.label} color="success" size="small" /> : null}
        </Stack>

        {onValidate ? (
          <Stack alignItems="center" direction="row" justifyContent="center" sx={{ width: '100%', pt: 1 }}>
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
    </GlassCard>
  );
});
