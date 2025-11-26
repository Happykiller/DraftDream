import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Fade,
  Stack,
  Typography
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ReleaseAccordion from '../components/ReleaseAccordion';
import { useI18n, type Language } from '../i18n/I18nProvider';

import type { ReleaseDataset, ReleaseEntry } from '../types/releases.ts';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

const datasetPathForLanguage = (language: Language): string => {
  const basePath = import.meta.env.BASE_URL ?? '/';
  const sanitizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;

  return `${sanitizedBase}i18n/${language}/releases.json`;
};

const ReleaseNotesPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { language, t } = useI18n();
  const [status, setStatus] = useState<LoadingState>('idle');
  const [releases, setReleases] = useState<ReleaseEntry[]>([]);

  const handleBackToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const formatReleaseDate = useCallback(
    (isoDate: string) => {
      const date = new Date(isoDate);

      return new Intl.DateTimeFormat(language, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    },
    [language]
  );

  const releaseDateLabel = useCallback(
    (isoDate: string) => t('releaseNotes.releasedOn', { date: formatReleaseDate(isoDate) }),
    [formatReleaseDate, t]
  );

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const loadReleases = async (): Promise<void> => {
      setStatus('loading');

      try {
        const response = await fetch(datasetPathForLanguage(language), {
          cache: 'no-store',
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Unexpected response status ${response.status}`);
        }

        const payload = (await response.json()) as ReleaseDataset;

        if (!isActive) {
          return;
        }

        setReleases(payload.releases);
        setStatus('success');
      } catch (error) {
        if (!isActive || controller.signal.aborted) {
          return;
        }

        console.error('Unable to load release notes dataset', error);
        setStatus('error');
      }
    };

    void loadReleases();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [language]);

  useEffect(() => {
    document.title = t('releaseNotes.documentTitle');
  }, [language, t]);

  const pageLabels = useMemo(
    () => ({
      emptyScope: t('releaseNotes.emptyScope'),
      global: t('releaseNotes.globalLabel'),
      notes: t('releaseNotes.notesLabel'),
      scope: t('releaseNotes.scopeLabel')
    }),
    [t]
  );

  const renderContent = (): JSX.Element => {
    if (status === 'loading' || status === 'idle') {
      return (
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      );
    }

    if (status === 'error') {
      return (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {t('releaseNotes.error')}
        </Alert>
      );
    }

    if (releases.length === 0) {
      return (
        <Typography color="text.secondary" textAlign="center" variant="body1">
          {t('releaseNotes.empty')}
        </Typography>
      );
    }

    return (
      <ReleaseAccordion getReleaseDateLabel={releaseDateLabel} labels={pageLabels} releases={releases} />
    );
  };

  return (
    <Box component="main" sx={{ backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Fade in timeout={800}>
          <Stack spacing={8}>
            <Stack alignItems="center" spacing={4} sx={{ textAlign: 'center', position: 'relative' }}>
              <Box sx={{ position: 'absolute', left: 0, top: 0, display: { xs: 'none', md: 'block' } }}>
                <Button color="inherit" onClick={handleBackToHome} size="small" variant="text">
                  ← {t('releaseNotes.backToHome')}
                </Button>
              </Box>

              <Stack spacing={2} sx={{ maxWidth: 800 }}>
                <Typography
                  sx={{
                    background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 800,
                    letterSpacing: '-0.02em'
                  }}
                >
                  {t('releaseNotes.title')}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: '1.1rem', maxWidth: 600, mx: 'auto' }}>
                  {t('releaseNotes.pageSubtitle')}
                </Typography>
              </Stack>

              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Button color="inherit" onClick={handleBackToHome} variant="outlined">
                  {t('releaseNotes.backToHome')}
                </Button>
              </Box>
            </Stack>

            {renderContent()}
          </Stack>
        </Fade>
      </Container>
    </Box>
  );
};

export default ReleaseNotesPage;
