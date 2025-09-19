// src/pages/LoginPage.tsx
import * as React from 'react';
import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography, Paper } from '@mui/material';
import { Done, Visibility, VisibilityOff, Info as InfoIcon, Person, Lock } from '@mui/icons-material';

import { Input } from '@components/Input';
import { CODES } from '@src/commons/CODES';
import { useAuthReq } from '@hooks/useAuthReq';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';

export function Login(): React.JSX.Element {
  /**
   * Instance
   */
  const flash = useFlashStore();
  const navigate = useNavigate();
  const { execute: auth } = useAuthReq();
  const { execute: runTask } = useAsyncTask();

  /**
   * Variables
   */
  const [formEntities, setFormEntities] = React.useState({
    email: { value: '', valid: false },
    password: { value: '', valid: false },
  });

  /**
   * Methods
   */
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result: any = await runTask(() => auth({ email: formEntities.email.value, password: formEntities.password.value }));
    // runTask returns T | null (null when task throws)
    if (!result) {
      flash.error('Unexpected error, please try again.');
      return;
    }

    if (result.message === CODES.SUCCESS && result.data) {
      flash.success(`Login successful : ${result.data.name_first}!`);
      navigate('/', { replace: true });
    } else {
      // Prefer server message if present
      flash.error(result.error || 'Invalid credentials');
    }
  };

  /**
   * Render
   */
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
          backgroundColor: 'black',
        justifyContent: 'center',
        padding: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: `4px`,
          backgroundColor: 'white',
          backdropFilter: 'blur(2px)',
        }}
      >
        <Box textAlign="center" mb={3}>
          <Typography variant="h1" gutterBottom>
            FitDesk
          </Typography>
        </Box>

          <form onSubmit={onSubmit}>
            <Stack spacing={3}>
              <Input
                label={<Trans>login.login</Trans>}
                tooltip={<Trans>REGEX.LOGIN</Trans>}
                startIcon={<Person fontSize="small"/>}
                icons={{
                  visibility : <Visibility fontSize="small"/>,
                  visibilityOff : <VisibilityOff fontSize="small"/>,
                  help : <InfoIcon fontSize="small"/>,
                }}
                regex="^[a-zA-Z0-9._-]{3,}$"
                entity={formEntities.email}
                onChange={(entity: any) =>
                  setFormEntities((prev) => ({ ...prev, email: entity }))
                }
                require
                virgin
              />

              <Input
                label={<Trans>login.password</Trans>}
                tooltip={<Trans>REGEX.PASSWORD</Trans>}
                startIcon={<Lock fontSize="small"/>}
                icons={{
                  visibility : <Visibility fontSize="small"/>,
                  visibilityOff : <VisibilityOff fontSize="small"/>,
                  help : <InfoIcon fontSize="small"/>,
                }}
                regex=".{6,}"
                type="password"
                entity={formEntities.password}
                onChange={(entity: any) =>
                  setFormEntities((prev) => ({ ...prev, password: entity }))
                }
                require
                virgin
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={<Done fontSize="small"/>}
                disabled={!(formEntities.email.valid && formEntities.password.valid)}
              >
                <Trans>login.button</Trans>
              </Button>
            </Stack>
          </form>
      </Paper>
    </Box>
  );
}
