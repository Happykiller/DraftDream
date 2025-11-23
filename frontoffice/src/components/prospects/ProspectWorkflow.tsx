// src/components/prospects/ProspectWorkflow.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Cancel,
  CalendarMonth,
  Chat,
  CheckCircle,
  Description,
  People,
  Phone,
  type SvgIconComponent,
} from '@mui/icons-material';
import {
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { orange } from '@mui/material/colors';

import { ProspectStatusEnum } from '@src/commons/prospects/status';

interface ProspectWorkflowStage {
  status: ProspectStatusEnum;
  title: string;
  description: string;
  accentColor: string;
  tintColor: string;
  Icon: SvgIconComponent;
}

/**
 * Displays the prospect pipeline to give coaches a quick overview of the workflow steps.
 */
export function ProspectWorkflow(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();

  const stageStyles = React.useMemo<Record<ProspectStatusEnum, { accentColor: string; Icon: SvgIconComponent }>>(
    () => ({
      [ProspectStatusEnum.LEAD]: {
        accentColor: theme.palette.text.primary,
        Icon: People,
      },
      [ProspectStatusEnum.CONTACTE]: {
        accentColor: theme.palette.primary.main,
        Icon: Phone,
      },
      [ProspectStatusEnum.RDV_PLANIFIE]: {
        accentColor: theme.palette.warning.main,
        Icon: CalendarMonth,
      },
      [ProspectStatusEnum.PROPOSITION]: {
        accentColor: theme.palette.secondary.main,
        Icon: Description,
      },
      [ProspectStatusEnum.NEGOCIATION]: {
        accentColor: orange[600],
        Icon: Chat,
      },
      [ProspectStatusEnum.GAGNE]: {
        accentColor: theme.palette.success.main,
        Icon: CheckCircle,
      },
      [ProspectStatusEnum.PERDUS]: {
        accentColor: theme.palette.error.main,
        Icon: Cancel,
      },
    }),
    [theme],
  );

  const stages = React.useMemo<ProspectWorkflowStage[]>(
    () => [
      {
        status: ProspectStatusEnum.LEAD,
        title: t('prospects.workflow.stages.lead.title'),
        description: t('prospects.workflow.stages.lead.description'),
        accentColor: stageStyles[ProspectStatusEnum.LEAD].accentColor,
        tintColor: alpha(stageStyles[ProspectStatusEnum.LEAD].accentColor, 0.06),
        Icon: stageStyles[ProspectStatusEnum.LEAD].Icon,
      },
      {
        status: ProspectStatusEnum.CONTACTE,
        title: t('prospects.workflow.stages.contact.title'),
        description: t('prospects.workflow.stages.contact.description'),
        accentColor: stageStyles[ProspectStatusEnum.CONTACTE].accentColor,
        tintColor: alpha(stageStyles[ProspectStatusEnum.CONTACTE].accentColor, 0.06),
        Icon: stageStyles[ProspectStatusEnum.CONTACTE].Icon,
      },
      {
        status: ProspectStatusEnum.RDV_PLANIFIE,
        title: t('prospects.workflow.stages.meeting.title'),
        description: t('prospects.workflow.stages.meeting.description'),
        accentColor: stageStyles[ProspectStatusEnum.RDV_PLANIFIE].accentColor,
        tintColor: alpha(stageStyles[ProspectStatusEnum.RDV_PLANIFIE].accentColor, 0.06),
        Icon: stageStyles[ProspectStatusEnum.RDV_PLANIFIE].Icon,
      },
      {
        status: ProspectStatusEnum.PROPOSITION,
        title: t('prospects.workflow.stages.proposal.title'),
        description: t('prospects.workflow.stages.proposal.description'),
        accentColor: stageStyles[ProspectStatusEnum.PROPOSITION].accentColor,
        tintColor: alpha(stageStyles[ProspectStatusEnum.PROPOSITION].accentColor, 0.06),
        Icon: stageStyles[ProspectStatusEnum.PROPOSITION].Icon,
      },
      {
        status: ProspectStatusEnum.NEGOCIATION,
        title: t('prospects.workflow.stages.negotiation.title'),
        description: t('prospects.workflow.stages.negotiation.description'),
        accentColor: stageStyles[ProspectStatusEnum.NEGOCIATION].accentColor,
        tintColor: alpha(stageStyles[ProspectStatusEnum.NEGOCIATION].accentColor, 0.06),
        Icon: stageStyles[ProspectStatusEnum.NEGOCIATION].Icon,
      },
      {
        status: ProspectStatusEnum.GAGNE,
        title: t('prospects.workflow.stages.won.title'),
        description: t('prospects.workflow.stages.won.description'),
        accentColor: stageStyles[ProspectStatusEnum.GAGNE].accentColor,
        tintColor: alpha(stageStyles[ProspectStatusEnum.GAGNE].accentColor, 0.06),
        Icon: stageStyles[ProspectStatusEnum.GAGNE].Icon,
      },
      {
        status: ProspectStatusEnum.PERDUS,
        title: t('prospects.workflow.stages.lost.title'),
        description: t('prospects.workflow.stages.lost.description'),
        accentColor: stageStyles[ProspectStatusEnum.PERDUS].accentColor,
        tintColor: alpha(stageStyles[ProspectStatusEnum.PERDUS].accentColor, 0.06),
        Icon: stageStyles[ProspectStatusEnum.PERDUS].Icon,
      },
    ],
    [stageStyles, t],
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

          <Grid columnSpacing={2} columns={{ xs: 1, lg: 4, xl: 8 }} container rowSpacing={2}>
            {stages.map((stage) => (
              <Grid key={stage.status} size={1}>
                <Paper
                  elevation={0}
                  sx={{
                    height: '100%',
                    border: '1px solid',
                    borderColor: stage.accentColor,
                    bgcolor: stage.tintColor,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  <Stack alignItems="center" direction="row" spacing={1.25}>
                    <stage.Icon fontSize="small" sx={{ color: stage.accentColor }} />
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
              </Grid>
            ))}
          </Grid>
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
