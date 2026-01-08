import * as React from 'react';
import { useTranslation } from 'react-i18next';
import type { SelectChangeEvent } from '@mui/material/Select';
import { session } from '@stores/session';
import type { SessionStoreModel } from '@stores/session';

/**
 * Hook to manage language selection and switching.
 */
export function useProfileLanguage() {
    const { t, i18n } = useTranslation();

    const normalizeLanguage = React.useCallback((value: string | undefined) => value?.split('-')[0] ?? 'fr', []);

    const languagesDictionary = React.useMemo(() => {
        const dictionary = t('languages', { returnObjects: true }) as Record<string, string> | string;
        return typeof dictionary === 'string' ? {} : dictionary;
    }, [t]);

    const [language, setLanguage] = React.useState<string>(() => normalizeLanguage(i18n.language));

    React.useEffect(() => {
        setLanguage(normalizeLanguage(i18n.language));
    }, [i18n.language, normalizeLanguage]);

    const handleLanguageChange = React.useCallback(
        (event: SelectChangeEvent<string>) => {
            const nextLanguage = event.target.value;

            if (!nextLanguage || nextLanguage === language) {
                return;
            }

            setLanguage(nextLanguage);
            void i18n.changeLanguage(nextLanguage);
        },
        [i18n, language],
    );

    const languageOptions = React.useMemo(() => Object.entries(languagesDictionary), [languagesDictionary]);

    const activeLanguage = React.useMemo(() => {
        if (languageOptions.length === 0) {
            return '';
        }
        return languageOptions.some(([value]) => value === language)
            ? language
            : languageOptions[0][0];
    }, [language, languageOptions]);

    return {
        languageOptions,
        activeLanguage,
        handleLanguageChange,
    };
}

/**
 * Hook to retrieve and format the current session data.
 */
export function useSessionData() {
    const { t } = useTranslation();
    const snapshot = session();

    const sessionData = React.useMemo<Omit<SessionStoreModel, 'reset'>>(() => {
        const { reset: _reset, ...rest } = snapshot;
        return rest;
    }, [snapshot]);

    const hasSessionData = React.useMemo(
        () => Object.values(sessionData).some((value) => value !== null && value !== undefined && value !== ''),
        [sessionData],
    );

    const formattedSnapshot = React.useMemo(() => JSON.stringify(sessionData, null, 2), [sessionData]);

    const maskedAccessToken = React.useMemo(() => {
        if (!sessionData.access_token) {
            return t('profile.summary.emptyValue');
        }
        if (sessionData.access_token.length <= 12) {
            return sessionData.access_token;
        }
        return `${sessionData.access_token.slice(0, 6)}…${sessionData.access_token.slice(-4)}`;
    }, [sessionData.access_token, t]);

    const roleLabel = React.useMemo(() => {
        if (!sessionData.role) {
            return null;
        }
        return sessionData.role.replace(/_/g, ' ');
    }, [sessionData.role]);

    const fullName = React.useMemo(() => {
        const nameParts = [sessionData.name_first, sessionData.name_last].filter(Boolean);
        if (nameParts.length === 0) {
            return null;
        }
        return nameParts.join(' ');
    }, [sessionData.name_first, sessionData.name_last]);

    const summaryFields = React.useMemo(
        () => [
            {
                key: 'name',
                label: t('profile.summary.fields.name'),
                value: fullName ?? t('profile.summary.emptyValue'),
            },
            {
                key: 'id',
                label: t('profile.summary.fields.id'),
                value: sessionData.id ?? t('profile.summary.emptyValue'),
            },
            {
                key: 'role',
                label: t('profile.summary.fields.role'),
                value: roleLabel ?? t('profile.summary.emptyValue'),
            },
            {
                key: 'access_token',
                label: t('profile.summary.fields.accessToken'),
                value: maskedAccessToken,
            },
        ],
        [fullName, maskedAccessToken, roleLabel, sessionData.id, t],
    );

    return {
        sessionData,
        hasSessionData,
        formattedSnapshot,
        maskedAccessToken,
        roleLabel,
        fullName,
        summaryFields,
    };
}
