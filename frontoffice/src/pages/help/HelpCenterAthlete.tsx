import * as React from 'react';
import {
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
  description: string;
}

/** Athlete-oriented help center bootstrap page with initial self-service sections. */
export function HelpCenterAthlete(): React.JSX.Element {
  const { t } = useTranslation();
  const sections = t('help_center.athlete.sections', { returnObjects: true }) as HelpCenterSection[];

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack spacing={0.5}>
        <Typography variant="h5">{t('help_center.athlete.title')}</Typography>
        <Typography color="text.secondary" variant="body2">
          {t('help_center.athlete.subtitle')}
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
                    color="secondary"
                    variant="outlined"
                    label={t('help_center.labels.athlete_section')}
                    sx={{ alignSelf: 'flex-start' }}
                  />
                  <Typography variant="h6">{section.title}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {section.description}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
