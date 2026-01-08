// src/pages/Sandbox.tsx
import * as React from 'react';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import { ResponsiveButton } from '@components/common/ResponsiveButton';
import { useTranslation } from 'react-i18next';

import { Input } from '@src/components/Input';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';

/** Internal playground to validate reusable components and stores. */
export function Sandbox(): React.JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState({ value: '', valid: false });
  const { success, error, warning, info, open } = useFlashStore();
  const { execute } = useAsyncTask();
  const { t } = useTranslation();

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
              {t('sandbox.input_card.title')}
            </Typography>

            <Input
              label={t('sandbox.input_card.label')}
              tooltip={t('sandbox.input_card.tooltip')}
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
              {t('sandbox.flash_card.title')}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <ResponsiveButton
                variant="contained"
                color="success"
                aria-label={t('sandbox.flash_card.aria.success')}
                onClick={() => success(t('sandbox.flash_card.messages.success'))}
              >
                {t('sandbox.flash_card.buttons.success')}
              </ResponsiveButton>
              <ResponsiveButton
                variant="contained"
                color="error"
                aria-label={t('sandbox.flash_card.aria.error')}
                onClick={() => error(t('sandbox.flash_card.messages.error'))}
              >
                {t('sandbox.flash_card.buttons.error')}
              </ResponsiveButton>
              <ResponsiveButton
                variant="contained"
                color="warning"
                aria-label={t('sandbox.flash_card.aria.warning')}
                onClick={() => warning(t('sandbox.flash_card.messages.warning'))}
              >
                {t('sandbox.flash_card.buttons.warning')}
              </ResponsiveButton>
              <ResponsiveButton
                variant="contained"
                color="info"
                aria-label={t('sandbox.flash_card.aria.info')}
                onClick={() => info(t('sandbox.flash_card.messages.info'))}
              >
                {t('sandbox.flash_card.buttons.info')}
              </ResponsiveButton>
              <ResponsiveButton
                variant="outlined"
                aria-label={t('sandbox.flash_card.aria.custom')}
                onClick={() => open(t('sandbox.flash_card.messages.custom'), 'info')}
              >
                {t('sandbox.flash_card.buttons.custom')}
              </ResponsiveButton>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Card 3 - Loader test */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {t('sandbox.loader_card.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('sandbox.loader_card.description')}
            </Typography>
            <ResponsiveButton variant="contained" onClick={simulateTask}>
              {t('sandbox.loader_card.button')}
            </ResponsiveButton>
          </CardContent>
        </Card>
      </Grid>

      {/* Card 4 - NotFound */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {t('sandbox.not_found_card.title')}
            </Typography>

            <ResponsiveButton variant="contained" onClick={() => navigate('/non-existent-page')}>
              {t('sandbox.not_found_card.button')}
            </ResponsiveButton>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}