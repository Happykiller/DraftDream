import { Box, CircularProgress } from '@mui/material';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import {
  ReactNode,
  Suspense
} from 'react';
import { initReactI18next, useTranslation } from 'react-i18next';

export type Language = 'en' | 'fr';

// Initialize i18n
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    ns: ['landing', 'common'], // Namespaces to load
    fallbackNS: ['landing', 'common'],
    defaultNS: 'landing',
    load: 'languageOnly',
    backend: {
      loadPath: '/i18n/{{lng}}/{{ns}}.json',
    },
    detection: {
      lookupLocalStorage: 'i18nextLng',
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: true,
    },
  });

type TranslateFunction = (key: string, variables?: Record<string, string>) => string;

type I18nContextValue = {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
  readonly t: TranslateFunction;
};

type I18nProviderProps = {
  readonly children: ReactNode;
};

export const supportedLanguages: readonly Language[] = ['en', 'fr'];

export const I18nProvider = ({ children }: I18nProviderProps): ReactNode => {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: 'background.default',
            display: 'flex',
            height: '100vh',
            justifyContent: 'center',
            left: 0,
            position: 'fixed',
            top: 0,
            width: '100vw',
            zIndex: 9999
          }}
        >
          <CircularProgress size={60} thickness={4} />
        </Box>
      }
    >
      {children}
    </Suspense>
  );
};

export const useI18n = (): I18nContextValue => {
  const { t, i18n } = useTranslation();

  const language = (supportedLanguages.includes(i18n.language as Language)
    ? i18n.language
    : 'en') as Language;

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  // Wrapper to match the existing TranslateFunction signature
  const translate: TranslateFunction = (key, variables) => {
    return t(key, variables as Record<string, unknown>) as string;
  };

  return {
    language,
    setLanguage,
    t: translate
  };
};
