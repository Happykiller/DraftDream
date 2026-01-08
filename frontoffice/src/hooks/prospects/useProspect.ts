// src/hooks/prospects/useProspect.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { prospectGet } from '@services/graphql/prospects.service';

import type { Prospect } from '@app-types/prospects';

import { useAsyncTask } from '@hooks/useAsyncTask';

export interface UseProspectOptions {
    prospectId?: string | null;
    initialProspect?: Prospect | null;
    initialError?: string | null;
}

export interface UseProspectResult {
    prospect: Prospect | null;
    loading: boolean;
    error: string | null;
    reload: () => Promise<Prospect | null>;
}

/**
 * Fetches a single prospect with loader-aware status tracking.
 */
export function useProspect({
    prospectId,
    initialProspect = null,
    initialError = null,
}: UseProspectOptions = {}): UseProspectResult {
    const { t } = useTranslation();
    const { execute } = useAsyncTask();
    const [prospect, setProspect] = React.useState<Prospect | null>(initialProspect);
    const [error, setError] = React.useState<string | null>(initialError);
    const [loading, setLoading] = React.useState(false);

    const load = React.useCallback(
        async (idToLoad: string): Promise<Prospect | null> => {
            setLoading(true);
            setError(null);

            try {
                const result = await execute(() => prospectGet(idToLoad));

                if (!result) {
                    const message = t('prospects.form.not_found');
                    setProspect(null);
                    setError(message);
                    return null;
                }

                setProspect(result);
                return result;
            } catch (caught: unknown) {
                console.error('[useProspect] Failed to load prospect', caught);
                const message = t('prospects.notifications.update_failure');
                setProspect(null);
                setError(message);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [execute, t],
    );

    React.useEffect(() => {
        setProspect(initialProspect);
    }, [initialProspect]);

    React.useEffect(() => {
        setError(initialError);
    }, [initialError]);

    React.useEffect(() => {
        if (!prospectId) {
            setProspect(null);
            setError(null);
            setLoading(false);
            return;
        }

        if (initialProspect && initialProspect.id === prospectId) {
            setLoading(false);
            return;
        }

        if (initialError) {
            setLoading(false);
            return;
        }

        void load(prospectId);
    }, [initialError, initialProspect, load, prospectId]);

    const reload = React.useCallback(async () => {
        if (!prospectId) {
            setProspect(null);
            setError(null);
            return null;
        }

        return load(prospectId);
    }, [load, prospectId]);

    return { prospect, loading, error, reload };
}
