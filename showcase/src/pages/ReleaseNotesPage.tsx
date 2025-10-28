import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography
} from '@mui/material';

import ReleaseAccordion from '../components/ReleaseAccordion.tsx';
import { supportedLanguages, useI18n, type Language } from '../i18n/I18nProvider.tsx';
import type { ReleaseDataset, ReleaseEntry } from '../types/releases.ts';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

const datasetPathForLanguage = (language: Language): string => {
  const basePath = import.meta.env.BASE_URL ?? '/';
  const sanitizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;

  return `${sanitizedBase}i18n/${language}/releases.json`;
};

const ReleaseNotesPage = (): JSX.Element => {
  const { language, setLanguage, t } = useI18n();
  const [status, setStatus] = useState<LoadingState>('idle');
  const [releases, setReleases] = useState<ReleaseEntry[]>([]);

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

  const handleLanguageChange = (event: SelectChangeEvent<string>): void => {
    const nextLanguage = event.target.value as Language;
    setLanguage(nextLanguage);
  };

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
          <Stack spacing={3} sx={{ textAlign: 'center' }}>
            <Stack spacing={1}>
              <Typography color="primary.main" fontWeight={600} variant="overline">
                {t('releaseNotes.subtitle')}
              </Typography>
              <Typography sx={{ fontSize: { xs: '2.25rem', md: '3rem' }, fontWeight: 700 }}>
                {t('releaseNotes.title')}
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 640, mx: 'auto' }} variant="body1">
                {t('releaseNotes.description')}
              </Typography>
            </Stack>
            <Stack alignItems="center" direction="row" justifyContent="center" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="release-notes-language-label">{t('releaseNotes.languageLabel')}</InputLabel>
                <Select
                  id="release-notes-language"
                  label={t('releaseNotes.languageLabel')}
                  labelId="release-notes-language-label"
                  onChange={handleLanguageChange}
                  value={language}
                >
                  {supportedLanguages.map((supportedLanguage) => (
                    <MenuItem key={supportedLanguage} value={supportedLanguage}>
                      {supportedLanguage.toUpperCase()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
          {renderContent()}
        </Stack>
      </Container>
      <Box component="footer" sx={{ pb: 6 }}>
        <Typography color="text.disabled" textAlign="center" variant="caption">
          {t('releaseNotes.footer')}
        </Typography>
      </Box>
    </Box>
  );
};

export default ReleaseNotesPage;
