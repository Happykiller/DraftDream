// src/pages/Sandbox.tsx
import * as React from 'react';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { Typography, Card, CardContent, Button, Stack } from '@mui/material';

import { Input } from '@src/components/Input';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';

export function Sandbox(): React.JSX.Element {
  const navigate = useNavigate();
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
      {/* Card 1 */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Input
            </Typography>

            <Input
              label="Email"
              tooltip="Enter a valid email address"
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
              Flash Messages
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                color="success"
                aria-label="Show success flash"
                onClick={() => success('Operation completed successfully.')}
              >
                Success
              </Button>
              <Button
                variant="contained"
                color="error"
                aria-label="Show error flash"
                onClick={() => error('Something went wrong.')}
              >
                Error
              </Button>
              <Button
                variant="contained"
                color="warning"
                aria-label="Show warning flash"
                onClick={() => warning('Please double-check your inputs.')}
              >
                Warning
              </Button>
              <Button
                variant="contained"
                color="info"
                aria-label="Show info flash"
                onClick={() => info('Heads up! Here is some information.')}
              >
                Info
              </Button>
              <Button
                variant="outlined"
                aria-label="Show custom flash"
                onClick={() => open('Custom message (outlined button).', 'info')}
              >
                Custom
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
              Loader Test
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Click below to simulate a 2s async task with loader overlay.
            </Typography>
            <Button variant="contained" onClick={simulateTask}>
              Run Task
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Card 4 - NotFound */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              NotFound
            </Typography>

            <Button variant="contained" onClick={(e) => navigate('/non-existent-page')}>
              Go unkown
            </Button>
          </CardContent>
        </Card>
      </Grid>

    </Grid>
  );
}
