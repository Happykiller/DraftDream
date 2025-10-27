import { Button, Container, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = (): JSX.Element => {
  const navigate = useNavigate();

  const handleNavigate = (): void => {
    navigate('/changelog');
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 10, md: 16 } }}>
      {/* General information */}
      <Stack spacing={6}>
        <Stack spacing={2}>
          <Typography color="primary.main" variant="overline">
            FitDesk
          </Typography>
          <Typography variant="h1">
            Flexible workspaces that adapt to your team&apos;s rhythm
          </Typography>
          <Typography color="text.secondary" variant="h5">
            FitDesk blends ergonomic desks, smart scheduling, and data-driven wellness to
            help distributed teams stay energised and connected.
          </Typography>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button color="primary" onClick={handleNavigate} size="large" variant="contained">
            Explore the changelog
          </Button>
          <Button color="secondary" href="https://fitdesk.example.com" size="large" variant="outlined">
            Learn more
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default LandingPage;
