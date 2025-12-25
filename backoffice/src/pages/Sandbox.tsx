// src/pages/Sandbox.tsx
import * as React from 'react';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { Typography, Card, CardContent, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { Input } from '@src/components/Input';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';

export function Sandbox(): React.JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = React.useState({ value: '', valid: false });
  const { success, error, warning, info, open } = useFlashStore();
  const { execute } = useAsyncTask();

  const simulateTask = async () => {
    await execute(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, 2000);
        }),
    );
  };

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {/* General information */}
      {/* Card 1 */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {t('sandbox.cards.input.title')}
            </Typography>

            <Input
              label={t('sandbox.cards.input.label')}
              tooltip={t('common.placeholders.enter_email')}
              regex="^[^@]+@[^@]+\.[^@]+$"
              entity={email}
              onChange={setEmail}
              require
              virgin
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Card 2 - Flash message playground */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {t('sandbox.cards.flash.title')}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                color="success"
                aria-label={t('sandbox.cards.flash.aria.success')}
                onClick={() => success(t('sandbox.cards.flash.success_message'))}
              >
                {t('common.buttons.success')}
              </Button>
              <Button
                variant="contained"
                color="error"
                aria-label={t('sandbox.cards.flash.aria.error')}
                onClick={() => error(t('sandbox.cards.flash.error_message'))}
              >
                {t('common.buttons.error')}
              </Button>
              <Button
                variant="contained"
                color="warning"
                aria-label={t('sandbox.cards.flash.aria.warning')}
                onClick={() => warning(t('sandbox.cards.flash.warning_message'))}
              >
                {t('common.buttons.warning')}
              </Button>
              <Button
                variant="contained"
                color="info"
                aria-label={t('sandbox.cards.flash.aria.info')}
                onClick={() => info(t('sandbox.cards.flash.info_message'))}
              >
                {t('common.buttons.info')}
              </Button>
              <Button
                variant="outlined"
                aria-label={t('sandbox.cards.flash.aria.custom')}
                onClick={() => open(t('common.placeholders.custom_flash'), 'info')}
              >
                {t('common.buttons.custom')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Card 3 - Loader test */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {t('sandbox.cards.loader.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('common.placeholders.loader_hint')}
            </Typography>
            <Button variant="contained" onClick={simulateTask}>
              {t('common.buttons.run_task')}
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Card 4 - NotFound */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {t('sandbox.cards.notfound.title')}
            </Typography>

            <Button variant="contained" onClick={() => navigate('/non-existent-page')}>
              {t('common.buttons.go_unknown')}
            </Button>
          </CardContent>
        </Card>
      </Grid>

    </Grid>
  );
}
