// src\hooks\useAsyncTask.ts
import * as React from 'react';

import { useLoaderStore } from '@stores/loader';

export const useAsyncTask = () => {
  const setLoading = useLoaderStore((state) => state.setLoading);

  const execute = React.useCallback(
    async <T>(task: () => Promise<T>): Promise<T> => {
      setLoading(true);
      try {
        const result = await task();
        return result;
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
