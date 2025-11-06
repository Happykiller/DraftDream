import { Button, Container, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useI18n } from '../i18n/I18nProvider';

const LandingPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleNavigate = (): void => {
    navigate('/changelog');
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 10, md: 16 } }}>
      {/* General information */}
      <Stack spacing={6}>
        <Stack spacing={2}>
          <Typography variant="h1">{t('landing.hero.title')}</Typography>
          <Typography color="text.secondary" variant="h5">
            {t('landing.hero.subtitle')}
          </Typography>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button color="primary" onClick={handleNavigate} size="large" variant="contained">
            {t('landing.hero.cta')}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default LandingPage;
