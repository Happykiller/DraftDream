import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';

export type Language = 'en' | 'fr';

type TranslationDictionary = Record<string, string | TranslationDictionary>;

type TranslationResources = Record<Language, TranslationDictionary>;

type TranslateFunction = (key: string, variables?: Record<string, string>) => string;

type I18nContextValue = {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
  readonly t: TranslateFunction;
};

type I18nProviderProps = {
  readonly children: ReactNode;
};

const translations: TranslationResources = {
  en: {
    releaseNotes: {
      description: 'Follow the evolution of FitDesk and its components through each release.',
      documentTitle: 'Release Notes | FitDesk',
      empty: 'No release notes are available yet.',
      emptyScope: 'No updates recorded for this scope yet.',
      error: 'An error occurred while loading the release notes. Please try again later.',
      footer: 'FitDesk Platform — shipping clarity across every release.',
      globalLabel: 'Global',
      languageLabel: 'Language',
      loading: 'Loading release notes…',
      notesLabel: 'Notes',
      projectLabel: 'Project',
      releasedOn: 'Released on {{date}}',
      scopeLabel: 'Scope',
      subtitle: 'Release notes',
      title: 'Release notes'
    }
  },
  fr: {
    releaseNotes: {
      description: 'Suivez l\'évolution de FitDesk et de ses composants à chaque version.',
      documentTitle: 'Notes de version | FitDesk',
      empty: 'Aucune note de version n\'est disponible pour le moment.',
      emptyScope: 'Aucune mise à jour disponible pour ce périmètre pour l\'instant.',
      error: 'Une erreur est survenue lors du chargement des notes de version. Merci de réessayer plus tard.',
      footer: 'Plateforme FitDesk — une vision claire de chaque mise à jour.',
      globalLabel: 'Global',
      languageLabel: 'Langue',
      loading: 'Chargement des notes de version…',
      notesLabel: 'Notes',
      projectLabel: 'Projet',
      releasedOn: 'Publié le {{date}}',
      scopeLabel: 'Périmètre',
      subtitle: 'Notes de version',
      title: 'Notes de version'
    }
  }
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const resolvePath = (dictionary: TranslationDictionary, keyPath: string[]): string | TranslationDictionary | undefined => {
  if (keyPath.length === 0) {
    return dictionary;
  }

  const [currentKey, ...remaining] = keyPath;
  const value = dictionary[currentKey];

  if (typeof value === 'undefined') {
    return undefined;
  }

  if (remaining.length === 0) {
    return value;
  }

  if (typeof value === 'string') {
    return value;
  }

  return resolvePath(value, remaining);
};

const applyVariables = (template: string, variables?: Record<string, string>): string => {
  if (!variables) {
    return template;
  }

  return template.replace(/{{\s*(.+?)\s*}}/g, (match, variableName) => {
    const trimmedName = String(variableName).trim();

    return Object.prototype.hasOwnProperty.call(variables, trimmedName)
      ? variables[trimmedName] ?? ''
      : match;
  });
};

export const supportedLanguages: readonly Language[] = ['en', 'fr'];

/**
 * Picks the best supported language based on the browser preferences.
 */
const resolveInitialLanguage = (): Language => {
  const normalizeLanguage = (candidate?: string): Language | undefined => {
    if (!candidate) {
      return undefined;
    }

    const [languageCode] = candidate.split('-');
    const normalized = languageCode?.toLowerCase();

    return supportedLanguages.find((supportedLanguage) => supportedLanguage === normalized);
  };

  if (typeof navigator === 'undefined') {
    return 'en';
  }

  const fromPreferences = navigator.languages
    ?.map((preferredLanguage) => normalizeLanguage(preferredLanguage))
    .find((language): language is Language => Boolean(language));

  if (fromPreferences) {
    return fromPreferences;
  }

  return normalizeLanguage(navigator.language) ?? 'en';
};

export const I18nProvider = ({ children }: I18nProviderProps): JSX.Element => {
  const [language, setLanguage] = useState<Language>(() => resolveInitialLanguage());

  const translate = useCallback<TranslateFunction>(
    (key, variables) => {
      const dictionary = translations[language];
      const keyPath = key.split('.');
      const value = resolvePath(dictionary, keyPath);

      if (typeof value === 'string') {
        return applyVariables(value, variables);
      }

      return key;
    },
    [language]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: translate
    }),
    [language, translate]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }

  return context;
};
