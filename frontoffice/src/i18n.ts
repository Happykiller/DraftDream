// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import detector from 'i18next-browser-languagedetector';

import appEN from '@src/locales/en/translation.json'
import appFR from '@src/locales/fr/translation.json';

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: appEN,
  },
  fr: {
    translation: appFR,
  }
};

const initI18n = async () => {
  await i18n
    .use(detector)
    .use(initReactI18next)
    .init({
      resources,
      supportedLngs: ['en', 'fr'],
      fallbackLng: 'fr',
      debug: process.env.NODE_ENV === 'development',
      interpolation: {
        escapeValue: false,
      }
    });
};

export default initI18n;
