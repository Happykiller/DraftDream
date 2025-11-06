import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography
} from '@mui/material';
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
    <Box component="main" sx={{ backgroundColor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        {/* General information */}
        <Stack spacing={6}>
          <Stack direction="row" justifyContent="flex-start">
            <Button color="primary" onClick={handleBackToHome} variant="outlined">
              {t('releaseNotes.backToHome')}
            </Button>
          </Stack>
          <Stack spacing={3} sx={{ textAlign: 'center' }}>
            <Stack spacing={1}>
              <Typography sx={{ fontSize: { xs: '2.25rem', md: '3rem' }, fontWeight: 700 }}>
                {t('releaseNotes.title')}
              </Typography>
            </Stack>
          </Stack>
          {renderContent()}
        </Stack>
      </Container>
    </Box>
  );
};

export default ReleaseNotesPage;
