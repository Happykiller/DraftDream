// src/components/prospects/ProspectWorkflow.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Paper, Stack, Typography } from '@mui/material';

import { ProspectStatusEnum } from '@src/commons/prospects/status';

interface ProspectWorkflowStage {
  status: ProspectStatusEnum;
  title: string;
  description: string;
  accentColor: string;
  tintColor: string;
}

/**
 * Displays the prospect pipeline to give coaches a quick overview of the workflow steps.
 */
export function ProspectWorkflow(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();

  const stageAccents = React.useMemo(
    () => ({
      [ProspectStatusEnum.LEAD]: theme.palette.warning.main,
      [ProspectStatusEnum.CONTACTE]: theme.palette.secondary.main,
      [ProspectStatusEnum.RDV_PLANIFIE]: theme.palette.info.main,
      [ProspectStatusEnum.PROPOSITION]: theme.palette.success.main,
      [ProspectStatusEnum.NEGOCIATION]: theme.palette.purple?.main ?? theme.palette.secondary.dark,
      [ProspectStatusEnum.GAGNE]: theme.palette.primary.main,
      [ProspectStatusEnum.PERDUS]: theme.palette.error.main,
      [ProspectStatusEnum.A_FAIRE]: theme.palette.grey[700],
      [ProspectStatusEnum.CLIENT]: theme.palette.teal?.main ?? theme.palette.success.dark,
    }),
    [theme],
  );

  const stages = React.useMemo<ProspectWorkflowStage[]>(
    () => [
      {
        status: ProspectStatusEnum.LEAD,
        title: t('prospects.workflow.stages.lead.title'),
        description: t('prospects.workflow.stages.lead.description'),
        accentColor: stageAccents[ProspectStatusEnum.LEAD],
        tintColor: alpha(stageAccents[ProspectStatusEnum.LEAD], 0.06),
      },
      {
        status: ProspectStatusEnum.CONTACTE,
        title: t('prospects.workflow.stages.contact.title'),
        description: t('prospects.workflow.stages.contact.description'),
        accentColor: stageAccents[ProspectStatusEnum.CONTACTE],
        tintColor: alpha(stageAccents[ProspectStatusEnum.CONTACTE], 0.06),
      },
      {
        status: ProspectStatusEnum.RDV_PLANIFIE,
        title: t('prospects.workflow.stages.meeting.title'),
        description: t('prospects.workflow.stages.meeting.description'),
        accentColor: stageAccents[ProspectStatusEnum.RDV_PLANIFIE],
        tintColor: alpha(stageAccents[ProspectStatusEnum.RDV_PLANIFIE], 0.06),
      },
      {
        status: ProspectStatusEnum.PROPOSITION,
        title: t('prospects.workflow.stages.proposal.title'),
        description: t('prospects.workflow.stages.proposal.description'),
        accentColor: stageAccents[ProspectStatusEnum.PROPOSITION],
        tintColor: alpha(stageAccents[ProspectStatusEnum.PROPOSITION], 0.06),
      },
      {
        status: ProspectStatusEnum.NEGOCIATION,
        title: t('prospects.workflow.stages.negotiation.title'),
        description: t('prospects.workflow.stages.negotiation.description'),
        accentColor: stageAccents[ProspectStatusEnum.NEGOCIATION],
        tintColor: alpha(stageAccents[ProspectStatusEnum.NEGOCIATION], 0.06),
      },
      {
        status: ProspectStatusEnum.GAGNE,
        title: t('prospects.workflow.stages.won.title'),
        description: t('prospects.workflow.stages.won.description'),
        accentColor: stageAccents[ProspectStatusEnum.GAGNE],
        tintColor: alpha(stageAccents[ProspectStatusEnum.GAGNE], 0.06),
      },
      {
        status: ProspectStatusEnum.PERDUS,
        title: t('prospects.workflow.stages.lost.title'),
        description: t('prospects.workflow.stages.lost.description'),
        accentColor: stageAccents[ProspectStatusEnum.PERDUS],
        tintColor: alpha(stageAccents[ProspectStatusEnum.PERDUS], 0.06),
      },
      {
        status: ProspectStatusEnum.A_FAIRE,
        title: t('prospects.workflow.stages.todo.title'),
        description: t('prospects.workflow.stages.todo.description'),
        accentColor: stageAccents[ProspectStatusEnum.A_FAIRE],
        tintColor: alpha(stageAccents[ProspectStatusEnum.A_FAIRE], 0.06),
      },
      {
        status: ProspectStatusEnum.CLIENT,
        title: t('prospects.workflow.stages.client.title'),
        description: t('prospects.workflow.stages.client.description'),
        accentColor: stageAccents[ProspectStatusEnum.CLIENT],
        tintColor: alpha(stageAccents[ProspectStatusEnum.CLIENT], 0.06),
      },
    ],
    [stageAccents, t],
  );

  const helpItems = React.useMemo(
    () => t('prospects.workflow.help.items', { returnObjects: true }) as string[],
    [t],
  );

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {/* General information */}
      <Stack spacing={1}>
        <Typography variant="h6">{t('prospects.workflow.title')}</Typography>
        <Typography color="text.secondary" variant="body2">
          {t('prospects.workflow.description')}
        </Typography>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Typography color="text.secondary" variant="body2">
            {t('prospects.workflow.card_helper')}
          </Typography>

          <Box sx={{ overflowX: 'auto', pb: 1 }}>
            <Stack direction="row" spacing={2} sx={{ minWidth: stages.length * 240 }}>
              {stages.map((stage) => (
                <Paper
                  key={stage.status}
                  elevation={0}
                  sx={{
                    minWidth: 240,
                    border: '1px solid',
                    borderColor: stage.accentColor,
                    bgcolor: stage.tintColor,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: 1,
                        bgcolor: stage.accentColor,
                        flexShrink: 0,
                      }}
                    />
                    <Typography component="span" fontWeight={700} variant="body1">
                      {stage.title}
                    </Typography>
                  </Stack>

                  <Typography color="text.secondary" variant="body2">
                    {stage.description}
                  </Typography>

                  <Paper
                    elevation={0}
                    sx={{
                      border: '1px dashed',
                      borderColor: stage.accentColor,
                      bgcolor: alpha(stage.accentColor, 0.05),
                      borderRadius: 2,
                      px: 2,
                      py: 3,
                      textAlign: 'center',
                    }}
                  >
                    <Typography fontWeight={700} variant="body2">
                      {t('prospects.workflow.empty_title')}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">
                      {t('prospects.workflow.empty_description')}
                    </Typography>
                  </Paper>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.3),
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          p: { xs: 2, md: 3 },
        }}
      >
        <Stack spacing={1.5}>
          <Typography color="primary.main" fontWeight={700} variant="subtitle1">
            {t('prospects.workflow.help.title')}
          </Typography>
          <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
            {helpItems.map((item) => (
              <Typography key={item} component="li" color="primary.main" variant="body2">
                {item}
              </Typography>
            ))}
          </Stack>
          <Typography color="primary.main" variant="body2">
            {t('prospects.workflow.help.footer')}
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}
