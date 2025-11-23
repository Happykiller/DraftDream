// src/components/prospects/ProspectWorkflow.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Stack, Typography } from '@mui/material';

import { ProspectStatusEnum } from '@src/commons/prospects/status';

interface ProspectWorkflowStage {
  status: ProspectStatusEnum;
  title: string;
  description: string;
}

/**
 * Displays the prospect pipeline to give coaches a quick overview of the workflow steps.
 */
export function ProspectWorkflow(): React.JSX.Element {
  const { t } = useTranslation();

  const stages = React.useMemo<ProspectWorkflowStage[]>(
    () => [
      {
        status: ProspectStatusEnum.LEAD,
        title: t('prospects.workflow.stages.lead.title'),
        description: t('prospects.workflow.stages.lead.description'),
      },
      {
        status: ProspectStatusEnum.CONTACTE,
        title: t('prospects.workflow.stages.contact.title'),
        description: t('prospects.workflow.stages.contact.description'),
      },
      {
        status: ProspectStatusEnum.RDV_PLANIFIE,
        title: t('prospects.workflow.stages.meeting.title'),
        description: t('prospects.workflow.stages.meeting.description'),
      },
      {
        status: ProspectStatusEnum.PROPOSITION,
        title: t('prospects.workflow.stages.proposal.title'),
        description: t('prospects.workflow.stages.proposal.description'),
      },
      {
        status: ProspectStatusEnum.NEGOCIATION,
        title: t('prospects.workflow.stages.negotiation.title'),
        description: t('prospects.workflow.stages.negotiation.description'),
      },
      {
        status: ProspectStatusEnum.GAGNE,
        title: t('prospects.workflow.stages.won.title'),
        description: t('prospects.workflow.stages.won.description'),
      },
      {
        status: ProspectStatusEnum.PERDUS,
        title: t('prospects.workflow.stages.lost.title'),
        description: t('prospects.workflow.stages.lost.description'),
      },
      {
        status: ProspectStatusEnum.A_FAIRE,
        title: t('prospects.workflow.stages.todo.title'),
        description: t('prospects.workflow.stages.todo.description'),
      },
      {
        status: ProspectStatusEnum.CLIENT,
        title: t('prospects.workflow.stages.client.title'),
        description: t('prospects.workflow.stages.client.description'),
      },
    ],
    [t],
  );

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {/* General information */}
      <Stack spacing={0.5}>
        <Typography variant="h6">{t('prospects.workflow.title')}</Typography>
        <Typography color="text.secondary" variant="body2">
          {t('prospects.workflow.description')}
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        {stages.map((stage) => (
          <Paper
            key={stage.status}
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderLeftWidth: 6,
              borderLeftColor: 'primary.main',
              px: 2,
              py: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            <Stack alignItems="center" direction="row" spacing={1}>
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  borderRadius: 1,
                  color: 'primary.contrastText',
                  fontSize: 13,
                  fontWeight: 700,
                  px: 1,
                  py: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                {t('prospects.workflow.badge', { status: stage.title })}
              </Box>
              <Typography component="span" fontWeight={700} variant="body1">
                {stage.title}
              </Typography>
            </Stack>
            <Typography color="text.secondary" variant="body2">
              {stage.description}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
