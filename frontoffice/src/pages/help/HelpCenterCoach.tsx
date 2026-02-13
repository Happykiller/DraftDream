import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

interface HelpCenterSection {
  key: string;
  title: string;
  badge: string;
  description?: string;
  steps?: string[];
  note?: string;
}

/** Coach-oriented help center bootstrap page with initial domain sections. */
export function HelpCenterCoach(): React.JSX.Element {
  const { t } = useTranslation();
  const sections = t('help_center.coach.cards', { returnObjects: true }) as HelpCenterSection[];

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack spacing={0.5}>
        <Typography variant="h5">{t('help_center.coach.title')}</Typography>
        <Typography color="text.secondary" variant="body2">
          {t('help_center.coach.subtitle')}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {sections.map((section) => (
          <Grid key={section.key} size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    label={section.badge || t('help_center.labels.coach_section')}
                    sx={{ alignSelf: 'flex-start' }}
                  />
                  <Typography variant="h6">{section.title}</Typography>
                  {section.description ? (
                    <Typography color="text.secondary" variant="body2">
                      {section.description}
                    </Typography>
                  ) : null}

                  {section.steps?.length ? (
                    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                      {section.steps.map((step) => (
                        <Typography key={step} component="li" variant="body2" sx={{ mb: 0.5 }}>
                          {step}
                        </Typography>
                      ))}
                    </Box>
                  ) : null}

                  {section.note ? (
                    <Typography color="text.secondary" variant="caption">
                      {section.note}
                    </Typography>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
