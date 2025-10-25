// src\hooks\useAsyncTask.ts
import * as React from 'react';

import { useLoaderStore } from '@stores/loader';

type AsyncTask = <T>(task: () => Promise<T>) => Promise<T>;

/**
 * Wraps asynchronous operations to keep the global loader overlay in sync.
 * Errors are re-thrown so the caller can surface them through flash messages
 * or local state while the loader is reliably reset.
 */
export const useAsyncTask = () => {
  const setLoading = useLoaderStore((state) => state.setLoading);

  const execute = React.useCallback<AsyncTask>(
    async (task) => {
      setLoading(true);
      try {
        return await task();
      } catch (error) {
        console.error('[AsyncTask] Error:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading],
  );

  return { execute };
};
